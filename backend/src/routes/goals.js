import express from "express";
import mongoose from "mongoose";
import { protectRoute } from "../middleware/auth.middleware.js";
import { walletDeduct, walletRelease } from "../middleware/walletLock.js";
import Goal from "../models/Goal.js";
import TransactionHistory from "../models/TransactionHistory.js";
import Progress from "../models/Progress.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { title, description, category, durationDays, stakeAmountUnits, evidenceType, completionThreshold, minDailyFocusMinutes, isPublic } = req.body;
        
        // 1. Atomic Wallet Deduction with $gte guard
        await walletDeduct(req.user._id, stakeAmountUnits, session);

        // 2. Create Goal
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(durationDays));

        const goal = await Goal.create([{
            userId: req.user._id,
            title, description, category, durationDays, stakeAmountUnits,
            evidenceType, completionThreshold, minDailyFocusMinutes, isPublic,
            endDate
        }], { session });

        // 3. Log Transaction
        const tx = await TransactionHistory.create([{
            userId: req.user._id,
            amount: -stakeAmountUnits,
            type: "goal_stake",
            description: `Staked ₹${stakeAmountUnits/100} on goal: ${title}`,
            status: "completed"
        }], { session });

        goal[0].stakeTxId = tx[0]._id;
        await goal[0].save({ session });

        await session.commitTransaction();
        res.status(201).json(goal[0]);
    } catch (err) {
        await session.abortTransaction();
        if (err.message === "WALLET_INSUFFICIENT") {
            return res.status(422).json({ message: "Insufficient balance" });
        }
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

router.get("/", async (req, res) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const query = { userId: req.user._id };
        if (status) query.status = status;

        const goals = await Goal.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        res.json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        
        const progress = await Progress.find({ goalId: goal._id }).sort({ dayNumber: 1 });
        res.json({ goal, progress });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post("/:id/complete", async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const goal = await Goal.findById(req.params.id).session(session);
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        if (goal.status !== "active") return res.status(400).json({ message: "Goal not active" });

        const isPassed = Goal.isEligibleForCompletion(goal);
        
        if (isPassed) {
            const rewardUnits = Goal.computeRewardUnits(goal);
            await walletRelease(req.user._id, rewardUnits, "goal_reward", session);
            
            const tx = await TransactionHistory.create([{
                userId: req.user._id,
                amount: rewardUnits,
                type: "goal_reward",
                description: `Reward for completing: ${goal.title}`,
                status: "completed"
            }], { session });

            goal.status = "completed";
            goal.rewardTxId = tx[0]._id;
        } else {
            const penaltyUnits = Goal.computePenaltyUnits(goal);
            await TransactionHistory.create([{
                userId: req.user._id,
                amount: -penaltyUnits,
                type: "goal_penalty",
                description: `Penalty for failing: ${goal.title}`,
                status: "completed"
            }], { session });

            goal.status = "failed";
        }

        await goal.save({ session });
        await session.commitTransaction();
        res.json(goal);
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ message: err.message });
    } finally {
        session.endSession();
    }
});

export default router;
