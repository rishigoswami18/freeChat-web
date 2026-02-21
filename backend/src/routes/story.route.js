import express from "express";
import Story from "../models/Story.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

router.use(protectRoute);

// Create story
router.post("/", async (req, res) => {
    try {
        const { image, caption } = req.body;

        if (!image) {
            return res.status(400).json({ message: "Image is required for a story" });
        }

        // Upload to Cloudinary
        const uploaded = await cloudinary.uploader.upload(image, {
            folder: "freechat_stories",
        });

        const newStory = await Story.create({
            userId: req.user._id,
            fullName: req.user.fullName,
            profilePic: req.user.profilePic || "",
            imageUrl: uploaded.secure_url,
            caption: caption || "",
        });

        res.status(201).json(newStory);
    } catch (err) {
        console.error("Error creating story:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get stories (user + friends)
router.get("/", async (req, res) => {
    try {
        const friendIds = req.user.friends || [];

        // Fetch stories from user and their friends
        const stories = await Story.find({
            userId: { $in: [req.user._id, ...friendIds] },
        }).sort({ createdAt: -1 });

        // Group stories by userId for the tray
        const groupedStories = stories.reduce((acc, story) => {
            const uid = story.userId.toString();
            if (!acc[uid]) {
                acc[uid] = {
                    userId: story.userId,
                    fullName: story.fullName,
                    profilePic: story.profilePic,
                    stories: [],
                };
            }
            acc[uid].stories.push(story);
            return acc;
        }, {});

        res.json(Object.values(groupedStories));
    } catch (err) {
        console.error("Error fetching stories:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
