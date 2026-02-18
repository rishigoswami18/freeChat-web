import { detectEmotion } from "../utils/emotionService.js";

import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const testMLConnection = async (req, res) => {
  try {
    const result = await detectEmotion("I am happy to test this connection");
    res.status(200).json({
      status: "success",
      message: "ML Service is reachable!",
      prediction: result,
      env_url: process.env.ML_API_URL || "Using default (localhost)"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "ML Service connection failed",
      error_details: error.message
    });
  }
};
export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }
    const emotion = await detectEmotion(text);
    res.status(200).json({ text, emotion });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
