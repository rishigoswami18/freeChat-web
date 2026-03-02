import axios from "axios";

// Access the AI Inference Token from environment variables (Local .env or Render Vars)
const HF_TOKEN = process.env.HF_TOKEN;
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/bhadresh-savani/bert-base-uncased-emotion";

export const detectEmotion = async (text) => {
  try {
    // Calling Hugging Face's BERT model for high-accuracy emotion classification
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: text },
      {
        headers: { Authorization: `Bearer ${HF_TOKEN}` },
        timeout: 5000
      }
    );

    // The API returns an array of label/score objects sorted by score
    if (Array.isArray(response.data) && response.data[0]?.length > 0) {
      const results = response.data[0];
      const topResult = results[0];
      const detectedLabel = topResult.label;

      const mapping = {
        joy: "joy",
        love: "love",
        sadness: "sadness",
        anger: "anger",
        fear: "fear",
        surprise: "surprise",
      };

      return mapping[detectedLabel] || "neutral";
    }

    return "neutral";
  } catch (error) {
    console.error("AI Emotion Detection Error:", error.message);
    return "neutral";
  }
};