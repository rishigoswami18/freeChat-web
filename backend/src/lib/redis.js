import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

redis.on("connect", () => console.log("✅ [Redis] Connected to cache hierarchy."));
redis.on("error", (err) => console.error("❌ [Redis] Connection Error:", err.message));

export default redis;
