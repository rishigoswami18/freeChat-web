import { randomUUID } from "crypto";
import AdminAccess from "../models/AdminAccess.js";

const ROLE_PERMISSIONS = {
  moderator: [
    "dashboard.read",
    "users.read",
    "moderation.read",
    "moderation.write",
    "audit.read",
  ],
  ops_admin: [
    "dashboard.read",
    "users.read",
    "users.write",
    "kyc.review",
    "moderation.read",
    "moderation.write",
    "analytics.read",
    "audit.read",
  ],
  finance_admin: [
    "dashboard.read",
    "users.read",
    "payments.read",
    "payments.write",
    "analytics.read",
    "audit.read",
  ],
  super_admin: ["*"],
};

const LEGACY_ADMIN_ACCESS = {
  role: "super_admin",
  permissions: ["*"],
  isLegacy: true,
  isActive: true,
};

const getRequestIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
  req.socket?.remoteAddress ||
  "";

const mergePermissions = (role, customPermissions = []) => {
  const defaults = ROLE_PERMISSIONS[role] || [];
  return [...new Set([...defaults, ...customPermissions])];
};

const hasPermissions = (adminAccess, requiredPermissions) => {
  if (!adminAccess?.isActive) return false;
  if (adminAccess.permissions?.includes("*")) return true;
  if (requiredPermissions.length === 0) return true;

  return requiredPermissions.every((permission) =>
    adminAccess.permissions?.includes(permission)
  );
};

export const writeAuditContext = (req, res, next) => {
  req.auditContext = {
    requestId: req.headers["x-request-id"] || randomUUID(),
    ipAddress: getRequestIp(req),
    userAgent: req.get("user-agent") || "",
  };

  next();
};

export const resolveAdminAccess = async (user) => {
  if (!user?._id) return null;

  const adminAccess = await AdminAccess.findOne({
    userId: user._id,
    isActive: true,
  }).lean();

  if (adminAccess) {
    return {
      ...adminAccess,
      permissions: mergePermissions(adminAccess.role, adminAccess.permissions),
    };
  }

  if (user.role === "admin") {
    return LEGACY_ADMIN_ACCESS;
  }

  return null;
};

export const requireAdminPermission =
  (...requiredPermissions) =>
  async (req, res, next) => {
    try {
      const adminAccess = await resolveAdminAccess(req.user);

      if (!adminAccess) {
        return res.status(403).json({
          success: false,
          error: {
            code: "ADMIN_ACCESS_REQUIRED",
            message: "Admin access required",
          },
        });
      }

      if (!hasPermissions(adminAccess, requiredPermissions)) {
        return res.status(403).json({
          success: false,
          error: {
            code: "INSUFFICIENT_PERMISSION",
            message: "Insufficient admin permission",
          },
        });
      }

      req.adminAccess = adminAccess;
      next();
    } catch (error) {
      console.error("Error in requireAdminPermission middleware:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "ADMIN_MIDDLEWARE_ERROR",
          message: "Internal Server Error",
        },
      });
    }
  };

export const requireSuperAdmin = requireAdminPermission("config.write");
