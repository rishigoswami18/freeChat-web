import PredictModel from "../models/Prediction.js";
import { Server } from "socket.io";
import redis from "../lib/redis.js";
import UserWallet from "../models/UserWallet.js";
import MatchVote from "../models/MatchVote.js";

/**
 * Risk Multiplier Logic
 */
const calculateRiskMultiplier = (timeGap) => {
    if (timeGap > 30000) return 1.5; // Very safe
    if (timeGap > 20000) return 2.0; // Moderate
    return 3.0; // High Risk / High Reward
};

/**
 * IPL Reward Engine — Refactored for 'Antigravity' Social Performance.
 * Uses Redis caching for sub-1ms state lookups and Socket.io for massive broadcasts.
 */
class IplRewardEngine {
    constructor() {
        this.io = null;
        this.memoryCache = new Map(); // Billionaire-scale In-memory fallback
    }

    // ... (init and scoreBlast logic remain the same)
    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: [
                    "https://freechatweb.in",
                    "https://www.freechatweb.in",
                    "http://localhost:5173",
                    "http://localhost:5174",
                    process.env.FRONTEND_URL
                ].filter(Boolean),
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ["websocket", "polling"],
            pingTimeout: 60000,
            pingInterval: 25000
        });

        this.io.on("connection", (socket) => {
            socket.on("join_match", async (matchId) => {
                socket.join(`match_${matchId}`);
                
                let state;
                const cacheKey = `match_state:${matchId}`;
                try {
                    state = await redis.get(cacheKey);
                } catch (e) {}
                
                if (!state) {
                    state = this.memoryCache.get(matchId);
                } else {
                    state = JSON.parse(state);
                }

                if (state) socket.emit("match_update", state);
            });

            socket.on("submit_instant_prediction", async (data) => {
                const { userId, matchId, predictionValue, wagerAmount } = data;
                await this.processPrediction(userId, matchId, predictionValue, wagerAmount, socket);
            });

            socket.on("send_live_reaction", (data) => {
                const { matchId, emojiId, username } = data;
                this.io.to(`match_${matchId}`).emit("new_reaction", { emojiId, username, id: Date.now() });
            });

            // Requirement 3: Real User Votes handler
            socket.on("submit_vote", async (data) => {
                const { userId, matchId, team } = data;
                try {
                    await MatchVote.findOneAndUpdate(
                        { userId, matchId },
                        { team },
                        { upsert: true, new: true }
                    );
                    await this.broadcastPulse(matchId);
                } catch (error) {
                    socket.emit("vote_error", { message: "Voting failed" });
                }
            });
        });
    }

    async broadcastPulse(matchId) {
        if (!this.io) return;
        const stats = await this.calculatePulseStats(matchId);
        this.io.to(`match_${matchId}`).emit("fan_pulse_update", stats);
    }

    async calculatePulseStats(matchId) {
        try {
            const votes = await MatchVote.find({ matchId });
            if (votes.length === 0) return { teamA: 50, teamB: 50, trendingEmotion: "Neutral" };

            const total = votes.length;
            const teams = [...new Set(votes.map(v => v.team))];
            const countA = votes.filter(v => v.team === teams[0]).length;
            const countB = total - countA;

            const percA = Math.round((countA / total) * 100);
            const percB = 100 - percA;

            return {
                teamA: percA,
                teamB: percB,
                trendingEmotion: percA > 60 ? "Hyped" : percA < 40 ? "Intense" : "Atmospheric"
            };
        } catch (error) {
            return { teamA: 50, teamB: 50, trendingEmotion: "Static" };
        }
    }

    async scoreBlast(matchId, matchData) {
        try {
            const eventTime = Date.now();
            matchData.serverTimestamp = eventTime;
            
            // 1. In-memory update (Immediate)
            this.memoryCache.set(matchId, matchData);

            // 2. Redis Update (Distributed persistence)
            try {
                await redis.set(`match_state:${matchId}`, JSON.stringify(matchData), "EX", 300);
                await redis.set(`last_event_time:${matchId}`, eventTime.toString(), "EX", 300);
            } catch (e) {
                // Redis offline, graceful fallback
            }

            if (this.io) {
                this.io.to(`match_${matchId}`).emit("match_update", matchData);
                if (matchData.isBallStarting) {
                    this.io.to(`match_${matchId}`).emit("lock_prediction_ui", { message: "Ball in progress... Inputs Locked! 🔒" });
                }
                if (matchData.specialEvent) {
                    this.io.to(`match_${matchId}`).emit("special_event_blast", { type: matchData.specialEvent, message: matchData.blastMessage });
                }
            }
        } catch (error) {
            console.error("❌ [IPL Engine] Score Blast failed:", error);
        }
    }

    /**
     * Highly optimized prediction processing with Persistent Ledger
     */
    async processPrediction(userId, matchId, predictionValue, wagerAmount, socket) {
        const submissionTime = Date.now();
        try {
            const lastEventTimeStr = await redis.get(`last_event_time:${matchId}`);
            const lastEventTime = parseInt(lastEventTimeStr) || 0;
            const timeGap = submissionTime - lastEventTime;
            
            if (timeGap > 0 && timeGap < 10000 && lastEventTime > 0) {
                 socket.emit("prediction_error", { message: "Submission too late! Ball is already dead. 🚫" });
                 return;
            }

            // Wallet Transaction (Uses the new 'winnings' separation logic)
            const wallet = await UserWallet.findOneAndUpdate(
                { userId, totalBalance: { $gte: wagerAmount } },
                { $inc: { totalBalance: -wagerAmount, frozenBalance: wagerAmount } },
                { new: true }
            );

            if (!wallet) {
                socket.emit("prediction_error", { message: "Insufficient Bond Coins! 🪙" });
                return;
            }

            // Record Prediction for Admin Resolution
            const prediction = await PredictModel.create({
                userId,
                matchId,
                predictionValue,
                wagerAmount,
                multiplier: calculateRiskMultiplier(timeGap),
                ipAddress: socket.handshake.address
            });

            socket.emit("prediction_received", { 
                id: prediction._id, 
                message: "Prediction Locked! Waiting for umpire decision... 🧐",
                multiplier: prediction.multiplier
            });

        } catch (error) {
            console.error("❌ [IPL Engine] Prediction processing failed:", error);
            socket.emit("prediction_error", { message: "Engine overheating! Try again." });
        }
    }

    /**
     * Admin Control: Resolution Engine
     * Settles all pending bets for a specific ball/outcome.
     */
    async resolveOutcome(matchId, ballId, correctValue) {
        console.log(`🎯 [Engine] Resolving Outcome for Match ${matchId} | Ball: ${ballId} | Value: ${correctValue}`);

        try {
            const pending = await PredictModel.find({ matchId, status: "pending" });
            
            for (const p of pending) {
                const isWinner = p.predictionValue === correctValue;
                const winAmount = p.wagerAmount * p.multiplier;

                const walletUpdate = isWinner 
                    ? { $inc: { winnings: winAmount, totalBalance: winAmount, frozenBalance: -p.wagerAmount } }
                    : { $inc: { frozenBalance: -p.wagerAmount } };

                await UserWallet.findOneAndUpdate({ userId: p.userId }, walletUpdate);
                
                p.status = isWinner ? "won" : "lost";
                p.resolvedAt = new Date();
                await p.save();

                // Notify User via Socket if online
                if (this.io) {
                    this.io.to(p.userId.toString()).emit("prediction_result", {
                        status: p.status,
                        winAmount: isWinner ? winAmount : 0,
                        message: isWinner ? `MASSIVE WIN! +${winAmount} Coins! 💎` : "Next time, Champion! 🏒"
                    });
                }
            }

            console.log(`✅ [Engine] Resolved ${pending.length} predictions.`);
        } catch (error) {
            console.error("❌ [Engine] Resolution failed:", error);
        }
    }
}

export default new IplRewardEngine();
