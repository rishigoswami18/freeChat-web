
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import Post from './src/models/Post.js';
import User from './src/models/User.js';

async function migrate() {
    try {
        const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
        await mongoose.connect(uri);
        console.log("Connected to MongoDB");

        const users = await User.find({}, '_id role isVerified');
        const userMap = {};
        users.forEach(u => {
            userMap[u._id.toString()] = { role: u.role, isVerified: u.isVerified };
        });

        console.log(`Loaded ${users.length} users for mapping.`);

        const posts = await Post.find({});
        console.log(`Processing ${posts.length} posts...`);

        let updatedPosts = 0;
        for (const post of posts) {
            const author = userMap[post.userId.toString()];
            let changed = false;

            if (author) {
                if (post.role !== author.role) {
                    post.role = author.role;
                    changed = true;
                }
                if (post.isVerified !== author.isVerified) {
                    post.isVerified = author.isVerified;
                    changed = true;
                }
            }

            // Also update comments
            if (post.comments && post.comments.length > 0) {
                for (const comment of post.comments) {
                    const cAuthor = userMap[comment.userId.toString()];
                    if (cAuthor) {
                        if (comment.role !== cAuthor.role) {
                            comment.role = cAuthor.role;
                            changed = true;
                        }
                        if (comment.isVerified !== cAuthor.isVerified) {
                            comment.isVerified = cAuthor.isVerified;
                            changed = true;
                        }
                    }
                }
            }

            if (changed) {
                await post.save();
                updatedPosts++;
            }
        }

        console.log(`Migration complete. Updated ${updatedPosts} posts.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

migrate();
