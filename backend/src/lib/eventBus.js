import { EventEmitter } from "events";

/**
 * EventBus — Distributed Event-Driven Architecture.
 * Currently uses Node.js EventEmitter (In-Memory).
 * Designed to be swapped with Redis Pub/Sub or RabbitMQ for multi-process scaling.
 */
class EventBus extends EventEmitter {
    constructor() {
        super();
        this.setMaxListeners(50);
    }

    /**
     * Publish an event to all subscribers.
     * @param {string} eventName - e.g., 'user.registered', 'message.sent'
     * @param {Object} payload 
     */
    emit(eventName, payload) {
        console.log(`[EventBus] 📢 Event Published: ${eventName}`, {
            timestamp: new Date().toISOString(),
            payloadType: typeof payload
        });
        super.emit(eventName, payload);
    }

    /**
     * Subscribe to a specific event.
     */
    subscribe(eventName, handler) {
        console.log(`[EventBus] 👂 New Subscription: ${eventName}`);
        this.on(eventName, handler);
    }
}

export const bus = new EventBus();

// Global Event Names Registry
export const EVENTS = {
    USER: {
        REGISTERED: "user.registered",
        LOGGED_IN: "user.login",
        PROFILE_UPDATED: "user.profile_update"
    },
    CHAT: {
        MESSAGE_SENT: "chat.message_sent",
        ROOM_CREATED: "chat.room_created"
    },
    SOCIAL: {
        FRIEND_REQUEST: "social.friend_request",
        FRIEND_ACCEPTED: "social.friend_accepted"
    },
    ENGAGEMENT: {
        POST_CREATED: "engagement.post_created",
        REEL_WATCHED: "engagement.reel_watched"
    },
    SYSTEM: {
        SERVICE_STARTED: "system.start",
        ERROR_OCCURRED: "system.error"
    }
};
