import redis from "../lib/redis.js";
import User from "../models/User.js";
import PrizeVault from "../models/PrizeVault.js";
import { sendPushNotification } from "../lib/push.service.js";
import crypto from "crypto";

/**
 * Leaderboard Service — 'Antigravity' Speed & Fair Distribution
 * Handles the selection of daily winners and prize dispersal.
 */
class LeaderboardService {
    /**
     * Finalize Match & Distribute Prizes
     * Triggered automatically after the final ball is processed.
     */
    async processDailyWinners(matchId) {
        console.log(`🏆 [Leaderboard] Finalizing winners for: ${matchId}`);

        try {
            // 1. Fetch performance stats from Redis
            // stats dictionary: { userId: { correct: 10, total: 12, totalLatency: 5000ms } }
            const rawStats = await redis.hgetall(`match_stats:${matchId}`);
            
            if (!rawStats || Object.keys(rawStats).length === 0) {
                console.warn("⚠️ [Leaderboard] No participation data found for this match.");
                return;
            }

            // 2. Selection Algorithm (Accuracy + Speed)
            const leaderboard = Object.entries(rawStats).map(([userId, dataStr]) => {
                const data = JSON.parse(dataStr);
                const accuracy = data.correct / data.total;
                const avgSpeed = data.totalLatency / data.total; // Lower is better
                
                // Weight: 70% Accuracy | 30% Speed
                // We normalize Speed by capping it (rewarding anything under 2s equally)
                const speedScore = Math.max(0.1, 1 - (avgSpeed / 10000)); 
                const finalScore = (accuracy * 0.7) + (speedScore * 0.3);

                return { userId, finalScore, language: data.language || "en" };
            });

            // 3. Sort & Slice Top 10
            leaderboard.sort((a, b) => b.finalScore - a.finalScore);
            const winners = leaderboard.slice(0, 10);

            // 4. Distribute Prizes & Notify
            for (const [index, winner] of winners.entries()) {
                const rank = index + 1;
                const voucherCode = `BOND-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
                
                // Save to Vault
                await PrizeVault.create({
                    userId: winner.userId,
                    prizeName: rank === 1 ? "Elite Match Legend Pack" : "Fan Starter Kit",
                    prizeValue: rank === 1 ? "₹999" : "₹199",
                    redemptionCode: voucherCode,
                    sourceMatch: matchId
                });

                // Regional Notification
                const messages = {
                    hi: `बधाई हो! आप # ${rank} पर रहे! अपना पुरस्कार वाल्ट चेक करें। 🏏💎`,
                    en: `Congrats! You ranked #${rank}! Check your prize vault now. 🏆💎`,
                    ta: `வாழ்த்துகள்! நீங்கள் #${rank} இடத்தில் உள்ளீர்கள்! உங்கள் அறைப் பெட்டியைப் பார்க்கவும். 🏏`,
                    te: `అభినందనలు! మీరు #${rank} ర్యాంక్ సాధించారు! మీ బహుమతి వాల్ట్‌ని చూడండి. 🏆`
                };

                await sendPushNotification(winner.userId, {
                    title: rank === 1 ? "MATCH MVP! 👑" : "Daily Winner! 🌟",
                    body: messages[winner.language] || messages.en,
                    data: { type: "LEVEL_UP", rank: rank.toString() }
                });
            }

            // 5. Daily Reset — Clear the cache for fresh start tomorrow
            await redis.del(`match_stats:${matchId}`);
            console.log("✅ [Leaderboard] Daily Reset Complete. Prizes Dispersed.");

        } catch (error) {
            console.error("❌ [Leaderboard] Distribution Failed:", error);
        }
    }
}

export default new LeaderboardService();
