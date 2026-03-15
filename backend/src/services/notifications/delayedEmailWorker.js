import cron from "node-cron";
import DelayedEmail from "../../models/DelayedEmail.js";
import User from "../../models/User.js";
import { streamClient } from "../../lib/stream.js";
import { EmailService } from "../email/emailService.js";

/**
 * Delayed Email Worker
 * Periodically checks for unread activity and sends email reminders.
 */
export const DelayedEmailWorker = {
    /**
     * Process pending delayed emails
     */
    process: async () => {
        try {
            const now = new Date();
            const pendingEmails = await DelayedEmail.find({
                isProcessed: false,
                scheduledAt: { $lte: now }
            })
            .limit(20)
            .lean();

            if (pendingEmails.length === 0) return;

            console.log(`🕒 [DelayedEmailWorker] Processing ${pendingEmails.length} matured jobs...`);

            for (const record of pendingEmails) {
                try {
                    const recipient = await User.findById(record.recipientId).select("email fullName");
                    if (!recipient?.email) {
                        await DelayedEmail.findByIdAndUpdate(record._id, { isProcessed: true });
                        continue;
                    }

                    // Check unread status from Stream
                    let hasUnread = true;
                    if (streamClient) {
                        const response = await streamClient.queryUsers({ id: { $eq: record.recipientId.toString() } });
                        const user = response.users[0];
                        hasUnread = user && (user.total_unread_count || 0) > 0;
                    }

                    if (hasUnread) {
                        await EmailService.sendNotification(recipient.email, {
                            emoji: "💬",
                            title: `Unread messages from ${record.senderName}`,
                            body: `Hey ${recipient.fullName.split(' ')[0]}, you still have unread messages waiting for you: "${record.messageText}"`,
                            ctaText: "Reply Now",
                            ctaUrl: `${process.env.CLIENT_URL || "https://www.bondbeyond.in"}/inbox`
                        });
                        console.log(`✅ [DelayedEmailWorker] Sent reminder to ${recipient.email}`);
                    }

                    await DelayedEmail.findByIdAndUpdate(record._id, { isProcessed: true });
                } catch (err) {
                    console.error(`[DelayedEmailWorker] Failed job ${record._id}:`, err.message);
                    // Mark as processed to prevent infinity loop, or implement retry budget
                    await DelayedEmail.findByIdAndUpdate(record._id, { isProcessed: true });
                }
            }
        } catch (error) {
            console.error("[DelayedEmailWorker] Critical failure:", error.message);
        }
    },

    /**
     * Start the scheduled worker
     */
    start: () => {
        console.log("🚀 [DelayedEmailWorker] Scheduled. Running every 15 minutes...");
        
        // Initial run
        DelayedEmailWorker.process();

        // Cron: Every 15 minutes
        cron.schedule("*/15 * * * *", () => {
            DelayedEmailWorker.process();
        });
    }
};
