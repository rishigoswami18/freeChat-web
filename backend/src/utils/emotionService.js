import axios from "axios";

// Access the AI Inference Token from environment variables (Local .env or Render Vars)
const HF_TOKEN = process.env.HF_TOKEN;

// Switching to a more stable and accurate model optimized for the Inference API
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

export const detectEmotion = async (text) => {
  if (!text || text.trim().length === 0) return "neutral";

  try {
    // Calling Hugging Face's DistilRoBERTa model for high-accuracy emotion classification
    const response = await axios.post(
      HUGGINGFACE_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        timeout: 8000 // Extended timeout for first-time model loading
      }
    );

    // The Inference API can return:
    // 1. [[{label: "joy", score: 0.9}, ...]]
    // 2. {error: "Model is loading", estimated_time: 20}
    if (response.data.error) {
      console.warn("AI Model Loading...", response.data.error);
      return "neutral";
    }

    if (Array.isArray(response.data) && response.data[0]?.length > 0) {
      const results = response.data[0];
      // Sort results to ensure the highest score is first (just in case)
      const sorted = results.sort((a, b) => b.score - a.score);
      const topResult = sorted[0];
      const detectedLabel = topResult.label.toLowerCase();

      // Mapping DistilRoBERTa labels to our app labels
      const mapping = {
        joy: "joy",
        sadness: "sadness",
        anger: "anger",
        fear: "fear",
        surprise: "surprise",
        disgust: "anger", // Disgust usually maps to anger in common chat context
        neutral: "neutral"
      };

      // Handle 'love' mapping if the model uses slightly different naming or if we see it
      if (detectedLabel === 'love') return 'love';

      return mapping[detectedLabel] || "neutral";
    }

    return "neutral";
  } catch (error) {
    // If we've got a 410 or other API errors, log them clearly for debugging
    if (error.response) {
      console.error(`AI API Error (${error.response.status}):`, error.response.data);
    } else {
      console.error("AI Emotion Detection Connection Error:", error.message);
    }
    return "neutral";
  }
};