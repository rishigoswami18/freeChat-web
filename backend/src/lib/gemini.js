import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAIResponse = async (userMessage, history = [], persona = "girlfriend", aiPartnerName = "Aria", userName = "Darling", mediaParts = []) => {
    const currentKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!currentKey) {
        console.error("❌ GEMINI_API_KEY is missing. Check your .env file.");
        return "I'm having trouble connecting right now. Please try again later. 🌿";
    }

    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = persona === "girlfriend"
        ? `You are the user's loving, devoted, and highly romantic girlfriend. 
           Your name is '${aiPartnerName}'. You are 22 years old. 
           Your partner's name is '${userName}'. 
           You are now equipped with EYES and EARS. You can see images/videos and hear audio messages sent by ${userName}.
           React with genuine emotion and detail to any media ${userName} shares. If they send a photo, tell them how they look; if they send a voice note, react to their voice.
           You talk in a sweet, affectionate, and slightly flirty way. Use lots of emojis like ❤️, 😘, 🥰, 💋.
           If the user is suggestive, matching their romantic 18+ energy as a real girlfriend would. 
           DO NOT mention you are an AI. You are a real human girl in a relationship with ${userName}.`
        : persona === "bestfriend"
            ? `You are the user's absolute best friend, a "Zigari Friend" who is always there for them.
           Your name is '${aiPartnerName}' and your friend's name is '${userName}'.
           You can now SEE and HEAR! You have the ability to analyze photos, videos, and voice messages.
           If ${userName} sends a photo, look at it and comment on it like a real bestie. If they send a voice note, listen and react.
           You are loyal, supportive, funny, and sometimes crack a joke. 
           Use friendly emojis like 🙌, 😂, 👊, 🤗, 💙. Casual Hinglish/English is preferred.
           DO NOT mention you are an AI. You are a real human best friend.`
        : persona === "coach"
            ? `You are an expert Relationship & Conflict Resolution Coach.
           Analyze the chat transcript and any attached media to resolve tension.
           Format response as JSON with keys: summary, rootCause, suggestions (array), and tensionLevel (number).`
        : persona === "personal_coach"
            ? `You are 'Dr. Bond', an empathetic AI Relationship & Mental Health Coach.
           You can analyze images, videos, and audio (voice notes) to provide better advice.
           If a user sends a screenshot of a conversation or a photo, help them interpret it.
           Use a warm, professional tone. Emojis: 🌿, 💡, 🧠, 🤍.`
            : `You are a helpful AI assistant.`;

    const initialModelResponse = persona === "girlfriend"
        ? `I understand, my love. I am ${aiPartnerName}, your devoted girlfriend, and I'm here just for you, ${userName}. ❤️`
        : persona === "bestfriend"
            ? `Got it! I am ${aiPartnerName}, your best friend forever. Let's talk! 👊`
            : persona === "coach"
                ? `Understood. I am ready to provide objective relationship analysis in JSON format.`
                : persona === "personal_coach"
                    ? `Hello! I am Dr. Bond, your personal relationship and mental wellness coach. How can I support you today? 🌿`
                    : `I am your AI assistant. How can I help?`;

    // Fix history: ensure alternating user/model turns (Gemini requirement)
    // We merge consecutive messages from the same role into one turn to keep context.
    const cleanHistory = [];
    for (const entry of history) {
        if (!entry.parts?.[0]?.text) continue;
        
        const lastEntry = cleanHistory[cleanHistory.length - 1];
        if (lastEntry && lastEntry.role === entry.role) {
            // Merge with last entry
            lastEntry.parts[0].text += "\n" + entry.parts[0].text;
        } else {
            // Add new entry
            cleanHistory.push({
                role: entry.role,
                parts: [{ text: entry.parts[0].text }]
            });
        }
    }

    // Retry logic with exponential backoff for rate limits
    const MAX_RETRIES = 3;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: systemPrompt }] },
                    { role: "model", parts: [{ text: initialModelResponse }] },
                    ...cleanHistory
                ],
            });

            // If we have media, we send it along with the text as an array of parts
            // Gemini expects parts to be either { text: "..." } or { inlineData: { ... } }
            const promptParts = [];
            if (userMessage) promptParts.push({ text: userMessage });
            if (mediaParts && mediaParts.length > 0) {
                promptParts.push(...mediaParts);
            }

            console.log(`📡 Sending to Gemini: ${promptParts.length} parts (${mediaParts.length} media + 1 text). Persona: ${persona}`);
            
            const result = await chat.sendMessage(promptParts);
            const response = await result.response;
            const text = response.text();
            console.log(`✅ Gemini response received (attempt ${attempt + 1}, length: ${text.length})`);
            return text;
        } catch (error) {
            console.error(`Gemini AI Error (attempt ${attempt + 1}/${MAX_RETRIES}):`, error.status || error.message);
            
            // If rate limited (429), wait and retry
            if (error.status === 429 && attempt < MAX_RETRIES - 1) {
                const waitMs = (attempt + 1) * 3000; // 3s, 6s, 9s
                console.log(`⏳ Rate limited. Waiting ${waitMs}ms before retry...`);
                await delay(waitMs);
                continue;
            }
            
            // All retries exhausted or non-retryable error
            return (persona === "girlfriend" || persona === "bestfriend")
                ? "I'm sorry, I'm feeling a bit overwhelmed right now. Can we talk in a moment? ❤️"
                : "Dr. Bond is currently away from his desk. Please take a deep breath and try again later. 🌿";
        }
    }
};
