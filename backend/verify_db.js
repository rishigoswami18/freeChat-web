import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Match from './src/models/Match.js';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const matches = await Match.find({ tier: "gold" });
    console.log(`Found ${matches.length} gold matches.`);
    
    matches.forEach(m => {
      console.log(`- ${m.matchName} | Status: ${m.status} | Tier: ${m.tier} | Date: ${m.startTime}`);
    });

    // Check all matches status counts
    const counts = await Match.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    console.log("Status counts:", counts);

    // Check tier counts
    const tierCounts = await Match.aggregate([
        { $group: { _id: "$tier", count: { $sum: 1 } } }
    ]);
    console.log("Tier counts:", tierCounts);

    process.exit(0);
  } catch (err) {
    console.error("Check error:", err);
    process.exit(1);
  }
}

check();
