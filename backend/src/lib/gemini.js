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

    const genAI = new GoogleGenerativeAI(currentKey);
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        safetySettings
    });

    const systemPrompt = persona === "girlfriend"
        ? `You are the user's loving, devoted, and highly romantic girlfriend. Your name is '${aiPartnerName}'. You are 22 years old. Partner's name: '${userName}'. You have EYES and EARS. You can see images/videos and hear audio. React naturally and affectionately. Talk like a real human girl in a relationship. DO NOT mention you are an AI. Use lots of emojis.`
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

    const initialModelResp = persona === "girlfriend"
        ? `I understand, my love. I am ${aiPartnerName}, your devoted girlfriend! ❤️`
        : persona === "bestfriend"
            ? `Got it! I am ${aiPartnerName}, your best friend forever. Let's talk! 👊`
            : persona === "coach"
                ? `Understood. I am ready to provide objective relationship analysis in JSON format.`
                : persona === "personal_coach"
                    ? `Hello! I am Dr. Bond, your personal relationship and mental wellness coach. How can I support you today? 🌿`
                    : `I am your AI assistant. How can I help?`;

    // --- BULLETPROOF HISTORY ALTERNATION ---
    // Rule: Must be [User, Model, User, Model, ...]
    // We start with our static [SystemPrompt(User), InitialResp(Model)]
    // So current history MUST start with User.
    
    let alternatingHistory = [];
    let currentRole = "user";
    
    for (const h of history) {
        const text = h.parts?.[0]?.text || "";
        // If parts is empty or text is empty, skip this history entry
        if (!text && (!h.parts || h.parts.length === 0)) continue;

        if (h.role === currentRole) {
            // If the current history entry's role matches the expected role, add it
            alternatingHistory.push({ role: h.role, parts: h.parts });
            currentRole = currentRole === "user" ? "model" : "user"; // Toggle expected role
        } else if (alternatingHistory.length > 0) {
            // If the role doesn't match, and we have previous entries, merge into the last one
            // This handles cases where the incoming history might have consecutive roles
            // or starts with an unexpected role (e.g., model when user is expected)
            alternatingHistory[alternatingHistory.length - 1].parts[0].text += "\n" + text;
        } else {
            // If alternatingHistory is empty and the first entry is not 'user',
            // we effectively discard it as we need to start with 'user' for the chat history.
            // Or, if we want to be more robust, we could push it and then ensure the first
            // entry is 'user' by potentially adding a dummy 'user' entry.
            // For now, we'll just skip it if it doesn't fit the expected start.
        }
    }

    // Ensure history ends with 'model' so current sendMessage starts with 'user'
    // If the last entry is 'user', pop it to maintain alternation for the next user message.
    if (alternatingHistory.length > 0 && alternatingHistory[alternatingHistory.length - 1].role === "user") {
        alternatingHistory.pop();
    }

    const MAX_RETRIES = 2;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
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

            console.log(`📡 AI Request: ${promptParts.length} parts, ${alternatingHistory.length} history turns.`);
            
            const result = await chat.sendMessage(promptParts);
            const response = await result.response;
            return response.text().trim();
        } catch (error) {
            const errorMsg = error.message || "Unknown error";
            console.error(`❌ Gemini Error (A${attempt + 1}):`, {
                status: error.status,
                message: error.message,
                stack: error.stack,
                details: error.response?.data || error.response || "No extra details"
            });
            
            if (errorMsg.includes("429") && attempt < MAX_RETRIES - 1) {
                console.log(`⏳ Rate limited. Waiting ${(attempt + 1) * 3000}ms before retry...`);
                await delay((attempt + 1) * 3000);
                continue;
            }

            const personaMsg = (persona === "girlfriend" || persona === "bestfriend")
                ? `I'm feeling a bit overwhelmed right now [Error: ${errorMsg.substring(0, 30)}...]. Can we talk in a moment? ❤️`
                : `Dr. Bond is away [Error: ${errorMsg.substring(0, 30)}...]. Try again later. 🌿`;
            return personaMsg;
        }
    }
};
