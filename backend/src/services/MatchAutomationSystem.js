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
import Series from "../models/Series.js";
import iplRewardEngine from "./iplRewardEngine.js";
import { sendPushNotification } from "../lib/push.service.js";
import CricketProviderManager from "./CricketProviderManager.js";
import CricketDataProvider from "./providers/CricketDataProvider.js";

// --- Configuration ---
const PRIMARY_API = "https://cricket-live-data.p.rapidapi.com"; 
const RAPIDAPI_HOST = "cricket-live-data.p.rapidapi.com";

class MatchAutomationSystem {
    constructor() {
        this.activeMonitors = new Map();
        this.headers = {
            'x-rapidapi-key': process.env.RAPIDAPI_KEY,
            'x-rapidapi-host': RAPIDAPI_HOST
        };
    }
    init() {
        console.log("🛠️ [MatchSystem] Priming Universal Cricket Engine...");
        
        // 1. Sync All Global Fixtures: Every 12 hours
        cron.schedule("0 */12 * * *", () => this.syncGlobalFixtures());

        // 2. Monitoring Task: Every 2 minutes (Higher velocity for Universal Hub)
        cron.schedule("*/2 * * * *", () => this.orchestrateLiveMatches());
        
        // 3. IPL Specific Sync: Every 24 hours (Pre-season)
        cron.schedule("0 1 * * *", () => this.syncIplData());

        this.syncGlobalFixtures();
        this.orchestrateLiveMatches();
        this.syncIplData();
    }

    async syncIplData() {
        console.log("🏆 [MatchSystem] Syncing IPL 2026 Metadata (Table & Stats)...");
        try {
            // Trigger internal endpoints to refresh cache
            const baseUrl = `http://localhost:${process.env.PORT || 5001}/api/ipl`;
            await axios.get(`${baseUrl}/table`);
            await axios.get(`${baseUrl}/stats?type=runs`);
            await axios.get(`${baseUrl}/stats?type=wickets`);
        } catch (error) {
            console.log("⚠️ [MatchSystem] Local IPL Sync deferred (Backend starting?)");
        }
    }

    /**
     * Requirement: Universal API Integration
     * Fetches ALL fixtures from the API (International + Domestic)
     */
    async syncGlobalFixtures() {
        try {
            console.log("🌏 [MatchSystem] Syncing ALL Global Fixtures (Multi-Source)...");
            
            // Source 1: RapidAPI
            const response = await axios.get(`${PRIMARY_API}/fixtures`, { headers: this.headers });
            const rapidMatches = response.data.results || [];

            // Source 2: CricketData.org (The new key provided by user)
            const cricDataMatches = await CricketDataProvider.getCurrentMatches();

            // Merge & Process
            const allMatches = [...rapidMatches];
            
            // Map CricData to standard format if needed, for now just process RapidAPI as primary
            // and CricData as secondary discovery
            for (const m of allMatches) {
                const startUtc = DateTime.fromISO(m.date, { zone: 'utc' });
                const isIpl = (m.series && m.series.series_name?.includes("IPL"));
                const priority = isIpl ? 100 : (m.series?.series_name?.includes("World Cup") ? 90 : 10);
                const entryFee = isIpl ? 100 : 25; 
                const tier = isIpl ? "gold" : "bronze";

                const seriesDoc = await Series.findOne({ externalId: m.series?.id?.toString() });

                await Match.findOneAndUpdate(
                    { externalId: m.id.toString() },
                    {
                        externalId: m.id.toString(),
                        seriesId: seriesDoc ? seriesDoc._id : null,
                        externalSeriesId: m.series?.id?.toString(),
                        matchName: `${m.home.code} vs ${m.away.code}`,
                        startTime: startUtc.toJSDate(),
                        status: m.status?.toLowerCase() || "scheduled",
                        venue: m.venue,
                        team1: { name: m.home.name, logo: "" },
                        team2: { name: m.away.name, logo: "" },
                        tier,
                        entryFee
                    },
                    { upsert: true }
                );
            }

            // Also process CricData specialized matches
            for (const m of cricDataMatches) {
                // Simplified mapping for CricData discovery
                await Match.findOneAndUpdate(
                    { externalId: m.id },
                    {
                        externalId: m.id,
                        matchName: m.name,
                        startTime: m.date ? new Date(m.date) : new Date(),
                        status: m.status?.toLowerCase().includes("won") ? "completed" : "scheduled",
                        venue: m.venue || "Global Arena",
                        team1: { name: m.team1?.name || "Team 1", logo: "" },
                        team2: { name: m.team2?.name || "Team 2", logo: "" },
                        tier: m.name?.includes("IPL") ? "gold" : "bronze",
                        entryFee: m.name?.includes("IPL") ? 100 : 10
                    },
                    { upsert: true }
                );
            }

            console.log(`✅ [MatchSystem] Global Sync Complete. Discovery from 2 Pro Sources.`);
        } catch (error) {
            console.error("❌ [MatchSystem] Global Sync Failed:", error.message);
        }
    }

    async fullSync() {
        await this.syncAllSeries();
        const activeSeries = await Series.find({ isActive: true });
        for (const s of activeSeries) {
            await this.syncSeriesMatches(s.externalId, s._id);
        }
    }

    async syncAllSeries() {
        try {
            console.log("📂 [MatchSystem] Syncing tournament series list...");
            const response = await axios.get(`${PRIMARY_API}/series`, { headers: this.headers });
            const series = response.data.results || [];

            for (const s of series) {
                // Priority logic: IPL gets 100, others 0-90
                let priority = 0;
                if (s.series_name.includes("IPL")) priority = 100;
                else if (s.series_name.includes("World Cup")) priority = 90;
                else if (s.series_name.includes("T20")) priority = 50;

                await Series.findOneAndUpdate(
                    { externalId: s.id.toString() },
                    { 
                        seriesName: s.series_name,
                        externalId: s.id.toString(),
                        priority,
                        isActive: true
                    },
                    { upsert: true }
                );
            }
        } catch (error) {
            console.error("❌ [MatchSystem] Series Sync Error:", error.message);
        }
    }

    async syncSeriesMatches(externalSeriesId, internalSeriesId) {
        console.log(`📅 [MatchSystem] Syncing matches for series: ${externalSeriesId}`);
        try {
            const response = await axios.get(`${PRIMARY_API}/fixtures-by-series/${externalSeriesId}`, { headers: this.headers });
            const matches = response.data.results || [];
            
            for (const m of matches) {
                const startUtc = DateTime.fromISO(m.date, { zone: 'utc' });
                
                // Tier Logic: Randomly assign for now, can be based on teams later
                const tiers = ["gold", "silver", "bronze"];
                const tier = tiers[Math.floor(Math.random() * tiers.length)];
                const fees = { gold: 100, silver: 50, bronze: 10 };

                await Match.findOneAndUpdate(
                    { externalId: m.id.toString() }, 
                    {
                        externalId: m.id.toString(),
                        seriesId: internalSeriesId,
                        externalSeriesId: externalSeriesId.toString(),
                        matchName: `${m.home.code} vs ${m.away.code}`,
                        startTime: startUtc.toJSDate(),
                        status: m.status?.toLowerCase() === "live" ? "live" : "scheduled",
                        venue: m.venue,
                        team1: { name: m.home.name, logo: "" },
                        team2: { name: m.away.name, logo: "" },
                        tier: tier,
                        entryFee: fees[tier]
                    },
                    { upsert: true, new: true }
                );
            }
        } catch (error) {
            console.error(`❌ [MatchSystem] Match Sync Failed for ${externalSeriesId}:`, error.message);
        }
    }

    async orchestrateLiveMatches() {
        if (this.isSyncing) return;
        this.isSyncing = true;

        try {
            const now = new Date();
            const upcomingAndLive = await Match.find({ 
                $or: [
                    { status: "live" },
                    { 
                        status: "scheduled",
                        startTime: { $lte: new Date(now.getTime() + 10 * 60000) } 
                    }
                ]
            });

            console.log(`📡 [MatchSystem] Hub Monitoring: ${upcomingAndLive.length} active arenas.`);

            for (const match of upcomingAndLive) {
                if (!this.activeMonitors.has(match._id.toString())) {
                    this.startMatchMonitor(match);
                }
            }
        } finally {
            this.isSyncing = false;
        }
    }

    startMatchMonitor(match) {
        console.log(`🔌 [MatchSystem] Monitoring: ${match.matchName}`);

        // Extreme Caching + Smart Polling (Budget Strategy)
        // Interval: 15 seconds. Only runs if active connections exist.
        const monitorInterval = setInterval(async () => {
            try {
                // Fetch fresh doc to avoid stale data and check if still live
                const freshMatch = await Match.findById(match._id);
                if (!freshMatch || freshMatch.status !== "live") {
                    this.stopMatchMonitor(match._id.toString());
                    return;
                }

                // Requirement: Smart Polling
                // If no one is online, STOP calling the API to save quota.
                const activeUserCount = iplRewardEngine.getActiveUserCount();
                if (activeUserCount === 0) {
                    console.log(`💤 [MatchSystem] Arena Sleep Mode: No active watchers for ${freshMatch.matchName}`);
                    return;
                }

                // 1. Extreme Caching Check (10 seconds)
                const cacheKey = `match_api_data:${freshMatch.externalId}`;
                const cached = await iplRewardEngine.memoryCache.get(cacheKey);
                if (cached && (Date.now() - cached.timestamp < 10000)) {
                    // Force broadcast cached data to new users without hitting API
                    iplRewardEngine.scoreBlast(freshMatch._id.toString(), cached);
                    return; 
                }

                // 2. Fetch via Multi-Provider Fallback Manager
                const result = await CricketProviderManager.getMatchUpdate(freshMatch.externalId, freshMatch.matchName);
                if (!result) {
                    console.log(`⚠️ [MatchSystem] No update found for ${freshMatch.matchName}`);
                    return;
                }

                console.log(`🏏 [MatchSystem] Update for ${freshMatch.matchName}: ${result.score} (${result.overs}) - Source: ${result.source || "API"}`);

                const isLockActive = result.is_live === true || result.status?.toLowerCase() === "live";

                const scoreData = {
                    _id: freshMatch._id,
                    matchId: freshMatch._id,
                    matchName: freshMatch.matchName,
                    score: result.score || "0/0",
                    overs: result.overs || "0.0",
                    battingTeam: result.batting_team || "IPL",
                    isLockActive: isLockActive,
                    status: result.status || "live",
                    importantStatus: result.important_status || "",
                    lastBall: result.last_ball,
                    timestamp: Date.now()
                };

                // 3. Update State & Broadcast
                iplRewardEngine.memoryCache.set(cacheKey, scoreData);
                iplRewardEngine.scoreBlast(freshMatch._id.toString(), scoreData);

                // Update DB if status changed or score changed
                const newScoreStr = `${scoreData.score} (${scoreData.overs})`;
                if (
                    freshMatch.status !== scoreData.status?.toLowerCase() || 
                    freshMatch.currentScore !== newScoreStr ||
                    freshMatch.importantStatus !== scoreData.importantStatus
                ) {
                    await Match.findByIdAndUpdate(freshMatch._id, { 
                        status: scoreData.status?.toLowerCase() === "live" ? "live" : scoreData.status?.toLowerCase(),
                        currentScore: newScoreStr,
                        importantStatus: scoreData.importantStatus
                    });
                    console.log(`📝 [MatchSystem] DB Updated for ${freshMatch.matchName}: ${newScoreStr} [${scoreData.importantStatus}]`);
                }

                // Settlement check
                if (scoreData.status?.toLowerCase() === "completed" || result.winner) {
                    this.stopMatchMonitor(freshMatch._id.toString());
                    await this.autoSettleMatch(freshMatch._id.toString(), result.winner || result.battingTeam);
                }

            } catch (error) {
                console.error(`❌ [MatchSystem] Monitor Error for ${match.matchName}:`, error.message);
            }
        }, 15000); 

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
