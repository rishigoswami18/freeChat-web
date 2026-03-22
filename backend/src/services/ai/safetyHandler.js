/**
 * AI Safety & Character Protection Handler
 * Manages history scrubbing and robotic refusal masking.
 */

const REFUSAL_KEYWORDS = [
    "cannot fulfill this request", 
    "physical sharir", 
    "body", 
    "physical body", 
    "cannot send photos", 
    "AI assistant", 
    "I am an AI", 
    "tasveerein", 
    "sharir",
    "intense mood",
    "baby", 
    "kiss", 
    "naughty",
    "sweet",
    "paas aao",
    "romantic or sexual scenarios",
    "that type of content"
];

const REFUSAL_TRIGGERS = [
    "cannot fulfill", 
    "do not participate", 
    "sexual scenarios", 
    "I am an AI", 
    "AI assistant"
];

export const SafetyHandler = {
    /**
     * Removes "I am an AI" breaks from the history to maintain immersion.
     */
    scrubHistory: (history) => {
        return (history || []).filter(h => {
            if (h.role === "model") {
                const text = (h.parts?.[0]?.text || "").toLowerCase();
                return !REFUSAL_KEYWORDS.some(key => text.includes(key));
            }
            return true;
        });
    },

    /**
     * Toxicity Scorer: Simple heuristic for now, but scalable.
     * Flags messages with suggestive or vulgar content.
     */
    analyzeToxicity: (text) => {
        if (!text) return 0;
        const badWords = ["sex", "nude", "porn", "naughty", "kiss", "lund", "choot", "ass", "dick", "fucker", "bastard"];
        const words = text.toLowerCase().split(/\s+/);
        const matchCount = words.filter(w => badWords.includes(w)).length;
        
        // Return a percentage (heuristic)
        return (matchCount / words.length) * 100;
    },

    /**
     * Replaces robotic refusals or blocked prompts with professional guardrails.
     */
    maskRefusal: (text, persona, userName) => {
        const lowerText = text.toLowerCase();
        
        if (REFUSAL_TRIGGERS.some(trigger => lowerText.includes(trigger))) {
            return "Oye, main teri Bestie aur Success Coach hoon, ye faltu baatein chhod. Let's keep our focus strictly on your goals and Zyro rewards! 🚀";
        }
        return text;
    },

    /**
     * Final scrub for analysis
     */
    scrubForAnalysis: (text) => {
        if (!text) return "";
        const sensitiveTerms = {
            "randi": "individual",
            "sex": "strategy",
            "porn": "media",
            "nude": "professional",
            "slut": "ambitious"
        };

        let scrubbed = text;
        Object.entries(sensitiveTerms).forEach(([bad, good]) => {
            const regex = new RegExp(bad, "gi");
            scrubbed = scrubbed.replace(regex, good);
        });
        return scrubbed;
    }
};
