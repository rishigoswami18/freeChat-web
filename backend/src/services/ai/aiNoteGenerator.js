import { getAIResponse } from "../../lib/gemini.js";

/**
 * Optimized AI Romantic Note Generator
 * Uses structured prompt templates for consistency and cost-efficiency.
 */
export const AINoteGenerator = {
    /**
     * Generates a romantic note for a specific personality.
     */
    generate: async ({ userName, aiName, persona = "companion" }) => {
        const templates = {
            companion: `Write a short, high-status motivational note for ${userName}. 
                        Tone: Professional, ambitious, and supportive. 
                        Style: Like a strategy partner encouraging a winning mindset.
                        Constraints: Under 20 words. Use 1-2 growth emojis like 🎯 or 🚀. 
                        Focus: Efficiency and long-term success.`,
            
            bestfriend: `Write a supportive, uplifting note for ${userName}.
                        Tone: Loyal, fun, and warm.
                        Style: A "ride or die" best friend checking in.
                        Constraints: Under 20 words. Use emojis.`
        };

        const prompt = templates[persona] || templates.companion;

        try {
            const note = await getAIResponse(prompt, [], persona, aiName, userName);
            return note.trim();
        } catch (error) {
            console.error(`[AINoteGenerator] Failed for ${userName}:`, error.message);
            return null;
        }
    }
};
