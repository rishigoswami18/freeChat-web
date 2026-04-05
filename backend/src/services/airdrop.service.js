import UserWallet from "../models/UserWallet.js";
import User from "../models/User.js";
import { createNotification } from "./notification.service.js";
import mongoose from "mongoose";

/**
 * creatorAirdrop - Creators sending coins to their elite fans
 * @param {ObjectId} creatorId - The sender
 * @param {Array} fanIds - List of recipient user IDs
 * @param {Number} amountPerFan - Coins per fan
 */
export const creatorAirdrop = async (creatorId, fanIds, amountPerFan) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const totalAmount = amountPerFan * fanIds.length;
        
        // 1. Check Creator Balance
        const creatorWallet = await UserWallet.findOne({ userId: creatorId }).session(session);
        if (!creatorWallet || creatorWallet.winnings < totalAmount) {
            throw new Error(`Insufficient funds: You need 🪙 ${totalAmount} but only have 🪙 ${creatorWallet.winnings || 0}`);
        }

        // 2. Deduct from Creator
        creatorWallet.winnings -= totalAmount;
        await creatorWallet.save({ session });

        // 3. Credit Fans
        for (const fanId of fanIds) {
            const fanWallet = await UserWallet.findOneAndUpdate(
                { userId: fanId },
                { $inc: { bonusBalance: amountPerFan } },
                { session, new: true, upsert: true }
            );

            // 🚀 Notify Fan
            await createNotification({
                recipient: fanId,
                sender: creatorId,
                type: "GIFT",
                content: `✨ Airdrop Received! You received 🪙 ${amountPerFan} coins from your favorite creator!`
            });
        }

        await session.commitTransaction();
        session.endSession();

        return { success: true, totalSent: totalAmount, totalFans: fanIds.length };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        throw error;
    }
};
