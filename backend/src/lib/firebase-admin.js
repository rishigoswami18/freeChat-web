import admin from "firebase-admin";

// Project 1 (Auth & Invites): book-app
let authApp;
try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        authApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
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
    if (pushSvcJson) {
        const serviceAccount = JSON.parse(pushSvcJson);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        pushApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        }, "push-app");
        console.log(`✅ Firebase Push Project (${serviceAccount.project_id}) initialized`);
    }
} catch (error) {
    console.error("❌ Firebase Push Project init failed:", error.message);
}

// Export specific services from the correct projects
export const firebaseAuth = authApp ? authApp.auth() : null;
export const firebaseMessaging = pushApp ? pushApp.messaging() : null;

export default admin;
