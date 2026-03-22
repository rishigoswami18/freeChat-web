import axios from "axios";

/**
 * ElevenLabs Service — Ultra-realistic AI Voice Generation
 */

const VOICES = {
    "ai-coach-id": "pNInz6obpg8n9YAt69re", // Adam (Dr. Bond)
    "ai-user-id": "EXAVITQu4vr4xnSDxMaL",  // Bella (Girlfriend)
    "ai-match-analyst": "N2lVS1wzXKqBy7O903Lc", // Liam (Analyst)
    "ai-friend-id": "piTKPmq98Fe8KcxicBNo", // Nicole (Bestie)
};

export const ElevenLabsService = {
    generateVoice: async (text, aiType = "dr_bond") => {
        const apiKey = process.env.ELEVEN_LABS_API_KEY;
        if (!apiKey) throw new Error("ELEVEN_LABS_API_KEY_MISSING");

        const voiceId = VOICES[aiType] || VOICES.dr_bond;
        const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

        try {
            const response = await axios.post(url, {
                text,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                }
            }, {
                headers: {
                    "xi-api-key": apiKey,
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer", // We want the binary audio data
            });

            return response.data;
        } catch (error) {
            console.error("❌ [ElevenLabs] Error:", error.message);
            throw error;
        }
    }
};
