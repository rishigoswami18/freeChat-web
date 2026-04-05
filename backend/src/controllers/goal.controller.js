import Goal from "../models/Goal.js";
import UserWallet from "../models/UserWallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import mongoose from "mongoose";

export const createGoal = async (req, res) => {
    try {
        const { title, description, durationDays, stakeAmount } = req.body;
        const userId = req.user._id;

        if (!title || !description || !durationDays || stakeAmount === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const wallet = await UserWallet.findOne({ userId });
        if (!wallet) return res.status(404).json({ message: "Wallet not found" });

        const totalAvailable = (wallet.winnings || 0) + (wallet.bonusBalance || 0);
        if (totalAvailable < stakeAmount) {
            return res.status(400).json({ message: "Insufficient balance for staking" });
        }

        // Deduct stake (prioritize bonusBalance first)
        let remainingToDeduct = stakeAmount;
        if (wallet.bonusBalance >= remainingToDeduct) {
            wallet.bonusBalance -= remainingToDeduct;
            remainingToDeduct = 0;
        } else {
            remainingToDeduct -= wallet.bonusBalance;
            wallet.bonusBalance = 0;
            wallet.winnings -= remainingToDeduct;
        }

        await wallet.save();

        const endDate = new Date();
        endDate.setDate(endDate.getDate() + parseInt(durationDays));

        const goal = await Goal.create({
            userId,
            title,
            description,
            durationDays,
            stakeAmount,
            endDate
        });

        // Log transaction
        await TransactionHistory.create({
            userId,
            amount: -stakeAmount,
            type: "GOAL_STAKE",
            description: `Staked ${stakeAmount} on goal: ${title}`,
            status: "completed"
        });

        res.status(201).json(goal);
    } catch (err) {
        console.error("Error creating goal:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getUserGoals = async (req, res) => {
    try {
        const userId = req.user._id;
        const goals = await Goal.find({ userId }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (err) {
        console.error("Error fetching goals:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
