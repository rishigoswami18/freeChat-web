import admin from "firebase-admin";
import { parseServiceAccount } from "./firebaseConfig.js";

/**
 * Multi-Project Firebase Admin Initializer
 */

const getApp = (name, envKey) => {
    // 1. Return existing if initialized
    if (admin.apps.some(app => app.name === name)) {
        return admin.app(name);
    }

    // 2. Parse config
    const config = parseServiceAccount(process.env[envKey]);
    if (!config) return null;

    // 3. Initialize named app
    try {
        const app = admin.initializeApp({
            credential: admin.credential.cert(config)
        }, name);
        
        console.log(`✅ [FirebaseService] Initialized "${name}" project: ${config.project_id}`);
        return app;
    } catch (error) {
        console.error(`❌ [FirebaseService] Failed to initialize "${name}":`, error.message);
        return null;
    }
};

// Singleton instances for specific features
export const authApp = getApp("auth-app", "FIREBASE_SERVICE_ACCOUNT_JSON");
export const pushApp = getApp("push-app", "FIREBASE_PUSH_SERVICE_ACCOUNT_JSON") || authApp; 

export default admin;
