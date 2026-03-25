import { ChatEngine } from "../services/ai/chatEngine.js";
import { AIGateway } from "../services/ai/aiGateway.js";

/**
 * PRODUCTION AI GATEWAY (Legacy Bridge)
 * 
 * This module acts as the unified entry point for all AI text generation. 
 * While it maintains backward compatibility with the legacy 'getAIResponse' signature,
 * it routes all heavy-lifting through the scalable AIGateway service.
 * 
 * Features: Reliability, Retries, Observability, and Provider Abstraction.
 */

/**
 * @param {string} prompt - The user's input.
 * @param {Array} history - Previous message history.
 * @param {string} persona - The character personality (girlfriend, doctor, etc.)
 * @returns {Promise<string>} The AI's response.
 */
export const getAIResponse = async (prompt, history = [], persona = "companion", aiPartnerName = "Aria", userName = "Darling", mediaParts = []) => {
    try {
        // We route through ChatEngine because it handles the complex Social AI logic 
        // (history alignment, personality reinforcement, safety masking).
        // ChatEngine in turn uses the AIGateway for robust API communication.
        return await ChatEngine.getResponse({
            prompt,
            history,
            persona,
            aiName: aiPartnerName,
            userName,
            mediaParts
        });
    } catch (error) {
        // High-level fallback if the entire gateway/engine stack fails
        console.error(`[AI-GATEWAY-BRIDGE] Terminal Failure:`, error.message);
        
        const fallbackMessages = {
            companion: "Aisha here! Strategizing your next Zyro move... 🚀 Just a second.",
            bestfriend: "Hustle mode active! Zyro sync thoda slow hai, let's wait a bit. 👊",
            personal_coach: "Dr. Bond is analyzing your vision. Engine latency detected... 🌿",
            match_analyst: "Commander checking the stadium feed... 🏟️ Stadium signal is weak!",
            default: "Hustle never stops! System calibration chalu hai. ✨"
        };

        return fallbackMessages[persona] || fallbackMessages.default;
    }
};

/**
 * DIRECT GATEWAY ACCESS (For non-social tasks like analysis or generic completion)
 */
export const generateRawResponse = async (options) => {
    return await AIGateway.generate(options);
};
