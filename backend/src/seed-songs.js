import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Song from "./models/Song.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const songData = [
    {
        title: "Summer Walk",
        artist: "Zyro Originals",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        coverUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300",
        genre: "Pop",
        isTrending: true,
        duration: 180
    },
    {
        title: "Dreamy Vibes",
        artist: "Chill Producer",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        coverUrl: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=300",
        genre: "Lo-Fi",
        isTrending: true,
        duration: 156
    },
    {
        title: "Upbeat Energy",
        artist: "Studio X",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300",
        genre: "Dance",
        isTrending: true,
        duration: 210
    }
];

const seedSongs = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error("MONGO_URI not found in env");

        await mongoose.connect(uri);
        console.log("✅ Connected to MongoDB");

        // Safe Batch Upsert: Prevents duplicates and preserves existing usageCount/trends
        const ops = songData.map(song => ({
            updateOne: {
                filter: { title: song.title, artist: song.artist },
                update: { $set: song },
                upsert: true
            }
        }));

        const result = await Song.bulkWrite(ops);
        console.log(`✅ Seed Complete. Upserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`);

        process.exit(0);
    } catch (err) {
        console.error("❌ Error seeding songs:", err.message);
        process.exit(1);
    }
};

seedSongs();
