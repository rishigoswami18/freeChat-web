import Song from "../../models/Song.js";

/**
 * Music Service — High-performance audio discovery & analytics engine.
 */
export const MusicService = {
    /**
     * Get trending songs based on real-time usage & growth
     */
    getTrending: async (limit = 20) => {
        return await Song.find({ isTrending: true })
            .sort({ trendingScore: -1, usageCount: -1 })
            .select("title artist audioUrl coverUrl duration usageCount genre")
            .limit(limit)
            .lean();
    },

    /**
     * Search for songs by title or artist (uses Text Index)
     */
    searchSongs: async (query, limit = 20) => {
        if (!query) return await MusicService.getTrending(limit);
        
        return await Song.find({ $text: { $search: query } })
            .sort({ usageCount: -1 })
            .limit(limit)
            .lean();
    },

    /**
     * Increment usage and recalculate trending weight
     */
    trackUsage: async (songId) => {
        // Trending Score Logic: current usage + (growth * factor)
        // Simplified for this phase: every use boosts score
        return await Song.findByIdAndUpdate(songId, {
            $inc: { usageCount: 1, trendingScore: 5 }
        }, { new: true });
    },

    /**
     * Reset/Decay trending scores (should run as cron job)
     */
    decayTrendingScores: async () => {
        // Periodic decay to ensure old songs don't stay trending forever
        await Song.updateMany(
            { trendingScore: { $gt: 0 } },
            { $mul: { trendingScore: 0.95 } }
        );
    }
};
