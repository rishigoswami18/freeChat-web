import redis from "../lib/redis.js";

/**
 * Skill-Based Time Gate Middleware
 * Ensures that users cannot submit analytics or predictions after an event has occurred.
 * Calibrated for 'Courtside' fraud prevention.
 */
export const timeGate = async (req, res, next) => {
    const { matchId } = req.body;
    const submissionTime = Date.now();

    if (!matchId) return next();

    try {
        // Fetch the 'Source of Truth' timestamp from Redis
        const lastEventTimeStr = await redis.get(`last_event_time:${matchId}`);
        const lastEventTime = parseInt(lastEventTimeStr) || 0;

        // 1. Logic Gap Check
        // If the gap between the last score update and submission is too small, 
        // the user likely saw the result on a faster feed (Stadium or High-Speed TV).
        const gap = submissionTime - lastEventTime;

        if (gap > 0 && gap < 7000) { // 7-second buffer for processing + network latency
            return res.status(403).json({
                message: "Time-Gate Triggered: Prediction submitted after the event resulted. 🚫",
                code: "EVENT_EXPIRED"
            });
        }

        // 2. Fraud Flagging (The 'Courtside' Watchlist)
        // If a user consistently hits predictions within 1.5 seconds of a score update.
        if (gap > 0 && gap < 1500) {
            await redis.sadd("watchlist:courtside_cheaters", req.user._id.toString());
            console.warn(`🚨 [Security] User ${req.user._id} added to Courtside Watchlist. Gap: ${gap}ms`);
        }

        next();
    } catch (error) {
        console.error("❌ [Time-Gate] Security Check Failed:", error);
        res.status(500).json({ message: "Security Engine Latency. Try again." });
    }
};

/**
 * Weighted Reward Multiplier
 * Adjusts payouts based on the 'Risk vs Timing' profile.
 */
export const calculateRiskMultiplier = (gap) => {
    if (gap > 20000) return 1.0; // Standard reward (20s+ before event)
    if (gap > 10000) return 1.2; // Skill bonus (Predicting 10s before event)
    if (gap > 5000) return 1.5;  // Elite bonus (Predicting right before the ball)
    return 1.0;
};
