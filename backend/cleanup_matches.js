import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await mongoose.connection.db.collection('matches').updateMany(
        { 
            $or: [
                { status: 'live', startTime: { $lt: new Date('2026-03-19T00:00:00Z') } },
                { matchName: /Victoria/i } 
            ]
        }, 
        { $set: { status: 'completed' } }
    );
    console.log(`✅ Cleaned up ${result.modifiedCount} matches.`);
    process.exit();
}

run().catch(console.error);
