import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Song from "../models/Song.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import { detectEmotion } from "../utils/emotionService.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";
import { getPexelsVideos } from "../utils/pexelsService.js";
import { getYouTubeShorts } from "../utils/youtubeService.js";
import { MusicService } from "../services/music/musicService.js";

const router = express.Router();

// All routes require auth
router.use(protectRoute);

// Create post (with optional media - supports both direct URL and base64 upload)
router.post("/", async (req, res) => {
  try {
    const { content, media, mediaUrl: directUrl, mediaType, songName, audioUrl, songId } = req.body;
    console.log("Create post request received:", {
      contentLength: content?.length,
      mediaType,
      hasDirectUrl: !!directUrl,
      hasBase64Media: !!media,
      songName,
      hasAudioUrl: !!audioUrl
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
    if (content && hasPremiumAccess(req.user)) {
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
      role: req.user.role || "user",
      isVerified: req.user.isVerified || false,
      content: content || "",
      caption,
      mediaUrl,
      mediaType: mediaType || "",
      songId: songId || null,
      songName: songName || "Original Audio",
      audioUrl: audioUrl || "",
      // FreeChat: Support paid content
      isPaid: req.body.isPaid === true,
      price: parseInt(req.body.price) || 0
    });


    // Track usage if a formal song was used
    if (songId) {
      MusicService.trackUsage(songId).catch(e => console.error("Usage track fail:", e.message));
    }

    console.log("Post created successfully with ID:", newPost._id);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post in route handler:", err);
    res.status(500).json({ message: err.message || "Failed to create post. Please try again." });
  }
});

import { ReelsService } from "../services/social/reelsService.js";

// Get discovery reels with prioritization and external fallback
router.get("/videos", async (req, res) => {
  try {
    const { limit = 8, lastId } = req.query;
    const isPremium = hasPremiumAccess(req.user);

    const result = await ReelsService.getDiscoveryFeed({
      limit,
      lastId,
      isPremium
    });

    res.json(result);
  } catch (err) {
    console.error("🌊 Reels: Route Error:", err.message);
    res.status(500).json({ message: "Reels temporarily unavailable" });
  }
});


// Music Discovery Endpoints
router.get("/songs/trending", async (req, res) => {
  try {
    const songs = await MusicService.getTrending();
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/songs/search", async (req, res) => {
  try {
    const { q } = req.query;
    const songs = await MusicService.searchSongs(q);
    res.json(songs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Legacy support override
router.get("/songs", async (req, res) => {
  const trending = await MusicService.getTrending();
  res.json(trending);
});

import { FeedService } from "../services/social/feedService.js";

// Get feed posts (ranked: friends + trending + recency)
router.get("/", async (req, res) => {
  try {
    const { userId, friends, limit = 10, lastId } = req.query;
    const friendIds = friends ? friends.split(",").filter(Boolean) : [];

    const result = await FeedService.getHomeFeed({
      userId: userId || req.user._id,
      friendIds,
      limit,
      lastId
    });

    // 🛡️ THE GATE: Mask paid content for non-paying users
    if (result.posts) {
        result.posts = result.posts.map(p => {
            const isOwner = (p.userId || p._id)?.toString() === req.user._id.toString();
            // Note: Since we use FeedService, ensure unlockedBy is selected in the service or select it here
            const isUnlocked = p.unlockedBy?.some(id => id.toString() === req.user._id.toString());
            
            if (p.isPaid && !isOwner && !isUnlocked) {
                return {
                    ...p,
                    userId: p.userId || p._id,
                    mediaUrl: "LOCKED", 
                    content: "Unlock to see this exclusive post! 💎",
                    isLocked: true 
                };
            }
            return { ...p, userId: p.userId || p._id, isLocked: false };
        });
    }

    res.json(result);


  } catch (err) {
    console.error("🌊 Feed: Route Error:", err.message);
    res.status(500).json({ message: "Feed temporarily unavailable" });
  }
});


// Get list of users who liked the post
router.get("/:id/likes", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("likes", "fullName profilePic username nativeLanguage learningLanguage role isVerified");
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.json(post.likes);
  } catch (err) {
    console.error("Error fetching post likes:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Toggle like
router.put("/:id/like", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Interaction not supported on discovery content" });
    }
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

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Comments not supported on discovery content" });
    }

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Detect emotion from comment text using ML service if user is premium
    let caption = "";
    if (hasPremiumAccess(req.user)) {
      caption = await detectEmotion(text.trim());
    }

    const comment = {
      userId: req.user._id,
      fullName: req.user.fullName,
      profilePic: req.user.profilePic || "",
      role: req.user.role || "user",
      isVerified: req.user.isVerified || false,
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Share tracking not supported on discovery content" });
    }
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

// Get user specific posts with pagination
router.get("/user/:userId", async (req, res) => {
  try {
    const { limit = 10, lastId } = req.query;
    const limitNum = parseInt(limit, 10) || 10;

    const userId = req.params.userId;
    console.log("🔍 [Profile] Fetching posts for user:", userId);

    const matchQuery = { userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId };
    if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
      matchQuery._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    const posts = await Post.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "authorInfo",
        },
      },
      {
        $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          userId: "$userId", // Explicitly preserve userId
          role: { $ifNull: ["$role", "$authorInfo.role"] },
          isVerified: { $ifNull: ["$isVerified", "$authorInfo.isVerified"] },
          fullName: { $ifNull: ["$authorInfo.fullName", "$fullName"] },
          profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limitNum + 1 },
      { 
        $project: { 
          userId: 1,
          content: 1,
          mediaUrl: 1,
          mediaType: 1,
          likes: 1,
          comments: 1,
          createdAt: 1,
          role: 1,
          isVerified: 1,
          fullName: 1,
          profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] },
          // FreeChat fields
          isPaid: 1,
          price: 1,
          unlockedBy: 1
        } 
      }
    ]);

    const hasMore = posts.length > limitNum;
    const paginatedPosts = hasMore ? posts.slice(0, limitNum) : posts;
    const nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1]._id : null;

    // 🛡️ THE GATE: Mask paid content in Profile
    const transformedPosts = paginatedPosts.map(p => {
        const isOwner = p.userId?.toString() === req.user._id.toString();
        const isUnlocked = p.unlockedBy?.some(id => id.toString() === req.user._id.toString());
        
        if (p.isPaid && !isOwner && !isUnlocked) {
            return {
                ...p,
                mediaUrl: "LOCKED",
                content: "Unlock to see this exclusive post! 💎",
                isLocked: true
            };
        }
        return { ...p, isLocked: false };
    });

    res.json({ posts: transformedPosts, nextCursor, hasMore });


  } catch (err) {
    console.error("❌ Post Fetch Error:", err.message);
    try {
      const fallbackLimit = parseInt(req.query.limit, 10) || 10;
      const posts = await Post.find({ userId: req.params.userId })
        .sort({ _id: -1 })
        .limit(fallbackLimit);
      res.json({ posts, nextCursor: null, hasMore: false });
    } catch (fallbackErr) {
      res.status(500).json({ message: "DB Error: " + fallbackErr.message });
    }
  }
});

// Delete post
router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Check ownership or Admin permission
    const isAdmin = req.user.role === "admin";
    if (post.userId.toString() !== req.user._id.toString() && !isAdmin) {
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

// 💎 Unlock paid post
router.post("/:id/unlock", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!post.isPaid) return res.status(400).json({ message: "Post is already free" });

    const userId = req.user._id;
    if (post.userId.toString() === userId.toString()) {
      return res.status(400).json({ message: "You already own this post" });
    }

    if (post.unlockedBy.includes(userId)) {
      return res.status(400).json({ message: "Post already unlocked" });
    }

    // 📜 Log Transaction (Audit-ready)
    const { default: TransactionHistory } = await import("../models/TransactionHistory.js");
    await TransactionHistory.create({
      userId,
      recipientId: post.creator,
      amount: -post.price,
      type: "POST_UNLOCK",
      description: `Unlocked premium post ${post._id} by creator ${post.creator}`,
      status: "completed"
    });

    // Atomic Balance Check & Deduction
    const { default: UserWallet } = await import("../models/UserWallet.js");
    const wallet = await UserWallet.findOneAndUpdate(
      { userId, bonusBalance: { $gte: post.price } },
      { $inc: { bonusBalance: -post.price } },
      { new: true }
    );

    if (!wallet) return res.status(400).json({ message: "Insufficient coins to unlock" });

    // Update Post access
    post.unlockedBy.push(userId);
    await post.save();

    // Reward the creator (70% split)
    const earnings = Math.floor(post.price * 0.7);
    await UserWallet.findOneAndUpdate(
      { userId: post.userId },
      { $inc: { winnings: earnings } },
      { upsert: true }
    );


    // 🚀 Notify the Creator
    const { createNotification } = await import("../services/notification.service.js");
    await createNotification({
        recipient: post.userId,
        sender: userId,
        type: "POST_UNLOCK",
        relatedId: post._id,
        content: `${req.user.fullName} unlocked your premium post 💰`
    });

    res.json({ success: true, message: "Post unlocked!", mediaUrl: post.mediaUrl });

  } catch (err) {
    console.error("Unlock error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
