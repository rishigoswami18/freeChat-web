import axios from "axios";
import { hasPremiumAccess } from "../utils/freeTrial.js";
import { generateStreamToken, upsertStreamUser, streamClient } from "../lib/stream.js";
import { getAIResponse } from "../lib/gemini.js";


// Helper: resolve AI pic (relative paths → full URL)
const resolveAiPic = (pic, fallback) => {
  if (!pic) return fallback;
  if (pic.startsWith("http")) return pic;
  const base = process.env.SERVER_URL || "https://freechatweb.in";
  return `${base}${pic}`;
};


// Helper: convert media URL to Gemini format (Base64)
async function urlToGeminiPart(url, mimeType) {
  try {
    if (!url) return null;
    
    // Determine absolute URL
    let targetUrl = url;
    if (!url.startsWith("http")) {
      const base = process.env.SERVER_URL || "https://freechatweb.in";
      targetUrl = url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
    }

    console.log(`🔍 AI Fetching Media: ${targetUrl}`);
    
    const response = await axios.get(targetUrl, { 
      responseType: 'arraybuffer',
      timeout: 10000, // 10s
      headers: { 'Accept': 'image/*,video/*,audio/*' }
    });

    const finalMimeType = mimeType || response.headers["content-type"] || "image/jpeg";
    const base64Data = Buffer.from(response.data).toString("base64");
    
    console.log(`✅ Media Loaded: ${targetUrl} (${response.data.byteLength} bytes, ${finalMimeType})`);

    return {
      inlineData: {
        data: base64Data,
        mimeType: finalMimeType
      }
    };
  } catch (error) {
    console.error(`❌ AI Media Fetch Failed [${url}]:`, error.message);
    return null;
  }
}

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
          name: `${req.user.aiPartnerName || "Aisha"} (Strategic Bestie)`,
          image: resolveAiPic(req.user.aiPartnerPic, "https://freechatweb.in/ai-companion.png"),
          role: "user"
        });
      } catch (upsertErr) {
        console.error("Failed to ensure AI partner in Stream:", upsertErr);
      }
    }

    // Ensure AI Best Friend exists in Stream if friended
    if (req.user.isFriendedWithAI && streamClient) {
      try {
        await upsertStreamUser({
          id: "ai-friend-id",
          name: `${req.user.aiFriendName || "Golu"} (Zyro Peer)`,
          image: resolveAiPic(req.user.aiFriendPic, "https://freechatweb.in/ai-bestfriend.png"),
          role: "user"
        });
      } catch (upsertErr) {
        console.error("Failed to ensure AI friend in Stream:", upsertErr);
      }
    }

    if (!token) {
      console.error("❌ Failed to generate Stream token for user:", userId);
      return res.status(500).json({ message: "Stream token generation failed" });
    }

    // Unconditionally add the AI Coach and AI Strategist so everyone can talk to them
    if (streamClient) {
      try {
        await upsertStreamUser({
          id: "ai-coach-id",
          name: "Dr. Bond (Success Coach)",
          image: "https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png", 
          role: "user"
        });
        
        await upsertStreamUser({
          id: "ai-strategist-id",
          name: "Aisha (Arena Strategist)",
          image: "https://freechatweb.in/ai-companion.png", 
          role: "user"
        });
      } catch (err) {
        console.error("Failed to ensure global AI roles in Stream:", err);
      }
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
export const testAIConnection = async (req, res) => {
  try {
    const response = await getAIResponse("Hi, tell me your model and version and if you are online.", [], "personal_coach", "Dr. Bond", req.user.fullName);
    res.status(200).json({ status: "success", ai_response: response });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { messageId, text, recipientId, channelId, attachments, isVoice, voiceUrl, isSnap, mediaUrl, mediaType } = req.body;
    
    console.log(`📩 AI Send Request:`, { 
      messageId, text, recipientId, channelId, 
      hasAttachments: !!attachments?.length,
      isVoice, voiceUrl: !!voiceUrl,
      isSnap, mediaUrl: !!mediaUrl
    });

    if (!text && !attachments && !isVoice && !isSnap) {
      return res.status(400).json({ message: "Content is required" });
    }

    let mediaParts = [];

    // Process attachments
    if (attachments && attachments.length > 0) {
      console.log(`📎 Processing ${attachments.length} attachments...`);
      for (const att of attachments) {
        const url = att.image_url || att.asset_url || att.thumb_url || att.file_url || att.url;
        if (url) {
          const type = att.type || "image";
          const mimeType = type === "image" ? "image/jpeg" : (type === "video" ? "video/mp4" : "application/pdf");
          const part = await urlToGeminiPart(url, mimeType);
          if (part) mediaParts.push(part);
        } else {
          console.warn("⚠️ Attachment without URL found:", att);
        }
      }
    }

    // Process Voice Messages
    if (isVoice && voiceUrl) {
      console.log(`🎙️ Processing voice message...`);
      const part = await urlToGeminiPart(voiceUrl, "audio/mp3");
      if (part) mediaParts.push(part);
    }

    // Process Snaps
    if (isSnap && mediaUrl) {
      console.log(`📸 Processing snap...`);
      const mimeType = mediaType === "video" ? "video/mp4" : "image/jpeg";
      const part = await urlToGeminiPart(mediaUrl, mimeType);
      if (part) mediaParts.push(part);
    }

    console.log(`🧬 Media parts prepared: ${mediaParts.length}`);
    const { SafetyHandler } = await import("../services/ai/safetyHandler.js");
    const toxicityScore = SafetyHandler.analyzeToxicity(text);
    if (toxicityScore > 30) {
      console.warn(`🚩 [Audit-Flag] High Toxicity detected from User ${req.user._id}: ${toxicityScore}%`);
      // In production, you would also save this to an Audit Log DB
    }

    const promptText = text || (mediaParts.length > 0 ? "Analyze this media and respond." : "");

    // --- Virtual Companion AI Logic ---
    if (recipientId === "ai-user-id" && streamClient) {
      console.log(`🤖 AI Chat Request: ${req.user.fullName} -> AI`);

      // Ensure AI User exists in Stream
      await upsertStreamUser({
        id: "ai-user-id",
        name: `${req.user.aiPartnerName || "Aria"} (AI Partner)`,
        image: resolveAiPic(req.user.aiPartnerPic, "https://freechatweb.in/ai-companion.png"),
        role: "user"
      });

      // Fetch history and map to Gemini format properly
      const channel = streamClient.channel("messaging", channelId);
      const historyRes = await channel.query({ messages: { limit: 15 } });
      
      const history = await Promise.all((historyRes.messages || [])
        .filter(m => m.id !== messageId) // Avoid current message if already in history
        .map(async (m, index, arr) => {
          const role = m.user.id === "ai-user-id" ? "model" : "user";
          const parts = [{ text: m.text || (m.attachments?.length ? "Shared an attachment" : "") }];
          
          // Optimization: Only fetch media for the single most recent user message with media
          // This saves tokens and stays within Rate Limits (RPM/TPM)
          const latestMediaMsg = arr.filter(msg => (msg.user.id !== "ai-user-id" && msg.user.id !== "ai-friend-id" && msg.user.id !== "ai-coach-id") && (msg.attachments?.length || msg.isSnap || msg.isVoice)).slice(-1)[0];
          
          if (latestMediaMsg && m.id === latestMediaMsg.id && role === "user") {
            // Check attachments
            if (m.attachments && m.attachments.length > 0) {
              for (const att of m.attachments) {
                const url = att.image_url || att.asset_url || att.thumb_url || att.url;
                if (url) {
                  const part = await urlToGeminiPart(url, att.type === "video" ? "video/mp4" : "image/jpeg");
                  if (part) parts.push(part);
                }
              }
            }
            // Check snaps
            if (m.isSnap && m.mediaUrl) {
              const part = await urlToGeminiPart(m.mediaUrl, m.mediaType === "video" ? "video/mp4" : "image/jpeg");
              if (part) parts.push(part);
            }
            // Check voice
            if (m.isVoice && (m.url || m.voiceUrl)) {
              const part = await urlToGeminiPart(m.url || m.voiceUrl, "audio/mp3");
              if (part) parts.push(part);
            }
          }

          return { role, parts };
        }));

      // Generate AI response with history and media
      let aiReply = await getAIResponse(promptText, history, "companion", req.user.aiPartnerName, req.user.fullName, mediaParts);

      // Send reply as AI via Stream
      try {
        await channel.sendMessage({
          text: aiReply || "Aisha here! Zyro sync thoda slow hai, par main tere saath hoon. Sub theek hai? 🚀",
          user_id: "ai-user-id"
        });
      } catch (streamErr) {
        console.error("Stream Send Failure (Companion):", streamErr.message);
      }

      return res.status(200).json({ success: true, aiReply });
    }

    // --- Virtual Best Friend AI Logic ---
    if (recipientId === "ai-friend-id" && streamClient) {
      console.log(`🤖 AI Friend Chat Request: ${req.user.fullName} -> AI Friend`);

      // Ensure AI Friend User exists in Stream
      await upsertStreamUser({
        id: "ai-friend-id",
        name: `${req.user.aiFriendName || "Golu"} (Best Friend)`,
        image: resolveAiPic(req.user.aiFriendPic, "https://freechatweb.in/ai-bestfriend.png"),
        role: "user"
      });

      // Fetch history with multi-modal parts
      const channel = streamClient.channel("messaging", channelId);
      const historyRes = await channel.query({ messages: { limit: 15 } });
      const history = await Promise.all((historyRes.messages || [])
        .filter(m => m.id !== req.body.messageId)
        .map(async (m, index, arr) => {
          const role = m.user.id === "ai-friend-id" ? "model" : "user";
          const parts = [{ text: m.text || (m.attachments?.length ? "Shared a file" : "") }];

          const latestMediaMsg = arr.filter(msg => (msg.user.id !== "ai-friend-id") && (msg.attachments?.length || msg.isSnap || msg.isVoice)).slice(-1)[0];
          if (latestMediaMsg && m.id === latestMediaMsg.id && role === "user") {
            if (m.attachments) {
              for (const att of m.attachments) {
                const url = att.image_url || att.asset_url || att.thumb_url || att.url;
                if (url) {
                  const part = await urlToGeminiPart(url, att.type === "video" ? "video/mp4" : "image/jpeg");
                  if (part) parts.push(part);
                }
              }
            }
            if (m.isSnap && m.mediaUrl) {
              const part = await urlToGeminiPart(m.mediaUrl, m.mediaType === "video" ? "video/mp4" : "image/jpeg");
              if (part) parts.push(part);
            }
            if (m.isVoice && (m.url || m.voiceUrl)) {
              const part = await urlToGeminiPart(m.url || m.voiceUrl, "audio/mp3");
              if (part) parts.push(part);
            }
          }
          return { role, parts };
        }));

      // Generate AI response
      let aiReply = await getAIResponse(promptText, history, "bestfriend", req.user.aiFriendName, req.user.fullName, mediaParts);

      try {
        await channel.sendMessage({
          text: aiReply || "Connectivity thodi kam hai, par hustle chalu hai! Let's focus on Zyro. 👊",
          user_id: "ai-friend-id"
        });
      } catch (streamErr) {
        console.error("Stream Send Failure (Best Friend):", streamErr.message);
      }

      return res.status(200).json({ success: true, aiReply });
    }

    // --- AI Mental Health & Relationship Coach Logic ---
    if (recipientId === "ai-coach-id" && streamClient) {
      console.log(`🧠 AI Coach Request: ${req.user.fullName} -> Coach`);

      await upsertStreamUser({
        id: "ai-coach-id",
        name: "Dr. Bond (Relationship Coach)",
        image: "https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png",
        role: "user"
      });

      const channel = streamClient.channel("messaging", channelId);
      const historyRes = await channel.query({ messages: { limit: 15 } });
      const history = await Promise.all((historyRes.messages || [])
        .filter(m => m.id !== req.body.messageId)
        .map(async (m, index, arr) => {
          const role = m.user.id === "ai-coach-id" ? "model" : "user";
          const parts = [{ text: m.text || "Shared media" }];

          const latestMediaMsg = arr.filter(msg => (msg.user.id !== "ai-coach-id") && (msg.attachments?.length || msg.isSnap)).slice(-1)[0];
          if (latestMediaMsg && m.id === latestMediaMsg.id && role === "user") {
            if (m.attachments) {
              for (const att of m.attachments) {
                const url = att.image_url || att.asset_url || att.thumb_url || att.url;
                if (url) {
                  const part = await urlToGeminiPart(url, att.type === "video" ? "video/mp4" : "image/jpeg");
                  if (part) parts.push(part);
                }
              }
            }
            if (m.isSnap && m.mediaUrl) {
              const part = await urlToGeminiPart(m.mediaUrl, m.mediaType === "video" ? "video/mp4" : "image/jpeg");
              if (part) parts.push(part);
            }
          }
          return { role, parts };
        }));

      let aiReply = await getAIResponse(promptText, history, "personal_coach", "Dr. Bond", req.user.fullName, mediaParts);

      try {
        await channel.sendMessage({
          text: aiReply || "I'm here for you. 🌿",
          user_id: "ai-coach-id"
        });
        console.log(`🩺 Response sent as Dr. Bond to channel: ${channelId}`);
      } catch (streamErr) {
        console.error("Stream Send Failure (Coach):", streamErr.message);
      }

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

export const analyzeConflict = async (req, res) => {
  try {
    const { channelId } = req.body;
    if (!channelId || !streamClient) {
      return res.status(400).json({ message: "Channel ID and Stream Client required" });
    }

    const channel = streamClient.channel("messaging", channelId);
    const historyRes = await channel.query({ messages: { limit: 50 } });
    
    // Format messages for AI analysis
    const chatTranscript = (historyRes.messages || [])
      .map(m => `${m.user.name}: ${m.text}`)
      .join("\n");

    const analysisJson = await getAIResponse(
      `Please analyze the following chat transcript between a couple and provide a conflict resolution report:\n\n${chatTranscript}`,
      [],
      "coach"
    );

    // Clean potential markdown code blocks from AI response
    const cleanedJson = analysisJson.replace(/```json|```/g, "").trim();
    let result;
    try {
      result = JSON.parse(cleanedJson);
    } catch (parseErr) {
      console.error("AI Analysis JSON Parse Error:", parseErr, "Content:", analysisJson);
      return res.status(500).json({ 
        message: "AI Coach provided an unreadable analysis.",
        raw: analysisJson 
      });
    }

    // Save to DB (Optional: keep a history of coaching)
    const ConflictAnalysis = (await import("../models/ConflictAnalysis.js")).default;
    await ConflictAnalysis.create({
      channelId,
      users: (historyRes.channel?.members || []).map(m => m.user_id),
      ...result
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Conflict Analysis Error:", error);
    res.status(500).json({ message: "AI Coach is unavailable right now." });
  }
};
