import axios from "axios";

const HF_TOKEN = process.env.HF_TOKEN;

// The NEW router URL for Hugging Face Inference API
const HUGGINGFACE_API_URL = "https://router.huggingface.co/hf-inference/models/michellejieli/emotion_text_classifier";

export const detectEmotion = async (text) => {
  if (!text || text.trim().length === 0) return "neutral";

  if (!HF_TOKEN) {
    console.warn("AI Emotion Notification: No HF_TOKEN. Please set it in Render dashboard.");
    return "neutral";
  }

  try {
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    if (response.data.error && response.data.error.includes("loading")) {
      return "neutral";
    }

    if (Array.isArray(response.data) && response.data[0]?.length > 0) {
      const results = response.data[0];
      const sorted = results.sort((a, b) => b.score - a.score);
      const topResult = sorted[0];
      const detectedLabel = topResult.label.toLowerCase();

      const mapping = {
        joy: "joy",
        love: "love",
        sadness: "sadness",
        anger: "anger",
        fear: "fear",
        surprise: "surprise"
      };

      return mapping[detectedLabel] || "neutral";
    }

    return "neutral";
  } catch (error) {
    console.error(`AI Emotion Error [${error.response?.status || 'Network'}]:`, error.response?.data?.error || error.message);
    return "neutral";
  }
};