import axios from "axios";

export const detectEmotion = async (text) => {
  try {
    const ML_API_URL = process.env.ML_API_URL || "http://127.0.0.1:8001";
    console.log("Sending text to ML service:", text);
    const response = await axios.post(`${ML_API_URL}/predict_emotion`, { text });
    console.log("ML Service Response:", response.data);
    return response.data.emotion;
  } catch (error) {
    console.error("ML Service unreachable:", error.message);
    return "neutral";
  }
};