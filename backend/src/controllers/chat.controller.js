import { detectEmotion } from "../utils/emotionService.js";

import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error("❌ Stream API Key or Secret missing in environment variables");
      return res.status(500).json({ message: "Chat configuration error on server" });
    }

    const token = generateStreamToken(req.user._id);

    if (!token) {
      console.error("❌ Failed to generate Stream token for user:", req.user._id);
      return res.status(500).json({ message: "Chat token generation failed" });
    }

    console.log("✅ Stream token generated successfully for:", req.user.id);
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const testStreamConnection = async (req, res) => {
  try {
    const key = process.env.STREAM_API_KEY;
    const secret = process.env.STREAM_API_SECRET;

    if (!key || !secret) {
      return res.status(200).json({
        status: "error",
        message: "Stream keys are missing in environment variables",
        key_present: !!key,
        secret_present: !!secret
      });
    }

    res.status(200).json({
      status: "success",
      message: "Stream configuration found",
      key_preview: `${key.substring(0, 3)}...${key.substring(key.length - 3)}`,
      secret_length: secret.length
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: error.message });
  }
};

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
    let emotion = "neutral";
    if (req.user.isMember || req.user.role === "admin") {
      emotion = await detectEmotion(text);
    }
    res.status(200).json({ text, emotion });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
