// Scripts for firebase and firebase messaging
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
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
    if (!payload.notification) return;

    const isCall = payload.data?.type === "incoming_call";

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || payload.notification.icon || '/logo.png',
        data: payload.data,
        ...(isCall && {
            requireInteraction: true,
            tag: 'incoming-call',
            renotify: true,
            actions: [
                { action: 'answer', title: '✅ Answer' },
                { action: 'decline', title: '❌ Decline' },
            ],
            vibrate: [200, 100, 200, 100, 200, 100, 200],
        }),
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    const data = notification.data || {};
    notification.close();

    if (event.action === 'decline') {
        return;
    }

    // For incoming calls: open the app root so IncomingCallNotification can handle it
    // For other notifications: use the provided URL
    const isCall = data.type === 'incoming_call';
    const url = isCall ? '/' : (data.url || '/');
    const fullUrl = self.location.origin + url;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin)) {
                    client.focus();
                    if (!isCall) client.navigate(fullUrl);
                    return;
                }
            }
            return clients.openWindow(fullUrl);
        })
    );
});
