import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * getAIContentSuggestions
 * Personalized AI content strategies for creators
 */
export const getAIContentSuggestions = async (niche = "Lifestyle", creatorName = "Creator") => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `
            You are an expert Social Media Strategist for the FreeChat platform (India's Trusted Earnings social network).
            Your goal is to help a creator named ${creatorName} who focuses on the ${niche} niche.
            
            Suggest 3 highly engaging post ideas for them to post today to maximize their "Social Earnings" (coins from followers).
            Include:
            1. Title of the idea
            2. Description of the media (photo/video)
            3. A catchy caption
            4. Why it will work for the ${niche} audience.
            
            Return the response as a clean JSON array of objects.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        // Extract JSON
        const jsonMatch = text.match(/\[\s*{.*}\s*\]/s);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
        console.error("AI Content Suggestion Error:", error.message);
        return [];
    }
};
