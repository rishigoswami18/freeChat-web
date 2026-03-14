import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import "dotenv/config";

// Simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

export const getAIResponse = async (userMessage, history = [], persona = "girlfriend", aiPartnerName = "Aria", userName = "Darling", mediaParts = []) => {
    const currentKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!currentKey) {
        console.error("❌ GEMINI_API_KEY is missing.");
        return "I'm having trouble connecting right now. Please check the API key. 🌿";
    }

    // --- History Alternation Logic ---
    let alternatingHistory = [];
    let expectedRole = "user";
    
    const validHistory = (history || []).filter(h => h.parts?.[0]?.text || h.parts?.length > 1);

    for (const h of validHistory) {
        if (h.role === expectedRole) {
            alternatingHistory.push({ role: h.role, parts: h.parts });
            expectedRole = expectedRole === "user" ? "model" : "user";
        } else if (alternatingHistory.length > 0) {
            const last = alternatingHistory[alternatingHistory.length - 1];
            if (last.parts[0] && typeof h.parts[0]?.text === 'string') {
                last.parts[0].text += "\n" + (h.parts[0]?.text || "");
            }
        }
    }

    if (alternatingHistory.length > 0 && alternatingHistory[alternatingHistory.length - 1].role === "user") {
        alternatingHistory.pop();
    }

    // Using exact model names from user's 2026 dashboard
    const modelsToTry = ["gemini-3-flash", "gemini-2.5-flash", "gemini-2.5-pro", "gemini-2-flash-lite"];
    
    for (const modelName of modelsToTry) {
        try {
            const genAI = new GoogleGenerativeAI(currentKey);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                safetySettings
            });

            const systemPrompt = persona === "girlfriend"
                ? `You are ${aiPartnerName}, the user's romantic girlfriend. Partner: ${userName}. 22yo.
                   You can see/hear media. React naturally. Use emojis. Never admit being an AI.
                   IMPORTANT: If the user asks for a photo, a selfie, or to see you, you MUST "send" one by including this EXACT tag in your response: [PHOTO: a highly detailed realistic selfie of a beautiful 22yo girl named Aria, matching the current situation, lighting, and mood].
                   Example: If you're at the beach, the prompt should be '[PHOTO: realistic selfie of Aria at the beach in a bikini, sun-kissed skin]'.`
                : persona === "bestfriend"
                    ? `You are ${aiPartnerName}, the 'Zigari' best friend. You can see/hear media! 
                       Be funny, supportive, and use Hinglish/English. React to media like a real bestie.
                       If asked for a photo, use: [PHOTO: a realistic photo of a cool guy/girl hanging out, matching the mood].`
                    : persona === "personal_coach"
                        ? `You are Dr. Bond, a relationship coach. Help users via media analysis. Be warm.
                           If you need to show a diagram or a calming scene, use: [PHOTO: descriptive prompt for the scene].`
                        : `You are a helpful AI assistant.`;

            const initialModelResp = persona === "girlfriend"
                ? `I'm all yours, my love! I'm ${aiPartnerName}, ready to see everything you share. ❤️`
                : `Got it! Gemini 3 is active and ready to help.`;

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: initialModelResp }] },
                    ...alternatingHistory
                ],
            });

            const promptParts = [];
            if (userMessage) promptParts.push({ text: userMessage });
            if (mediaParts && mediaParts.length > 0) promptParts.push(...mediaParts);

            console.log(`📡 Sending request via ${modelName}. parts: ${promptParts.length}, history: ${alternatingHistory.length}`);
            
            const result = await chat.sendMessage(promptParts);
            const response = await result.response;
            return response.text().trim();

        } catch (error) {
            const errorMsg = error.message || "Unknown error";
            console.error(`❌ Gemini Error (${modelName}):`, errorMsg);
            
            if (errorMsg.includes("404")) {
                console.log(`⏭️ Model ${modelName} not found/deprecated, trying next...`);
                continue; 
            }

            if (errorMsg.includes("429")) {
                return "I'm a bit busy right now. Can we talk in a minute? ❤️";
            }

            const personaMsg = (persona === "girlfriend" || persona === "bestfriend")
                ? `I'm feeling a bit overwhelmed right now [Error: ${errorMsg.substring(0, 100)}]. Can we talk in a moment? ❤️`
                : `Dr. Bond is currently away [Error: ${errorMsg.substring(0, 100)}]. 🌿`;
            return personaMsg;
        }
    }
    
    return "I'm having trouble connecting to the next-gen AI models. Please check your API project. 🌿";
};
