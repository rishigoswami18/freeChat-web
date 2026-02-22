import express from "express";
import mongoose from "mongoose";
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
    const { content, media, mediaType, songName } = req.body;
    console.log("Create post request received. Content length:", content?.length, "Media type:", mediaType, "Media present:", !!media, "Song name:", songName);

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

    // Detect emotion from post content using ML service if user is premium
    let caption = "";
    if (content && (req.user.isMember || req.user.role === "admin")) {
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
      songName: songName || "Original Audio",
    });

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post:", err);
    res.status(500).json({ message: err.message || "Internal Server Error" });
  }
});

// Get video posts with prioritization (for Reels)
router.get("/videos", async (req, res) => {
  try {
    // Return videos sorted by a score of (likes + shares) and date
    // For simplicity, we'll fetch more than needed and sort them or just use a weighted sort if possible.
    // Here we'll just get all videos and sort by popular + recent.
    const posts = await Post.find({
      mediaType: "video",
    });

    // Sort logic: Popularity (likes + shares) weighted with recency
    const sortedPosts = posts.sort((a, b) => {
      const scoreA = (a.likes.length * 2) + (a.shareCount * 5);
      const scoreB = (b.likes.length * 2) + (b.shareCount * 5);

      // If scores are equal, sort by date
      if (scoreA === scoreB) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return scoreB - scoreA;
    });

    res.json(sortedPosts);
  } catch (err) {
    console.error("Error fetching video posts:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get feed posts (user + friends + public profiles)
router.get("/", async (req, res) => {
  try {
    const { userId, friends } = req.query;
    const friendIds = friends ? friends.split(",").filter(Boolean) : [];

    // Convert string IDs to ObjectIds for the aggregation pipeline
    // Fallback to req.user._id if userId is not provided in query
    const myId = userId ? new mongoose.Types.ObjectId(userId) : req.user._id;
    const peerIds = friendIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    const posts = await Post.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $unwind: {
          path: "$authorInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          $or: [
            { userId: { $in: [myId, ...peerIds] } },
            { "authorInfo.isPublic": true },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $project: {
          authorInfo: 0, // Remove the joined data to keep response structure identical
        },
      },
    ]);

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

    // Detect emotion from comment text using ML service if user is premium
    let caption = "";
    if (req.user.isMember || req.user.role === "admin") {
      caption = await detectEmotion(text.trim());
    }

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
