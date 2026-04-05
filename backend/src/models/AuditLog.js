import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., "MATCH_KILL", "SCORE_OVERRIDE", "USER_SHADOWBAN"
        required: true,
        index: true
    },
    targetId: {
        type: mongoose.Schema.Types.Mixed,
        required: false // Some actions might not have a specific target
    },
    targetModel: {
        type: String, // e.g., "Match", "User"
        required: false
    },
    resourceId: {
        type: mongoose.Schema.Types.Mixed,
        default: null,
        index: true
    },
    resourceType: {
        type: String,
        default: "",
        index: true
    },
    reason: {
        type: String,
        default: ""
    },
    before: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    after: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    severity: {
        type: String,
        enum: ["info", "warning", "critical"],
        default: "info",
        index: true
    },
    success: {
        type: Boolean,
        default: true,
        index: true
    },
    requestId: {
        type: String,
        default: "",
        index: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ adminId: 1, createdAt: -1 });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
