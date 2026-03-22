import axios from "axios";

/**
 * TopMediai Service — Production Grade
 * Replaced ElevenLabs. Uses high-fidelity Indian voices.
 */

// Official Standard Speaker IDs for Indian Accents
const VOICES = {
    "ai-coach-id": "Sagar", 
    "ai-user-id": "Neha",   
    "ai-match-analyst": "Hemant",
    "ai-friend-id": "Neha",
};

export const TopMediaiService = {
    generateVoice: async (text, aiType = "ai-user-id") => {
        const apiKey = process.env.TOP_MEDIA_AI_KEY;
        if (!apiKey) throw new Error("TOP_MEDIA_AI_KEY_MISSING");

        // Fail-safe speaker mapping
        const speaker = VOICES[aiType] || "Sagar";
        const url = "https://api.topmediai.com/v1/text2speech";

        console.log(`🎙️ [TopMediai Dispatch] Speaker: ${speaker} | Text: ${text.substring(0, 30)}...`);

        try {
            const response = await axios.post(url, {
                text,
                speaker,
                emotion: "Neutral",
                speed: "1.0",
                format: "mp3"
            }, {
                headers: {
                    "x-api-key": apiKey,
                    "Content-Type": "application/json",
                }
            });

            if (response.data?.data?.oss_url) {
                const audioRes = await axios.get(response.data.data.oss_url, { responseType: 'arraybuffer' });
                return audioRes.data;
            }
            
            throw new Error(response.data?.message || "Invalid API Response from TopMediai");
        } catch (error) {
            console.error("❌ [TopMediai Service Error]:", error.message);
            throw error;
        }
    }
};
