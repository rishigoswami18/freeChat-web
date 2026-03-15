import { PushService } from "../services/notifications/pushService.js";
import { TokenService } from "../services/notifications/tokenService.js";

/**
 * LEGACY WRAPPER: Matches old push.service.js signature to prevent breaking existing code
 * while routing logic through the new production-grade architecture.
 */

export const sendPushNotification = async (userId, payload) => {
    return await PushService.sendToUser(userId, payload);
};

export const saveFcmToken = async (userId, token) => {
    // We assume web by default for the legacy wrapper
    return await TokenService.saveToken(userId, token, "web");
};

/**
 * Future-ready: Export new services for direct use in new modules
 */
export { PushService, TokenService };
