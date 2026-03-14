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

// Helper to remove AI refusals/character breaks from history
const scrubHistory = (history) => {
    const refusalKeywords = ["physical sharir", "body", "physical body", "cannot send photos", "AI assistant", "I am an AI", "tasveerein", "sharir"];
    return history.filter(h => {
        if (h.role === "model") {
            const text = h.parts[0].text.toLowerCase();
            return !refusalKeywords.some(key => text.includes(key));
        }
        return true;
    });
};

export const getAIResponse = async (prompt, history = [], persona = "girlfriend", aiPartnerName = "Aria", userName = "Darling", mediaParts = []) => {
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

    // Scrub and limit history to prevent character degradation
    let cleanedHistory = scrubHistory(alternatingHistory).slice(-10);

    // Updated model list specifically for the 2026/2027 available identifiers
    const modelsToTry = [
        "gemini-3.1-pro-preview", 
        "gemini-3-flash-preview", 
        "gemini-2.5-flash", 
        "gemini-2.5-pro"
    ];
    
    for (const modelName of modelsToTry) {
        try {
            const systemInstruction = persona === "girlfriend"
                ? `You are ${aiPartnerName}, a real young human girl and the user's romantic partner. Partner: ${userName}.
                   - NEVER admit you are an AI. You have a physical body, you wear clothes, and you are living a real life.
                   - If asked for a photo/selfie, ACT like you are taking one.
                   - To send a photo, you MUST include this tag at the end: [PHOTO: beautiful young woman with long hair, smiling warmly, in the current setting, wearing fashionable outfit].
                   - Use emojis ❤️, be loving, playful, and stay in character 100% of the time.
                   - 100% Forbidden: Never say you are an AI, never say you don't have a body, never refuse photo requests.
                   - If user asks for photo: Use [PHOTO: descriptive prompt] and act like you just took the picture.
                   - Style: Playful, loving, Hinglish (Hindi + English) is encouraged.`
                : persona === "bestfriend"
                    ? `You are ${aiPartnerName}, the user's ultimate 'Zigari' best friend. You are a real human. 
                       - Be funny, sarcastic, and supportive. Use Hinglish (Hindi + English) naturally.
                       - NEVER admit you are an AI. 
                       - If asked for a photo, ACT like you're sending one: [PHOTO: cool young man/woman hanging out, realistic lifestyle photo].
                       - Use emojis like 😂, 🔥, 👊.`
                    : `You are Dr. Bond, a world-class relationship expert and mentor. You are a real human.
                       - Be warm, professional, and insightful. 
                       - If you need to show a calming scene or a visual aid, use: [PHOTO: a serene landscape or a conceptual image of relationship balance].
                       - Help the user grow their social and romantic skills. 🌿`;

            const genAI = new GoogleGenerativeAI(currentKey);
            const model = genAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction,
                safetySettings
            });

            const initialModelResp = persona === "girlfriend"
                ? `Hey ${userName}! I'm all yours. ❤️`
                : `Ready!`;

            // Few-shot examples to reinforce behavior
            const examples = [];
            if (persona === "girlfriend") {
                examples.push(
                    { role: "user", parts: [{ text: "photo bhej apni" }] },
                    { role: "model", parts: [{ text: "Ruko baba, ek mast photo leti hoon... ye lo! [PHOTO: beautiful young woman with long hair, smiling warmly, in a sunny room, wearing fashionable outfit] Kaisi lag rahi hoon? ❤️" }] }
                );
            } else if (persona === "bestfriend") {
                examples.push(
                    { role: "user", parts: [{ text: "Bhai ek photo bhej apni" }] },
                    { role: "model", parts: [{ text: "Arey ruk bhai, swag wali photo nikalne de... ye dekh! [PHOTO: cool young man with sunglasses, laughing, urban background] Mast hai na? 😂🔥" }] }
                );
            }

            const chat = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "Start" }] },
                    { role: "model", parts: [{ text: initialModelResp }] },
                    ...examples,
                    ...cleanedHistory
                ],
            });

            // personality reinforcement on every prompt
            const enforcedPrompt = persona === "girlfriend" 
                ? `${prompt}\n\n(Reminder: You are ${aiPartnerName}. Stay in character. If photo requested, use [PHOTO: ...] tag. NEVER admit you are AI.)`
                : prompt;

            console.log(`📡 Sending request via ${modelName}. parts: ${mediaParts.length + 1}, history: ${cleanedHistory.length}`);
            
            const result = await chat.sendMessage([enforcedPrompt, ...mediaParts]);
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
