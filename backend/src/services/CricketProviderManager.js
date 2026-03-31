import axios from "axios";
import cacheService from "./CacheService.js";
import CricketScraperService from "./CricketScraperService.js";
import CricketDataProvider from "./providers/CricketDataProvider.js";

/**
 * CricketProviderManager — Resilience Engine for Zyro
 * Manages Multi-Provider Fallback, Scraping Backups, and Extreme Caching.
 */
class CricketProviderManager {
    constructor() {
        this.rapidApiKeys = [
            process.env.RAPIDAPI_KEY,
            process.env.RAPIDAPI_KEY_SECONDARY, // Fallback key
            "RELIANCE_FALLBACK_DUMMY"
        ].filter(k => k && k !== "undefined");

        this.currentKeyIndex = 0;
        this.primaryApi = "https://cricket-live-data.p.rapidapi.com";
    }

    async getMatchUpdate(externalMatchId, matchName = "") {
        if (matchName.includes("RCB") || matchName.includes("SRH")) {
            // Simulated Mock Live Data for Testing when Real IPL match is not available
            const cacheScoreDb = "mock_score_data_rcbsrh";
            let currentScoreData = cacheService.get(cacheScoreDb) || { runs: 137, wickets: 5, balls: 87 }; // 87 balls = 14.3 overs
            
            // Randomly tick the score
            let randomRuns = Math.random() > 0.4 ? Math.floor(Math.random() * 6) : 0;
            if (randomRuns === 5) randomRuns = 4; // realistic cricket score
            
            currentScoreData.runs += randomRuns;
            if (randomRuns === 0 && Math.random() > 0.85) currentScoreData.wickets += 1;
            if (currentScoreData.wickets > 10) currentScoreData.wickets = 10;
            currentScoreData.balls += 1;
            
            cacheService.set(cacheScoreDb, currentScoreData, 300);
            
            const overs = Math.floor(currentScoreData.balls / 6) + "." + (currentScoreData.balls % 6);
            console.log(`[Simulator] Tick updated: ${currentScoreData.runs}/${currentScoreData.wickets} (${overs})`);
            
            return {
                score: currentScoreData.runs + "/" + currentScoreData.wickets,
                overs: overs,
                status: "live",
                batting_team: "SRH",
                important_status: "Royal Challengers Bengaluru opt to bowl",
                source: "BondBeyond Automated Simulator"
            };
        }

        const cacheKey = `global_match_cache:${externalMatchId}`;
        const cached = cacheService.get(cacheKey);
        if (cached) return cached;

        try {
            // Priority 1: RapidAPI
            const rapidData = await this.fetchWithRetry(`/match/${externalMatchId}`);
            if (rapidData) return rapidData;
        } catch (error) {
            console.warn(`⚠️ [ProviderManager] RapidAPI missed for ${externalMatchId}. Trying CricketData.org...`);
        }

        try {
            // Priority 2: CricketData.org (The new key provided by user)
            // Note: ID mapping might be needed if IDs differ, but often external IDs are matched via names
            const dataOrgUpdate = await CricketDataProvider.getMatchUpdate(externalMatchId);
            if (dataOrgUpdate) return dataOrgUpdate;
        } catch (error) {
            console.warn(`⚠️ [ProviderManager] CricketData.org missed for ${externalMatchId}.`);
        }

        // Priority 3: Scraper Fallback
        console.error("🪂 [ProviderManager] Professional APIs Failed. Booting Ghost-API Scraper...");
        const scraped = await CricketScraperService.getLiveScore(matchName);
        if (scraped && scraped.status === "success") {
            cacheService.set(cacheKey, scraped, 10); // Extreme Cache
            return scraped;
        }

        return null;
    }

    async fetchWithRetry(endpoint, attempts = 0) {
        if (attempts >= this.rapidApiKeys.length) {
            throw new Error("All RapidAPI keys exhausted (429)");
        }

        const key = this.rapidApiKeys[this.currentKeyIndex];
        try {
            const { data } = await axios.get(`${this.primaryApi}${endpoint}`, {
                headers: {
                    'x-rapidapi-key': key,
                    'x-rapidapi-host': 'cricket-live-data.p.rapidapi.com'
                },
                timeout: 5000
            });

            if (data.status === 429 || data.error?.includes("limit")) {
                throw { response: { status: 429 } };
            }

            return data.results || data;
        } catch (error) {
            if (error.response?.status === 429) {
                console.warn(`🔄 [ProviderManager] Key Index ${this.currentKeyIndex} Blocked. Rotating...`);
                this.currentKeyIndex = (this.currentKeyIndex + 1) % this.rapidApiKeys.length;
                return this.fetchWithRetry(endpoint, attempts + 1);
            }
            throw error;
        }
    }
}

export default new CricketProviderManager();
