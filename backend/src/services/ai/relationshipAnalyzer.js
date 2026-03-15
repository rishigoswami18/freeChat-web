/**
 * Relationship Analytics Engine
 * Deeply analyzes couple dynamics based on mood, activity, and stability.
 */
export const RelationshipAnalyzer = {
    /**
     * Analyzes recent trends for a couple.
     * @param {Object} user 
     * @param {Object} partner 
     * @returns {Object} { score, status, insight, alertType }
     */
    analyze: (user, partner) => {
        if (!user || !partner) return null;

        const results = {
            score: 70, // Base score
            status: "stable",
            insight: "",
            alertType: null
        };

        // 1. Mood Analysis
        const recentMoods = partner.moodHistory?.slice(-5) || [];
        const lowMoodsCount = recentMoods.filter(m => ["sad", "angry", "tired", "stressed"].includes(m.mood)).length;
        
        if (lowMoodsCount >= 3) {
            results.score -= 20;
            results.status = "needs_attention";
            results.insight = `${partner.fullName.split(' ')[0]}'s mood has been consistently low lately. A heartfelt message or a small surprise could go a long way. ❤️`;
            results.alertType = "mood_support";
        }

        // 2. Interaction Gap (Conceptual)
        // If we had message timestamps, we would check the gap here.
        
        // 3. Anniversary Check
        if (user.anniversary) {
            const today = new Date();
            const anniv = new Date(user.anniversary);
            if (today.getMonth() === anniv.getMonth() && today.getDate() === anniv.getDate()) {
                results.score += 30;
                results.insight = `Happy Anniversary! Today is a special milestone for you and ${partner.fullName.split(' ')[0]}. 🥂`;
                results.alertType = "anniversary";
            }
        }

        return results;
    }
};
