import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

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

// Get Razorpay key (for frontend checkout)
router.get("/key", (req, res) => {
    res.json({ key: process.env.RAZORPAY_KEY_ID });
});

// Create Razorpay order
router.post("/create-order", async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user.isMember) {
            return res.status(400).json({ message: "You are already a member" });
        }

        const options = {
            amount: 4900, // ₹49 in paise
            currency: "INR",
            receipt: `membership_${req.user._id}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan: "premium_monthly",
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.error("Error creating Razorpay order:", err);
        const errorMsg = err.error?.description || err.message || "Failed to create payment order";
        res.status(500).json({ message: errorMsg });
    }
});

// Verify payment and activate membership
router.post("/verify-payment", async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: "Missing payment details" });
        }

        // Verify signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        // Payment verified — activate membership
        const user = await User.findById(req.user._id);
        user.isMember = true;
        user.memberSince = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: "Payment verified! Welcome to freeChat Premium! 🎉",
            isMember: true,
            memberSince: user.memberSince,
        });
    } catch (err) {
        console.error("Error verifying payment:", err.message);
        res.status(500).json({ message: "Payment verification failed" });
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
