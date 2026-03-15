import { authApp } from "./firebaseAdmin.js";

/**
 * Firebase Auth Service Wrapper
 */
export const getFirebaseAuth = () => {
    if (!authApp) {
        console.warn("[FirebaseService] Auth App not initialized correctly.");
        return null;
    }
    return authApp.auth();
};
