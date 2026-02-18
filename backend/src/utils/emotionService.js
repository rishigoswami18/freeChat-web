import axios from "axios";

export const detectEmotion = async (text) => {
  try {
    console.log("Sending text to ML service:", text);
    const response = await axios.post("http://127.0.0.1:8001/predict_emotion", { text });
    console.log("ML Service Response:", response.data);
    return response.data.emotion;
  } catch (error) {
    console.error("ML Service unreachable:", error.message);
    return "neutral";
  }
};