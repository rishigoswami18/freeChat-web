import express from "express";
import { protectRoute, isAdmin } from "../middleware/auth.middleware.js";
import {
    getAdminStats,
    getAdminUsers,
    getAdminPosts,
    deleteUser,
    toggleUserRole,
    broadcastEmail,
    getAdminSupportMessages,
    deleteSupportMessage,
    sendEmailToUser,
    sendNotificationToUser
} from "../controllers/admin.controller.js";
import {
    createMatch,
    getMatches,
    updateMatchStatus,
    resolveMatchBall,
    getWithdrawalRequests,
    processWithdrawal,
    getFinancialStats
} from "../controllers/bondAdmin.controller.js";
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
router.post("/send-email", sendEmailToUser);
router.post("/send-notification", sendNotificationToUser);

// Support Messages
router.get("/support", getAdminSupportMessages);
router.delete("/support/:id", deleteSupportMessage);

// Invite system
router.get("/firebase-users", getFirebaseNonUsers);
router.post("/invite", sendInvites);

// BondBeyond Specific Managed Features
router.get("/matches", getMatches);
router.post("/matches", createMatch);
router.patch("/matches/:id", updateMatchStatus);
router.post("/resolve-ball", resolveMatchBall);

// Financial & Operations
router.get("/withdrawals", getWithdrawalRequests);
router.post("/withdrawals/process", processWithdrawal);
router.get("/bond-stats", getFinancialStats);

export default router;

