import User from "../models/User.js";

// Send a gift to a creator
export const sendGift = async (req, res) => {
    try {
        const { creatorId, giftAmount, giftName } = req.body;
        const senderId = req.user._id;

        if (senderId.toString() === creatorId) {
            return res.status(400).json({ message: "You cannot give a gift to yourself" });
        }

        const sender = await User.findById(senderId);
        const creator = await User.findById(creatorId);

        if (!sender || !creator) {
            return res.status(404).json({ message: "User not found" });
        }

        if (sender.gems < giftAmount) {
            return res.status(400).json({ message: "Not enough gems. Please recharge." });
        }

        // Transaction
        sender.gems -= giftAmount;
        // Creator gets 70% of the value as earnings (the fund cut is 30%)
        creator.earnings += (giftAmount * 0.7);

        await sender.save();
        await creator.save();

        res.status(200).json({
            success: true,
            message: `Sent ${giftName} to ${creator.fullName}`,
            remainingGems: sender.gems
        });
    } catch (error) {
        console.error("Error in sendGift controller:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Get current earnings and gem balance
export const getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("gems earnings");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order for gems
export const createGemOrder = async (req, res) => {
    try {
        const { amount, packId } = req.body; // price in INR

        if (!amount || amount < 0) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        const options = {
            amount: amount * 100, // convert to paise
            currency: "INR",
            receipt: `gem_rcpt_${req.user._id.toString().slice(-10)}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                packId: packId?.toString() || "custom",
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Error creating gem order:", error);
        res.status(500).json({ message: "Failed to initiate payment" });
    }
};

// Verify payment and credit gems
export const verifyGemPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gemAmount
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed" });
        }

        const user = await User.findById(req.user._id);
        user.gems += gemAmount;
        await user.save();

        res.status(200).json({
            success: true,
            message: `Successfully credited ${gemAmount} gems! 💎`,
            gems: user.gems
        });
    } catch (error) {
        console.error("Error verifying gem payment:", error);
        res.status(500).json({ message: "Verification failed" });
    }
};

// Boost profile for 24 hours (costs 99 gems)
export const boostProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        const BOOST_COST = 99;
        const BOOST_HOURS = 24;

        if (user.gems < BOOST_COST) {
            return res.status(400).json({ message: `Not enough gems. You need ${BOOST_COST}💎 to boost.` });
        }

        user.gems -= BOOST_COST;

        const now = new Date();
        const existingBoost = user.boostUntil && user.boostUntil > now ? user.boostUntil : now;
        user.boostUntil = new Date(existingBoost.getTime() + BOOST_HOURS * 60 * 60 * 1000);

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile boosted! 🚀 You are now being featured.",
            gems: user.gems,
            boostUntil: user.boostUntil
        });
    } catch (error) {
        console.error("Error boosting profile:", error);
        res.status(500).json({ message: "Failed to boost profile" });
    }
};

