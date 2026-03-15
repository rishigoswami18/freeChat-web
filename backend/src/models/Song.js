import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: { type: String, required: true, index: true },
    artist: { type: String, required: true, index: true },
    audioUrl: { type: String, required: true },
    coverUrl: { type: String, default: "" },
    duration: { type: Number, default: 0 }, // in seconds
    genre: { type: String, default: "Pop" },
    
    // Analytics & Discovery
    usageCount: { type: Number, default: 0, index: -1 },
    trendingScore: { type: Number, default: 0, index: -1 },
    isTrending: { type: Boolean, default: false, index: true },
    
    // Metadata
    isVerified: { type: Boolean, default: false },
    creatorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Compound index for search
songSchema.index({ title: "text", artist: "text" });

const Song = mongoose.model("Song", songSchema);
export default Song;
