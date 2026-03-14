import "dotenv/config";
import cloudinary from "./cloudinary.js";

/**
 * Generates an image using HuggingFace Inference API (FLUX.1-schnell model).
 * Then uploads it to Cloudinary and returns the URL.
 */
export const generateAIImage = async (prompt) => {
    const hfToken = process.env.HF_TOKEN;
    if (!hfToken) {
        console.warn("⚠️ HF_TOKEN is missing in .env. Image generation skipped.");
        return null;
    }

    try {
        console.log(`🎨 Generating image for prompt: "${prompt}"`);
        
        // Using FLUX.1-schnell for fast and high-quality generation
        const response = await fetch(
            "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
            {
                headers: { 
                    Authorization: `Bearer ${hfToken}`,
                    "Content-Type": "application/json"
                },
                method: "POST",
                body: JSON.stringify({ inputs: prompt }),
            }
        );

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`HF API Error: ${err}`);
        }

        const buffer = await response.arrayBuffer();
        const base64Image = Buffer.from(buffer).toString("base64");
        const dataUri = `data:image/jpeg;base64,${base64Image}`;

        console.log("📤 Uploading generated image to Cloudinary...");
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
            folder: "ai_partner_selfies",
        });

        console.log(`✅ Image generated and uploaded: ${uploadRes.secure_url}`);
        return uploadRes.secure_url;

    } catch (error) {
        console.error("❌ Image Generation Failed:", error.message);
        return null;
    }
};
