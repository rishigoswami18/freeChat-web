import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "..", ".env") });

async function checkSessions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const sessions = await mongoose.connection.db.collection("gamesessions").find({}).toArray();
        console.log(`Found ${sessions.length} sessions`);

        sessions.forEach(s => {
            console.log(`ID: ${s._id} | Status: ${s.status} | GameType: ${s.gameType}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkSessions();
