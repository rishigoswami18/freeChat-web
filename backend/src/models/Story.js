import mongoose from "mongoose";

const storySchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fullName: { type: String, required: true },
        profilePic: { type: String, default: "" },
        imageUrl: { type: String, required: true },
        caption: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now, index: { expires: "24h" } },
    },
    { timestamps: true }
);

const Story = mongoose.model("Story", storySchema);
export default Story;
