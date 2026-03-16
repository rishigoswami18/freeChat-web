import axios from "axios";
import * as cheerio from "cheerio";

/**
 * CricketScraperService — The Billionaire's Ghost API
 * Specialized in scraping Cricbuzz with high precision and anti-detection.
 */
class CricketScraperService {
    constructor() {
        this.baseUrl = "https://www.cricbuzz.com";
        this.userAgentPool = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1"
        ];
    }

    getRandomUserAgent() {
        return this.userAgentPool[Math.floor(Math.random() * this.userAgentPool.length)];
    }

    /**
     * Scrapes LIVE matches and tries to find a match by team names.
     */
    async getLiveScore(matchName) {
        try {
            console.log(`🕵️ [Ghost-API] Hunting for: ${matchName}`);
            
            // Try Cricbuzz first
            let result = await this.scrapeCricbuzz(matchName);
            if (result) return result;

            // Fallback: Google Search Scraping (Extremely resilient)
            console.log("🪂 [Ghost-API] Cricbuzz Miss. Trying Google Stealth Scrape...");
            return await this.scrapeGoogle(matchName);
        } catch (error) {
            console.error("❌ [Ghost-API] Scrape Error:", error.message);
            return null;
        }
    }

    async scrapeCricbuzz(matchName) {
        try {
            const response = await axios.get(`${this.baseUrl}/cricket-match/live-scores`, {
                headers: { "User-Agent": this.getRandomUserAgent() },
                timeout: 10000
            });
            const $ = cheerio.load(response.data);
            let match = null;

            // Look for any text that matches the team names
            $("div, span, a").each((_, el) => {
                const text = $(el).text().toLowerCase();
                if (matchName && this.isMatchMatch(matchName, text, "")) {
                    // Found a container potentially
                    const container = $(el).closest("div"); 
                    const fullText = container.text();
                    
                    const scoreMatch = fullText.match(/([\d\/\s&]+)\s*\(([\d.]+)\)/);
                    const statusText = container.find(".cb-text-live, .cb-text-complete, .cb-mtch-sts, .cb-text-stumps").text().trim();
                    
                    if (scoreMatch) {
                        let importantStatus = "";
                        if (statusText) {
                            const stLower = statusText.toLowerCase();
                            if (stLower.includes("stumps")) importantStatus = "STUMPS";
                            else if (stLower.includes("lunch")) importantStatus = "LUNCH";
                            else if (stLower.includes("tea")) importantStatus = "TEA";
                            else if (stLower.includes("innings break")) importantStatus = "INN BREAK";
                            else if (stLower.includes("day")) {
                                const dMatch = stLower.match(/day\s*(\d+)/);
                                if (dMatch) importantStatus = `DAY ${dMatch[1]}`;
                            }
                        }

                        match = {
                            score: scoreMatch[1].trim(),
                            overs: scoreMatch[2],
                            batting_team: matchName.split("vs")[0].trim().toUpperCase(),
                            status: "live",
                            status_text: statusText || "Live Sync",
                            important_status: importantStatus,
                            is_scraped: true,
                            source: "Ghost-API (Cricbuzz)"
                        };
                        return false;
                    }
                }
            });
            return match;
        } catch (e) { return null; }
    }

    async scrapeGoogle(matchName) {
        try {
            const query = encodeURIComponent(`${matchName} live score`);
            const url = `https://www.google.com/search?q=${query}`;
            const response = await axios.get(url, {
                headers: { "User-Agent": this.getRandomUserAgent() }
            });
            const $ = cheerio.load(response.data);
            
            // Google often shows scores in a specific card or in the first few results
            const pageText = $("body").text();
            const scoreMatch = pageText.match(/(\d+\/\d+|\d+)\s*\(([\d.]+)\s*ov\)/i) || 
                               pageText.match(/(\d+\/\d+|\d+)\s*ov/i);

            if (scoreMatch) {
                return {
                    score: scoreMatch[1],
                    overs: scoreMatch[2] || "0.0",
                    batting_team: "Live Team",
                    status: "live",
                    status_text: "Google Sync",
                    is_scraped: true,
                    source: "Ghost-API (Google)"
                };
            }
            return null;
        } catch (e) { return null; }
    }

    isMatchMatch(target, title, header) {
        const targetClean = target.toLowerCase().replace(/vs|v/g, "");
        const titleClean = title.toLowerCase().replace(/vs|v/g, "");
        const headerClean = header.toLowerCase().replace(/vs|v/g, "");
        
        const teams = targetClean.split(/\s+/).filter(t => t.length > 2);
        return teams.every(team => titleClean.includes(team) || headerClean.includes(team));
    }

    /**
     * Gets fixtures (Upcoming matches) from the scraper.
     */
    async getFixtures() {
        try {
            const response = await axios.get(`${this.baseUrl}/cricket-schedule/upcoming-series/international`, {
                headers: { "User-Agent": this.getRandomUserAgent() }
            });
            const $ = cheerio.load(response.data);
            const fixtures = [];

            $(".cb-sCHdl-itm").each((_, el) => {
                const title = $(el).find("a").text().trim();
                const date = $(el).find(".cb-lv-grn-strip").text().trim();
                if (title && date) {
                    fixtures.push({ title, date });
                }
            });

            return fixtures;
        } catch (error) {
            console.error("❌ [Ghost-API] Fixture Scrape Error:", error.message);
            return [];
        }
    }
}

export default new CricketScraperService();
