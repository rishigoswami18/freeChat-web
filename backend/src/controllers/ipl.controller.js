import User from "../models/User.js";
import Match from "../models/Match.js";
import Series from "../models/Series.js";
import Prediction from "../models/Prediction.js";
import UserWallet from "../models/UserWallet.js";
import iplRewardEngine from "../services/iplRewardEngine.js";
import matchAutomationSystem from "../services/MatchAutomationSystem.js";
import cacheService from "../services/CacheService.js";
import { iplSquadsData } from "../data/ipl_2026_squads.js";

/**
 * Universal Cricket Hub Controller — 365 Days of Automated Betting.
 */

// Custom helper: Find the most 'high-profile' match (Featured)
const getFeaturedMatch = async () => {
  const isIplSeasonStarted = new Date() > new Date('2026-03-28T19:30:00');

  // 1. Try Live IPL (gold tier)
  let match = await Match.findOne({ status: "live", tier: "gold" }).populate("seriesId");
  
  // 2. Try any live match (Resilient discovery)
  if (!match) {
    match = await Match.findOne({ status: "live" })
      .populate("seriesId")
      .sort({ "seriesId.priority": -1 });
  }

  // 3. Try Upcoming gold (IPL) match
  if (!match) {
    match = await Match.findOne({ status: "scheduled", tier: "gold" }).populate("seriesId").sort({ startTime: 1 });
  }

  // 4. Only fall back to non-IPL matches if the season has started
  if (!match && isIplSeasonStarted) {
    match = await Match.findOne({ status: { $in: ["live", "scheduled"] } }).populate("seriesId").sort({ status: -1, startTime: 1 });
  }

  // Pre-season safety: Relaxed for Live matches
  if (match && match.status !== "live" && match.tier !== "gold" && !isIplSeasonStarted) {
    return null;
  }

  return match;
};

export const getIplLiveStats = async (req, res) => {
  try {
    const match = await getFeaturedMatch();

    if (!match) {
      return res.status(200).json({ match: null, message: "Arena Recalibrating..." });
    }

    const matchData = {
      _id: match._id,
      matchId: match._id,
      matchName: match.matchName,
      status: match.status,
      startTime: match.startTime,
      venue: match.venue,
      tier: match.tier,
      entryFee: match.entryFee,
      prizePool: match.prizePool,
      participants: match.participantsCount,
      seriesName: match.seriesId?.seriesName || "Cricket Mastery",
      score: match.currentScore?.split('(')[0].trim() || "0/0",
      overs: match.currentScore?.match(/\(([^)]+)\)/)?.[1] || "0.0",
      importantStatus: match.importantStatus || "",
      battingTeam: match.team1.name, 
      teams: {
        batting: { 
          name: match.team1.name.split(' ').map(n => n[0]).join(''),
          fullName: match.team1.name,
          score: match.currentScore?.split('(')[0].trim() || "0/0", 
          overs: match.currentScore?.match(/\(([^)]+)\)/)?.[1] || "0.0", 
          logo: match.team1.logo,
        },
        bowling: { 
          name: match.team2.name.split(' ').map(n => n[0]).join(''),
          fullName: match.team2.name,
          score: "Yet to bat", 
          overs: "0.0", 
          logo: match.team2.logo,
        }
      },
      predictionPrompt: match.status === "live" ? "Next ball outcome?" : "Match outcome?",
      predictionOptions: match.status === "live" ? [0, 1, 4, 6, "Out", "Wde"] : [match.team1.name, match.team2.name]
    };

    const response = {
      match: matchData,
      meta: {
        seasonStarted: new Date() > new Date('2026-03-28T19:30:00'),
        targetDate: '2026-03-28T19:30:00',
        prizePool: '1.5M GEMS'
      }
    };

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getLiveTicker = async (req, res) => {
  try {
    const cachedTicker = cacheService.get("universal_ticker");
    if (cachedTicker) return res.status(200).json(cachedTicker);

    // Requirement: SHOW ALL LIVE MATCHES across all series
    const matches = await Match.find({ 
      status: { $in: ["live", "scheduled"] }
    })
    .populate("seriesId")
    .sort({ 
        status: -1,             // Live first
        "seriesId.priority": -1, // Then by importance
        startTime: 1           // Then by date
    })
    .limit(20);

    const tickerData = matches.map(m => ({
      id: m._id,
      name: m.matchName,
      status: m.status,
      score: m.currentScore || (m.status === "scheduled" ? "Upcoming" : "Completed"),
      startTime: m.startTime,
      series: m.seriesId?.seriesName || "Universal Arena",
      isLive: m.status === "live",
      team1: m.team1,
      team2: m.team2
    }));

    cacheService.set("universal_ticker", tickerData, 5); // Faster refresh for Hub
    res.status(200).json(tickerData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * IPL Tab as a Filter: Reuse logic but filter for priority 100
 */
export const getIplTabContent = async (req, res) => {
    try {
        const iplMatches = await Match.find({ tier: "gold" })
            .sort({ status: -1, startTime: 1 })
            .limit(10);
        
        res.status(200).json(iplMatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const submitPrediction = async (req, res) => {
    // Prediction engine already match-agnostic as per previous refactor
    try {
        const { matchId, predictionValue, wagerAmount } = req.body;
        const userId = req.user._id;

        const match = await Match.findById(matchId);
        if (!match) return res.status(404).json({ message: "Match not found" });

        const totalDeduction = match.entryFee + (wagerAmount || 0);
        const wallet = await UserWallet.findOne({ userId });

        if (!wallet || wallet.totalBalance < totalDeduction) {
            return res.status(400).json({ message: "Insufficient Bond Coins 🪙" });
        }

        await UserWallet.findOneAndUpdate({ userId }, { $inc: { totalBalance: -totalDeduction, frozenBalance: (wagerAmount || 0) } });
        await Match.findByIdAndUpdate(matchId, { $inc: { participantsCount: 1, prizePool: match.entryFee * 0.8 } });

        const prediction = new Prediction({
            userId, matchId, predictionValue, wagerAmount: wagerAmount || 0,
            multiplier: match.status === "live" ? 2.5 : 1.8, // Slightly buffed for Hub
            status: "pending"
        });
        await prediction.save();

        res.status(200).json({ success: true, message: "Prediction Secure! 🏟️" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getIplSquads = async (req, res) => {
  try {
    res.status(200).json(iplSquadsData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const triggerScoreBlast = async (req, res) => {
  try {
    const { matchId, type, message, updatedStats } = req.body;
    await iplRewardEngine.scoreBlast(matchId, { ...updatedStats, specialEvent: type, blastMessage: message });
    res.status(200).json({ success: true, message: "Blast delivered! 🏟️" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIplDetails = async (req, res) => {
  try {
    const { seriesId } = req.query;
    // Real logic would aggregate points from Match collection based on results
    const pointsTable = [
      { team: "TEAM A", played: 5, won: 4, lost: 1, points: 8, nrr: "+1.2" },
      { team: "TEAM B", played: 5, won: 3, lost: 2, points: 6, nrr: "+0.5" },
    ];
    res.status(200).json({ pointsTable });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUpcomingMatches = async (req, res) => {
  try {
    const now = new Date();
    // Safety Cleanup: Any scheduled match from >12h ago is likely stale
    await Match.updateMany(
        { status: "scheduled", startTime: { $lt: new Date(now.getTime() - 12 * 60 * 60000) } },
        { $set: { status: "completed" } }
    );

    const matches = await Match.find({ 
        status: "scheduled",
        startTime: { $gte: now } 
    })
      .populate("seriesId")
      .sort({ startTime: 1 })
      .limit(20);
    res.status(200).json(matches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncMatchesNow = async (req, res) => {
  try {
      await matchAutomationSystem.fullSync();
      res.status(200).json({ success: true, message: "Global Series Sync Triggered! 🔄" });
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};
export const getPythonScrape = async (req, res) => {
  try {
    const { matchName } = req.query;
    const { exec } = await import("child_process");
    const path = await import("path");
    const scriptPath = path.join(process.cwd(), "src/services/scraper.py");
    
    exec(`python "${scriptPath}" "${matchName || ''}"`, (error, stdout, stderr) => {
      if (error) return res.status(500).json({ message: error.message });
      try {
        const result = JSON.parse(stdout);
        res.status(200).json(result);
      } catch (e) {
        res.status(500).json({ message: "Failed to parse Python output" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getIplPointsTable = async (req, res) => {
  try {
    const cacheKey = "ipl_points_table";
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { exec } = await import("child_process");
    const path = await import("path");
    const scriptPath = path.join(process.cwd(), "src/services/scraper.py");

    exec(`python "${scriptPath}" "table"`, async (error, stdout, stderr) => {
      if (error) return res.status(500).json({ message: error.message });
      try {
        const result = JSON.parse(stdout);
        if (result.status === "success") {
          await cacheService.set(cacheKey, result.data, 3600); // 1 hour TTL
          res.status(200).json(result.data);
        } else {
          // Fallback static data if scraper fails
          const fallback = [
            { team: "Kolkata Knight Riders", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Sunrisers Hyderabad", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Rajasthan Royals", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Royal Challengers Bengaluru", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Chennai Super Kings", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Delhi Capitals", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Lucknow Super Giants", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Gujarat Titans", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Punjab Kings", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" },
            { team: "Mumbai Indians", played: "0", won: "0", lost: "0", nrr: "0.000", pts: "0" }
          ];
          res.status(200).json(fallback);
        }
      } catch (e) {
        res.status(500).json({ message: "Failed to parse Python output" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIplStats = async (req, res) => {
  try {
    const { type } = req.query; // runs or wickets
    const cacheKey = `ipl_stats_${type || 'runs'}`;
    const cached = await cacheService.get(cacheKey);
    if (cached) return res.status(200).json(cached);

    const { exec } = await import("child_process");
    const path = await import("path");
    const scriptPath = path.join(process.cwd(), "src/services/scraper.py");

    exec(`python "${scriptPath}" "stats" "${type || 'runs'}"`, async (error, stdout, stderr) => {
      if (error) return res.status(500).json({ message: error.message });
      try {
        const result = JSON.parse(stdout);
        if (result.status === "success" && result.data && result.data.length > 0) {
          await cacheService.set(cacheKey, result.data, 3600);
          res.status(200).json(result.data);
        } else {
          // Mock data for "Billion-Dollar" experience matching screenshot
          const mock = type === "wickets" 
            ? [
                { player: "Suyash Sharma", value: "24", team: "KKR" },
                { player: "Romario Shepherd", value: "21", team: "MI" },
                { player: "Jasprit Bumrah", value: "20", team: "MI" }
              ]
            : [
                { player: "Ishan Kishan", value: "800", team: "MI" },
                { player: "Virat Kohli", value: "720", team: "RCB" },
                { player: "Aniket Verma", value: "680", team: "DOM" }
              ];
          res.status(200).json(mock);
        }
      } catch (e) {
        res.status(500).json({ message: "Failed to parse Python output" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getIplSchedule = async (req, res) => {
  try {
    // Aggressive Lookup: Find by 'gold' tier OR by Series Name 'IPL'
    const matches = await Match.find({ 
      $or: [
        { tier: "gold" },
        { matchName: /IPL/i }
      ]
    })
    .populate("seriesId")
    .sort({ startTime: 1 })
    .limit(100);

    console.log(`🏟️ [IPL Controller] Schedule Request: Found ${matches.length} matches.`);
    
    // Group by status
    const schedule = {
      live: matches.filter(m => m.status === "live"),
      upcoming: matches.filter(m => m.status === "scheduled"),
      recent: matches.filter(m => m.status === "completed")
    };
    
    res.status(200).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const syncExternalData = async (req, res) => {
  try {
    const { secret_key, matchId, externalId, matchName, matchData } = req.body;

    // Security check
    if (!secret_key || secret_key !== process.env.SYNC_EXTERNAL_SECRET) {
      return res.status(401).json({ message: "Unauthorized automation request" });
    }

    if (!matchData) {
      return res.status(400).json({ message: "No match data provided" });
    }

    // Find the match
    let query = {};
    if (matchId) query._id = matchId;
    else if (externalId) query.externalId = externalId;
    else if (matchName) query.matchName = new RegExp(matchName, "i");
    else {
      return res.status(400).json({ message: "Provide matchId, externalId, or matchName" });
    }

    const match = await Match.findOne(query);
    if (!match) {
      return res.status(404).json({ message: "Match not found for sync" });
    }

    // Update match data
    if (matchData.score) match.currentScore = matchData.score;
    if (matchData.status) match.status = matchData.status;
    if (matchData.importantStatus) match.importantStatus = matchData.importantStatus;
    
    // Auto-enable predictions if match goes live
    if (matchData.status === "live") {
      match.isPredictionsEnabled = true;
    }

    await match.save();

    res.status(200).json({ 
      success: true, 
      message: `Match ${match.matchName} synced via automation! 🚀`,
      updated: {
        score: match.currentScore,
        status: match.status
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
