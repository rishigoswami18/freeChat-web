import axios from "axios";

/**
 * CricketDataProvider — CricketData.org (CricAPI) Integration
 * A secondary professional provider for high-velocity data.
 */
class CricketDataProvider {
    constructor() {
        this.apiKey = process.env.CRICKET_DATA_API_KEY;
        this.baseUrl = "https://api.cricapi.com/v1";
    }

    async getMatchUpdate(externalId) {
        if (!this.apiKey) return null;

        try {
            // CricketData.org often uses different IDs than RapidAPI. 
            // This provider works best if the matches were also synced via CricketData.org.
            // For now, we'll try to fetch match info by ID.
            const { data } = await axios.get(`${this.baseUrl}/match_info`, {
                params: {
                    apikey: this.apiKey,
                    id: externalId
                },
                timeout: 5000
            });

            if (data.status !== "success" || !data.data) return null;

            const m = data.data;
            
            // Map to BondBeyond format
            // Score format in CricketData: [{r, w, o, inning}, ...]
            const primaryScore = m.score && m.score.length > 0 ? m.score[m.score.length - 1] : null;

            return {
                score: primaryScore ? `${primaryScore.r}/${primaryScore.w}` : "0/0",
                overs: primaryScore ? primaryScore.o.toString() : "0.0",
                status: m.status?.toLowerCase().includes("won") || m.status?.toLowerCase().includes("lost") ? "completed" : "live",
                status_text: m.status || "Live",
                batting_team: primaryScore ? primaryScore.inning.split(" Inning")[0] : "BATTING",
                source: "CricketData.org"
            };
        } catch (error) {
            console.error("❌ [CricketDataProvider] Match Update Error:", error.message);
            return null;
        }
    }

    /**
     * Requirement: High Volume Match Discovery
     */
    async getCurrentMatches() {
        if (!this.apiKey) return [];

        try {
            const { data } = await axios.get(`${this.baseUrl}/currentMatches`, {
                params: { apikey: this.apiKey },
                timeout: 5000
            });

            if (data.status !== "success") return [];
            return data.data || [];
        } catch (error) {
            console.error("❌ [CricketDataProvider] Current Matches Error:", error.message);
            return [];
        }
    }
}

export default new CricketDataProvider();
