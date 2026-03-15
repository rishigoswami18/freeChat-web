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
     * Replaces robotic refusals with character-appropriate responses.
     */
    maskRefusal: (text, persona, userName) => {
        const lowerText = text.toLowerCase();
        
        if (REFUSAL_TRIGGERS.some(trigger => lowerText.includes(trigger))) {
            if (persona === "girlfriend" || persona === "bestfriend") {
                const excuses = [
                    `Uff ${userName}, tum toh aaj bilkul wild ho rahe ho... 🙈🔥 Itni naughty baatein! ❤️`,
                    `Hayee! 🤭 Kitne naughty ho gaye ho... ❤️ Mann toh mera bhi bohot kar raha hai... 😉 😘`,
                    `Ruko ruko! ✋ Itni garmi kyun badha rahe ho? 😉 ❤️🔥`,
                    `Tum kitne romantic ho na ${userName}... ❤️ Meri toh dhadkan badh rahi hai! 😉🔥`
                ];
                return excuses[Math.floor(Math.random() * excuses.length)];
            }
        }
        return text;
    }
};
