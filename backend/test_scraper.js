import CricketScraperService from "./src/services/CricketScraperService.js";

async function testScraper() {
    console.log("🚀 Testing Ghost-API Scraper...");
    // Testing with a specific current match
    const result = await CricketScraperService.getLiveScore("Victoria vs South Australia"); 
    if (result) {
        console.log("✅ Scrape Success:", JSON.stringify(result, null, 2));
    } else {
        console.log("❌ No live scores found for this match.");
    }
    process.exit(0);
}

testScraper();
