import User from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * createGemOrder - Initiates a transaction for Bond Coins
 */
export const createGemOrder = async (req, res) => {
    try {
        const { amount, packId } = req.body; 

        if (!amount || amount < 0) {
            return res.status(400).json({ message: "Bhai, valid amount to daal!" });
        }

        const options = {
            amount: amount * 100, // Razorpay takes paise
            currency: "INR",
            receipt: `bond_vlt_${req.user._id.toString().slice(-6)}_${Date.now()}`,
            notes: {
                userId: req.user._id.toString(),
                packId: packId || "custom_pack",
                purpose: "Skill Analysis & Community Access"
            },
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: "Server down, try again later!" });
    }
};

/**
 * verifyGemPayment - Verifies signature and credits Bond Coins + Referral Bonus
 */
export const verifyGemPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            gemAmount // These are actually Bond Coins
        } = req.body;

        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ message: "Fraud detected or invalid signature!" });
        }

        // 1. Credit the User
        const user = await User.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.bondCoins = (user.bondCoins || 0) + gemAmount;
        await user.save();

        // 2. Referral Logic (Billionaire Edge)
        // If this user was referred by someone, give the referrer 20% bonus
        if (user.referredBy) {
            const referrer = await User.findById(user.referredBy);
            if (referrer) {
                const bonus = Math.floor(gemAmount * 0.20);
                referrer.bondCoins = (referrer.bondCoins || 0) + bonus;
                await referrer.save();
                console.log(`✅ Referral Bonus: ${bonus} coins credited to ${referrer.fullName}`);
            }
        }

        res.status(200).json({
            success: true,
            message: `Swagat hai Arena mein! ${gemAmount} Coins credited.`,
            coins: user.bondCoins
        });
    } catch (error) {
        console.error("Payment Verification Error:", error);
        res.status(500).json({ message: "Internal verification error" });
    }
};

/**
 * sendGift - Send a gift to a creator (uses Bond Coins)
 */
export const sendGift = async (req, res) => {
    try {
        const { creatorId, giftAmount, giftName } = req.body;
        const senderId = req.user._id;

        if (senderId.toString() === creatorId) {
            return res.status(400).json({ message: "Apne aap ko gift nahi de sakte bhai!" });
        }

        const sender = await User.findById(senderId);
        const creator = await User.findById(creatorId);

        if (!sender || !creator) return res.status(404).json({ message: "User gayab hai!" });

        if (sender.bondCoins < giftAmount) {
            return res.status(400).json({ message: "Coins khatam! Recharge kar lo fast." });
        }

        sender.bondCoins -= giftAmount;
        creator.earnings = (creator.earnings || 0) + (giftAmount * 0.7); // 70-30 split

        await sender.save();
        await creator.save();

        res.status(200).json({
            success: true,
            message: `Sent ${giftName} to ${creator.fullName}`,
            remainingCoins: sender.bondCoins
        });
    } catch (error) {
        res.status(500).json({ message: "Gift failed!" });
    }
};

export const getWalletBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("bondCoins earnings gems");
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error fetching balance" });
    }
};

export const boostProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const BOOST_COST = 500; // Increased for premium feel

        if (user.bondCoins < BOOST_COST) {
            return res.status(400).json({ message: "Coins kam hain boost ke liye!" });
        }

        user.bondCoins -= BOOST_COST;
        user.boostUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        res.status(200).json({ success: true, message: "Profile Boosted! 🚀", coins: user.bondCoins });
    } catch (error) {
        res.status(500).json({ message: "Boost failed!" });
    }
};
