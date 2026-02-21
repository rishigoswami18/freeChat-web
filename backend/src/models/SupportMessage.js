import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
    {
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        message: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["new", "read", "replied"],
            default: "new",
        },
    },
    { timestamps: true }
);

const SupportMessage = mongoose.model("SupportMessage", supportMessageSchema);

export default SupportMessage;
