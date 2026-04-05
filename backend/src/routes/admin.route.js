import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
    requireAdminPermission,
    requireSuperAdmin,
    writeAuditContext
} from "../middleware/admin.middleware.js";
import {
    getAdminStats,
    getAdminPosts,
    deleteUser,
    toggleUserRole,
    broadcastEmail,
    getAdminSupportMessages,
    deleteSupportMessage,
    sendEmailToUser,
    sendNotificationToUser,
    broadcastNotification, 
    clearAdminInbox, 
    sweepPendingActions 
} from "../controllers/admin.controller.js";
import {
    createMatch,
    getMatches,
    updateMatchStatus,
    getWithdrawalRequests,
    processWithdrawal,
    getFinancialStats,
    resolveMatchBall
} from "../controllers/bondAdmin.controller.js";
import { getFirebaseNonUsers, sendInvites } from "../controllers/invite.controller.js";
import dashboardAdminRoutes from "./admin/dashboard.route.js";
import adminUsersRoutes from "./admin/users.route.js";

const router = express.Router();

router.use(protectRoute);
router.use(writeAuditContext);

router.get("/stats", requireAdminPermission("dashboard.read"), getAdminStats);
router.get("/posts", requireAdminPermission("moderation.read"), getAdminPosts);
router.delete("/users/:id", requireAdminPermission("users.write"), deleteUser);
router.put("/users/:id/role", requireSuperAdmin, toggleUserRole);
router.post("/broadcast-email", requireAdminPermission("users.write"), broadcastEmail);
router.post("/send-email", requireAdminPermission("users.write"), sendEmailToUser);
router.post("/send-notification", requireAdminPermission("users.write"), sendNotificationToUser);
router.post("/broadcast-notification", requireAdminPermission("users.write"), broadcastNotification);
router.post("/clear-inbox", requireAdminPermission("moderation.write"), clearAdminInbox);
router.post("/sweep", requireAdminPermission("dashboard.write"), sweepPendingActions);

// Support Messages
router.get("/support", requireAdminPermission("moderation.read"), getAdminSupportMessages);
router.delete("/support/:id", requireAdminPermission("moderation.write"), deleteSupportMessage);

// Invite system
router.get("/firebase-users", requireAdminPermission("users.read"), getFirebaseNonUsers);
router.post("/invite", requireAdminPermission("users.write"), sendInvites);

// Zyro Specific Managed Features
router.get("/matches", requireAdminPermission("dashboard.read"), getMatches);
router.post("/matches", requireAdminPermission("config.write"), createMatch);
router.patch("/matches/:id", requireAdminPermission("config.write"), updateMatchStatus);
router.post("/matches/:id/resolve", requireAdminPermission("config.write"), resolveMatchBall);


// Financial & Operations
router.get("/withdrawals", requireAdminPermission("payments.read"), getWithdrawalRequests);
router.post("/withdrawals/process", requireAdminPermission("payments.write"), processWithdrawal);
router.get("/bond-stats", requireAdminPermission("analytics.read"), getFinancialStats);

// New modular admin APIs
router.use("/dashboard", dashboardAdminRoutes);
router.use("/users", adminUsersRoutes);

export default router;
