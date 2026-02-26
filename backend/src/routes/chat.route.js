import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getStreamToken,
  sendMessage,
  testMLConnection,
  testStreamConnection,
} from "../controllers/chat.controller.js";

import cloudinary from "../lib/cloudinary.js";

const router = express.Router();

// existing route (NO CHANGE)
router.get("/token", protectRoute, getStreamToken);

// Media upload for chat snaps/messages
router.post("/upload-media", protectRoute, async (req, res) => {
  try {
    const { media, mediaType } = req.body;
    if (!media) return res.status(400).json({ message: "Media is required" });

    const resourceType = mediaType === "video" ? "video" : "image";
    const uploaded = await cloudinary.uploader.upload(media, {
      folder: "freechat_messages",
      resource_type: resourceType,
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

export default router;
