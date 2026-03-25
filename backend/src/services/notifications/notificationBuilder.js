/**
 * Central registry of notification types with priority and behavior mappings.
 */
export const NOTIFICATION_TYPES = {
    DIRECT_MESSAGE: "direct_message",
    FRIEND_REQUEST: "friend_request",
    INCOMING_CALL: "incoming_call",
    COMMENT: "comment",
    LIKE: "like",
    SYSTEM: "system"
};

export const NOTIFICATION_CONFIGS = {
    [NOTIFICATION_TYPES.DIRECT_MESSAGE]: {
        priority: "high",
        channelId: "messages",
        ttl: 3600 * 24, // 1 day
        requireInteraction: false
    },
    [NOTIFICATION_TYPES.INCOMING_CALL]: {
        priority: "high",
        channelId: "calls",
        ttl: 60, // 1 minute (urgent)
        requireInteraction: true
    },
    [NOTIFICATION_TYPES.SYSTEM]: {
        priority: "normal",
        channelId: "general",
        ttl: 3600 * 48,
        requireInteraction: false
    }
};

/**
 * Builds standard FCM payload for high delivery reliability.
 */
export const buildFcmPayload = (tokens, { title, body, data, icon }) => {
    const type = data?.type || NOTIFICATION_TYPES.SYSTEM;
    const config = NOTIFICATION_CONFIGS[type] || NOTIFICATION_CONFIGS[NOTIFICATION_TYPES.SYSTEM];

    const message = {
        tokens,
        notification: {
            title,
            body,
            image: icon || "https://www.Zyro.in/logo.png"
        },
        data: {}, // Handled below
        android: {
            priority: config.priority === "high" ? "high" : "normal",
            notification: {
                channelId: config.channelId,
                priority: config.priority === "high" ? "max" : "default",
                color: "#f53855",
                tag: data?.senderId || "general",
                clickAction: "FLUTTER_NOTIFICATION_CLICK"
            }
        },
        webpush: {
            headers: {
                Urgency: config.priority === "high" ? "high" : "normal"
            },
            notification: {
                icon: "https://www.Zyro.in/logo.png",
                badge: "https://www.Zyro.in/logo.png",
                requireInteraction: config.requireInteraction,
                timestamp: Date.now(),
                click_action: data?.url ? `https://www.Zyro.in${data.url}` : "https://www.Zyro.in"
            }
        }
    };

    // FCM requires all data values to be strings
    if (data) {
        Object.entries(data).forEach(([key, value]) => {
            message.data[key] = String(value);
        });
    }

    return message;
};
