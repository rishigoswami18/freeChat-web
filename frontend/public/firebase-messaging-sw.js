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
        const replyText = event.reply; // the text from inline reply
        const senderId = data.senderId;

        if (!replyText || !senderId) return;

        console.log(`[SW] Replying to ${senderId}: ${replyText}`);

        event.waitUntil(
            fetch('/api/chat/notification-reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipientId: senderId, text: replyText }),
                credentials: 'include' // include session cookies
            }).then(response => {
                if (!response.ok) throw new Error('Failed to send reply');
                console.log('[SW] Reply sent successfully');
            }).catch(err => {
                console.error('[SW] Error sending reply:', err);
                // Fallback: Open chat if reply fails
                const fallbackUrl = self.location.origin + (data.url || '/');
                return clients.openWindow(fallbackUrl);
            })
        );
        return;
    }

    // For incoming calls or general clicks: open the app
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
