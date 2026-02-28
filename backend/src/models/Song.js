import mongoose from "mongoose";

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    audioUrl: { type: String, default: "" },
    isTrending: { type: Boolean, default: false },
}, { timestamps: true });

const Song = mongoose.model("Song", songSchema);
export default Song;
