import axios from "axios";
import * as cheerio from "cheerio";

async function debugScraper() {
    const baseUrl = "https://www.cricbuzz.com";
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36";

    try {
        console.log(`Fetching live scores...`);
        const response = await axios.get(`${baseUrl}/cricket-match/live-scores`, {
            headers: { "User-Agent": userAgent }
        });
        const $ = cheerio.load(response.data);
        
        console.log("Parsing matches...");

        // Look for any href with /cricket-scores/
        $("a").each((i, el) => {
            const href = $(el).attr('href') || "";
            if (href.includes('/cricket-scores/')) {
                const text = $(el).text().trim();
                console.log(`\n[${i}] HREF: ${href}`);
                console.log(`TEXT: ${text.replace(/\s+/g, ' ')}`);
                
                // Get sibling text or parent text
                const parentText = $(el).parent().text().replace(/\s+/g, ' ').trim();
                console.log(`PARENT TEXT: ${parentText}`);
                
                const scoreMatch = parentText.match(/(\d+\/\d+|\d+-\d+|\d+)\s*\(([\d.]+)\)/) || 
                                   parentText.match(/(\d+\/\d+|\d+-\d+|\d+)\s*ov/i);
                if (scoreMatch) {
                    console.log(">>> SCORE MATCH:", scoreMatch[0]);
                }
            }
        });

    } catch (error) {
        console.error(error.message);
    }
}

debugScraper();
