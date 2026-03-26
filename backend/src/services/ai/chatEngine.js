import { HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { AIGateway } from "./aiGateway.js";
import { PersonaManager } from "./personaManager.js";
import { SafetyHandler } from "./safetyHandler.js";

/**
 * AI Chat Engine — Specialized in high-immersion character interactions.
 * Features: Model fallback, History cleanup, Personality reinforcement.
 */

const SAFETY_SETTINGS = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

const MODELS = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-latest"];

export const ChatEngine = {
    /**
     * Core Chat Implementation
     */
    getResponse: async ({ 
        prompt, 
        history = [], 
        persona = "companion", 
        aiName = "Aria", 
        userName = "Bhai", 
        mediaParts = [] 
    }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY_MISSING");

        // 1. Prepare and Scrub History
        const scrubbedHistory = SafetyHandler.scrubHistory(history);
        const alignedHistory = ChatEngine._alignHistory(scrubbedHistory).slice(-12);

        // 2. Try models in order (Fallback Logic handled by Engine, delivery by Gateway)
        for (const modelName of MODELS) {
            try {
                const text = await AIGateway.generate({
                    provider: "gemini",
                    model: modelName,
                    systemInstruction: PersonaManager.getInstructions(persona, { aiName, userName }),
                    safetySettings: SAFETY_SETTINGS,
                    messages: [
                        { role: "user", parts: [{ text: "Wake up" }] },
                        { role: "model", parts: [{ text: PersonaManager.getInitialMessage(persona, userName) }] },
                        ...alignedHistory,
                        { 
                            role: "user", 
                            parts: [
                                { text: (persona === "ZYRO_BESTIE" || persona === "bestie") 
                                    ? `${prompt}\n\n(Context: Respond as a professional strategy partner. Focus on efficiency and mindset.)` 
                                    : prompt 
                                },
                                ...mediaParts
                            ] 
                        }
                    ]
                });

                // 3. Mask robotic refusals
                return SafetyHandler.maskRefusal(text, persona, userName);

            } catch (error) {
                console.warn(`[ChatEngine] Gateway failed for ${modelName}:`, error.message);
                if (modelName === MODELS[MODELS.length - 1]) throw error;
            }
        }
    },

    /**
     * Internal: Ensures history strictly alternates User -> Model
     */
    _alignHistory: (rawHistory) => {
        let aligned = [];
        let nextRole = "user";

        for (const msg of rawHistory) {
            if (msg.role === nextRole) {
                aligned.push({ role: msg.role, parts: msg.parts });
                nextRole = nextRole === "user" ? "model" : "user";
            }
        }
        
        // Ensure it doesn't end with a User message to satisfy Gemini SDK
        if (aligned.length > 0 && aligned[aligned.length - 1].role === "user") {
            aligned.pop();
        }
        return aligned;
    }
};
