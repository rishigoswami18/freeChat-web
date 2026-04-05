import express from "express";
import { requireAdminPermission } from "../../middleware/admin.middleware.js";
import {
  getAdminLiveTicker,
  getAdminOverview,
} from "../../controllers/admin/dashboard.admin.controller.js";

const router = express.Router();

router.get("/overview", requireAdminPermission("dashboard.read"), getAdminOverview);
router.get("/live-ticker", requireAdminPermission("dashboard.read"), getAdminLiveTicker);

export default router;
