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
} from "../controllers/user.controller.js";
import { migrateUsernames } from "../controllers/migration.controller.js";

const router = express.Router();
router.get("/all", getAllUsers);

// apply auth middleware to all routes
router.use(protectRoute);


router.get("/", getRecommendedUsers);
router.get("/friends", getMyFriends);

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.put("/profile", updateProfile);
router.put("/buy-verification", buyVerification);

router.delete("/unfriend/:id", unfriend);

// Migration route (Temporary)
router.post("/migrate-usernames", migrateUsernames);

export default router;