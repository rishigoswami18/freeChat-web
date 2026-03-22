import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  sendMessage,
  testMLConnection,
  testStreamConnection,
  testAIConnection,
  analyzeConflict,
} from "../controllers/chat.controller.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import DelayedEmail from "../models/DelayedEmail.js";
import { sendNotificationEmail } from "../lib/email.service.js";
import { sendPushNotification } from "../lib/push.service.js";
import { streamClient } from "../lib/stream.js";
import { getAIResponse } from "../lib/gemini.js";
import { MatchIntelligence } from "../services/ai/matchIntelligence.js";
import { TopMediaiService } from "../services/ai/topMediai.js";
import RealtimeAvatar from "../services/ai/realtimeAvatar.js";

const router = express.Router();

// existing route (NO CHANGE)
router.get("/token", protectRoute, getStreamToken);

// Media upload for chat snaps/messages
router.post("/upload-media", protectRoute, async (req, res) => {
  try {
    const { media, mediaType } = req.body;
    if (!media) return res.status(400).json({ message: "Media is required" });

    const uploaded = await cloudinary.uploader.upload(media, {
      folder: "freechat_messages",
      resource_type: "auto",
    });

    res.status(200).json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id
    });
  } catch (error) {
    console.error("Error in chat media upload:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// NEW route → emotion-aware message sending
router.post("/send", protectRoute, sendMessage);

// AI Relationship Coach → analyzes conflict in a channel
router.post("/analyze-conflict", protectRoute, analyzeConflict);

// ═══════════════════════════════════════════════════
//  AI FACE CALL — Voice-to-Voice with AI personas
// ═══════════════════════════════════════════════════
router.post("/ai-face-call", protectRoute, async (req, res) => {
  try {
    const { text, aiType, history = [], matchContext, userEmotion } = req.body;
    
    if (!text?.trim() && !userEmotion) { // Allow empty text if we're just reacting to a face change
      return res.status(400).json({ message: "Text or Emotion is required" });
    }

    console.log(`📞 [AI Face Call] ${req.user.fullName} → ${aiType}: "${text.substring(0, 50)}..."`);

    // Map aiType to persona
    const personaMap = {
      "ai-user-id": "face_call",
      "ai-friend-id": "face_call",
      "ai-coach-id": "personal_coach",
      "ai-match-analyst": "match_analyst"
    };

    const persona = personaMap[aiType] || "face_call";
    
    // Get AI name based on type
    let aiName = "AI";
    if (aiType === "ai-user-id") aiName = req.user.aiPartnerName || "Aria";
    else if (aiType === "ai-friend-id") aiName = req.user.aiFriendName || "Golu";
    else if (aiType === "ai-coach-id") aiName = "Dr. Bond";
    else if (aiType === "ai-match-analyst") aiName = "Commander";

    // Build prompt with match context and EMOTIONAL awareness
    let prompt = text || "[User is looking at you]";
    if (userEmotion) {
      prompt = `[USER EMOTION: ${userEmotion}]\n\n${prompt}`;
    }
    if (matchContext && persona === "match_analyst") {
      prompt = `[LIVE MATCH: ${matchContext}]\n\n${prompt}`;
    }

    const reply = await getAIResponse(
      prompt,
      history,
      persona,
      aiName,
      req.user.fullName
    );

    console.log(`📞 [AI Face Call] ${aiName} replied: "${(reply || "").substring(0, 50)}..."`);

    res.status(200).json({ reply });
  } catch (error) {
    console.error("❌ [AI Face Call] Error:", error.message);
    res.status(500).json({ 
      reply: "Connection thodi weak hai... ek second ruko! 📡",
      error: error.message 
    });
  }
});

// ═══════════════════════════════════════════════════
//  EXPERT EYE — Screenshot/Image Analysis
// ═══════════════════════════════════════════════════
router.post("/analyze-screenshot", protectRoute, async (req, res) => {
  try {
    const { image, mimeType, context } = req.body;

    if (!image) {
      return res.status(400).json({ message: "Image data is required" });
    }

    console.log(`👁️ [Expert Eye] ${req.user.fullName} sent screenshot for analysis`);

    // Extract base64 data (handle data URIs)
    const base64Data = image.includes(",") ? image.split(",")[1] : image;
    const resolvedMime = mimeType || (image.startsWith("data:") ? image.split(";")[0].split(":")[1] : "image/jpeg");

    const analysis = await MatchIntelligence.analyzeScreenshot({
      imageBase64: base64Data,
      mimeType: resolvedMime,
      userName: req.user.fullName,
      context
    });

    res.status(200).json({ analysis });
  } catch (error) {
    console.error("❌ [Expert Eye] Analysis Error:", error.message);
    res.status(500).json({ message: "Analysis failed. Try again." });
  }
});

// ═══════════════════════════════════════════════════
//  MATCH RECAP — Post-match War Room Summary
// ═══════════════════════════════════════════════════
router.post("/match-recap", protectRoute, async (req, res) => {
  try {
    const { matchName, predictions, chatHighlights, finalScore } = req.body;

    if (!matchName) {
      return res.status(400).json({ message: "Match name is required" });
    }

    console.log(`📊 [Match Recap] Generating for ${req.user.fullName}: ${matchName}`);

    const recap = await MatchIntelligence.generateMatchRecap({
      matchName,
      userPredictions: predictions || [],
      chatHighlights: chatHighlights || [],
      finalScore: finalScore || "Not available",
      userName: req.user.fullName
    });

    res.status(200).json({ recap });
  } catch (error) {
    console.error("❌ [Match Recap] Error:", error.message);
    res.status(500).json({ message: "Recap generation failed" });
  }
});

// ═══════════════════════════════════════════════════
//  GLOBAL STADIUM — AI-Powered Translation
// ═══════════════════════════════════════════════════
router.post("/ai-translate", protectRoute, async (req, res) => {
  try {
    const { text, targetLang } = req.body;

    if (!text || !targetLang) {
      return res.status(400).json({ message: "Text and target language required" });
    }

    console.log(`🌍 [Global Stadium] Translating to ${targetLang}: "${text.substring(0, 40)}..."`);

    const translated = await MatchIntelligence.translateMessage({
      text,
      targetLang
    });

    res.status(200).json({ translatedText: translated });
  } catch (error) {
    console.error("❌ [Translation] Error:", error.message);
    res.status(500).json({ message: "Translation failed" });
  }
});

// DIAGNOSTIC routes (run these in browser to check connection status)
router.get("/test-ml", testMLConnection);
router.get("/test-stream", testStreamConnection);
router.get("/test-ai", protectRoute, testAIConnection);
router.get("/test-email", async (req, res) => {
  try {
    // Log env presence
    const envCheck = {
      SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
      SMTP_USER: process.env.SMTP_USER ? "✅ SET" : "❌ MISSING",
      SMTP_PASS: process.env.SMTP_PASS ? "✅ SET (" + process.env.SMTP_PASS.length + " chars)" : "❌ MISSING",
      OWNER_EMAIL: process.env.OWNER_EMAIL || "NOT SET",
    };
    console.log("[Email Test] Env check:", envCheck);

    const { sendSupportEmail } = await import("../lib/email.service.js");
    const info = await sendSupportEmail("System Test", "test@example.com", "Diagnostic test from server.");
    res.status(200).json({ status: "success", messageId: info.messageId, envCheck });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      envCheck: {
        SMTP_HOST: process.env.SMTP_HOST || "NOT SET",
        SMTP_USER: process.env.SMTP_USER ? "✅ SET" : "❌ MISSING",
        SMTP_PASS: process.env.SMTP_PASS ? "✅ SET" : "❌ MISSING",
        OWNER_EMAIL: process.env.OWNER_EMAIL || "NOT SET",
      }
    });
  }
});


// Rate-limit: one notification email per recipient per 10 minutes
const messageNotifCooldown = new Map();
const COOLDOWN_MS = 60 * 1000; // 1 minute (reduced from 10m for better responsive notifications)

router.post("/notify-message", protectRoute, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId) return res.status(400).json({ message: "recipientId required" });

    // Skip notifications for AI Bots
    if (recipientId.toString().includes("ai-")) {
      return res.json({ sent: false, reason: "ai_bot" });
    }

    // Rate limit check
    const cooldownKey = `${req.user._id}_${recipientId}`;
    const lastSent = messageNotifCooldown.get(cooldownKey);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      return res.json({ sent: false, reason: "cooldown" });
    }

    const recipient = await User.findById(recipientId).select("email fullName").catch(() => null);
    if (!recipient) return res.json({ sent: false, reason: "no_user" });

    messageNotifCooldown.set(cooldownKey, Date.now());

    // 🕒 DELAYED Email Notification (Scheduled for 2 hours later)
    if (recipient.email) {
      const channelId = [req.user._id.toString(), recipientId.toString()].sort().join("-");

      // Update existing pending email if one exists to avoid spamming
      const existing = await DelayedEmail.findOne({
        recipientId,
        channelId,
        isProcessed: false
      });

      if (existing) {
        existing.messageText = text || "New unread messages...";
        await existing.save();
      } else {
        await DelayedEmail.create({
          recipientId,
          senderName: req.user.fullName,
          messageText: text || "New message",
          channelId,
          scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 Hour Mark
        });
      }
    }

    // 🚀 Immediate Push Notification (STAYS REAL-TIME)
    sendPushNotification(recipientId, {
      title: `${req.user.fullName.split(' ')[0]} 💬`,
      body: text || `New message from ${req.user.fullName.split(' ')[0]}`,
      icon: req.user.profilePic || "https://www.freechatweb.in/logo.png",
      data: {
        url: `/chat/${req.user._id}`,
        type: "direct_message",
        senderId: req.user._id.toString()
      }
    }).catch(err => console.error("[Push] Message notification failed:", err.message));

    res.json({ sent: true });
  } catch (err) {
    console.error("Error in message notification:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Reply directly from notification (called by Service Worker)
router.post("/notification-reply", protectRoute, async (req, res) => {
  try {
    const { recipientId, text } = req.body;
    if (!recipientId || !text || !text.trim()) {
      return res.status(400).json({ message: "Recipient and text required" });
    }

    if (!streamClient) {
      return res.status(500).json({ message: "Chat service not initialized" });
    }

    const channelId = [req.user._id.toString(), recipientId.toString()].sort().join("-");
    const channel = streamClient.channel("messaging", channelId, {
      members: [req.user._id.toString(), recipientId.toString()],
    });

    console.log(`💬 [Notification Reply] ${req.user.fullName} -> ${recipientId}: ${text}`);

    await channel.sendMessage({
      text,
      user_id: req.user._id.toString(),
    });

    res.json({ success: true });
  } catch (err) {
    console.error("Error replying from notification:", err.message);
    res.status(500).json({ message: "Failed to send reply" });
  }
});

// ===== Call Notification =====
// Send a high-priority push notification when someone calls
router.post("/notify-call", protectRoute, async (req, res) => {
  try {
    const { recipientId, callId, callType } = req.body;
    if (!recipientId || !callId) {
      return res.status(400).json({ message: "recipientId and callId required" });
    }

    const callerName = req.user.fullName?.split(' ')[0] || "Someone";
    const callerPic = req.user.profilePic || "https://www.freechatweb.in/logo.png";
    const isAudio = callType === "audio";

    console.log(`📞 [Call Push] ${callerName} calling ${recipientId} (${isAudio ? 'audio' : 'video'})`);

    // Send high-priority push notification
    await sendPushNotification(recipientId, {
      title: `${isAudio ? "📞" : "📹"} ${callerName} is calling...`,
      body: `Incoming ${isAudio ? "voice" : "video"} call. Tap to answer!`,
      icon: callerPic,
      data: {
        url: `/call/${callId}${isAudio ? "?type=audio" : ""}`,
        type: "incoming_call",
        callId: callId,
        callerName: req.user.fullName,
        callerPic: callerPic,
      },
    });

    res.json({ sent: true });
  } catch (err) {
    console.error("[Call Push] Error:", err.message);
    res.status(500).json({ message: "Failed to send call notification" });
  }
});

// ═══ REALTIME AI AVATAR & VISUAL MEMORY ═══
router.post("/avatar-session", protectRoute, async (req, res) => {
  try {
    const session = await RealtimeAvatar.createHeyGenSession();
    res.json(session);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/avatar-start", protectRoute, async (req, res) => {
  const { sessionId, sdp } = req.body;
  try {
    const data = await RealtimeAvatar.startStreaming(sessionId, sdp);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/avatar-task", protectRoute, async (req, res) => {
  const { sessionId, text } = req.body;
  try {
    const data = await RealtimeAvatar.speak(sessionId, text);
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/sense-emotion", protectRoute, async (req, res) => {
  const { image } = req.body;
  try {
    const analysis = await RealtimeAvatar.senseEmotion(image);
    res.json(analysis);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/voice-transcribe", protectRoute, async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm" } = req.body;
    if (!audioBase64) return res.status(400).json({ message: "Audio data is required" });

    console.log(`🎤 [Voice Transcribe] ${req.user.fullName} sent audio segment (${Math.round(audioBase64.length/1024)} KB)`);

    const transcription = await MatchIntelligence.transcribeAudio({
      audioBase64,
      mimeType,
      userName: req.user.fullName
    });

    console.log(`📝 [Transcribed] "${transcription.substring(0, 40)}..."`);
    res.status(200).json({ text: transcription });
  } catch (error) {
    console.error("❌ [Voice Transcribe] Error:", error.message);
    res.status(500).json({ message: "Transcription failed" });
  }
});

router.post("/voice-generate", protectRoute, async (req, res) => {
  try {
    const { text, aiType } = req.body;
    if (!text) return res.status(400).json({ message: "Text is required" });

    const audioBuffer = await TopMediaiService.generateVoice(text, aiType);
    
    // Stream Binary MP3
    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.byteLength
    });
    res.end(Buffer.from(audioBuffer));
  } catch (error) {
    console.warn("⚠️ [TopMediai] Falling back to browser TTS:", error.message);
    res.status(202).json({ fallback: true });
  }
});

export default router;
