import User from "../models/User.js";
import UserWallet from "../models/UserWallet.js";
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
                gemAmount: amount, // Crucial: Store the amount in notes to verify later
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
 * Uses Razorpay Order Fetch to prevent amount tampering.
 */
export const verifyGemPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        // 1. Verify Signature (Standard)
        const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");

        if (expectedSignature !== razorpay_signature) return res.status(400).json({ message: "Fraud detected!" });

        // 2. 🛡️ THE SHIELD: Fetch order from Razorpay to get the REAL amount from notes
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const gemAmount = parseInt(order.notes.gemAmount || 0);

        if (gemAmount <= 0) {
            return res.status(400).json({ message: "Invalid order amount detected." });
        }

        // 3. Credit the User Wallet (Atomic)
        const wallet = await UserWallet.findOneAndUpdate(
            { userId: req.user._id },
            { $inc: { bonusBalance: gemAmount } },
            { new: true, upsert: true }
        );

        // 4. Log Transaction (Audit-ready)
        const { default: TransactionHistory } = await import("../models/TransactionHistory.js");
        await TransactionHistory.create({
            userId: req.user._id,
            amount: gemAmount,
            type: "DEPOSIT",
            description: `Recharge for ₹${gemAmount} completed.`,
            status: "completed"
        });


        // 2. Referral Logic (Billionaire Edge)
        const user = await User.findById(req.user._id);
        if (user && user.referredBy) {
            const bonus = Math.floor(gemAmount * 0.20);
            await UserWallet.findOneAndUpdate(
                { userId: user.referredBy },
                { $inc: { bonusBalance: bonus } },
                { upsert: true }
            );
            console.log(`✅ Referral Bonus: ${bonus} coins credited to referrer.`);
        }

        res.status(200).json({
            success: true,
            message: `Swagat hai Arena mein! ${gemAmount} Coins credited.`,
            coins: wallet.totalBalance
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

        // Atomic transaction: Deduct from sender, add to creator
        const senderWallet = await UserWallet.findOneAndUpdate(
            { userId: senderId, bonusBalance: { $gte: giftAmount } },
            { $inc: { bonusBalance: -giftAmount } },
            { new: true }
        );

    if (!senderWallet) {
      return res.status(400).json({ message: "Coins khatam! Recharge kar lo fast." });
    }

    const creatorEarnings = Math.floor(giftAmount * 0.7); // 70-30 split
    await UserWallet.findOneAndUpdate(
        { userId: creatorId },
        { $inc: { winnings: creatorEarnings } },
        { upsert: true }
    );

    // 📜 Audit Trail: Log the gift transaction
    const { default: TransactionHistory } = await import("../models/TransactionHistory.js");
    await TransactionHistory.create({
        userId: senderId,
        recipientId: creatorId,
        amount: -giftAmount,
        type: "GIFT",
        description: `Sent ${giftName} gift of ₹${giftAmount} to creator.`,
        status: "completed"
    });

    res.status(200).json({
        success: true,
        message: `Sent ${giftName} to creator`,
        remainingCoins: senderWallet.totalBalance
    });
  } catch (error) {
    console.error("Gift error:", error);
    res.status(500).json({ message: "Gift failed!" });
  }
};


export const getWalletBalance = async (req, res) => {
    try {
        const wallet = await UserWallet.findOne({ userId: req.user._id });
        if (!wallet) return res.status(200).json({ totalBalance: 0, winnings: 0, bonusBalance: 0 });
        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).json({ message: "Error fetching balance" });
    }
};

export const boostProfile = async (req, res) => {
    try {
        const BOOST_COST = 500;
        
        const wallet = await UserWallet.findOneAndUpdate(
            { userId: req.user._id, bonusBalance: { $gte: BOOST_COST } },
            { $inc: { bonusBalance: -BOOST_COST } },
            { new: true }
        );

        if (!wallet) {
            return res.status(400).json({ message: "Coins kam hain boost ke liye!" });
        }

        await User.findByIdAndUpdate(req.user._id, {
            boostUntil: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });

        res.status(200).json({ success: true, message: "Profile Boosted! 🚀", coins: wallet.totalBalance });
    } catch (error) {
        res.status(500).json({ message: "Boost failed!" });
    }
};
