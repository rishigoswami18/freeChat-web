import { firebaseMessaging } from "./firebase-admin.js";
import User from "../models/User.js";

/**
 * Send push notification to a user by their ID
 */
export const sendPushNotification = async (userId, { title, body, data, icon }) => {
    try {
        if (!firebaseMessaging) {
            console.warn("[Push] FCM service not initialized. Skipping push.");
            return;
        }

        const user = await User.findById(userId).select("fcmTokens fullName");
        if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
            console.log(`[Push] Skipping user ${userId} - no FCM tokens`);
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: {},
            tokens: user.fcmTokens,
            // Android-specific options for high reliability & premium feel
            android: {
                priority: "high",
                notification: {
                    channelId: data?.type === "incoming_call" ? "calls" : "messages",
                    priority: "max",
                    defaultSound: true,
                    defaultVibrateTimings: true,
                    icon: "notification_icon",
                    color: "#f53855", // Brand Primary (approximately from oklch)
                    tag: data?.senderId || "bondbeyond_general", // Group by sender
                    clickAction: "FLUTTER_NOTIFICATION_CLICK" // For mobile compatibility
                },
                fcmOptions: {
                    analyticsLabel: data?.type || "general"
                }
            },
            // Web-specific options for premium browser experience
            webpush: {
                headers: {
                    Urgency: "high"
                },
                notification: {
                    icon: icon || "https://www.bondbeyond.in/logo.png",
                    badge: "https://www.bondbeyond.in/logo.png",
                    requireInteraction: data?.type === "incoming_call",
                    timestamp: Date.now(),
                    silent: false,
                    vibrate: [200, 100, 200],
                    actions: data?.type === "direct_message" ? [
                        { action: "view", title: "View Message" },
                        { action: "reply", title: "Quick Reply" }
                    ] : []
                },
                fcmOptions: {
                    link: data?.url ? `https://www.bondbeyond.in${data.url}` : "https://www.bondbeyond.in"
                }
            }
        };

        // Convert all data values to strings (FCM requirement)
        if (data) {
            Object.entries(data).forEach(([key, value]) => {
                message.data[key] = String(value);
            });
            // Add click_action for web notifications
            if (data.url) {
                message.webpush.notification.click_action = data.url;
            }
        }

        if (icon) {
            message.notification.image = icon;
        }

        // Specific overrides for incoming calls
        if (data?.type === "incoming_call") {
            message.android.notification.channelId = "calls";
            message.apns = {
                headers: { "apns-priority": "10" },
                payload: {
                    aps: { sound: "default", "content-available": 1 },
                },
            };
        }

        console.log(`[Push] Sending notification to ${user.fullName} (${user.fcmTokens.length} tokens)...`);

        const response = await firebaseMessaging.sendEachForMulticast(message);

        console.log(`[Push] Success: ${response.successCount}, Failure: ${response.failureCount}`);

        // Cleanup failed tokens
        if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const token = user.fcmTokens[idx];
                    const errorCode = resp.error?.code || "unknown";
                    const errorMsg = resp.error?.message || "No message";

                    console.error(`[Push] ❌ Token Error [${errorCode}]: ${errorMsg}`);
                    failedTokens.push(token);
                }
            });

            if (failedTokens.length > 0) {
                user.fcmTokens = user.fcmTokens.filter(t => !failedTokens.includes(t));
                await user.save();
                console.log(`[Push] Cleaned up ${failedTokens.length} invalid tokens from database`);
            }
        }

        return response;
    } catch (error) {
        console.error("[Push] Error sending notification:", error.message);
    }
};

/**
 * Save FCM token for a user
 */
export const saveFcmToken = async (userId, token) => {
    if (!token) return;
    try {
        await User.findByIdAndUpdate(userId, {
            $addToSet: { fcmTokens: token }
        });
        console.log(`[Push] Token saved for user ${userId}`);
    } catch (error) {
        console.error("[Push] Error saving FCM token:", error.message);
    }
};
