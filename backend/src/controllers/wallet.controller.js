import User from "../models/User.js";
import UserWallet from "../models/UserWallet.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import { bus, EVENTS } from "../lib/eventBus.js";

/**
 * Wallet Middleware
 * Multi-account prevention & Fraud Detection.
 * Blocks registration if the same IP is being used for suspicious referral farming.
 */
export const fraudDetection = async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const { referralCode } = req.body;

    if (referralCode && req.path.includes("signup")) {
        const referralLimit = 3; // Max referrals from one IP within 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const count = await User.countDocuments({
            registrationIP: ip,
            createdAt: { $gte: twentyFourHoursAgo }
        });

        if (count >= referralLimit) {
            console.warn(`🚨 [Fraud Detection] IP ${ip} blocked for suspicious referral farming.`);
            return res.status(403).json({ 
                message: "Security Alert: Too many accounts created from this network recently. 🛡️" 
            });
        }
    }
    next();
};

/**
 * Withdrawal Controller
 */
export const requestWithdrawal = async (req, res) => {
    const { upiId, amount } = req.body;
    const userId = req.user._id;

    try {
        if (!upiId || !amount || amount < 500) {
            return res.status(400).json({ message: "Minimum withdrawal is 500 Bond Coins. 🪙" });
        }

        // 1. Atomic logical deduction with balance check
        const wallet = await UserWallet.findOneAndUpdate(
            { userId, winnings: { $gte: amount } },
            { 
                $inc: { winnings: -amount, frozenBalance: amount },
                $set: { lastUpdated: new Date() }
            },
            { new: true }
        );

        if (!wallet) {
            return res.status(400).json({ message: "Insufficient 'Winnings' or withdrawal already in progress. 📉" });
        }


        // 2. Create Request
        const request = await WithdrawalRequest.create({
            userId,
            amount,
            upiId,
            ipAddress: req.headers["x-forwarded-for"] || req.socket.remoteAddress
        });

        // 3. Notify Admin via Event Bus
        bus.emit("ADMIN_NOTIFICATION", {
            type: "WITHDRAWAL_REQUEST",
            message: `User ${req.user.fullName} requested ₹${amount/10} payout via ${upiId}`,
            requestId: request._id
        });

        res.status(200).json({ 
            success: true, 
            message: "Withdrawal request submitted! Our auditors will process it within 24h. ⏳",
            request
        });

    } catch (error) {
        console.error("❌ [Withdrawal] Request Failed:", error);
        res.status(500).json({ message: "Payout engine encounterd an error." });
    }
};

/**
 * Tiered Reward Calculator
 * Bronze = 1x | Gold = 2x
 */
export const applyTieredMultiplier = (baseAmount, tier) => {
    const multipliers = {
        bronze: 1,
        silver: 1.5,
        gold: 2
    };
    return baseAmount * (multipliers[tier] || 1);
};
