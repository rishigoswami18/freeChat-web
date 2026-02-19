
import mongoose from "mongoose";
import User from "../src/models/User.js";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://rishigoswamisl99:rishigoswami@cluster0.zx6x51b.mongodb.net/freeChat_db");
        console.log("MongoDB connected");
    } catch (err) {
        console.error("MongoDB connection error:", err);
        process.exit(1);
    }
};

const analyze = async () => {
    await connectDB();

    try {
        const users = await User.find({}).select("fullName email coupleStatus partnerId role");

        console.log("\n--- USER DATABASE DUMP ---");
        users.forEach(u => {
            console.log(`User: ${u.fullName} (${u._id})`);
            console.log(`  Role: ${u.role}`);
            console.log(`  Status: ${u.coupleStatus}`);
            console.log(`  PartnerId: ${u.partnerId}`);
            console.log("--------------------------");
        });

    } catch (error) {
        console.error("Error analyzing:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

analyze();
