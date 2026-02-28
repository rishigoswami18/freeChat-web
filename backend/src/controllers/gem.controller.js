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

// Purchase gems (Mock for now, would integrate with payment gateway)
export const purchaseGems = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user._id);

        // In real app, verify payment signature here
        user.gems += amount;
        await user.save();

        res.status(200).json({ success: true, gems: user.gems });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
