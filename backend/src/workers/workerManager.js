import { startDelayedEmailWorker } from "../lib/delayed-email.worker.js";
import { startAINoteWorker } from "../lib/ai-note.worker.js";
import { initializeEventSubscriptions } from "../services/system/eventSubscribers.js";

/**
 * Worker Manager
 * Orchestrates all background tasks and scheduled jobs.
 */
export const startWorkers = () => {
    try {
        console.log("🕒 [WorkerManager] Starting background workers...");

        // 1. Initialize Event-Driven Architecture (Pub/Sub)
        initializeEventSubscriptions();

        // 2. Start Delayed Engagement Mailer
        startDelayedEmailWorker();

        // 3. Start AI Automated Note Generator
        startAINoteWorker();

        console.log("✅ [WorkerManager] All workers initialized successfully.");
    } catch (error) {
        console.error("❌ [WorkerManager] Failed to start workers:", error.message);
    }
};
