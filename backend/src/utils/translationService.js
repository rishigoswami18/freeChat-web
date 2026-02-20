import axios from "axios";

export const translateText = async (text, targetLang = "en") => {
    try {
        const ML_API_URL = process.env.ML_API_URL || "https://freechat-ml.onrender.com";
        const targetUrl = `${ML_API_URL}/translate`;

        console.log(`Sending text to ML translation service at: ${targetUrl}`);
        const response = await axios.post(targetUrl, { text, target_lang: targetLang });

        console.log("ML Translation Service Response:", response.data);
        return response.data.translated_text;
    } catch (error) {
        console.error("ML Translation Service Error:", error.message);
        throw new Error("Translation failed");
    }
};
