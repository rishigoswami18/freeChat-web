import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  sendMessage,
  testMLConnection,
  testStreamConnection,
} from "../controllers/chat.controller.js";
import cloudinary from "../lib/cloudinary.js";
import User from "../models/User.js";
import { sendNotificationEmail } from "../lib/email.service.js";

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
const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes

router.post("/notify-message", protectRoute, async (req, res) => {
  try {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ message: "recipientId required" });

    // Rate limit check
    const cooldownKey = `${req.user._id}_${recipientId}`;
    const lastSent = messageNotifCooldown.get(cooldownKey);
    if (lastSent && Date.now() - lastSent < COOLDOWN_MS) {
      return res.json({ sent: false, reason: "cooldown" });
    }

    const recipient = await User.findById(recipientId).select("email fullName");
    if (!recipient?.email) return res.json({ sent: false, reason: "no_email" });

    messageNotifCooldown.set(cooldownKey, Date.now());

    // Fire-and-forget
    sendNotificationEmail(recipient.email, {
      emoji: "💬",
      title: `New message from ${req.user.fullName.split(' ')[0]}!`,
      body: `<strong>${req.user.fullName}</strong> sent you a message on freeChat. Open the app to read and reply!`,
      ctaText: "Open Chat",
      ctaUrl: `${process.env.CLIENT_URL || "https://freechatweb.in"}/inbox`,
    });

    res.json({ sent: true });
  } catch (err) {
    console.error("Error in message notification:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
