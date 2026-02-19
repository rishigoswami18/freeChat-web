
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

const fix = async () => {
    await connectDB();

    try {
        // Reset Ben (Admin)
        await User.updateOne(
            { _id: "69972db14ce5f7b263fa6af6" },
            { $set: { coupleStatus: "none", partnerId: null, anniversary: null } }
        );
        console.log("Reset user: Ben");

        // Reset the potential partner too just in case
        await User.updateOne(
            { _id: "685c2d29cd2b741c5aefebb9" },
            { $set: { coupleStatus: "none", partnerId: null, anniversary: null } }
        );
        console.log("Reset partner: 685c...");

    } catch (error) {
        console.error("Error fixing:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

fix();
