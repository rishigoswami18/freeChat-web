import mongoose from "mongoose";
import Post from "./src/models/Post.js";
import User from "./src/models/User.js";
import "dotenv/config";

const MONGODB_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freeChat";

async function seed() {
    try {
        console.log("Connecting to:", MONGODB_URI);
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        const user = await User.findOne();
        if (!user) {
            console.log("No users found to assign posts to. Please create an account first.");
            return;
        }

        const videoPosts = [
            {
                userId: user._id,
                fullName: user.fullName,
                profilePic: user.profilePic,
                content: "Beautiful scenery! 🌊",
                mediaUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
                mediaType: "video",
                songName: "Nature Vibes",
                likes: [],
                comments: [],
                shareCount: 15,
                isAd: false,
            },
            {
                userId: user._id,
                fullName: user.fullName,
                profilePic: user.profilePic,
                content: "Cooking some amazing food! 🍜",
                mediaUrl: "https://www.w3schools.com/html/movie.mp4",
                mediaType: "video",
                songName: "Kitchen Beats",
                likes: [],
                comments: [],
                shareCount: 42,
                isAd: false,
            },
            {
                userId: user._id,
                fullName: user.fullName,
                profilePic: user.profilePic,
                content: "Testing my new camera! 📸",
                mediaUrl: "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
                mediaType: "video",
                songName: "Camera Focus",
                likes: [],
                comments: [],
                shareCount: 5,
                isAd: false,
            },
        ];

        await Post.insertMany(videoPosts);
        console.log("Successfully seeded 3 video posts!");
    } catch (err) {
        console.error("Error seeding posts:", err);
    } finally {
        await mongoose.disconnect();
    }
}

seed();
