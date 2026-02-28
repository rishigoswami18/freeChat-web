import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { hasPremiumAccess, isFreeTrial } from "../utils/freeTrial.js";

const router = express.Router();

// Initialize Razorpay safely
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;

if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    console.error("❌ CRITICAL: Razorpay API keys are missing in .env! Membership features will fail.");
} else {
    try {
        razorpay = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });
        console.log(`✅ Razorpay initialized with ${RAZORPAY_KEY_ID.startsWith("rzp_live") ? "LIVE" : "TEST"} keys`);
    } catch (err) {
        console.error("❌ Failed to initialize Razorpay:", err.message);
    }
}

router.use(protectRoute);

// Get membership status
router.get("/status", async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("isMember memberSince role");
        res.json({
            isMember: hasPremiumAccess(user),
            memberSince: user.memberSince,
            role: user.role,
            freeTrial: isFreeTrial()
        });
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
            receipt: `rcpt_${req.user._id.toString().slice(-10)}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                plan: "premium_monthly",
            },
        };

        if (!razorpay) {
            return res.status(500).json({ message: "Payment service is currently unavailable (API keys missing)" });
        }

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (err) {
        console.error("Razorpay Order Creation Error Details:", JSON.stringify(err, null, 2));
        console.error("Error creating Razorpay order:", err);
        const errorMsg = err.error?.description || err.message || "Failed to create payment order";
        res.status(500).json({
            message: errorMsg,
            details: err.error?.description || null
        });
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
