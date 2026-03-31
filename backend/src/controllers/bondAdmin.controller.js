import Match from "../models/Match.js";
import WithdrawalRequest from "../models/WithdrawalRequest.js";
import UserWallet from "../models/UserWallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import User from "../models/User.js";

/**
 * Match Controls
 */
export const createMatch = async (req, res) => {
    try {
        const match = await Match.create(req.body);
        res.status(201).json({ success: true, match });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMatches = async (req, res) => {
    try {
        const matches = await Match.find().sort({ startTime: -1 });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateMatchStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, isPredictionsEnabled } = req.body;
        const match = await Match.findByIdAndUpdate(id, { status, isPredictionsEnabled }, { new: true });
        res.status(200).json({ success: true, match });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Withdrawal Management
 */
export const getWithdrawalRequests = async (req, res) => {
    try {
        const requests = await WithdrawalRequest.find()
            .populate("userId", "fullName email")
            .sort({ createdAt: -1 });
        res.status(200).json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const processWithdrawal = async (req, res) => {
    const { requestId, status, adminNotes } = req.body;
    try {
        const request = await WithdrawalRequest.findById(requestId);
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (status === "approved") {
            request.status = "completed";
            // Balance was already 'frozen' in controller/wallet.controller.js
            await UserWallet.findOneAndUpdate(
                { userId: request.userId },
                { $inc: { frozenBalance: -request.amount } }
            );

            await TransactionHistory.create({
                userId: request.userId,
                amount: -request.amount,
                type: "WITHDRAWAL",
                description: `Withdrawal of ₹${request.amount/10} completed via UPI.`
            });
        } else if (status === "rejected") {
            request.status = "rejected";
            // Refund the frozen balance back to winnings
            await UserWallet.findOneAndUpdate(
                { userId: request.userId },
                { $inc: { winnings: request.amount, totalBalance: request.amount, frozenBalance: -request.amount } }
            );
        }

        request.adminNotes = adminNotes;
        request.processedAt = new Date();
        await request.save();

        res.status(200).json({ success: true, message: `Withdrawal ${status}.` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Financial & Live Stats
 */
export const getFinancialStats = async (req, res) => {
    try {
        const totalWinningsDistributed = await UserWallet.aggregate([
            { $group: { _id: null, total: { $sum: "$winnings" } } }
        ]);

        const activeUsersCount = 0;

        res.status(200).json({
            activeUsers: activeUsersCount,
            totalWinnings: totalWinningsDistributed[0]?.total || 0,
            revenue: 0 // In real scenario, sum from Payment Provider/Razorpay transactions
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
