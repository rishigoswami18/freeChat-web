import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { translateText } from "../utils/translationService.js";
import User from "../models/User.js";
import { hasPremiumAccess } from "../utils/freeTrial.js";

const router = express.Router();

router.post("/", protectRoute, async (req, res) => {
    try {
        const { text, targetLang } = req.body;

        if (!text || !targetLang) {
            return res.status(400).json({ message: "Text and target language are required" });
        }

        // Check membership (Premium Gating)
        const user = await User.findById(req.user._id);
        if (!hasPremiumAccess(user)) {
            return res.status(403).json({ message: "Real-time translation is a premium feature. Please upgrade to use it." });
        }

        const translated = await translateText(text, targetLang);
        res.json({ translatedText: translated });
    } catch (err) {
        console.error("Translation route error:", err.message);
        res.status(500).json({ message: "Translation service unavailable" });
    }
});

export default router;
