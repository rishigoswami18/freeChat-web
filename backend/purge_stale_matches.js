import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const now = new Date();
    const result = await mongoose.connection.db.collection('matches').deleteMany({
        status: 'scheduled',
        startTime: { $lt: now }
    });
    console.log(`✅ Purged ${result.deletedCount} past scheduled matches.`);
    
    // Check what's left
    const left = await mongoose.connection.db.collection('matches').find({ status: 'scheduled' }).sort({ startTime: 1 }).toArray();
    left.forEach(m => console.log(`- ${m.matchName} | ${m.startTime.toISOString()}`));
    
    process.exit();
}

run().catch(console.error);
