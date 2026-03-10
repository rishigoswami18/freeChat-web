import { hasPremiumAccess } from "../utils/freeTrial.js";
import { generateStreamToken, upsertStreamUser, streamClient } from "../lib/stream.js";
import { getAIResponse } from "../lib/gemini.js";

export async function getStreamToken(req, res) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "User session not found on server" });
    }

    if (!process.env.STREAM_API_KEY || !process.env.STREAM_API_SECRET) {
      console.error("❌ Stream API Key or Secret missing in environment variables");
      return res.status(500).json({ message: "Stream API keys not configured on server" });
    }

    const token = generateStreamToken(userId);

    // Ensure AI partner exists in Stream if coupled
    if (req.user.isCoupledWithAI && streamClient) {
      try {
        await upsertStreamUser({
          id: "ai-user-id",
          name: `${req.user.aiPartnerName || "Aria"} (AI Partner)`,
          image: "https://avatar.iran.liara.run/public/girl?username=aria",
          role: "user"
        });
      } catch (upsertErr) {
        console.error("Failed to ensure AI partner in Stream:", upsertErr);
      }
    }

    if (!token) {
      console.error("❌ Failed to generate Stream token for user:", userId);
      return res.status(500).json({ message: "Stream token generation failed" });
    }

    console.log(`✅ Stream token generated for ${userId}: ${token.substring(0, 10)}...`);
    res.status(200).json({ token, apiKey: process.env.STREAM_API_KEY });
  } catch (error) {
    console.error("❌ Error in getStreamToken controller:", error.stack || error.message);
    res.status(500).json({ message: `Internal Server Error: ${error.message}` });
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
    const { text, recipientId, channelId } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    // --- Virtual Girlfrind AI Logic ---
    if (recipientId === "ai-user-id" && streamClient) {
      console.log(`🤖 AI Chat Request: ${req.user.fullName} -> AI`);

      // Ensure AI User exists in Stream
      await upsertStreamUser({
        id: "ai-user-id",
        name: `${req.user.aiPartnerName || "Aria"} (AI Partner)`,
        image: "https://avatar.iran.liara.run/public/girl?username=aria",
        role: "user"
      });

      // Fetch history and map to Gemini format properly
      const channel = streamClient.channel("messaging", channelId);
      const historyRes = await channel.query({ messages: { limit: 15 } });
      const history = (historyRes.messages || [])
        .map(m => ({
          role: m.user.id === "ai-user-id" ? "model" : "user",
          parts: [{ text: m.text }]
        }));

      // Generate AI response with history
      let aiReply = await getAIResponse(text, history, "girlfriend", req.user.aiPartnerName, req.user.fullName);

      // Clean up excessive newlines for a better chat look
      aiReply = (aiReply || "").trim().replace(/\n{2,}/g, '\n');

      // Send reply as AI via Stream
      await channel.sendMessage({
        text: aiReply,
        user_id: "ai-user-id",
        silent: true // Don't trigger standard notifications
      });

      return res.status(200).json({ success: true, aiReply });
    }

    // Standard emotion logic for human chats
    let emotion = "neutral";
    const { detectEmotion } = await import("../utils/emotionService.js");
    if (hasPremiumAccess(req.user)) {
      emotion = await detectEmotion(text);
    }
    res.status(200).json({ text, emotion });
  } catch (error) {
    console.error("Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
