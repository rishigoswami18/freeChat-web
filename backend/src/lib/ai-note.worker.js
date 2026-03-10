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
                    icon: "https://avatar.iran.liara.run/public/girl?username=aria",
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
 * Starts the periodic background worker.
 */
export const startAINoteWorker = () => {
    console.log("🚀 [AI Note Worker] Initializing... (Interval: 1 hour)");

    // Check every hour (it will only update if 24h have passed)
    setInterval(() => {
        processAINotes();
    }, 60 * 60 * 1000);

    // Also run immediately on start (catching those who logged in 24h+ ago)
    processAINotes();
};
