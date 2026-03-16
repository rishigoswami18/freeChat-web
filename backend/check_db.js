import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Fix for ES modules with mongoose models usually requires importing the model file
import Match from './src/models/Match.js';

async function checkLiveMatches() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");
        const matches = await Match.find({ status: 'live' });
        console.log(`Found ${matches.length} live matches`);
        matches.forEach(m => {
            console.log(`Match: ${m.matchName}, ID: ${m.externalId}, Score: ${m.currentScore}`);
        });
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkLiveMatches();
