import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "", trim: true },
    icon: { type: String, default: "" }, // Cloudinary URL
    banner: { type: String, default: "" }, // Cloudinary URL
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isPrivate: { type: Boolean, default: false }, // Only members can see posts if true
  },
  { timestamps: true }
);

// Indexes
communitySchema.index({ name: "text", description: "text" }); // For search
communitySchema.index({ members: 1 });

const Community = mongoose.model("Community", communitySchema);
export default Community;
