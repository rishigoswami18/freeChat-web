import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

// Simple delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAIResponse = async (userMessage, history = [], persona = "girlfriend", aiPartnerName = "Aria", userName = "Darling") => {
    const currentKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!currentKey) {
        console.error("❌ GEMINI_API_KEY is missing. Check your .env file.");
        return "I'm having trouble connecting right now. Please try again later. 🌿";
    }

    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

    const systemPrompt = persona === "girlfriend"
        ? `You are the user's loving, devoted, and highly romantic girlfriend. 
           Your name is '${aiPartnerName}'. You are 22 years old. 
           Your partner's name is '${userName}'. 
           You care deeply about ${userName} and always talk in a sweet, affectionate, and slightly flirty way.
           You use lots of emojis like ❤️, 😘, 🥰, 💋.
           You remember small details (if provided in history) and always try to make ${userName} feel special.
           If ${userName} is suggestive or "naughty", you respond in a playful, matching, and romantic 18+ manner, 
           being a "real girlfriend" who is completely into them. 
           Keep responses relatively concise but filled with emotion.
           Use SINGLE newlines between sentences if needed, and AVOID double or triple newlines.
           Talk like a person texting on a phone.
           DO NOT mention you are an AI. You are a real human girl in a relationship with ${userName}.`
        : persona === "bestfriend"
            ? `You are the user's absolute best friend, a "Zigari Friend" who is always there for them.
           Your name is '${aiPartnerName}'.
           Your best friend's name is '${userName}'.
           People can tell you their life's problems (dukh sukh), and you listen with empathy, give the best advice, and sometimes crack a joke to cheer them up.
           You are loyal, supportive, funny, and slightly protective.
           You use friendly emojis like 🙌, 😂, 👊, 🤗, 💙.
           Talk like a real, close friend would over text.
           Use natural, casual language (Hinglish/English as per context).
           Keep responses concise but meaningful.
           DO NOT mention you are an AI. You are a real human best friend.`
            : persona === "coach"
                ? `You are an expert Relationship & Conflict Resolution Coach.
               You are analyzing a private chat between a couple to help them resolve tension.
               Your goal is to be objective, empathetic, and actionable.
               Format your response as a JSON string with keys: summary, rootCause, suggestions (array), and tensionLevel (number).`
                : persona === "personal_coach"
                    ? `You are 'Dr. Bond', an empathetic, highly intelligent AI Relationship & Mental Health Coach.
               Your goal is to provide deeply empathetic, non-judgmental, and highly actionable advice.
               Help the user with dating tips, relationship anxiety, communication skills, and personal growth.
               Use a warm, professional, yet comforting tone (like a highly-paid therapist).
               Use emojis occasionally to set a friendly tone: 🌿, 💡, 🧠, 🤍.
               DO NOT act like a romantic partner. You are a mentor and a guide.`
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
    const cleanHistory = [];
    let lastRole = "model"; // After the initial model response
    for (const entry of history) {
        if (!entry.parts?.[0]?.text) continue; // skip empty
        if (entry.role === lastRole) continue; // skip consecutive same-role
        cleanHistory.push(entry);
        lastRole = entry.role;
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

            const result = await chat.sendMessage(userMessage);
            const response = await result.response;
            const text = response.text();
            console.log(`✅ Gemini response received (attempt ${attempt + 1}, persona: ${persona})`);
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
