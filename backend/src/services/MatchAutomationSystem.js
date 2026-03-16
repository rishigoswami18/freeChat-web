/**
 * MatchAutomationSystem — BondBeyond Backend Architect
 * Specialized in Automated Match Lifecycles, Live Syncing, and Mass Payouts.
 */
import cron from "node-cron";
import axios from "axios";
import { DateTime } from "luxon";
import dotenv from "dotenv";
dotenv.config();

import Match from "../models/Match.js";
import Prediction from "../models/Prediction.js";
import UserWallet from "../models/UserWallet.js";
import iplRewardEngine from "./iplRewardEngine.js";
import { sendPushNotification } from "../lib/push.service.js";

// --- Configuration ---
const PRIMARY_API = "https://cricket-live-data.p.rapidapi.com"; 
const RAPIDAPI_HOST = "cricket-live-data.p.rapidapi.com";
const API_KEY = process.env.RAPIDAPI_KEY;

class MatchAutomationSystem {
    constructor() {
        this.activeMonitors = new Map();
        this.headers = {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        };
    }

    /**
     * Initialization: Prime the engine
     */
    init() {
        console.log("🛠️ [MatchSystem] Priming Match Automation Engine...");
        
        // 1. Daily Sync: Every 24 hours at midnight
        cron.schedule("0 0 * * *", () => this.syncIplMatches());

        // 2. Monitoring Task: Every 15 minutes to check for upcoming matches
        cron.schedule("*/15 * * * *", () => this.orchestrateLiveMatches());

        // Initial run on boot
        this.syncIplMatches();
        this.orchestrateLiveMatches();
    }

    /**
     * Requirement 1: Daily Scheduler (Cricket API Sync)
     */
    async syncIplMatches() {
        console.log("📅 [MatchSystem] Fetching IPL Season Match List from RapidAPI...");
        try {
            const response = await axios.get(`${PRIMARY_API}/fixtures-by-series/2548`, { headers: this.headers });
            const matches = response.data.results || [];
            
            console.log(`🔍 [MatchSystem] Found ${matches.length} total matches in series.`);

            for (const m of matches) {
                // Time Conversion: API gives "date": "2025-03-22T14:00:00+00:00"
                const startUtc = DateTime.fromISO(m.date, { zone: 'utc' });
                
                await Match.findOneAndUpdate(
                    { externalId: m.id.toString() }, 
                    {
                        externalId: m.id.toString(),
                        matchName: `${m.home.code} vs ${m.away.code}`,
                        startTime: startUtc.toJSDate(),
                        status: m.status?.toLowerCase() === "live" ? "live" : "scheduled",
                        venue: m.venue,
                        team1: { name: m.home.name, logo: "" }, // API doesn't seem to provide logo in this endpoint
                        team2: { name: m.away.name, logo: "" }
                    },
                    { upsert: true, new: true }
                );
            }
            console.log(`✅ [MatchSystem] Synced IPL matches.`);
        } catch (error) {
            console.error("❌ [MatchSystem] Sync Failed:", error.message);
            this.alertAdmin(`CRITICAL: Match Sync Failed. Error: ${error.message}`);
        }
    }

    /**
     * Requirement 2: Live Sync Engine (Socket.io Pulse)
     */
    async orchestrateLiveMatches() {
        const now = new Date();
        const upcomingAndLive = await Match.find({ 
            $or: [
                { status: "live" },
                { 
                    status: "scheduled",
                    startTime: { $lte: new Date(now.getTime() + 15 * 60000) } 
                }
            ]
        });

        for (const match of upcomingAndLive) {
            if (!this.activeMonitors.has(match._id.toString())) {
                this.startMatchMonitor(match);
            }
        }
    }

    startMatchMonitor(match) {
        console.log(`📡 [MatchSystem] Starting Real-time High-Velocity Pulse for: ${match.matchName}`);
        
        let mockOvers = match.matchName === "RCB vs SRH" ? 17.4 : 18.2;
        let mockScore = match.matchName === "RCB vs SRH" ? 214 : 184;
        let mockWickets = match.matchName === "RCB vs SRH" ? 3 : 4;
        let battingTeam = match.matchName === "RCB vs SRH" ? "RCB" : "CSK";

        const monitorInterval = setInterval(async () => {
            try {
                let result;
                
                // Fetch Live Response from RapidAPI
                const { data } = await axios.get(`${PRIMARY_API}/match/${match.externalId || match._id}`, { headers: this.headers });
                result = data.results || {};

                // Anti-Cheat: Global Lock State detection
                const isLockActive = result.is_live === true || result.status?.toLowerCase() === "live";

                // Broadcast via Socket.io
                const scoreData = {
                    matchId: match._id,
                    matchName: match.matchName,
                    score: result.score || "0/0",
                    overs: result.overs || "0.0",
                    battingTeam: result.batting_team || "IPL",
                    isBallInProgress: isLockActive, 
                    isLockActive: isLockActive,
                    status: result.status || "live",
                    lastBall: result.last_ball
                };
                
                iplRewardEngine.scoreBlast(match._id.toString(), scoreData);

                // Update Match status in DB
                await Match.findByIdAndUpdate(match._id, { 
                    status: result.status?.toLowerCase() === "live" ? "live" : match.status,
                    currentScore: `${scoreData.score} (${scoreData.overs})`
                });

                // Settlement check
                if (result.status?.toLowerCase() === "completed" || result.winner) {
                    this.stopMatchMonitor(match._id.toString());
                    await this.autoSettleMatch(match._id.toString(), result.winner || result.batting_team);
                }

            } catch (error) {
                console.error(`❌ [MatchSystem] Monitor Error for ${match.matchName}:`, error.message);
            }
        }, 5000); // Pulse every 5 seconds for efficiency

        this.activeMonitors.set(match._id.toString(), monitorInterval);
    }

    stopMatchMonitor(matchId) {
        const interval = this.activeMonitors.get(matchId);
        if (interval) {
            clearInterval(interval);
            this.activeMonitors.delete(matchId);
        }
    }

    /**
     * Requirement 3: Auto-Settle Logic (The Payout)
     */
    async autoSettleMatch(matchId, winnerName) {
        console.log(`💰 [MatchSystem] Automatic Settlement Triggered for Match: ${matchId}`);
        try {
            // 1. Update Match Status
            await Match.findByIdAndUpdate(matchId, { status: "completed", isPredictionsEnabled: false });

            // 2. Scan All Predictions for this match
            // Note: In BondBeyond, users predict ball-by-ball, but a 'Match Winner' bet is settled here.
            const pendingPredictions = await Prediction.find({ matchId, status: "pending" });
            
            console.log(`🔍 [MatchSystem] Scanning ${pendingPredictions.length} pending payouts...`);

            for (const p of pendingPredictions) {
                const isWinner = p.predictionValue === winnerName;
                const winAmount = p.wagerAmount * p.multiplier;

                // Atomic Wallet Update
                if (isWinner) {
                    await UserWallet.findOneAndUpdate(
                        { userId: p.userId },
                        { 
                            $inc: { winnings: winAmount, totalBalance: winAmount, frozenBalance: -p.wagerAmount },
                            $set: { lastUpdated: new Date() }
                        }
                    );
                    p.status = "won";

                    // Send Push Notification
                    await sendPushNotification(p.userId, {
                        title: "BOND WINNER! 🏆",
                        body: `Congratulations! Your prediction of ${winnerName} was correct. You earned ${winAmount} Bond Coins!`,
                        data: { type: "MATCH_RESULT", matchId }
                    });
                } else {
                    await UserWallet.findOneAndUpdate(
                        { userId: p.userId },
                        { $inc: { frozenBalance: -p.wagerAmount } }
                    );
                    p.status = "lost";
                }

                p.resolvedAt = new Date();
                await p.save();
            }

            console.log(`✅ [MatchSystem] Settlement Complete for ${matchId}.`);

        } catch (error) {
            this.alertAdmin(`SETTLEMENT CRASH: Match ${matchId} failed auto-settle. Error: ${error.message}`);
        }
    }

    /**
     * Requirement 4: High Availability & Admin Alerts
     */
    alertAdmin(message) {
        console.error(`🚨 [ADMIN ALERT] ${message}`);
        // Integration: Could send Email, WhatsApp, or Slack alert here.
    }
}

export default new MatchAutomationSystem();
