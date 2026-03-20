import User from "../models/User.js";

/**
 * Leaderboard Controller (Giant Slayer Module 3)
 * Handles global and localized rankings (Organization/Hostel level).
 */
export const getLeaderboard = async (req, res) => {
    try {
        const { type, organization, subLocation, limit = 10 } = req.query;
        let query = { isBanned: false };

        // 1. apply localized filters
        if (organization) {
            query.organization = organization;
        }
        if (subLocation) {
            query.subLocation = subLocation;
        }

        // 2. Select sorting logic
        let sort = {};
        if (type === "accuracy") {
            sort = { accuracy: -1, totalPredictions: -1 };
        } else {
            // Default: BondCoins (Wealth ranking)
            sort = { bondCoins: -1 };
        }

        const topUsers = await User.find(query)
            .sort(sort)
            .limit(parseInt(limit))
            .select("fullName profilePic bondCoins accuracy totalPredictions organization subLocation rank");

        res.status(200).json({
            success: true,
            filter: { organization, subLocation, type },
            leaderboard: topUsers
        });
    } catch (error) {
        console.error("❌ [Leaderboard] Error:", error);
        res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
};

/**
 * Get available organizations for filtering
 */
export const getOrganizations = async (req, res) => {
    try {
        const orgs = await User.distinct("organization", { organization: { $ne: "" } });
        res.status(200).json(orgs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
