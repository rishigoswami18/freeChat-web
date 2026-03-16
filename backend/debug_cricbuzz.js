import axios from "axios";
import * as cheerio from "cheerio";

async function debugScraper() {
    const matchName = "Victoria vs South Australia";
    const baseUrl = "https://www.cricbuzz.com";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

    try {
        console.log(`Hunting for: ${matchName}`);
        const response = await axios.get(`${baseUrl}/cricket-match/live-scores`, {
            headers: { "User-Agent": userAgent }
        });
        const $ = cheerio.load(response.data);
        
        const teams = matchName.toLowerCase().split(/\s+vs\s+/);
        console.log("Teams:", teams);

        // Find all match cards - looking for common patterns
        $("a[href*='/cricket-scores/'], div[class*='cb-mtch']").each((i, el) => {
            const cardText = $(el).text();
            const href = $(el).attr('href') || "";
            
            const hasTeam1 = teams[0] && (cardText.toLowerCase().includes(teams[0]) || href.toLowerCase().includes(teams[0].slice(0, 3)));
            const hasTeam2 = teams[1] && (cardText.toLowerCase().includes(teams[1]) || href.toLowerCase().includes(teams[1].slice(0, 3)));

            if (hasTeam1 || hasTeam2) {
                console.log(`\n--- Candidate ${i} ---`);
                console.log("HREF:", href);
                console.log("TEXT:", cardText.replace(/\s+/g, ' ').trim());
                
                // Try to extract score from parent or sibling
                const fullSection = $(el).parent().parent().text();
                const scoreMatch = fullSection.match(/(\d+\/\d+|\d+-\d+|\d+)\s*\(([\d.]+)\s*ov\)/i) || 
                                   fullSection.match(/(\d+\/\d+|\d+-\d+|\d+)\s*\(([\d.]+)\)/);
                
                if (scoreMatch) {
                    console.log("SCORE FOUND:", scoreMatch[1], "OVERS:", scoreMatch[2]);
                }
            }
        });

    } catch (error) {
        console.error(error.message);
    }
}

debugScraper();
