import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  profilePic: { type: String, default: "" },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    profilePic: { type: String, default: "" },
    content: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", ""], default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    shareCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", postSchema);
export default Post;
