import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { calculateAge } from "../utils/dateUtils.js";
import { sendNotificationEmail } from "../lib/email.service.js";
import { sendPushNotification } from "../lib/push.service.js";
import { getAIResponse } from "../lib/gemini.js";
import { streamClient } from "../lib/stream.js";

const router = express.Router();

// All couple routes require auth
router.use(protectRoute);

// Get couple status (partner info)
router.get("/status", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("partnerId coupleStatus anniversary coupleRequestSenderId dateOfBirth romanticNote romanticNoteLastUpdated aiPartnerName isCoupledWithAI")
            .populate("partnerId", "fullName profilePic bio dateOfBirth");

        const myAge = calculateAge(user.dateOfBirth);

        // Handle AI Virtual Partner Logic (Priority: Human Partner > AI Partner)
        if (user.isCoupledWithAI && !user.partnerId && user.coupleStatus !== "pending") {
            return res.json({
                coupleStatus: "coupled",
                isCoupledWithAI: true,
                partner: {
                    _id: "ai-user-id",
                    fullName: user.aiPartnerName || "Lia",
                    profilePic: user.aiPartnerPic?.startsWith("http") ? user.aiPartnerPic : `${process.env.CLIENT_URL || "https://freechatweb.in"}${user.aiPartnerPic || "/ai-companion.png"}`,
                    bio: "High-Status Strategy Partner for Mindset & Results. 🚀"
                },
                anniversary: user.anniversary || new Date(),
                coupleRequestSenderId: null,
                romanticNote: user.romanticNote,
                romanticNoteLastUpdated: user.romanticNoteLastUpdated,
                isBothAdult: true, // AI is always adult-friendly
                aiPartnerName: user.aiPartnerName
            });
        }

        const partnerAge = user.partnerId ? calculateAge(user.partnerId.dateOfBirth) : 0;

        res.json({
            coupleStatus: user.coupleStatus,
            isCoupledWithAI: false,
            partner: user.partnerId || null,
            anniversary: user.anniversary,
            coupleRequestSenderId: user.coupleRequestSenderId,
            romanticNote: user.romanticNote,
            romanticNoteLastUpdated: user.romanticNoteLastUpdated,
            isBothAdult: myAge >= 18 && partnerAge >= 18,
        });
    } catch (err) {
        console.error("Error getting couple status:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Update romantic note
router.put("/note", async (req, res) => {
    try {
        const { note } = req.body;
        const myId = req.user._id;

        const me = await User.findById(myId);
        if (me.coupleStatus !== "coupled" || !me.partnerId) {
            return res.status(400).json({ message: "You must be in a coupled relationship to set a note" });
        }

        const now = new Date();

        // Update with AI support
        if (me.isCoupledWithAI) {
            me.romanticNote = note || "";
            me.romanticNoteLastUpdated = now;
            await me.save();
        } else {
            // Update both users for synchronization
            await User.updateMany(
                { _id: { $in: [myId, me.partnerId] } },
                {
                    $set: {
                        romanticNote: note || "",
                        romanticNoteLastUpdated: now
                    }
                }
            );
        }

        res.json({ message: "Romantic note updated! ❤️", note, lastUpdated: now });

        // Notify partner about romantic note (fire-and-forget)
        if (me.partnerId && note) {
            const partner = await User.findById(me.partnerId).select("email");
            if (partner?.email) {
                sendNotificationEmail(partner.email, {
                    emoji: "💌",
                    title: `${req.user.fullName.split(' ')[0]} left you a love note!`,
                    body: `Your special someone wrote something just for you on Zyro. Open the app to read their romantic note! 💕`,
                    ctaText: "Read the Note",
                    ctaUrl: `${process.env.CLIENT_URL || "https://freechatweb.in"}/couple`,
                });

                // Send push notification (fire-and-forget)
                sendPushNotification(me.partnerId, {
                    title: `💌 ${req.user.fullName.split(' ')[0]} left you a love note!`,
                    body: `Your special someone wrote something just for you. Tap to read it!`,
                    icon: req.user.profilePic,
                    data: { url: "/couple" }
                }).catch(err => console.error("[Push] Romantic note notification failed:", err.message));
            }
        } else if (me.isCoupledWithAI && note) {
            // AI Response to Note
            try {
                const aiReply = await getAIResponse(
                    `I just read your strategic note: "${note}". It shows you are focused on the win. Let's keep building that mindset!`,
                    [],
                    "BOND_COMPANION",
                    me.aiPartnerName,
                    me.fullName
                );

                if (streamClient) {
                    const channel = streamClient.channel("messaging", {
                        members: [myId.toString(), "ai-user-id"],
                    });
                    await channel.create();
                    await channel.sendMessage({
                        text: aiReply,
                        user_id: "ai-user-id",
                        silent: true
                    });
                }
            } catch (aiErr) {
                console.error("AI couldn't respond to note:", aiErr);
            }
        }
    } catch (err) {
        console.error("Error updating romantic note:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Send couple request to a friend
router.post("/request/:id", async (req, res) => {
    try {
        const myId = req.user._id;
        const partnerId = req.params.id;

        if (myId.toString() === partnerId) {
            return res.status(400).json({ message: "You can't send a couple request to yourself" });
        }

        const me = await User.findById(myId);
        const partner = await User.findById(partnerId);

        if (!partner) {
            return res.status(404).json({ message: "User not found" });
        }

        // Age verification: must be 14+ for Couple feature
        if (calculateAge(new Date(me.dateOfBirth)) < 14) {
            return res.status(400).json({ message: "You must be at least 14 years old to use the Couple feature" });
        }

        if (calculateAge(new Date(partner.dateOfBirth)) < 14) {
            return res.status(400).json({ message: "The partner must be at least 14 years old" });
        }

        // Allow sending if NOT coupled with a human (AI doesn't count as a blocker)
        if (me.coupleStatus === "coupled" && !me.isCoupledWithAI) {
            return res.status(400).json({ message: "You are already in a couple" });
        }

        if (partner.coupleStatus === "coupled" && !partner.isCoupledWithAI) {
            return res.status(400).json({ message: "This user is already in a couple" });
        }

        if (me.coupleStatus === "pending") {
            return res.status(400).json({ message: "You already have a pending couple request" });
        }

        // Check they are friends
        if (!me.friends.includes(partnerId)) {
            return res.status(400).json({ message: "You can only send couple requests to friends" });
        }

        // Set both users to pending
        me.partnerId = partnerId;
        me.coupleStatus = "pending";
        me.coupleRequestSenderId = myId;
        await me.save();

        partner.partnerId = myId;
        partner.coupleStatus = "pending";
        partner.coupleRequestSenderId = myId;
        await partner.save();

        res.status(200).json({ message: "Couple request sent!" });
    } catch (err) {
        console.error("Error sending couple request:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Accept couple request
router.put("/accept/:id", async (req, res) => {
    try {
        const myId = req.user._id;
        const partnerId = req.params.id;

        const me = await User.findById(myId);
        const partner = await User.findById(partnerId);

        if (!partner) {
            return res.status(404).json({ message: "User not found" });
        }

        // Age verification check (extra safety)
        if (calculateAge(new Date(me.dateOfBirth)) < 14 || calculateAge(new Date(partner.dateOfBirth)) < 14) {
            return res.status(400).json({ message: "Both users must be at least 14 years old to link accounts" });
        }

        // Verify both are in pending state and linked to each other
        if (
            me.coupleStatus !== "pending" ||
            partner.coupleStatus !== "pending" ||
            me.partnerId?.toString() !== partnerId ||
            partner.partnerId?.toString() !== myId.toString()
        ) {
            return res.status(400).json({ message: "No pending couple request found" });
        }

        const now = new Date();
        me.coupleStatus = "coupled";
        me.isCoupledWithAI = false; // Disconnect virtual partner if transitioning to humans
        me.anniversary = now;
        me.coupleRequestSenderId = null;
        await me.save();

        partner.coupleStatus = "coupled";
        partner.isCoupledWithAI = false; // Disconnect their virtual partner too
        partner.anniversary = now;
        partner.coupleRequestSenderId = null;
        await partner.save();

        res.status(200).json({ message: "You are now a couple! 💑" });
    } catch (err) {
        console.error("Error accepting couple request:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Link with AI Virtual Partner
router.post("/link-ai", async (req, res) => {
    try {
        let { partnerName } = req.body;
        
        // --- NAME SANITIZATION (RAZORPAY COMPLIANCE) ---
        const forbiddenNames = ["baby", "darling", "jaan", "shona", "sweetheart", "love", "girlfriend", "jaaneman", "sexy"];
        if (partnerName && forbiddenNames.includes(partnerName.toLowerCase())) {
            partnerName = "AI Companion";
        }

        const user = await User.findById(req.user._id);

        if (user.coupleStatus === "coupled" && !user.isCoupledWithAI) {
            return res.status(400).json({ message: "You are already linked with a real partner" });
        }

        user.isCoupledWithAI = true;
        user.coupleStatus = "coupled";
        user.aiPartnerName = partnerName || "Aria";
        if (!user.anniversary) user.anniversary = new Date();

        await user.save();

        res.status(200).json({
            success: true,
            message: `Linked with your virtual partner ${user.aiPartnerName}! ❤️`,
            user
        });
    } catch (err) {
        console.error("Error linking with AI:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Unlink couple (modified to handle AI)
router.delete("/unlink", async (req, res) => {
    try {
        const me = await User.findById(req.user._id);

        if (me.coupleStatus === "none" && !me.isCoupledWithAI) {
            return res.status(400).json({ message: "You are not in a couple" });
        }

        if (me.isCoupledWithAI && !me.partnerId && me.coupleStatus !== "pending") {
            me.isCoupledWithAI = false;
            me.coupleStatus = "none";
            me.partnerId = null;
            me.anniversary = null;
            await me.save();
            return res.status(200).json({ message: "Virtual partner unlinked" });
        }

        const partner = await User.findById(me.partnerId);

        // Clear my couple data
        me.partnerId = null;
        me.coupleStatus = "none";
        me.anniversary = null;
        me.coupleRequestSenderId = null;
        await me.save();

        // Clear partner's couple data
        if (partner) {
            partner.partnerId = null;
            partner.coupleStatus = "none";
            partner.anniversary = null;
            partner.coupleRequestSenderId = null;
            await partner.save();
        }

        res.status(200).json({ message: "Couple unlinked" });
    } catch (err) {
        console.error("Error unlinking couple:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

export default router;
