import Match from "../models/Match.js";
import matchAutomationSystem from "../services/MatchAutomationSystem.js";

/**
 * Task 1: Beta Test Mode
 * Allows manual activation of any match for stress testing.
 */
export const enableTestMatch = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { forceLive } = req.body;

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match not found" });

        // Overwrite status to trigger monitor
        match.status = forceLive ? "live" : match.status;
        await match.save();

        if (forceLive) {
            matchAutomationSystem.startMatchMonitor(match);
        }

        console.log(`🧪 [TEST MODE] Match ${matchId} manually ${forceLive ? 'ACTIVATED' : 'UPDATED'}.`);
        
        res.status(200).json({ 
            success: true, 
            message: `Match ${match.matchName} is now ${match.status}. Monitoring: ${forceLive}`,
            match 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getSystemLatency = async (req, res) => {
    // Mock latency report - in real world would use Redis/Prometheus metrics
    const report = {
        api_to_db_ms: Math.floor(Math.random() * 200) + 50,
        db_to_socket_ms: Math.floor(Math.random() * 50) + 10,
        total_pipeline_latency: "60-260ms"
    };
    res.status(200).json(report);
};
