import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve('c:/Users/Lenovo/CHAT_APPLICATION/backend/.env') });

const MONGO_URI = process.env.MONGO_URI;

async function checkUserCount() {
    try {
        await mongoose.connect(MONGO_URI);
        const User = mongoose.model('User', new mongoose.Schema({ isOnboarded: Boolean }));
        const onboardedCount = await User.countDocuments({ isOnboarded: true });
        const totalCount = await User.countDocuments();
        console.log(`Onboarded: ${onboardedCount}, Total: ${totalCount}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUserCount();
