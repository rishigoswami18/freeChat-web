import DelayedEmail from "../models/DelayedEmail.js";
import User from "../models/User.js";
import { streamClient } from "./stream.js";
import { sendNotificationEmail } from "./email.service.js";

/**
 * Checks for delayed emails that have "matured" (2 hours elapsed)
 * and sends them if the user still has unread activity.
 */
export const processDelayedEmails = async () => {
    try {
        const now = new Date();
        // Find all emails scheduled for now or earlier that haven't been processed
        const pendingEmails = await DelayedEmail.find({
            isProcessed: false,
            scheduledAt: { $lte: now }
        }).limit(20); // Process in batches

        if (pendingEmails.length === 0) return;

        console.log(`🕒 [Delayed Email] Checking unread status for ${pendingEmails.length} matured notifications...`);

        for (const record of pendingEmails) {
            try {
                const recipient = await User.findById(record.recipientId).select("email fullName");
                if (!recipient || !recipient.email) {
                    record.isProcessed = true;
                    await record.save();
                    continue;
                }

                // Check Stream unread count
                let hasUnread = false;
                if (streamClient) {
                    const response = await streamClient.queryUsers({ id: { $eq: record.recipientId.toString() } });
                    const user = response.users[0];
                    if (user && (user.total_unread_count || 0) > 0) {
                        hasUnread = true;
                    }
                } else {
                    // Fail-safe if Stream is down: assume unread
                    hasUnread = true;
                }

                if (hasUnread) {
                    await sendNotificationEmail(recipient.email, {
                        emoji: "💬",
                        title: `Still have unread messages from ${record.senderName}!`,
                        body: `Hey ${recipient.fullName.split(' ')[0]}, you have unread messages waiting for you in freeChat: <br/><br/><i>"${record.messageText}"</i><br/><br/>Log in now to catch up!`,
                        ctaText: "Reply Now",
                        ctaUrl: `${process.env.CLIENT_URL || "https://www.freechatweb.in"}/inbox`
                    });
                }

                record.isProcessed = true;
                await record.save();
            } catch (err) {
                console.error(`  ❌ Error processing delayed email for user ${record.recipientId}:`, err.message);
                // Mark as processed anyway to avoid stuck loop, or increment retry count
                record.isProcessed = true;
                await record.save();
            }
        }
    } catch (error) {
        console.error("Critical error in processDelayedEmails:", error);
    }
};

/**
 * Starts the periodic background worker.
 */
export const startDelayedEmailWorker = () => {
    console.log("🚀 [Delayed Email Worker] Initializing... (Interval: 15 minutes)");

    // Check every 15 minutes
    setInterval(() => {
        processDelayedEmails();
    }, 15 * 60 * 1000);

    // Also run immediately on start to catch any missed while server was down
    processDelayedEmails();
};
