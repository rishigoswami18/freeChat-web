import { DelayedEmailWorker } from "../services/notifications/delayedEmailWorker.js";

/**
 * LEGACY WRAPPER: Routes through the modular DelayedEmailWorker.
 * Ensures backward compatibility with the server bootstrap script.
 */

export const processDelayedEmails = async () => {
    return await DelayedEmailWorker.process();
};

export const startDelayedEmailWorker = () => {
    return DelayedEmailWorker.start();
};
