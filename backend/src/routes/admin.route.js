import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import {
    getAdminStats,
    getAdminUsers,
    getAdminPosts,
    deleteUser,
    toggleUserRole,
    broadcastEmail
} from "../controllers/admin.controller.js";
import { getFirebaseNonUsers, sendInvites } from "../controllers/invite.controller.js";

const router = express.Router();

router.use(protectRoute);
router.use(isAdmin);

router.get("/stats", getAdminStats);
router.get("/users", getAdminUsers);
router.get("/posts", getAdminPosts);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", toggleUserRole);
router.post("/broadcast-email", broadcastEmail);

// Invite system
router.get("/firebase-users", getFirebaseNonUsers);
router.post("/invite", sendInvites);

export default router;

