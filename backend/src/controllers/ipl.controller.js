import User from "../models/User.js";
import Match from "../models/Match.js";
import iplRewardEngine from "../services/iplRewardEngine.js";
import matchAutomationSystem from "../services/MatchAutomationSystem.js";

/**
 * IPL Dashboard Controller — Pivoted for Real-time Arena Experience.
 */

export const getIplLiveStats = async (req, res) => {
  try {
    // 1. Find a live match first, then the next scheduled one
    let match = await Match.findOne({ status: "live" });
    if (!match) {
      match = await Match.findOne({ status: "scheduled" }).sort({ startTime: 1 });
    }

    if (!match) {
      return res.status(200).json({ match: null, message: "Coming Soon" });
    }

    const matchData = {
      matchId: match._id,
      matchName: match.matchName,
      status: match.status,
      startTime: match.startTime,
      teams: {
        batting: { 
          name: match.team1.name.split(' ').map(n => n[0]).join(''), // Initial fallback
          fullName: match.team1.name,
          score: match.currentScore || "0/0", 
          overs: "0.0", 
          logo: match.team1.logo,
          color: "#FDB913"
        },
        bowling: { 
          name: match.team2.name.split(' ').map(n => n[0]).join(''),
          fullName: match.team2.name,
          score: "Yet to bat", 
          overs: "0.0", 
          logo: match.team2.logo,
          color: "#D11D26"
        }
      },
      batters: [], // We'll populate this if match is live
      bowler: {},
      last12Balls: [],
      predictionPrompt: match.status === "live" ? "Next ball outcome?" : "Match outcome?",
      predictionOptions: match.status === "live" ? [0, 1, 4, 6, "Out", "Wde"] : [match.team1.name, match.team2.name]
    };

    // 2. Dynamic Fan Pulse: Calculate based on real predictions
    const predictions = await Prediction.find({ matchId: match._id });
    const team1Votes = predictions.filter(p => p.predictionValue === match.team1.name).length;
    const team2Votes = predictions.filter(p => p.predictionValue === match.team2.name).length;
    
    const totalVotes = team1Votes + team2Votes;
    const fanPulse = {
      teamA: totalVotes > 0 ? Math.round((team1Votes / totalVotes) * 100) : 50,
      teamB: totalVotes > 0 ? Math.round((team2Votes / totalVotes) * 100) : 50,
      trendingEmotion: totalVotes > 10 ? "High Intensity" : "Anticipation"
    };

    res.status(200).json({ match: matchData, fanPulse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitPrediction = async (req, res) => {
  try {
    const { prediction } = req.body;
    const userId = req.user._id;

    res.status(200).json({ 
      success: true, 
      message: "Prediction Locked! 🔒",
      potentialReward: 20 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Trigger Score Blast (Admin/Worker triggered)
 * Pushes real-time updates to all connected sockets.
 */
export const triggerScoreBlast = async (req, res) => {
  try {
    const { matchId, type, message, updatedStats } = req.body;
    
    // 1. Process the blast through our high-velocity engine
    await iplRewardEngine.scoreBlast(matchId, {
      ...updatedStats,
      specialEvent: type, // '6', '4', 'WICKET'
      blastMessage: message
    });

    res.status(200).json({ success: true, message: "Blast delivered to the Arena! 🏟️" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingMatches = async (req, res) => {
  try {
    const matches = await Match.find({ 
      status: { $in: ["scheduled", "live"] } 
    }).sort({ startTime: 1 }).limit(10);
    
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncMatchesNow = async (req, res) => {
    try {
        await matchAutomationSystem.syncIplMatches();
        res.status(200).json({ success: true, message: "Manual sync triggered! 🔄" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
