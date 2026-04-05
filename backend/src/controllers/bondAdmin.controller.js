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
 * Financial & Dashboard Stats (FreeChat Refactor)
 */
export const getFinancialStats = async (req, res) => {
    try {
        // 1. Total Users
        const userCount = await User.countDocuments();

        // 2. Gross Revenue (Total Deposits)
        const revenueAgg = await TransactionHistory.aggregate([
            { $match: { type: "DEPOSIT", status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // 3. Payouts (Processed Withdrawals)
        const payoutAgg = await WithdrawalRequest.aggregate([
            { $match: { status: "completed" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // 4. Pending Liabilities (Unprocessed Withdrawals)
        const pendingPayoutAgg = await WithdrawalRequest.aggregate([
            { $match: { status: "pending" } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // 5. TLV (Total Locked Value in user wallets)
        const tlvAgg = await UserWallet.aggregate([
            { $group: { _id: null, totalBonus: { $sum: "$bonusBalance" }, totalWinnings: { $sum: "$winnings" } } }
        ]);

        const grossRevenue = revenueAgg[0]?.total || 0;
        const totalPayouts = payoutAgg[0]?.total || 0;

        res.status(200).json({
            success: true,
            stats: {
                users: userCount,
                revenue: grossRevenue,
                payouts: totalPayouts,
                profit: grossRevenue - (totalPayouts * 1.0), // Simplified profit logic
                pendingWithdrawals: pendingPayoutAgg[0]?.total || 0,
                tlv: (tlvAgg[0]?.totalBonus || 0) + (tlvAgg[0]?.totalWinnings || 0)
            }
        });
    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const resolveMatchBall = async (req, res) => {
    const { id: matchId } = req.params;
    const { outcome, ballId } = req.body;

    try {
        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match not found" });

        // Update match ball result
        const ballIndex = match.balls.findIndex(b => b._id.toString() === ballId);
        if (ballIndex === -1) return res.status(404).json({ message: "Ball not found" });

        match.balls[ballIndex].result = outcome;
        match.balls[ballIndex].status = "resolved";
        await match.save();

        // 1. Find all predictions for this ball
        const { default: Prediction } = await import("../models/Prediction.js");
        const predictions = await Prediction.find({ matchId, ballId, status: "pending" });

        console.log(`[Admin] Resolving ball ${ballId} with outcome ${outcome}. Found ${predictions.length} predictions.`);

        for (const pred of predictions) {
            const isWinner = pred.predictedOutcome === outcome;
            pred.status = isWinner ? "won" : "lost";
            
            if (isWinner) {
                const winAmount = pred.amount * 2; // Simple 2x multiplier for now
                pred.payout = winAmount;

                // Update user wallet
                await UserWallet.findOneAndUpdate(
                    { userId: pred.userId },
                    { $inc: { winnings: winAmount, totalBalance: winAmount } }
                );

                // Log transaction
                await TransactionHistory.create({
                    userId: pred.userId,
                    amount: winAmount,
                    type: "WINNING",
                    description: `Won ₹${winAmount/10} from predicting '${outcome}' on Match #${matchId.slice(-4)}`
                });
            }
            await pred.save();
        }

        res.status(200).json({ success: true, message: `Ball resolved as ${outcome}. Payouts processed.` });
    } catch (error) {
        console.error("Resolve Ball Error:", error);
        res.status(500).json({ message: error.message });
    }
};
