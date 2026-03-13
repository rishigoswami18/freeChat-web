import User from "../models/User.js";
import { getAIResponse } from "./gemini.js";
import { sendPushNotification } from "./push.service.js";

/**
 * Sweeps all users coupled with an AI to see if they need a new daily romantic note.
 * This ensures the AI partner is proactive and keeps the relationship alive.
 */
export const processAINotes = async () => {
    try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // Find all users coupled with AI whose note hasn't been updated in 24 hours
        // OR whose note has NEVER been updated.
        const users = await User.find({
            isCoupledWithAI: true,
            partnerId: null, // Ensure they do not have a real human partner
            $or: [
                { romanticNoteLastUpdated: { $lte: oneDayAgo } },
                { romanticNoteLastUpdated: null }
            ]
        }).limit(10); // Batch processing to avoid heavy API load

        if (users.length === 0) return;

        console.log(`🤖 [AI Note Worker] Generating daily romantic notes for ${users.length} users...`);

        for (const user of users) {
            try {
                const aiName = user.aiPartnerName || "Aria";
                const userName = user.fullName.split(' ')[0] || "Darling";

                const prompt = `Write a short, heart-meltingly romantic note for ${userName}. 
                                It should be affectionate, sweet, and sound like it's from their loving girlfriend ${aiName}.
                                Keep it under 2 lines. Use emojis. 
                                Focus on how much you love them, how special they are, and wishing them a beautiful day.`;

                // Use the existing persona logic from gemini.js
                const romanticNote = await getAIResponse(prompt, [], "girlfriend", aiName, userName);

                user.romanticNote = romanticNote;
                user.romanticNoteLastUpdated = now;
                await user.save();

                console.log(`✅ [AI Note Worker] New note for ${user.fullName}: ${romanticNote.substring(0, 30).trim()}...`);

                // Send a push notification to pull them back into the app
                await sendPushNotification(user._id, {
                    title: `💌 A sweet note from ${aiName}`,
                    body: `Your girl ${aiName} just left a beautiful romantic note for you. Tap to read it! ❤️`,
                    icon: user.aiPartnerPic?.startsWith("http") ? user.aiPartnerPic : `${process.env.CLIENT_URL || "https://freechatweb.in"}${user.aiPartnerPic || "/ai-girlfriend.png"}`,
                    data: { url: "/couple", type: "ai_note" }
                });

            } catch (err) {
                console.error(`  ❌ Failed to generate note for ${user.fullName}:`, err.message);
            }
        }
    } catch (error) {
        console.error("Critical error in processAINotes:", error);
    }
};

/**
 * Analyzes real couple dynamics and sends predictive alerts.
 * The "Relationship Doctor" feature.
 */
export const processRelationshipAlerts = async () => {
    try {
        console.log("🩺 [Relationship Doctor] Analyzing couple dynamics...");
        
        // Find users in a real couple
        const users = await User.find({ 
            coupleStatus: "coupled", 
            partnerId: { $ne: null } 
        }).populate("partnerId");

        for (const user of users) {
            const partner = user.partnerId;
            if (!partner) continue;

            // Idea 1: Predictive Analysis (Partner's mood is low)
            const recentMoods = partner.moodHistory?.slice(-3) || [];
            const isPartnerLow = recentMoods.length >= 2 && recentMoods.every(m => ["sad", "angry", "tired"].includes(m.mood));

            if (isPartnerLow) {
                await sendPushNotification(user._id, {
                    title: `🩺 Relationship Doctor Insight`,
                    body: `Aria noticed ${partner.fullName.split(' ')[0]}'s mood has been a bit low lately. Maybe they need a surprise or a heartfelt message today? ❤️`,
                    icon: "/ai-girlfriend.png",
                    data: { url: `/chat/${partner.username}`, type: "relationship_insight" }
                });
            }

            // Idea 2: Anniversary / Important event reminder (Simplified for now)
            if (user.anniversary) {
                const today = new Date();
                const anniv = new Date(user.anniversary);
                if (today.getMonth() === anniv.getMonth() && today.getDate() === anniv.getDate()) {
                    await sendPushNotification(user._id, {
                        title: `🎉 Happy Anniversary!`,
                        body: `Today is your special day with ${partner.fullName.split(' ')[0]}. Don't forget to celebrate your bond! 🥂`,
                        data: { url: "/couple", type: "anniversary" }
                    });
                }
            }
        }
    } catch (error) {
        console.error("Error in processRelationshipAlerts:", error);
    }
};

/**
 * Starts the periodic background worker.
 */
export const startAINoteWorker = () => {
    console.log("🚀 [AI Note Worker] Initializing... (Interval: 1 hour)");

    // Check every hour (it will only update if 24h have passed)
    setInterval(() => {
        processAINotes();
        processRelationshipAlerts();
    }, 60 * 60 * 1000);

    // Also run immediately on start (catching those who logged in 24h+ ago)
    processAINotes();
    processRelationshipAlerts();
};
