import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ MONGO_URI is missing in environment variables!");
            process.exit(1);
        }
        const conn = await mongoose.connect(uri);
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error("❌ Error in connecting to MongoDB:", error.message);
        process.exit(1);
    }
}