import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fullName: { type: String, required: true },
  profilePic: { type: String, default: "" },
  role: { type: String, default: "user" },
  isVerified: { type: Boolean, default: false },
  text: { type: String, required: true },
  caption: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    profilePic: { type: String, default: "" },
    role: { type: String, default: "user" },
    isVerified: { type: Boolean, default: false },
    content: { type: String, default: "" },
    caption: { type: String, default: "" },
    mediaUrl: { type: String, default: "" },
    mediaType: { type: String, enum: ["image", "video", ""], default: "" },
    songName: { type: String, default: "Original Audio" },
    audioUrl: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
    shareCount: { type: Number, default: 0 },
    isAd: { type: Boolean, default: false },
    adLink: { type: String, default: "" },
    adCta: { type: String, default: "Learn More" },
  },
  { timestamps: true }
);

// Indexes for common queries
postSchema.index({ userId: 1, createdAt: -1 });  // User's posts sorted by date
postSchema.index({ createdAt: -1 });               // Feed pagination
postSchema.index({ mediaType: 1, createdAt: -1 }); // Video/reel filtering

const Post = mongoose.model("Post", postSchema);
export default Post;
