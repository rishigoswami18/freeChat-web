import express from "express";
import { requireAdminPermission } from "../../middleware/admin.middleware.js";
import {
  getAdminUserDetails,
  getAdminUserEarnings,
  getAdminUserFlags,
  getAdminUsersList,
  updateAdminUserStatus,
  updateAdminUserVerification,
} from "../../controllers/admin/users.admin.controller.js";

const router = express.Router();

router.get("/", requireAdminPermission("users.read"), getAdminUsersList);
router.get("/:id/earnings", requireAdminPermission("users.read", "payments.read"), getAdminUserEarnings);
router.get("/:id/flags", requireAdminPermission("users.read"), getAdminUserFlags);
router.patch("/:id/status", requireAdminPermission("users.write"), updateAdminUserStatus);
router.patch("/:id/verify", requireAdminPermission("kyc.review"), updateAdminUserVerification);
router.get("/:id", requireAdminPermission("users.read"), getAdminUserDetails);

export default router;
