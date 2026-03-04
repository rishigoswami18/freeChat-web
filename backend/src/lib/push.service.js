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
            data: data || {},
            tokens: user.fcmTokens,
        };

        if (icon) {
            message.notification.imageUrl = icon;
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
