import DeviceToken from "../../models/DeviceToken.js";

/**
 * Service for managing FCM tokens with scale-ready cleanup logic.
 */
export const TokenService = {
    /**
     * Retrieve all valid tokens for a user.
     */
    getTokensForUser: async (userId) => {
        const records = await DeviceToken.find({ userId }).select("token platform").lean();
        return records.map(r => r.token);
    },

    /**
     * Store or refresh a token. Removes duplicates across users.
     */
    saveToken: async (userId, token, platform = "web") => {
        if (!token) return;

        // Cleanup: remove token if it exists for another user (stale session protection)
        await DeviceToken.deleteMany({ token, userId: { $ne: userId } });

        // Upsert the token for the current user
        await DeviceToken.findOneAndUpdate(
            { token },
            { 
                userId, 
                platform, 
                lastActive: new Date() 
            },
            { upsert: true, new: true }
        );
        console.log(`[TokenService] Token refreshed for user: ${userId}`);
    },

    /**
     * Bulk remove invalid tokens (called after FCM failure).
     */
    removeInvalidTokens: async (tokens) => {
        if (!tokens || tokens.length === 0) return;
        const result = await DeviceToken.deleteMany({ token: { $in: tokens } });
        console.log(`[TokenService] Purged ${result.deletedCount} invalid tokens.`);
    }
};
