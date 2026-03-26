import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * AI Gateway — Production-grade abstraction for LLM providers.
 * Features:
 * - Reliability: Exponential backoff retries for 429 and 500s.
 * - Resilience: Request timeout protection via AbortController.
 * - Observability: Latency monitoring and detailed error logging.
 * - Flexibility: Pluggable model providers (Gemini, etc.)
 */
export const AIGateway = {
    /**
     * Primary entry point for generating AI responses.
     */
    generate: async (options) => {
        const {
            provider = "gemini",
            model = "gemini-1.5-flash",
            messages = [],
            systemInstruction = "",
            safetySettings = [],
            timeout = 15000, // 15s default timeout
            maxRetries = 3
        } = options;

        const startTime = Date.now();
        let attempts = 0;

        while (attempts < maxRetries) {
            attempts++;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            try {
                let response;
                if (provider === "gemini") {
                    response = await AIGateway._callGemini({
                        model,
                        messages,
                        systemInstruction,
                        safetySettings,
                        signal: controller.signal
                    });
                } else {
                    throw new Error(`Provider ${provider} not implemented.`);
                }

                clearTimeout(timeoutId);

                // Log performance metrics
                const duration = Date.now() - startTime;
                console.log(`[AIGateway] Success | Provider: ${provider} | Model: ${model} | Latency: ${duration}ms | Attempts: ${attempts}`);

                return response;

            } catch (error) {
                clearTimeout(timeoutId);
                const isRetryable = AIGateway._isRetryable(error);
                
                console.warn(`[AIGateway] Attempt ${attempts} failed | Provider: ${provider} | Error: ${error.message} | Retryable: ${isRetryable}`);

                if (isRetryable && attempts < maxRetries) {
                    const backoff = Math.pow(2, attempts) * 1000;
                    await new Promise(r => setTimeout(r, backoff));
                    continue;
                }

                // Final failure
                const duration = Date.now() - startTime;
                console.error(`[AIGateway] Critical Failure | Provider: ${provider} | Latency: ${duration}ms | Final Error: ${error.message}`);
                throw error;
            }
        }
    },

    /**
     * Internal: Gemini implementation using direct REST API to avoid SDK 404 bugs
     */
    _callGemini: async ({ model, messages, systemInstruction, safetySettings, signal }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

        // The user's system generates roles as "user" and "model". 
        // We must map it precisely to the REST API schema
        const contents = messages.map(msg => ({
            role: msg.role === "model" ? "model" : "user",
            parts: msg.parts // usually [{text: "..."}]
        }));

        if (systemInstruction) {
            contents.unshift({
                role: "user",
                parts: [{ text: `SYSTEM_INSTRUCTION: ${systemInstruction}\n\nUnderstood? Respond briefly.` }]
            }, {
                role: "model",
                parts: [{ text: "Understood. I'm ready." }]
            });
        }

        const payload = {
            contents,
        };

        // Simplify safety settings for REST (snake_case)
        if (safetySettings && safetySettings.length > 0) {
            payload.safety_settings = safetySettings;
        }

        // Add generation config (snake_case)
        payload.generation_config = {
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 2048,
        };

        // Log request for debugging
        const lastMsg = contents.length > 0 ? contents[contents.length-1] : { parts: [] };
        console.log(`📡 [Gemini Request] Model: ${model} | Parts: ${lastMsg.parts.length}`);

        // Upgrade to v1beta for Multimodal Audio (inlineData) support
        const fetchUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(fetchUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal
            });

            const data = await response.json();
            
            if (!response.ok) {
                const errMsg = data.error?.message || "Unknown API Error";
                console.error(`❌ [Gemini API Error] Status: ${response.status} | Msg: ${errMsg}`);
                throw new Error(`GEMINI_API_ERROR: ${errMsg}`);
            }

            // Check for safety blocks
            if (data.promptFeedback?.blockReason) {
                console.warn(`⚠️ [Gemini] Blocked by safety: ${data.promptFeedback.blockReason}`);
                throw new Error(`SAFETY_BLOCK: ${data.promptFeedback.blockReason}`);
            }

            const candidate = data.candidates?.[0];
            if (!candidate) {
                console.warn(`⚠️ [Gemini] API returned no candidates. Raw payload: ${JSON.stringify(data).substring(0, 150)}`);
                throw new Error("EMPTY_API_RESPONSE");
            }

            if (candidate.finishReason === "SAFETY" || candidate.finishReason === "RECITATION") {
                console.warn(`⚠️ [Gemini] Blocked Candidate: ${candidate.finishReason}`);
                throw new Error(`CANDIDATE_BLOCKED: ${candidate.finishReason}`);
            }

            const rawText = candidate.content?.parts?.[0]?.text;
            if (rawText) {
                return rawText.trim();
            }

            console.warn(`⚠️ [Gemini] Candidate returned empty string. Raw candidate: ${JSON.stringify(candidate)}`);
            return "";
        } catch (fetchError) {
            console.error(`❌ [Gemini Pipeline Error]: ${fetchError.message}`);
            throw fetchError; // Rethrow so the outer retry logic can catch it
        }
    },

    /**
     * Logic to determine if an error should trigger a retry.
     */
    _isRetryable: (error) => {
        const msg = error.message?.toLowerCase() || "";
        return (
            msg.includes("429") || // Rate Limit
            msg.includes("500") || // Server Error
            msg.includes("503") || // Service Unavailable
            msg.includes("404") || // Model Not Found (allows fallback/version update)
            msg.includes("timeout") ||
            msg.includes("abort") ||
            msg.includes("deadline exceeded")
        );
    }
};
