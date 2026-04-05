import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

// GET /api/notifications
router.get("/", protectRoute, async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .populate("sender", "fullName username profilePic isVerified")
            .sort({ createdAt: -1 })
            .limit(50);
        
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/notifications/read
router.put("/read", protectRoute, async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.status(200).json({ success: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
