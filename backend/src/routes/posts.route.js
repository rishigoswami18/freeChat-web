import express from "express";
import Post from "../models/Post.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import { detectEmotion } from "../utils/emotionService.js";

const router = express.Router();

// All routes require auth
router.use(protectRoute);

// Create post (with optional media upload)
router.post("/", async (req, res) => {
  try {
    const { content, media, mediaType } = req.body;
    console.log("Create post request received. Content length:", content?.length, "Media type:", mediaType, "Media present:", !!media);

    if (!content && !media) {
      return res.status(400).json({ message: "Post must have content or media" });
    }

    let mediaUrl = "";
    if (media) {
      // Upload base64 to Cloudinary
      const resourceType = mediaType === "video" ? "video" : "image";
      const uploaded = await cloudinary.uploader.upload(media, {
        folder: "freechat_posts",
        resource_type: resourceType,
      });
      mediaUrl = uploaded.secure_url;
    }

    // Detect emotion from post content using ML service
    let caption = "";
    if (content) {
      caption = await detectEmotion(content);
    }

    const newPost = await Post.create({
      userId: req.user._id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic || "",
      content: content || "",
      caption,
      mediaUrl,
      mediaType: mediaType || "",
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
});

// Get feed posts (user + friends)
router.get("/", async (req, res) => {
  try {
    const { userId, friends } = req.query;
    const friendIds = friends ? friends.split(",").filter(Boolean) : [];

    const posts = await Post.find({
      userId: { $in: [userId, ...friendIds] },
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Toggle like
router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const userId = req.user._id;
    const alreadyLiked = post.likes.includes(userId);

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes, liked: !alreadyLiked });
  } catch (err) {
    console.error("Error toggling like:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add comment
router.post("/:id/comment", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Detect emotion from comment text using ML service
    const caption = await detectEmotion(text.trim());

    const comment = {
      userId: req.user._id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic || "",
      text: text.trim(),
      caption,
    };

    post.comments.push(comment);
    await post.save();

    // Return the newly added comment (last one)
    const added = post.comments[post.comments.length - 1];
    res.status(201).json(added);
  } catch (err) {
    console.error("Error adding comment:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Increment share count
router.put("/:id/share", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { shareCount: 1 } },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json({ shareCount: post.shareCount });
  } catch (err) {
    console.error("Error sharing post:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
