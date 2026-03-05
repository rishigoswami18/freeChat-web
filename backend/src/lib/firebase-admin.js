import admin from "firebase-admin";

// Project 1 (Auth & Invites): book-app
const parseServiceAccount = (jsonString) => {
    if (!jsonString) return null;
    try {
        // Fix for common env variable quoting issues (e.g. Render/Docker)
        let cleanJson = jsonString.trim();
        if ((cleanJson.startsWith("'") && cleanJson.endsWith("'")) ||
            (cleanJson.startsWith('"') && cleanJson.endsWith('"'))) {
            cleanJson = cleanJson.slice(1, -1);
        }

        const serviceAccount = JSON.parse(cleanJson);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        return serviceAccount;
    } catch (e) {
        console.error("JSON Parse Error details:", e.message);
        return null;
    }
};

// Project 1 (Auth & Invites): book-app
let authApp;
try {
    const authSvc = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    if (authSvc) {
        authApp = admin.initializeApp({
            credential: admin.credential.cert(authSvc),
        }, "auth-app");
        console.log("✅ Firebase Auth Project (book-app) initialized");
    }
} catch (error) {
    console.error("❌ Firebase Auth Project init failed:", error.message);
}

// Project 2 (Push Notifications): mychat-f3ee1
let pushApp;
try {
    const pushSvcJson = process.env.FIREBASE_PUSH_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    const pushSvc = parseServiceAccount(pushSvcJson);
    if (pushSvc) {
        pushApp = admin.initializeApp({
            credential: admin.credential.cert(pushSvc),
        }, "push-app");
        console.log(`✅ Firebase Push Project (${pushSvc.project_id}) initialized`);
    }
} catch (error) {
    console.error("❌ Firebase Push Project init failed:", error.message);
}

// Export specific services from the correct projects
export const firebaseAuth = authApp ? authApp.auth() : null;
export const firebaseMessaging = pushApp ? pushApp.messaging() : null;

export default admin;
