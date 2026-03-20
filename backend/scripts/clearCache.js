import cacheService from '../src/services/CacheService.js';
import dotenv from 'dotenv';
dotenv.config();

async function clearCache() {
    console.log('🧹 [Maintenance] Clearing Universal Ticker and IPL Cache...');
    await cacheService.clear();
    console.log('✅ [Maintenance] Cache Purged Successfully.');
    process.exit(0);
}

clearCache();
