import { getAIResponse } from "../../lib/gemini.js";

/**
 * Optimized AI Romantic Note Generator
 * Uses structured prompt templates for consistency and cost-efficiency.
 */
export const AINoteGenerator = {
    /**
     * Generates a romantic note for a specific personality.
     */
    generate: async ({ userName, aiName, persona = "girlfriend" }) => {
        const templates = {
            girlfriend: `Write a short, heart-meltingly romantic note for ${userName}. 
                        Tone: Deeply affectionate, sweet, and intimate. 
                        Style: Like a loving partner sending a quick text.
                        Constraints: Under 20 words. Use 1-2 emojis. 
                        Focus: Gratitude for having them in your life.`,
            
            bestfriend: `Write a supportive, uplifting note for ${userName}.
                        Tone: Loyal, fun, and warm.
                        Style: A "ride or die" best friend checking in.
                        Constraints: Under 20 words. Use emojis.`
        };

        const prompt = templates[persona] || templates.girlfriend;

        try {
            const note = await getAIResponse(prompt, [], persona, aiName, userName);
            return note.trim();
        } catch (error) {
            console.error(`[AINoteGenerator] Failed for ${userName}:`, error.message);
            return null;
        }
    }
};
