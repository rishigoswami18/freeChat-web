import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { calculateAge } from "../utils/dateUtils.js";

const router = express.Router();

// All couple routes require auth
router.use(protectRoute);

// Get couple status (partner info)
router.get("/status", async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select("partnerId coupleStatus anniversary coupleRequestSenderId dateOfBirth romanticNote romanticNoteLastUpdated")
            .populate("partnerId", "fullName profilePic bio dateOfBirth");

        const myAge = calculateAge(user.dateOfBirth);
        const partnerAge = user.partnerId ? calculateAge(user.partnerId.dateOfBirth) : 0;

        res.json({
            coupleStatus: user.coupleStatus,
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

        res.json({ message: "Romantic note updated! ❤️", note, lastUpdated: now });
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

        if (me.coupleStatus === "coupled") {
            return res.status(400).json({ message: "You are already in a couple" });
        }

        if (partner.coupleStatus === "coupled") {
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
        me.anniversary = now;
        me.coupleRequestSenderId = null;
        await me.save();

        partner.coupleStatus = "coupled";
        partner.anniversary = now;
        partner.coupleRequestSenderId = null;
        await partner.save();

        res.status(200).json({ message: "You are now a couple! 💑" });
    } catch (err) {
        console.error("Error accepting couple request:", err.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Unlink couple
router.delete("/unlink", async (req, res) => {
    try {
        const me = await User.findById(req.user._id);

        if (me.coupleStatus === "none" || !me.partnerId) {
            return res.status(400).json({ message: "You are not in a couple" });
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
