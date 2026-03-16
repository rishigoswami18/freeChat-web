import mongoose from 'mongoose';
import MatchAutomationSystem from './src/services/MatchAutomationSystem.js';
import dotenv from 'dotenv';
dotenv.config();

async function triggerSync() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB. Triggering sync...");
    await MatchAutomationSystem.syncGlobalFixtures();
    console.log("Sync complete.");
    await mongoose.disconnect();
}

triggerSync();
