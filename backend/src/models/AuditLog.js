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
        type: mongoose.Schema.Types.ObjectId,
        required: false // Some actions might not have a specific target
    },
    targetModel: {
        type: String, // e.g., "Match", "User"
        required: false
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    ipAddress: String,
    userAgent: String
}, { timestamps: true });

const AuditLog = mongoose.model("AuditLog", AuditLogSchema);
export default AuditLog;
