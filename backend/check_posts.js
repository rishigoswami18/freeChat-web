
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import Post from './src/models/Post.js';
import User from './src/models/User.js';

async function check() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        if (!uri) {
            console.error("MONGO_URI not found in .env");
            process.exit(1);
        }
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        // Find a post by an admin
        const adminUser = await User.findOne({ role: 'admin' });
        if (adminUser) {
            console.log(`Found admin user: ${adminUser.fullName} (${adminUser._id})`);
            const post = await Post.findOne({ userId: adminUser._id });
            if (post) {
                console.log("Found post by admin:");
                console.log("Title/Content:", post.content?.substring(0, 20));
                console.log("Role in DB:", post.role);
                console.log("isVerified in DB:", post.isVerified);
            } else {
                console.log("No posts found for this admin.");
            }
        } else {
            console.log("No admin user found.");
        }

        const count = await Post.countDocuments({ role: 'admin' });
        console.log(`Total posts with role='admin': ${count}`);

        const noRoleCount = await Post.countDocuments({ role: { $exists: false } });
        console.log(`Total posts missing role field: ${noRoleCount}`);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

check();
