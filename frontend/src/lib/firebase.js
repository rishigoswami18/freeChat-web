import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { saveFcmToken } from "./api";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate config
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.messagingSenderId;

let app;
if (isConfigValid) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("[FCM] Firebase initialized successfully.");
    } catch (err) {
        console.error("[FCM] Initialization error:", err);
    }
} else {
    console.warn("[FCM] Firebase initialization skipped: Missing essential config keys in production environment.");
}

const messaging = app ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    if (!messaging) {
        console.error("[FCM] Cannot request permission: Messaging not initialized. Check your VITE_FIREBASE environment variables.");
        return null;
    }

    try {
        console.log("[FCM] Requesting notification permission...");

        // Explicitly register service worker for mobile reliability
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
                scope: '/'
            });
            console.log("[FCM] Service Worker registered with scope:", registration.scope);
        }

        const permission = await Notification.requestPermission();

        if (permission === 'granted') {
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            console.log("[FCM] Permission granted. Fetching token with VAPID Key:", vapidKey ? "PRESENT" : "MISSING");

            const token = await getToken(messaging, {
                vapidKey: vapidKey || undefined
            });

            if (token) {
                console.log("[FCM] Token acquired successfully:", token.substring(0, 10) + "...");
                await saveFcmToken(token);
                return token;
            } else {
                console.warn("[FCM] No registration token received. Ensure the Service Worker is correctly installed.");
            }
        } else {
            console.warn("[FCM] Permission denied by user.");
        }
    } catch (error) {
        console.error("[FCM] Permission/Token error:", error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export default app;
