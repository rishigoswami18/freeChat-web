import { AIWorker } from "../services/ai/aiWorker.js";

/**
 * LEGACY WRAPPER: Routes through the new AIWorker infrastructure.
 * Ensures zero-breaking changes for the server bootstrap.
 */

export const processAINotes = async () => {
    return await AIWorker.processRomanticNotes();
};

export const processRelationshipAlerts = async () => {
    return await AIWorker.processRelationShipInsights();
};

export const startAINoteWorker = () => {
    return AIWorker.start();
};
