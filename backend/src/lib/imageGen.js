import "dotenv/config";
import cloudinary from "./cloudinary.js";

/**
 * Generates an image using the INFIP API (Async Task Flow).
 * Polls for the result and then uploads to Cloudinary.
 */
export const generateAIImage = async (prompt) => {
    const apiKey = process.env.INFIP_API_KEY;
    const baseUrl = "https://api.infip.pro/v1";

    if (!apiKey) {
        console.warn("⚠️ No INFIP_API_KEY found.");
        return null;
    }

    try {
        console.log(`🎨 Initiating INFIP task for: "${prompt.substring(0, 40)}..."`);
        
        // 1. Expand and Sanitize Prompt for INFIP Safety
        let simpleDesc = prompt
            .replace(/[\[\]]/g, "") // Remove brackets if Gemini included them
            .replace(/PHOTO:/i, "")
            .replace(/selfie/gi, "portrait")
            .replace(/Aria/gi, "young woman")
            .trim();
        
        // Professional Photography Expansion (Stable and Safe)
        const finalPrompt = `Professional photo of ${simpleDesc}, masterpiece, high quality, vibrant colors, sharp focus`;

        console.log(`📡 Final Prompt: "${finalPrompt.substring(0, 80)}..."`);

        // 2. Create Task
        const initRes = await fetch(`${baseUrl}/images/generations`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "dreamshaper",
                prompt: finalPrompt.substring(0, 300), // Safety cap
                size: "1024x1024",
                response_format: "url"
            })
        });

        const initData = await initRes.json();
        if (!initRes.ok) {
            console.error("❌ INFIP Task Creation Failed:", initData.detail || JSON.stringify(initData));
            return null;
        }

        // Check if the image was returned synchronously
        let generatedUrl = initData.data?.[0]?.url || initData.result?.[0]?.url;
        
        if (!generatedUrl) {
            const taskId = initData.task_id;
            if (taskId) {
                console.log(`⏳ Task ID: ${taskId}. Polling for results...`);
                let attempts = 0;
                const maxAttempts = 15;

                while (attempts < maxAttempts) {
                    await new Promise(r => setTimeout(r, 2000));
                    attempts++;
                    const statusRes = await fetch(`${baseUrl}/tasks/${taskId}`, {
                        headers: { "Authorization": `Bearer ${apiKey}` }
                    });
                    const statusData = await statusRes.json();
                    generatedUrl = statusData.data?.[0]?.url || statusData.result?.[0]?.url;
                    
                    if (generatedUrl) break;
                    if (statusData.status === "failed") break;
                    console.log(`... polling (${attempts}/${maxAttempts}): ${statusData.status || "processing"}`);
                }
            }
        }

        // --- HANDLE SAFETY BLOCKS (Bad Prompt Buddy) ---
        if (generatedUrl && generatedUrl.includes("dbe3b6ca-d235-40da-9f8f-c72fc6590718")) {
            console.warn("⚠️ AI Image Generation Blocked by INFIP Safety Filter. Retrying with ultra-safe prompt...");
            
            // SECOND ATTEMPT with Extremely Safe Prompt
            const retryRes = await fetch(`${baseUrl}/images/generations`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: "dreamshaper",
                    prompt: "A beautiful cinematic portrait of a person, soft lighting, sharp focus",
                    size: "1024x1024",
                    response_format: "url"
                })
            });
            const retryData = await retryRes.json();
            generatedUrl = retryData.data?.[0]?.url || retryData.result?.[0]?.url;
            
            // If still blocked or no URL, give up
            if (!generatedUrl || generatedUrl.includes("dbe3b6ca-d235-40da-9f8f-c72fc6590718")) {
                console.error("❌ Both attempts blocked by INFIP safety filter.");
                return null;
            }
        }

        if (!generatedUrl) {
            console.warn("⚠️ Image generation failed or timed out.");
            return null;
        }

        // 3. Upload to Cloudinary
        console.log("📤 Uploading generated image to Cloudinary...");
        const uploadRes = await cloudinary.uploader.upload(generatedUrl, {
            folder: "ai_partner_selfies",
        });

        console.log(`✅ Final secure URL: ${uploadRes.secure_url}`);
        return uploadRes.secure_url;

    } catch (error) {
        console.error("❌ Image Generation Critical Failure:", error.message);
        return null;
    }
};
