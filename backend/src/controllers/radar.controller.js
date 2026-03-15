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

    // If data is old (> 10 mins) or doesn't exist, trigger a refresh in background or synchronously if needed
    // For "Billion-Dollar" feel, we trigger a refresh if it's been more than 5 minutes
    const staleTime = 1000 * 60 * 5; 
    if (!radar || (Date.now() - new Date(radar.lastPulse).getTime() > staleTime)) {
      radar = await RadarEngine.performPulseCheck(channelId, userId);
    }

    if (!radar) {
      return res.status(404).json({ message: "Radar pulse not available yet." });
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
