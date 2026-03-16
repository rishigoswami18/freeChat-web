import mongoose from 'mongoose';
import Match from './src/models/Match.js';
import Series from './src/models/Series.js';
import dotenv from 'dotenv';
dotenv.config();

async function cleanAndSync() {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Delete dummy matches
    const result = await Match.deleteMany({ 
        $or: [
            { externalId: { $regex: /^ipl-2026/ } },
            { externalId: { $exists: false } },
            { matchName: "KKR vs RCB" } // any specific dummies
        ]
    });
    console.log(`Deleted ${result.deletedCount} dummy matches.`);

    // Delete dummy series
    const seriesResult = await Series.deleteMany({ seriesName: /Dummy/i });
    console.log(`Deleted ${seriesResult.deletedCount} dummy series.`);

    await mongoose.disconnect();
}

cleanAndSync();
