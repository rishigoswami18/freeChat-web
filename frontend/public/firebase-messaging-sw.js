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

    const data = payload.data || {};
    const isCall = data.type === "incoming_call";

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.image || payload.notification.icon || '/logo.png',
        data: data,
        tag: isCall ? 'incoming-call' : 'direct-message',
        renotify: true,
        badge: '/logo.png',
        requireInteraction: isCall,
        vibrate: isCall ? [200, 100, 200, 100, 200, 100, 200] : [100],

        actions: isCall ? [
            { action: 'answer', title: '✅ Answer' },
            { action: 'decline', title: '❌ Decline' },
        ] : [
            {
                action: 'reply',
                title: 'Reply',
                type: 'text',
                placeholder: 'Type your message...',
            }
        ]
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function (event) {
    const notification = event.notification;
    const data = notification.data || {};
    const action = event.action;

    notification.close();

    if (action === 'decline') return;

    // Handle Inline Reply
    if (action === 'reply') {
        const replyText = event.reply;
        const senderId = data.senderId;
        const targetUrl = data.url || '/';
        const fullUrl = self.location.origin + targetUrl;

        // If OS supports inline reply and user typed something
        if (replyText && senderId) {
            event.waitUntil(
                fetch('/api/chat/notification-reply', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ recipientId: senderId, text: replyText }),
                    credentials: 'include'
                }).then(response => {
                    if (!response.ok) throw new Error('Reply failed');
                }).catch(err => {
                    console.error('[SW] Reply Error:', err);
                    return clients.openWindow(fullUrl);
                })
            );
        } else {
            // OS doesn't support inline reply or user just clicked the button
            event.waitUntil(clients.openWindow(fullUrl));
        }
        return;
    }

    const isCall = data.type === 'incoming_call';
    const isAnswerAction = action === 'answer';

    // For calls, use the specific call URL provided in push data
    // For direct clicks or Answer action, we want the specific URL
    const targetUrl = data.url || '/';
    const fullUrl = self.location.origin + targetUrl;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (new URL(client.url).origin === self.location.origin) {
                    client.focus();
                    // Always navigate if it's a specific action or a call
                    // This ensures the transition happens correctly
                    if (isCall || isAnswerAction || !client.url.includes(targetUrl)) {
                        return client.navigate(fullUrl);
                    }
                    return;
                }
            }
            return clients.openWindow(fullUrl);
        })
    );
});
