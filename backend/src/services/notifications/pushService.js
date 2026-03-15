import { firebaseMessaging } from "../../lib/firebase-admin.js";
import { buildFcmPayload } from "./notificationBuilder.js";
import { TokenService } from "./tokenService.js";

/**
 * High-performance Push Service.
 * Handles batching, batch-sending, and automatic token lifecycle management.
 */
export const PushService = {
    /**
     * Sends a notification to a specific user.
     */
    sendToUser: async (userId, payload) => {
        try {
            if (!firebaseMessaging) {
                console.warn("[PushService] FCM not initialized.");
                return;
            }

            const tokens = await TokenService.getTokensForUser(userId);
            if (tokens.length === 0) return;

            // FCM allows max 500 tokens per multicast. For social scale, we chunk them.
            const BATCH_SIZE = 500;
            for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
                const batch = tokens.slice(i, i + BATCH_SIZE);
                await PushService.sendBatch(batch, payload);
            }
        } catch (error) {
            console.error(`[PushService] Failed for user ${userId}:`, error.message);
        }
    },

    /**
     * Executes the actual FCM multicast call with error handling.
     */
    sendBatch: async (tokens, payload) => {
        const message = buildFcmPayload(tokens, payload);
        const response = await firebaseMessaging.sendEachForMulticast(message);

        console.log(`[PushService] Dispatched. Success: ${response.successCount}, Fail: ${response.failureCount}`);

        // Cleanup invalid tokens immediately on failure
        if (response.failureCount > 0) {
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                    const error = resp.error?.code;
                    // standard FCM invalid token error codes
                    if (error === "messaging/invalid-registration-token" || 
                        error === "messaging/registration-token-not-registered") {
                        invalidTokens.push(tokens[idx]);
                    }
                }
            });

            if (invalidTokens.length > 0) {
                await TokenService.removeInvalidTokens(invalidTokens);
            }
        }
    }
};
