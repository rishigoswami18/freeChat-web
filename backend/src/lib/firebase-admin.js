import admin from "firebase-admin";

// Initialize Firebase Admin SDK
// Requires FIREBASE_SERVICE_ACCOUNT_JSON env var (stringified JSON of your service account key)
// Or GOOGLE_APPLICATION_CREDENTIALS env var pointing to the service account key file path

let firebaseApp;

try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
        if (serviceAccount.private_key) {
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
        }
        firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("✅ Firebase Admin SDK initialized (from JSON env)");
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        firebaseApp = admin.initializeApp({
            credential: admin.credential.applicationDefault(),
        });
        console.log("✅ Firebase Admin SDK initialized (from credentials file)");
    } else {
        console.warn("⚠️ Firebase Admin SDK not initialized - no credentials found. Set FIREBASE_SERVICE_ACCOUNT_JSON or GOOGLE_APPLICATION_CREDENTIALS.");
    }
} catch (error) {
    console.error("❌ Firebase Admin SDK init failed:", error.message);
}

export const firebaseAuth = firebaseApp ? admin.auth() : null;
export const firebaseMessaging = firebaseApp ? admin.messaging() : null;
export default admin;
