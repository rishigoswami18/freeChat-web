import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import { detectEmotion } from "../utils/emotionService.js";

const router = express.Router();

// All routes require auth
router.use(protectRoute);

// Create post (with optional media - supports both direct URL and base64 upload)
router.post("/", async (req, res) => {
  try {
    const { content, media, mediaUrl: directUrl, mediaType, songName } = req.body;
    console.log("Create post request received:", {
      contentLength: content?.length,
      mediaType,
      hasDirectUrl: !!directUrl,
      hasBase64Media: !!media,
      songName
    });

    if (!content && !media && !directUrl) {
      return res.status(400).json({ message: "Post must have content or media" });
    }

    let mediaUrl = "";

    // Option 1: Frontend uploaded directly to Cloudinary (preferred for large files)
    if (directUrl) {
      mediaUrl = directUrl;
      console.log("Using direct media URL:", mediaUrl);
    }
    // Option 2: Base64 upload through backend (fallback / backward compat)
    else if (media) {
      try {
        console.log("Attempting backend media upload to Cloudinary...");
        const resourceType = mediaType === "video" ? "video" : "image";
        const uploaded = await cloudinary.uploader.upload(media, {
          folder: "freechat_posts",
          resource_type: resourceType,
          timeout: 120000, // Increased timeout to 2 minutes
        });
        mediaUrl = uploaded.secure_url;
        console.log("Backend upload successful:", mediaUrl);
      } catch (uploadErr) {
        console.error("Cloudinary upload failed:", uploadErr);
        return res.status(500).json({ message: "Media upload failed: " + (uploadErr.message || "Unknown error") });
      }
    }

    // Detect emotion from post content using ML service if user is premium
    let caption = "";
    if (content && (req.user.isMember || req.user.role === "admin")) {
      try {
        caption = await detectEmotion(content);
      } catch (mlErr) {
        console.error("Emotion detection failed (non-blocking):", mlErr.message);
        caption = "";
      }
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

    console.log("Post created successfully with ID:", newPost._id);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post in route handler:", err);
    res.status(500).json({ message: err.message || "Failed to create post. Please try again." });
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

// Get user specific posts
router.get("/user/:userId", async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("Error fetching user posts:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check ownership
    if (post.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Unauthorized to delete this post" });
    }

    // Delete media from cloudinary if it exists
    if (post.mediaUrl && post.mediaUrl.includes("cloudinary")) {
      try {
        const publicId = post.mediaUrl.split("/").pop().split(".")[0];
        const resourceType = post.mediaType === "video" ? "video" : "image";
        await cloudinary.uploader.destroy(`freechat_posts/${publicId}`, { resource_type: resourceType });
      } catch (cloudinaryErr) {
        console.error("Error deleting from Cloudinary:", cloudinaryErr.message);
        // Continue deleting post from DB even if cloudinary delete fails
      }
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("Error deleting post:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
