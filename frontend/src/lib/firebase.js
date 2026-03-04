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

let app;
if (firebaseConfig.projectId) {
    app = initializeApp(firebaseConfig);
} else {
    console.warn("[FCM] Firebase initialization skipped: Missing project configuration.");
}
const messaging = app ? getMessaging(app) : null;

export const requestNotificationPermission = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const token = await getToken(messaging, {
                vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY
            });

            if (token) {
                console.log("[FCM] Token acquired:", token);
                await saveFcmToken(token);
                return token;
            } else {
                console.log("[FCM] No registration token available. Request permission to generate one.");
            }
        }
    } catch (error) {
        console.error("[FCM] Notification permission error:", error);
    }
};

export const onMessageListener = () =>
    new Promise((resolve) => {
        onMessage(messaging, (payload) => {
            resolve(payload);
        });
    });

export default app;
