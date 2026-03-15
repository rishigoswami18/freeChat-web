import { pushApp } from "./firebaseAdmin.js";

/**
 * Firebase Cloud Messaging Service Wrapper
 */
export const getFirebaseMessaging = () => {
    if (!pushApp) {
        console.warn("[FirebaseService] Push App not initialized correctly.");
        return null;
    }
    return pushApp.messaging();
};
