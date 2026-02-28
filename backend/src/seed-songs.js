import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Song from "./models/Song.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const songs = [
    {
        title: "Summer Walk",
        artist: "Artist Name",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        isTrending: true
    },
    {
        title: "Dreamy Vibes",
        artist: "Audio Artist",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        isTrending: true
    },
    {
        title: "Upbeat Energy",
        artist: "Energy Studio",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        isTrending: true
    },
    {
        title: "Mellow Morning",
        artist: "Chill Producer",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        isTrending: true
    },
    {
        title: "Night Drive",
        artist: "Lo-Fi Beats",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
        isTrending: true
    },
];

const seedSongs = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in env");

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        await Song.deleteMany({});

        await Song.insertMany(songs);
        console.log("✅ Successfully seeded ACTUAL songs with audio");

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding songs:", err.message);
        process.exit(1);
    }
};

seedSongs();
