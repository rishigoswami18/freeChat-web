import mongoose from "mongoose";

const PrizeVaultSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prizeName: { type: String, required: true }, // e.g., "Legendary Match Pass", "Amazon Voucher"
    prizeType: { type: String, enum: ["voucher", "digital_asset", "coins"], default: "voucher" },
    prizeValue: { type: String }, // e.g., "₹500", "5000 Coins"
    redemptionCode: { type: String, required: true },
    isRedeemed: { type: Boolean, default: false },
    redeemedAt: { type: Date },
    expiryDate: { type: Date },
    sourceMatch: { type: String }, // matchId
    awardedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PrizeVault = mongoose.model("PrizeVault", PrizeVaultSchema);
export default PrizeVault;
