import { RadarEngine } from "../services/ai/radarEngine.js";
import EmpathyRadar from "../models/EmpathyRadar.js";

/**
 * Controller for AI Empathy Radar
 */
export const getRadarPulse = async (req, res) => {
  try {
    const { channelId } = req.params;
    const userId = req.user._id;

    // First attempt to get existing data (fast)
    let radar = await EmpathyRadar.findOne({ channelId });

    const staleTime = 1000 * 60 * 5; 
    const isStale = !radar || (Date.now() - new Date(radar.lastPulse).getTime() > staleTime);

    if (isStale) {
      console.log(`[Radar] Data is stale or missing for ${channelId}. Triggering background pulse...`);
      // Fire-and-forget: Start the AI pulse check in the background
      RadarEngine.performPulseCheck(channelId, userId).then(updated => {
        console.log(`[Radar] Background pulse complete for ${channelId}`);
      }).catch(err => {
        console.error(`[Radar] Background pulse failed:`, err.message);
      });
    }

    if (!radar) {
      // If we have NO data yet, we can't show anything meaningful.
      // But we don't want to hang the request.
      return res.status(202).json({ message: "Initializing pulse..." });
    }

    res.status(200).json(radar);
  } catch (error) {
    console.error("Error in getRadarPulse controller:", error.message);
    res.status(500).json({ message: "AI Radar is currently recalibrating. 📡" });
  }
};

export const triggerManualPulse = async (req, res) => {
    try {
      const { channelId } = req.body;
      const userId = req.user._id;
  
      const radar = await RadarEngine.performPulseCheck(channelId, userId);
      
      if (!radar) {
        return res.status(500).json({ message: "Failed to trigger AI Pulse." });
      }
  
      res.status(200).json(radar);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
