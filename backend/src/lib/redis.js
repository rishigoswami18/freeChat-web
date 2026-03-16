import Redis from "ioredis";

const redisConfig = process.env.REDIS_URL || "redis://localhost:6379";
let redis;

try {
    redis = new Redis(redisConfig, { 
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => null // Don't keep retrying if it fails
    });

    redis.on("error", (err) => {
        console.warn("⚠️ [Redis] Offline. Falling back to Memory.");
        // We handle the error here so it doesn't crash
    });

    redis.on("connect", () => console.log("✅ [Redis] Connected to cache hierarchy."));
} catch (e) {
    console.warn("⚠️ [Redis] Initialization failed. Hub using local memory.");
}

// Minimal in-memory fallback if Redis is dead
const memoryFallback = new Map();
const proxyRedis = {
    get: async (key) => redis?.status === 'ready' ? redis.get(key) : memoryFallback.get(key),
    set: async (key, val, mode, ttl) => {
        if (redis?.status === 'ready') return redis.set(key, val, mode, ttl);
        memoryFallback.set(key, val);
        if (ttl) setTimeout(() => memoryFallback.delete(key), ttl * 1000);
        return 'OK';
    },
    del: async (key) => redis?.status === 'ready' ? redis.del(key) : memoryFallback.delete(key),
    status: redis?.status || 'memory'
};

export default proxyRedis;
