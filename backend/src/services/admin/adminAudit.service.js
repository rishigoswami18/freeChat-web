import AuditLog from "../../models/AuditLog.js";

export const createAuditLog = async (req, payload = {}) => {
  if (!req?.user?._id || !payload.action) return null;

  return AuditLog.create({
    adminId: req.user._id,
    action: payload.action,
    targetId: payload.targetId ?? payload.resourceId ?? null,
    targetModel: payload.targetModel ?? payload.resourceType ?? "",
    resourceId: payload.resourceId ?? payload.targetId ?? null,
    resourceType: payload.resourceType ?? payload.targetModel ?? "",
    reason: payload.reason || "",
    details: payload.details || {},
    before: payload.before ?? null,
    after: payload.after ?? null,
    severity: payload.severity || "info",
    success: payload.success ?? true,
    requestId: req.auditContext?.requestId || "",
    ipAddress:
      payload.ipAddress ||
      req.auditContext?.ipAddress ||
      req.headers["x-forwarded-for"] ||
      req.socket?.remoteAddress ||
      "",
    userAgent: payload.userAgent || req.auditContext?.userAgent || "",
  });
};
