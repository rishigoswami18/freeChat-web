import { ImageEngine } from "../services/ai/imageEngine.js";

/**
 * LEGACY WRAPPER: Routes through the new modular ImageEngine.
 * Ensures zero-breaking changes for the existing image features.
 */
export const generateAIImage = async (prompt) => {
    try {
        return await ImageEngine.generate(prompt);
    } catch (error) {
        console.error("[LegacyImageGen] Proxy error:", error.message);
        return null;
    }
};

