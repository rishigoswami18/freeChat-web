import Redis from 'ioredis';

class CacheService {
    constructor() {
        this.memoryCache = new Map();
        this.redis = null;
        this.isRedisEnabled = false;

        // Attempt Redis connection
        try {
            this.redis = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
                maxRetriesPerRequest: 1,
                retryStrategy: (times) => null // Don't keep retrying if it fails once
            });

            this.redis.on('error', (err) => {
                // console.warn('⚠️ [Cache] Redis connection failed, falling back to Memory Cache');
                this.isRedisEnabled = false;
            });

            this.redis.on('connect', () => {
                console.log('🚀 [Cache] Redis Engine Online');
                this.isRedisEnabled = true;
            });
        } catch (e) {
            this.isRedisEnabled = false;
        }
    }

    async set(key, value, ttlSeconds = 60) {
        if (this.isRedisEnabled) {
            try {
                await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
                return;
            } catch (e) {
                this.isRedisEnabled = false;
            }
        }
        
        // Memory Fallback
        const expiresAt = Date.now() + ttlSeconds * 1000;
        this.memoryCache.set(key, { value, expiresAt });
    }

    async get(key) {
        if (this.isRedisEnabled) {
            try {
                const data = await this.redis.get(key);
                return data ? JSON.parse(data) : null;
            } catch (e) {
                this.isRedisEnabled = false;
            }
        }

        // Memory Fallback
        const item = this.memoryCache.get(key);
        if (!item) return null;
        if (Date.now() > item.expiresAt) {
            this.memoryCache.delete(key);
            return null;
        }
        return item.value;
    }

    async clear() {
        if (this.isRedisEnabled) {
            await this.redis.flushall();
        }
        this.memoryCache.clear();
    }
}

export default new CacheService();
