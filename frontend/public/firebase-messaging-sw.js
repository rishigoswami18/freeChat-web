// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
// IMPORTANT: You MUST replace these placeholders with your actual Firebase Web App config from the Firebase Console.
// Go to: Project Settings -> Apps -> SDK Setup and Config.
// Since this file is in the public folder, Vite environment variables do not work here.
firebase.initializeApp({
    apiKey: "AIzaSyBAuqlmt5xGqDKZG_ROCJdiza56zPisHS0",
    authDomain: "mychat-f3ee1.firebaseapp.com",
    projectId: "mychat-f3ee1",
    storageBucket: "mychat-f3ee1.firebasestorage.app",
    messagingSenderId: "1045840095786",
    appId: "1:1045840095786:web:34fa2d3cadcaac1a86f153"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    if (!payload.notification) return; // Guard clause

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || payload.notification.icon || '/logo.png',
        data: payload.data
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.openWindow(url)
    );
});
