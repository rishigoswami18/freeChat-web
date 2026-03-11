import express from "express";
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
  claimDailyReward,
} from "../controllers/user.controller.js";
import { migrateUsernames } from "../controllers/migration.controller.js";

const router = express.Router();
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
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token is required" });
    const { saveFcmToken } = await import("../lib/push.service.js");
    await saveFcmToken(req.user._id, token);
    res.json({ message: "Token saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/unfriend/:id", unfriend);
router.put("/change-password", changePassword);
router.delete("/delete-account", deleteAccount);
router.post("/claim-daily-reward", claimDailyReward);

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

// Wildcard routes MUST be last to avoid catching specific routes like /friends, /friend-requests
router.get("/:id", getUserProfile);
router.get("/:id/friends", getUserFriends);

export default router;