import { bus, EVENTS } from "../../lib/eventBus.js";
import { EmailService } from "../email/emailService.js";
import { upsertStreamUser } from "../../lib/stream.js";
import UserWallet from "../../models/UserWallet.js";

/**
 * Global Event Subscriptions Orchestrator.
 * Centralizes all non-critical side effects to keep controllers clean.
 */
export const initializeEventSubscriptions = () => {
    
    // --- AUTH EVENTS ---
    
    // Send Welcome Email + Sync with Stream + Create Wallet when a new user registers
    bus.subscribe(EVENTS.USER.REGISTERED, async ({ user }) => {
        console.log(`[EventSubscriber] Processing Welcome tasks for ${user.email}`);
        
        // 1. Send Welcome Email
        EmailService.sendWelcome(user.email, user.fullName).catch(err => 
            console.error(`[WelcomeEmail] Error: ${err.message}`)
        );

        // 2. Sync with Stream
        upsertStreamUser({
            id: user._id.toString(),
            name: user.fullName,
            image: user.profilePic || "",
            role: user.role,
        }).catch(err => console.error(`[StreamSync] Error: ${err.message}`));

        // 3. Create Bond Wallet (Instant bonus for IPL fans)
        UserWallet.create({ userId: user._id }).catch(err => 
            console.error(`[WalletCreation] Error: ${err.message}`)
        );
    });

    // --- CHAT EVENTS ---
    
    bus.subscribe(EVENTS.CHAT.MESSAGE_SENT, async ({ message, recipientId }) => {
        // Handle real-time metrics or secondary notifications here
    });

    // --- SYSTEM EVENTS ---
    
    bus.subscribe(EVENTS.SYSTEM.ERROR_OCCURRED, async ({ error, context }) => {
        // Log to external monitoring tool (e.g., Sentry)
    });

    console.log("✅ [EventBus] All global subscriptions initialized.");
};
