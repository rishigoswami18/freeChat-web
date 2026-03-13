import express from "express";
import mongoose from "mongoose";
import Post from "../models/Post.js";
import Song from "../models/Song.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";
import { detectEmotion } from "../utils/emotionService.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";

const router = express.Router();

// All routes require auth
router.use(protectRoute);

// Create post (with optional media - supports both direct URL and base64 upload)
router.post("/", async (req, res) => {
  try {
    const { content, media, mediaUrl: directUrl, mediaType, songName, audioUrl } = req.body;
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
      songName: songName || "Original Audio",
      audioUrl: audioUrl || "",
    });

    console.log("Post created successfully with ID:", newPost._id);
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error creating post in route handler:", err);
    res.status(500).json({ message: err.message || "Failed to create post. Please try again." });
  }
});

// Get video posts with prioritization (for Reels) with pagination
router.get("/videos", async (req, res) => {
  try {
    const { limit = 8, lastId } = req.query;
    const limitNum = parseInt(limit, 10) || 8;
    const isPremium = hasPremiumAccess(req.user);

    const matchQuery = { mediaType: "video", isAd: false };
    if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
      matchQuery._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

    // Fetch real video posts with author status
    let posts = await Post.aggregate([
      { $match: matchQuery }, // Exclude ads and previous pages
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
          role: { $ifNull: ["$role", "$authorInfo.role"] },
          isVerified: { $ifNull: ["$isVerified", "$authorInfo.isVerified"] },
          fullName: { $ifNull: ["$authorInfo.fullName", "$fullName"] },
          profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limitNum + 1 },
      { $project: { authorInfo: 0 } }
    ]);

    const hasMore = posts.length > limitNum;
    let paginatedPosts = hasMore ? posts.slice(0, limitNum) : posts;
    let nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1]._id : null;

    // INFINITE FEED STRATEGY: 
    // If we reached the end (no more new posts), fallback to "Discovery Mode" 
    // by sampling random videos to keep the feed alive.
    if (!hasMore && paginatedPosts.length < limitNum) {
      console.log("🔄 Reels: Reached end of chronological feed, entering Discovery Mode...");
      const discoveryPosts = await Post.aggregate([
        { $match: { mediaType: "video", isAd: false, _id: { $nin: paginatedPosts.map(p => p._id) } } },
        { $sample: { size: limitNum - paginatedPosts.length } },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "authorInfo",
          },
        },
        { $unwind: { path: "$authorInfo", preserveNullAndEmptyArrays: true } },
        {
          $addFields: {
            role: { $ifNull: ["$role", "$authorInfo.role"] },
            isVerified: { $ifNull: ["$isVerified", "$authorInfo.isVerified"] },
            fullName: { $ifNull: ["$authorInfo.fullName", "$fullName"] },
            profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] }
          }
        },
        { $project: { authorInfo: 0 } }
      ]);
      
      paginatedPosts = [...paginatedPosts, ...discoveryPosts];
      // Since it's discovery mode, we keep nextCursor null to signify this is the "shuffle" area
      // or we could implement a logic to keep shuffling indefinitely.
    }

    // If user is not premium, inject ads
    if (!isPremium && paginatedPosts.length > 0) {
      const ads = await Post.find({ isAd: true }).limit(2);
      const finalPosts = [];
      paginatedPosts.forEach((post, index) => {
        finalPosts.push(post);
        if ((index + 1) % 4 === 0 && ads.length > 0) {
          finalPosts.push(ads[index % ads.length]);
        }
      });
      return res.json({ posts: finalPosts, nextCursor, hasMore: true }); // Always claim hasMore for infinite feel
    }

    res.json({ posts: paginatedPosts, nextCursor, hasMore: true });
  } catch (err) {
    console.error("Error fetching video posts:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get curated songs for Reels/Videos
router.get("/songs", async (req, res) => {
  try {
    const songs = await Song.find().sort({ isTrending: -1, title: 1 });
    res.json(songs);
  } catch (err) {
    console.error("Error fetching songs:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Add a new song to the library (Admin/Internal)
router.post("/songs", async (req, res) => {
  try {
    const { title, artist, audioUrl, isTrending } = req.body;
    if (!title || !artist) return res.status(400).json({ message: "Title and artist required" });

    const newSong = await Song.create({ title, artist, audioUrl, isTrending });
    res.status(201).json(newSong);
  } catch (err) {
    console.error("Error adding song:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get feed posts (user + friends + public profiles) with Pagination
router.get("/", async (req, res) => {
  try {
    const { userId, friends, limit = 10, lastId } = req.query;
    const friendIds = friends ? friends.split(",").filter(Boolean) : [];
    const limitNum = parseInt(limit, 10) || 10;

    // Convert string IDs to ObjectIds for the aggregation pipeline
    const myId = userId ? new mongoose.Types.ObjectId(userId) : req.user._id;
    const peerIds = friendIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return null;
      }
    }).filter(Boolean);

    // Build Match Query
    const matchQuery = {
      $or: [
        { userId: { $in: [myId, ...peerIds] } },
        { "authorInfo.isPublic": true },
      ],
    };

    // Cursor-based pagination: If lastId is provided, get posts before it
    if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
      matchQuery._id = { $lt: new mongoose.Types.ObjectId(lastId) };
    }

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
      { $match: matchQuery },
      { $sort: { _id: -1 } }, // Using _id for stability in pagination
      { $limit: limitNum + 1 }, // Fetch 1 extra to see if there's more
      {
        $addFields: {
          role: { $ifNull: ["$role", "$authorInfo.role"] },
          isVerified: { $ifNull: ["$isVerified", "$authorInfo.isVerified"] },
          fullName: { $ifNull: ["$authorInfo.fullName", "$fullName"] },
          profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] }
        }
      },
      { $project: { authorInfo: 0 } },
    ]);

    const hasMore = posts.length > limitNum;
    const paginatedPosts = hasMore ? posts.slice(0, limitNum) : posts;
    const nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1]._id : null;

    res.json({
      posts: paginatedPosts,
      nextCursor,
      hasMore
    });
  } catch (err) {
    console.error("Error fetching posts:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
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

    const matchQuery = { userId: new mongoose.Types.ObjectId(req.params.userId) };
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
          role: { $ifNull: ["$role", "$authorInfo.role"] },
          isVerified: { $ifNull: ["$isVerified", "$authorInfo.isVerified"] },
          fullName: { $ifNull: ["$authorInfo.fullName", "$fullName"] },
          profilePic: { $ifNull: ["$authorInfo.profilePic", "$profilePic"] }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limitNum + 1 },
      { $project: { authorInfo: 0 } }
    ]);

    const hasMore = posts.length > limitNum;
    const paginatedPosts = hasMore ? posts.slice(0, limitNum) : posts;
    const nextCursor = hasMore ? paginatedPosts[paginatedPosts.length - 1]._id : null;

    res.json({ posts: paginatedPosts, nextCursor, hasMore });
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
