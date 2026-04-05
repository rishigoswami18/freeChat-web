import express from "express";
import User from "../models/User.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getAllUsers,
  acceptFriendRequest,
  getFriendRequests,
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  sendFriendRequest,
  updateProfile,
  unfriend,
  buyVerification,
  getUserProfile,
  getUserFriends,
  changePassword,
  deleteAccount,
  getTrendingCreators,
  toggleFollow,
  claimDailyReward
} from "../controllers/user.controller.js";
import { migrateUsernames } from "../controllers/migration.controller.js";

const router = express.Router();

router.get("/trending", protectRoute, getTrendingCreators);
router.post("/follow/:id", protectRoute, toggleFollow);
router.get("/all", getAllUsers);


// apply auth middleware to all routes
router.use(protectRoute);

router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);
router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.put("/profile", updateProfile);
router.put("/buy-verification", buyVerification);
router.put("/fcm-token", async (req, res) => {
  try {
    const { token, platform } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });
    const { TokenService } = await import("../services/notifications/tokenService.js");
    await TokenService.saveToken(req.user._id, token, platform || "web");
    res.json({ message: "Token saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/unfriend/:id", unfriend);
router.put("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);
router.post("/claim-daily-reward", claimDailyReward);

// Prize Vault & Rewards
router.get("/prizes", async (req, res) => {
  try {
    const { default: PrizeVault } = await import("../models/PrizeVault.js");
    const prizes = await PrizeVault.find({ userId: req.user._id }).sort({ awardedAt: -1 });
    res.json(prizes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Migration route (Temporary)
router.post("/migrate-usernames", migrateUsernames);

// Bridge for AI Best Friend
router.post("/link-friend-ai", async (req, res) => {
  try {
    const { friendName } = req.body;
    const user = await User.findById(req.user._id);

    user.isFriendedWithAI = true;
    user.aiFriendName = friendName || "Golu";

    await user.save();

    res.status(200).json({
      success: true,
      message: `Linked with your virtual best friend ${user.aiFriendName}! 🤜🤛`,
      user
    });
  } catch (err) {
    console.error("Error linking with AI friend:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update AI Companion Settings (Name + DP)
router.put("/update-ai-companion", async (req, res) => {
  try {
    const { type, name, pic } = req.body;
    // type: "partner" or "friend"
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (type === "partner") {
      if (name) user.aiPartnerName = name;
      if (pic) user.aiPartnerPic = pic;
    } else if (type === "friend") {
      if (name) user.aiFriendName = name;
      if (pic) user.aiFriendPic = pic;
    } else {
      return res.status(400).json({ message: "Invalid type. Use 'partner' or 'friend'" });
    }

    await user.save();
    res.status(200).json({ success: true, message: "AI companion updated!", user });
  } catch (err) {
    console.error("Error updating AI companion:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// 🤖 AI Strategy & Automation
router.get("/ai/content-strategy", protectRoute, async (req, res) => {
    try {
        const { getAIContentSuggestions } = await import("../services/aiContent.service.js");
        const suggestions = await getAIContentSuggestions(req.user.contentNiche || "Lifestyle", req.user.fullName);
        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.put("/settings/automation", protectRoute, async (req, res) => {
    try {
        const { isAutoReplyEnabled, autoReplyMessage, contentNiche } = req.body;
        const user = await User.findById(req.user._id);
        
        if (isAutoReplyEnabled !== undefined) user.isAutoReplyEnabled = isAutoReplyEnabled;
        if (autoReplyMessage !== undefined) user.autoReplyMessage = autoReplyMessage;
        if (contentNiche !== undefined) user.contentNiche = contentNiche;
        
        await user.save();
        res.json({ success: true, message: "Automation settings updated!", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post("/creator/airdrop", protectRoute, async (req, res) => {
    try {
        const { fanIds, amountPerFan } = req.body;
        if (!fanIds || !Array.isArray(fanIds) || !amountPerFan) {
            return res.status(400).json({ message: "Invalid airdrop data. Need fanIds (array) and amountPerFan" });
        }
        
        const { creatorAirdrop } = await import("../services/airdrop.service.js");
        const result = await creatorAirdrop(req.user._id, fanIds, amountPerFan);
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/creator/leaderboard", protectRoute, async (req, res) => {
    try {
        const { default: UserWallet } = await import("../models/UserWallet.js");
        const topWallets = await UserWallet.find({ winnings: { $gt: 0 } })
            .sort({ winnings: -1 })
            .limit(10)
            .populate({
                path: "userId",
                select: "fullName username profilePic isVerified followersCount"
            });
            
        res.json(topWallets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Wildcard routes MUST be last



router.get("/:id", getUserProfile);
router.get("/:id/friends", getUserFriends);

export default router;
