/**
 * Match Intelligence Service — "Expert Eye" & "Match Analyst"
 * 
 * Powers the AI War Room with:
 * 1. Screenshot/Image Analysis (pitch conditions, match situations)
 * 2. Match Summary Generation (War Room Recaps)
 * 3. Fantasy Probability Scoring
 */
import { ChatEngine } from "./chatEngine.js";

export const MatchIntelligence = {
    /**
     * Analyze a cricket match screenshot or camera image
     * Uses Gemini Vision (multimodal) to understand pitch, scoreboard, etc.
     */
    analyzeScreenshot: async ({ imageBase64, mimeType = "image/jpeg", userName = "User", context = "" }) => {
        const prompt = context 
            ? `Analyze this cricket match image. Context from user: "${context}". Give analysis in Hinglish, be specific and data-driven. Include fantasy advice if relevant.`
            : `Analyze this cricket match image in detail. Look for: pitch conditions (cracks, grass, moisture), scoreboard, player positions, field placements. Give analysis in Hinglish with fantasy cricket advice. Be specific — mention player names if visible.`;

        const mediaParts = [{
            inlineData: {
                data: imageBase64,
                mimeType
            }
        }];

        return await ChatEngine.getResponse({
            prompt,
            history: [],
            persona: "match_analyst",
            aiName: "Commander",
            userName,
            mediaParts
        });
    },

    /**
     * Generate a post-match "War Room Recap" for a user
     * Highlights predictions, funny chat moments, key stats
     */
    generateMatchRecap: async ({ matchName, userPredictions = [], chatHighlights = [], finalScore, userName }) => {
        const prompt = `Generate a "WAR ROOM RECAP" for ${userName} after the match: ${matchName}.

Match Result: ${finalScore}

User's Predictions during the match:
${userPredictions.map((p, i) => `${i + 1}. "${p.prediction}" — ${p.wasCorrect ? "✅ CORRECT" : "❌ Wrong"}`).join("\n")}

Funny/Notable Chat Moments:
${chatHighlights.map((c, i) => `${i + 1}. "${c}"`).join("\n")}

Create a fun, energetic recap in Hinglish. Include:
- Prediction accuracy percentage
- Best prediction highlight
- Funniest moment
- Overall "War Room Rating" (out of 5 stars)
- A motivational closer for next match

Keep it under 200 words. Make it shareable — like an Instagram story summary.`;

        return await ChatEngine.getResponse({
            prompt,
            history: [],
            persona: "match_analyst",
            aiName: "Commander",
            userName
        });
    },

    /**
     * Get ball-by-ball prediction / probability score
     * Used in real-time during live matches
     */
    getPrediction: async ({ matchContext, question, userName }) => {
        const prompt = `Match Situation: ${matchContext}

User's Question: "${question}"

Give a PROBABILITY SCORE (0-100%) and a short 1-2 line prediction. Be bold and specific. Format:
🎯 Probability: X%
💬 [Your prediction in Hinglish]`;

        return await ChatEngine.getResponse({
            prompt,
            history: [],
            persona: "match_analyst",
            aiName: "Commander",
            userName
        });
    },

    /**
     * Live Translation using Gemini (better quality than external APIs)
     * Translates chat messages in real-time
     */
    translateMessage: async ({ text, targetLang = "en", sourceLang = "auto" }) => {
        const langNames = {
            en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", 
            kn: "Kannada", ml: "Malayalam", bn: "Bengali", mr: "Marathi",
            gu: "Gujarati", pa: "Punjabi", ur: "Urdu", ko: "Korean",
            ja: "Japanese", zh: "Chinese", es: "Spanish", fr: "French",
            ar: "Arabic", pt: "Portuguese", de: "German"
        };

        const targetName = langNames[targetLang] || targetLang;
        const prompt = `Translate the following text to ${targetName}. ONLY return the translation, nothing else. Keep emojis and slang intact. If the text is already in ${targetName}, return it as-is.

Text: "${text}"`;

        return await ChatEngine.getResponse({
            prompt,
            history: [],
            persona: "coach", // Using neutral persona for translation
            aiName: "Translator",
            userName: "User"
        });
    },

    /**
     * Live Transcription using Gemini 1.5 Flash (Multimodal)
     * Handles audio blobs and returns high-accuracy text.
     */
    transcribeAudio: async ({ audioBase64, mimeType = "audio/webm", userName = "User" }) => {
        try {
            const prompt = "Transcribe the actual words spoken in this audio. If you hear someone speaking in Hindi or Hinglish, write it down exactly as spoken. DO NOT use dots or ellipses. If no speech is present, return only '---'.";

            const mediaParts = [{
                inlineData: {
                    data: audioBase64,
                    mimeType
                }
            }];

            // We use gemini-1.5-flash specifically for speed and audio support
            return await ChatEngine.getResponse({
                prompt,
                history: [],
                persona: "coach", // Neural persona for transcription
                aiName: "Transcriber",
                userName,
                mediaParts
            });
        } catch (error) {
            console.error("❌ [MatchIntelligence] Transcription Failure:", error.message);
            return ""; // Fail gracefully to keep the loop going
        }
    }
};
