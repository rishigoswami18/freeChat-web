import mongoose from "mongoose";
import Post from "./src/models/Post.js";
import "dotenv/config";

const MONGO_URI = process.env.MONGO_URI;

async function run() {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Find posts that have video extensions but mediaType is empty or wrong
    const posts = await Post.find({
        $or: [
            { mediaUrl: { $regex: /\.(mp4|mov|webm|avi)/i } },
            { mediaType: "video" }
        ]
    }).lean();

    console.log("Found", posts.length, "total video-potential posts.");

    posts.forEach(p => {
        console.log(`ID: ${p._id} | MediaType: '${p.mediaType}' | URL: ${p.mediaUrl.substring(0, 50)}...`);
    });

    const wrongType = posts.filter(p => p.mediaType !== 'video');
    if (wrongType.length > 0) {
        console.log(`Repairing ${wrongType.length} posts to mediaType: 'video'...`);
        await Post.updateMany(
            { _id: { $in: wrongType.map(p => p._id) } },
            { $set: { mediaType: "video" } }
        );
        console.log("Repair finished!");
    }

    // NEW: Migration for missing isAd field
    const missingIsAd = posts.filter(p => p.isAd === undefined);
    if (missingIsAd.length > 0) {
        console.log(`Repairing ${missingIsAd.length} posts to set isAd: false...`);
        await Post.updateMany(
            { _id: { $in: missingIsAd.map(p => p._id) } },
            { $set: { isAd: false } }
        );
        console.log("Migration finished!");
    } else {
        console.log("All video posts already have their isAd property set.");
    }

    await mongoose.disconnect();
}

run();
