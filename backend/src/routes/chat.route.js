import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  sendMessage,
  testMLConnection,
  testStreamConnection,
  analyzeConflict,
} from "../controllers/chat.controller.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import DelayedEmail from "../models/DelayedEmail.js";
import { sendNotificationEmail } from "../lib/email.service.js";
import { sendPushNotification } from "../lib/push.service.js";
import { streamClient } from "../lib/stream.js";

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

// DIAGNOSTIC routes (run these in browser to check connection status)
router.get("/test-ml", testMLConnection);
router.get("/test-stream", testStreamConnection);
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

    // Rate limit check
    const cooldownKey = `${req.user._id}_${recipientId}`;
    const lastSent = messageNotifCooldown.get(cooldownKey);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      return res.json({ sent: false, reason: "cooldown" });
    }

    const recipient = await User.findById(recipientId).select("email fullName");
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

export default router;
