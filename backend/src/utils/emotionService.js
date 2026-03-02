import axios from "axios";

// Access the AI Inference Token from environment variables (Local .env or Render Vars)
const HF_TOKEN = process.env.HF_TOKEN;

// Using a high-performance model with guaranteed uptime on HF Inference API
// Models from 'dair-ai' are the industry standard for emotion (contains: joy, love, sadness, anger, fear, surprise)
const HUGGINGFACE_API_URL = "https://api-inference.huggingface.co/models/michellejieli/emotion_text_classifier";

export const detectEmotion = async (text) => {
  if (!text || text.trim().length === 0) return "neutral";

  if (!HF_TOKEN) {
    console.warn("AI Emotion Alert: HF_TOKEN is missing in environment variables!");
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

    // Initial load handling
    if (response.data.error && response.data.error.includes("loading")) {
      console.log("AI Model warming up... (estimated time: " + response.data.estimated_time + "s)");
      return "neutral";
    }

    if (Array.isArray(response.data) && response.data[0]?.length > 0) {
      const results = response.data[0];
      const sorted = results.sort((a, b) => b.score - a.score);
      const topResult = sorted[0];
      const detectedLabel = topResult.label.toLowerCase();

      // Reliable mapping for the 'dair-ai' / 'emotion' dataset labels
      const mapping = {
        joy: "joy",
        love: "love",
        sadness: "sadness",
        anger: "anger",
        fear: "fear",
        surprise: "surprise",
        neutral: "neutral"
      };

      return mapping[detectedLabel] || "neutral";
    }

    return "neutral";
  } catch (error) {
    if (error.response) {
      // Log the specific status code to find out why it's failing
      console.error(`AI Detection Error [${error.response.status}]:`, error.response.data);

      // If 410, it means the model is no longer available on this specific endpoint
      if (error.response.status === 410) {
        console.error("Critical: Hugging Face model endpoint is deprecated. Need to choose another model.");
      }
    } else {
      console.error("AI Detection Connection Failure:", error.message);
    }
    return "neutral";
  }
};