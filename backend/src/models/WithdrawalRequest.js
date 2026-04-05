import mongoose from "mongoose";

const WithdrawalRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    upiId: { type: String, required: true, trim: true },
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected", "completed"], 
        default: "pending" 
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    riskScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    paymentRail: {
        type: String,
        enum: ["upi", "bank", "wallet", ""],
        default: "upi"
    },
    payoutProviderRef: {
        type: String,
        default: ""
    },
    ledgerEntryId: {
        type: String,
        default: ""
    },
    rejectionCode: {
        type: String,
        default: ""
    },
    reviewTimeline: {
        type: [mongoose.Schema.Types.Mixed],
        default: []
    },
    adminNotes: { type: String },
    ipAddress: { type: String },
    deviceFingerprint: { type: String },
    processedAt: { type: Date }
}, { timestamps: true });

const WithdrawalRequest = mongoose.model("WithdrawalRequest", WithdrawalRequestSchema);
export default WithdrawalRequest;
