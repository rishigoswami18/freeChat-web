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

// Get video posts with prioritization (for Reels)
router.get("/videos", async (req, res) => {
  try {
    console.log("Fetching video posts for Reels...");
    const isPremium = hasPremiumAccess(req.user);

    // Fetch real video posts
    let posts = await Post.find({
      mediaType: "video",
      isAd: false, // Exclude ads from regular posts
    });
    console.log(`Found ${posts.length} non-ad video posts.`);

    // Sort by popularity/recency
    posts.sort((a, b) => {
      const scoreA = (a.likes.length * 2) + (a.shareCount * 5);
      const scoreB = (b.likes.length * 2) + (b.shareCount * 5);
      if (scoreA === scoreB) return new Date(b.createdAt) - new Date(a.createdAt);
      return scoreB - scoreA;
    });
    console.log("Video posts sorted by popularity and recency.");

    // If user is not premium, inject ads every 4th post
    if (!isPremium) {
      console.log("User is not premium. Injecting ads into video feed.");
      const ads = await Post.find({ isAd: true }).limit(5); // Fetch a few ads
      console.log(`Found ${ads.length} ad posts in DB.`);

      // Fallback sample ad if none in DB
      const sampleAd = {
        _id: "ad_123",
        userId: "ad_user_id", // Placeholder for ad user
        fullName: "FreeChat Business",
        profilePic: "https://res.cloudinary.com/demo/image/upload/v1624103175/samples/people/steve-jobs.jpg",
        content: "Grow your business with FreeChat Ads. Target the right audience today!",
        mediaUrl: "https://res.cloudinary.com/demo/video/upload/v1624103175/samples/elephants.mp4",
        mediaType: "video",
        isAd: true,
        adLink: "https://freechatweb.in/ads",
        adCta: "Get Started",
        likes: [],
        comments: [],
        shareCount: 0,
        songName: "Sponsored Content",
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const finalPosts = [];
      let adIndex = 0;

      posts.forEach((post, index) => {
        finalPosts.push(post);
        // Inject an ad every 4th post
        if ((index + 1) % 4 === 0) {
          const currentAd = ads[adIndex] || sampleAd;
          finalPosts.push(currentAd);
          adIndex = (adIndex + 1) % (ads.length > 0 ? ads.length : 1); // Cycle through available ads
          console.log(`Injected ad at position ${finalPosts.length}. Ad ID: ${currentAd._id}`);
        }
      });

      console.log(`Final video feed with ads: ${finalPosts.length} items.`);
      return res.json(finalPosts);
    }

    console.log("User is premium. No ads injected.");
    res.json(posts);
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

// Get list of users who liked the post
router.get("/:id/likes", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("likes", "fullName profilePic username nativeLanguage learningLanguage");
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
