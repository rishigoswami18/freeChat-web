import mongoose from "mongoose";

const fraudFlagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    flagType: {
      type: String,
      enum: [
        "referral_abuse",
        "payment_risk",
        "payout_risk",
        "spam_graph",
        "multi_account",
        "manual_review",
      ],
      required: true,
      index: true,
    },
    riskScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
    status: {
      type: String,
      enum: ["open", "reviewing", "cleared", "confirmed"],
      default: "open",
      index: true,
    },
    evidence: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },
    reviewNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

fraudFlagSchema.index({ userId: 1, createdAt: -1 });
fraudFlagSchema.index({ status: 1, riskScore: -1 });

const FraudFlag = mongoose.model("FraudFlag", fraudFlagSchema);

export default FraudFlag;
