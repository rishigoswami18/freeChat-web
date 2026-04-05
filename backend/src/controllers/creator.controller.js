import UserWallet from "../models/UserWallet.js";
import TransactionHistory from "../models/TransactionHistory.js";
import User from "../models/User.js";
import Post from "../models/Post.js";

/**
 * GET /api/creator/stats
 * Overview Stats for the Creator Command Center.
 */
export const getCreatorStats = async (req, res) => {
    try {
        const creatorId = req.user._id;

        // 1. Current Balance (Winnings = Total Earnings)
        const wallet = await UserWallet.findOne({ userId: creatorId });
        
        // 2. Total Post Unlocks (Count and Revenue)
        const unlockRevenue = await TransactionHistory.aggregate([
            { $match: { recipientId: creatorId, type: { $in: ["GIFT", "POST_UNLOCK", "CHAT_UNLOCK"] } } },
            { $group: { _id: null, total: { $sum: "$amount" }, count: { $count: {} } } }
        ]);


        // 3. Trends (Week-over-week)
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const lastWeekRevenue = await TransactionHistory.aggregate([
            { $match: { recipientId: creatorId, createdAt: { $gte: sevenDaysAgo } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const totalEarnings = unlockRevenue[0]?.total || 0;

        const getTier = (earnings) => {
            if (earnings >= 500000) return { name: "Legend", fee: 3, color: "text-amber-400", icon: "👑", min: 500000, next: null };
            if (earnings >= 100000) return { name: "Elite", fee: 5, color: "text-purple-400", icon: "💎", min: 100000, next: 500000 };
            if (earnings >= 25000) return { name: "Pro", fee: 10, color: "text-blue-400", icon: "🔥", min: 25000, next: 100000 };
            if (earnings >= 5000) return { name: "Rising Star", fee: 15, color: "text-emerald-400", icon: "✨", min: 5000, next: 25000 };
            return { name: "Rookie", fee: 20, color: "text-white/40", icon: "🌱", min: 0, next: 5000 };
        };

        const currentTier = getTier(totalEarnings);
        const range = currentTier.next ? currentTier.next - currentTier.min : 1;
        const progressInTier = totalEarnings - currentTier.min;
        const nextTierProgress = currentTier.next 
            ? Math.min(100, Math.max(0, (progressInTier / range) * 100)) 
            : 100;

        res.status(200).json({
            walletBalance: wallet?.winnings || 0,
            totalEarnings,
            totalBonds: unlockRevenue[0]?.count || 0,
            eliteFansCount: 0, 
            vibeVelocity: currentTier.name === "Legend" ? "Peak" : "Ascending",
            creatorLevel: currentTier,
            nextLevelProgress: nextTierProgress,
            trends: {
                revenue: 12, 
                bonds: 5,
                fans: 2
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/creator/activities
 * Live Ticker of recent unlocks and gifts.
 */
export const getCreatorActivities = async (req, res) => {
    try {
        const creatorId = req.user._id;
        const activities = await TransactionHistory.find({ recipientId: creatorId })
            .populate("userId", "fullName profilePic location")
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/creator/elite-fans
 * Leaderboard of users who spent the most on this creator.
 */
export const getEliteFans = async (req, res) => {
    try {
        const creatorId = req.user._id;

        const fans = await TransactionHistory.aggregate([
            { $match: { recipientId: creatorId } },
            { $group: { _id: "$userId", totalSpent: { $sum: "$amount" } } },
            { $sort: { totalSpent: -1 } },
            { $limit: 5 },
            { 
              $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "fanInfo"
              }
            },
            { $unwind: "$fanInfo" }
        ]);

        const formattedFans = fans.map(f => ({
            _id: f._id,
            bondScore: f.totalSpent,
            fanId: {
                name: f.fanInfo.fullName,
                profilePic: f.fanInfo.profilePic
            }
        }));

        res.status(200).json(formattedFans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * GET /api/creator/analytics
 * Regional/Engagement data.
 */
export const getCreatorAnalytics = async (req, res) => {
    try {
        const creatorId = req.user._id;

        // Fan Countries (Regional Heatmap logic)
        const regionalData = await TransactionHistory.aggregate([
            { $match: { recipientId: creatorId } },
            { 
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "fanInfo"
              }
            },
            { $unwind: "$fanInfo" },
            { $group: { _id: "$fanInfo.location", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.status(200).json({
            regions: regionalData.map(r => ({ country: r._id || "Unknown", heat: r.count })),
            engagementRate: 8.5 // Mocked
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
