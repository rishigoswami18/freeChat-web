import mongoose from "mongoose";

const delayedEmailSchema = new mongoose.Schema({
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    messageText: { type: String, required: true },
    channelId: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    isProcessed: { type: Boolean, default: false }
}, { timestamps: true });

// Index for efficiently finding ready-to-send emails
delayedEmailSchema.index({ isProcessed: 1, scheduledAt: 1 });

const DelayedEmail = mongoose.model("DelayedEmail", delayedEmailSchema);
export default DelayedEmail;
