import cloudinary from "../../lib/cloudinary.js";

/**
 * AI Image Engine — Production-grade generative asset service.
 * Supports: Async polling, Auto-retry on safety blocks, Cloudinary persistence.
 */
export const ImageEngine = {
    generate: async (prompt) => {
        const apiKey = process.env.INFIP_API_KEY;
        const baseUrl = "https://api.infip.pro/v1";

        if (!apiKey) return null;

        try {
            // 1. Sanitize & Expand Prompt
            const cleanDesc = prompt.replace(/[\[\]]/g, "").replace(/PHOTO:/i, "").replace(/Aria/gi, "young woman").trim();
            const enhancedPrompt = `Cinematic portrait of ${cleanDesc}, highly detailed, 8k resolution, masterpieces`;

            // 2. Initial Request
            const response = await fetch(`${baseUrl}/images/generations`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "dreamshaper",
                    prompt: enhancedPrompt.substring(0, 300),
                    size: "1024x1024",
                    response_format: "url"
                })
            });

            let data = await response.json();
            let url = data.data?.[0]?.url || data.result?.[0]?.url;

            // 3. Poll if Async Task
            if (!url && data.task_id) {
                url = await ImageEngine._pollTask(data.task_id, apiKey);
            }

            // 4. Handle Safety Block (Recursive retry with ultra-safe prompt)
            if (url?.includes("dbe3b6ca-d235-40da-9f8f-c72fc6590718")) {
                console.warn("[ImageEngine] NSFW Block detected. Retrying with safe prompt.");
                return await ImageEngine.generate("A beautiful cinematic landscape at sunset, soft colors");
            }

            if (!url) return null;

            // 5. CDN Persistence
            const upload = await cloudinary.uploader.upload(url, { folder: "ai_partner_selfies" });
            return upload.secure_url;

        } catch (error) {
            console.error("[ImageEngine] Critical Failure:", error.message);
            return null;
        }
    },

    _pollTask: async (taskId, apiKey) => {
        const baseUrl = "https://api.infip.pro/v1";
        let attempts = 0;
        const max = 15;

        while (attempts < max) {
            await new Promise(r => setTimeout(r, 2000));
            attempts++;
            
            const res = await fetch(`${baseUrl}/tasks/${taskId}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            const data = await res.json();
            const url = data.data?.[0]?.url || data.result?.[0]?.url;
            
            if (url) return url;
            if (data.status === "failed") break;
            console.log(`[ImageEngine] Polling task ${taskId}... (${attempts}/${max})`);
        }
        return null;
    }
};
