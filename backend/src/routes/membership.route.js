import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protectRoute);

// Get membership status
router.get("/status", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("isMember memberSince");
        res.json({ isMember: user.isMember, memberSince: user.memberSince });
    } catch (err) {
        console.error("Error getting membership status:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Simulate payment — toggle membership on
router.post("/subscribe", async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.isMember) {
            return res.status(400).json({ message: "You are already a member" });
        }

        user.isMember = true;
        user.memberSince = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Welcome to freeChat Premium! 🎉",
            isMember: true,
            memberSince: user.memberSince,
        });
    } catch (err) {
        console.error("Error subscribing:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Cancel membership
router.post("/cancel", async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user.isMember) {
            return res.status(400).json({ message: "You are not a member" });
        }

        user.isMember = false;
        user.memberSince = null;
        await user.save();

        res.status(200).json({ success: true, message: "Membership cancelled" });
    } catch (err) {
        console.error("Error cancelling membership:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
