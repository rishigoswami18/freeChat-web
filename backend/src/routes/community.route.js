import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createCommunity,
  getAllCommunities,
  getCommunityDetails,
  toggleJoinCommunity,
  getCommunityPosts,
  createCommunityPost,
} from "../controllers/community.controller.js";

const router = express.Router();

router.use(protectRoute);

router.post("/", createCommunity); // Create a community
router.get("/", getAllCommunities); // List all communities
router.get("/:id", getCommunityDetails); // Get specific community details
router.put("/:id/join", toggleJoinCommunity); // Join or Leave
router.get("/:id/posts", getCommunityPosts); // Get posts inside community
router.post("/:id/posts", createCommunityPost); // Create post inside community

export default router;
