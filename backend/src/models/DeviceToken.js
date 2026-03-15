import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    platform: {
        type: String,
        enum: ["android", "ios", "web"],
        default: "web"
    },
    deviceInfo: {
        browser: String,
        os: String,
        device: String
    },
    lastActive: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Ensure we can quickly find tokens for a user
deviceTokenSchema.index({ userId: 1, lastActive: -1 });

const DeviceToken = mongoose.model("DeviceToken", deviceTokenSchema);
export default DeviceToken;
