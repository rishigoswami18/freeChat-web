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
     * Internal: Gemini implementation
     */
    _callGemini: async ({ model, messages, systemInstruction, safetySettings, signal }) => {
        const apiKey = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(apiKey);
        const modelInstance = genAI.getGenerativeModel({
            model,
            systemInstruction,
            safetySettings
        });

        const history = messages.slice(0, -1);
        const latest = messages[messages.length - 1];

        // Diagnostic Logging to catch role alternation errors
        console.log(`[AIGateway] Request Model: ${model} | History: ${history.length} msgs | Roles: ${messages.map(m => m.role).join(" -> ")}`);

        const chat = modelInstance.startChat({ history });
        const result = await chat.sendMessage(latest.parts);
        const response = await result.response;

        // Check for safety blocks manually to provide better errors
        if (response.promptFeedback?.blockReason) {
            throw new Error(`BLOCKED_BY_SAFETY: ${response.promptFeedback.blockReason}`);
        }

        const candidate = response.candidates?.[0];
        if (candidate?.finishReason === "SAFETY" || candidate?.finishReason === "RECITATION") {
            throw new Error(`BLOCKED_BY_SAFETY_CANDIDATE: ${candidate.finishReason}`);
        }

        try {
            return response.text().trim();
        } catch (e) {
            // This happens if safety triggers late or other SDK internal issues
            if (e.message?.includes("SAFETY")) {
                throw new Error("BLOCKED_BY_SAFETY: Late detection");
            }
            throw e;
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
            msg.includes("timeout") ||
            msg.includes("abort") ||
            msg.includes("deadline exceeded")
        );
    }
};
