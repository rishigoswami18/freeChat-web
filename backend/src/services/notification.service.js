import Notification from "../models/Notification.js";

/**
 * createNotification
 * Utility to reliably create alerts and spark engagement
 */
export const createNotification = async ({ recipient, sender, type, relatedId, content }) => {
    try {
        if (!recipient || !sender) return;
        if (recipient.toString() === sender.toString()) return; // Don't notify self

        const notification = await Notification.create({
            recipient,
            sender,
            type,
            relatedId,
            content
        });

        // Fire-and-forget push notification (optional bridge)
        try {
            const { sendPushNotification } = await import("./push.service.js");
            sendPushNotification(recipient, {
                title: getTitleForType(type),
                body: content,
                data: { url: "/notifications", type }
            });
        } catch (e) {
            // Silently fail push
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error.message);
    }
};

const getTitleForType = (type) => {
    switch (type) {
        case "FOLLOW": return "✨ New Fan!";
        case "POST_UNLOCK": return "💰 Content Unlocked!";
        case "CHAT_UNLOCK": return "💬 Private Chat Unlocked!";
        case "GIFT": return "🎁 You Received a Gift!";
        case "COMMENT": return "📝 New Comment";
        case "LIKE": return "❤️ New Like";
        default: return "🎉 New Interaction";
    }
};
