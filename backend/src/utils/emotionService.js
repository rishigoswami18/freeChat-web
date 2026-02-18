import axios from "axios";

export const detectEmotion = async (text) => {
  try {
    const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8001";
    const targetUrl = `${ML_API_URL}/predict_emotion`;

    console.log(`Sending text to ML service at: ${targetUrl}`);
    const response = await axios.post(targetUrl, { text });

    console.log("ML Service Response:", response.data);
    return response.data.emotion;
  } catch (error) {
    console.error("ML Service Error Details:", {
      message: error.message,
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return "neutral";
  }
};