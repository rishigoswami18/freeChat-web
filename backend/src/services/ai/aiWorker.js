import cron from "node-cron";
import User from "../../models/User.js";
import { AINoteGenerator } from "./aiNoteGenerator.js";
import { RelationshipAnalyzer } from "./relationshipAnalyzer.js";
import { sendPushNotification } from "../../lib/push.service.js";
import { defaultAIQueue } from "./aiQueue.js";

/**
 * AI Production Worker
 * Orchestrates job scheduling, relationship analysis, and proactive AI interactions.
 */
export const AIWorker = {
    /**
     * Internal: Process romantic notes for AI-coupled users
     */
    processRomanticNotes: async () => {
        const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        // Batch query for efficiency
        const users = await User.find({
            isCoupledWithAI: true,
            partnerId: null,
            $or: [
                { romanticNoteLastUpdated: { $lte: threshold } },
                { romanticNoteLastUpdated: null }
            ]
        })
        .select("_id fullName aiPartnerName aiPartnerPic romanticNoteLastUpdated")
        .limit(20);

        if (users.length === 0) return;

        console.log(`[AIWorker] Processing ${users.length} notes...`);

        for (const user of users) {
            // Queue the generative task to avoid hitting Rate Limits
            defaultAIQueue.add(async () => {
                const note = await AINoteGenerator.generate({
                    userName: user.fullName.split(' ')[0],
                    aiName: user.aiPartnerName || "Aria"
                });

                if (note) {
                    user.romanticNote = note;
                    user.romanticNoteLastUpdated = new Date();
                    await user.save();

                    // Dispatched through refactored PushService
                    await sendPushNotification(user._id, {
                        title: `💌 A message from ${user.aiPartnerName || "Aria"}`,
                        body: note,
                        icon: user.aiPartnerPic || "/ai-girlfriend.png",
                        data: { url: "/couple", type: "ai_note" }
                    });
                }
            }).catch(err => console.error(`[AIWorker] Job failed for ${user._id}:`, err.message));
        }
    },

    /**
     * Internal: Run analytics for real couples
     */
    processRelationShipInsights: async () => {
        const users = await User.find({
            coupleStatus: "coupled",
            partnerId: { $ne: null }
        })
        .select("_id fullName partnerId anniversary moodHistory")
        .populate("partnerId", "fullName username moodHistory")
        .limit(50);

        for (const user of users) {
            if (!user.partnerId) continue;

            const analysis = RelationshipAnalyzer.analyze(user, user.partnerId);
            
            if (analysis && analysis.alertType) {
                await sendPushNotification(user._id, {
                    title: analysis.alertType === 'anniversary' ? '🎉 Special Moment' : '🩺 Relationship Doctor',
                    body: analysis.insight,
                    data: { url: "/couple", type: "relationship_alert" }
                });
            }
        }
    },

    /**
     * Start the worker with node-cron
     */
    start: () => {
        console.log("🚀 [AIWorker] Scheduled. Running every hour...");

        // Run once on startup
        AIWorker.processRomanticNotes();
        AIWorker.processRelationShipInsights();

        // Cron: Every hour on the top of the hour
        cron.schedule("0 * * * *", () => {
            console.log("[AIWorker] Executing scheduled jobs...");
            AIWorker.processRomanticNotes();
            AIWorker.processRelationShipInsights();
        });
    }
};
