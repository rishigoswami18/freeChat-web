import mongoose from "mongoose";

const adminAccessSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["moderator", "ops_admin", "finance_admin", "super_admin"],
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    mfaEnabled: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: "",
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIp: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

adminAccessSchema.index({ role: 1, isActive: 1 });

const AdminAccess = mongoose.model("AdminAccess", adminAccessSchema);

export default AdminAccess;
