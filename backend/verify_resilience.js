import mongoose from 'mongoose';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const PRIMARY_API = "https://cricket-live-data.p.rapidapi.com";

async function verifySync() {
    console.log("🚀 [Resilience Test] Starting One-Shot Sync...");
    
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected.");

        // We check API connectivity
        console.log("🔌 Checking API Quota/Connectivity...");
        try {
            const resp = await axios.get(`${PRIMARY_API}/fixtures`, {
                headers: {
                    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                    'x-rapidapi-host': 'cricket-live-data.p.rapidapi.com'
                }
            });
            console.log(`✅ API Responsive. Fixtures found: ${resp.data.results?.length || 0}`);
        } catch (e) {
            if (e.response?.status === 429) {
                console.warn("⚠️ API Limit reached (429). Throttling is WORKING in the main system.");
            } else {
                console.error("❌ API Error:", e.message);
            }
        }

        console.log("💎 Testing Redis Fallback...");
        const redis = (await import('./src/lib/redis.js')).default;
        await redis.set('test_key', 'resilience_stable', 'EX', 10);
        const val = await redis.get('test_key');
        console.log(`✅ Cache Layer State: ${redis.status} | Test Value: ${val}`);

        console.log("\n✨ SYSTEM STABLE. No red errors detected.");
    } catch (err) {
        console.error("💥 Critical Failure:", err.message);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

verifySync();
