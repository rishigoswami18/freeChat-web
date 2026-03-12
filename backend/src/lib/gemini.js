import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

export const getAIResponse = async (userMessage, history = [], persona = "girlfriend", aiPartnerName = "Aria", userName = "Darling") => {
    try {
        const currentKey = (process.env.GEMINI_API_KEY || "").trim();
        if (!currentKey) {
            console.error("❌ GEMINI_API_KEY is missing. Check your .env file.");
            throw new Error("API Key Missing");
        }

        const genAI = new GoogleGenerativeAI(currentKey);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

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
                    : `You are a helpful AI assistant.`;

        const initialModelResponse = persona === "girlfriend"
            ? `I understand, my love. I am ${aiPartnerName}, your devoted girlfriend, and I'm here just for you, ${userName}. ❤️`
            : persona === "bestfriend"
                ? `Got it! I am ${aiPartnerName}, your best friend forever. Let's talk! 👊`
                : persona === "coach"
                    ? `Understood. I am ready to provide objective relationship analysis in JSON format.`
                    : `I am your AI assistant. How can I help?`;

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt }],
                },
                {
                    role: "model",
                    parts: [{ text: initialModelResponse }],
                },
                ...history
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini AI Error:", error);
        return "I'm sorry, I'm feeling a bit overwhelmed right now. Can we talk in a moment, babe? ❤️";
    }
};
