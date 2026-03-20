import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MatchSchema = new mongoose.Schema({
    matchName: String,
    startTime: Date,
    status: String,
    tier: String,
    currentScore: String,
});
const Match = mongoose.model('Match', MatchSchema);

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const matches = await Match.find({ 
        startTime: { 
            $gte: new Date("2026-03-20T00:00:00Z"), 
            $lt: new Date("2026-03-21T00:00:00Z") 
        } 
    });
    console.log(JSON.stringify(matches, null, 2));
    process.exit();
}

run().catch(console.error);
