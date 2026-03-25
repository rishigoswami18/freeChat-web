import mongoose from "mongoose";

export const connectDB = async (retryCount = 5) => {
    const uri = process.env.MONGO_URI;
    if (!uri) {
        console.error("❌ MONGO_URI is missing in environment variables!");
        process.exit(1);
    }

    for (let i = 0; i < retryCount; i++) {
        try {
            const conn = await mongoose.connect(uri, {
                serverSelectionTimeoutMS: 30000, // Increase to 30 seconds
                maxPoolSize: 200, // Optimize connection handling for IPL Spikes
                minPoolSize: 20   // Reduce latency on hot-starts
            });
            console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
            return; // Success!
        } catch (error) {
            console.warn(`⚠️ [Attempt ${i+1}/${retryCount}] MongoDB Connect Fail: ${error.message}`);
            if (i === retryCount - 1) {
                console.error("❌ Final MongoDB Connection Error. Please check your Atlas IP Whitelist.");
                process.exit(1);
            }
            // Wait before next retry (exponential backoff)
            await new Promise(res => setTimeout(res, Math.pow(2, i) * 1000));
        }
    }
}
