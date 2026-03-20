import { iplSquadsData } from "../data/ipl_2026_squads.js";

/**
 * AI Fantasy Coach Service v2.0
 * Uses scientific scoring and positional constraints to optimize squads.
 */
export const AIFantasyCoach = {
    /**
     * Generate a squad for a specific match.
     */
    generateSquad: (team1, team2, riskProfile = "balanced") => {
        const squad1 = iplSquadsData.find(s => s.shortName === team1.shortName || s.teamName === team1.name);
        const squad2 = iplSquadsData.find(s => s.shortName === team2.shortName || s.teamName === team2.name);

        if (!squad1 || !squad2) {
            return {
                error: true,
                message: `AI Advisor currently only supports IPL 2026 matches. Squad data for ${team1.name} or ${team2.name} is not available in our neural database.`,
            };
        }

        const allPlayers = [
            ...squad1.players.map(p => ({ ...p, team: squad1.shortName })), 
            ...squad2.players.map(p => ({ ...p, team: squad2.shortName }))
        ];

        // 1. Scoring Logic
        const scoredPlayers = allPlayers.map(player => {
            const numericalStats = parseStats(player.stats, player.role);
            const aiScore = calculateScore(player, numericalStats, riskProfile);
            const reasoning = getAIReasoning(player, numericalStats, riskProfile);
            
            return { ...player, aiScore, numericalStats, reasoning };
        });

        // 2. Selection Algorithm with Constraints
        // Constraints: 1 WK, 3-5 BAT, 1-3 AR, 3-5 BOW. Total 11.
        const sorted = scoredPlayers.sort((a, b) => b.aiScore - a.aiScore);
        
        const selected = [];
        const counters = { WK: 0, BAT: 0, AR: 0, BOW: 0 };

        // Mandatory first picks (top in each role to satisfy minimums)
        const roles = {
            'Wicketkeeper Batter': 'WK',
            'Batter': 'BAT',
            'All-Rounder': 'AR',
            'Bowler': 'BOW'
        };

        // Pass 1: Meet Minimums
        ['WK', 'BAT', 'AR', 'BOW'].forEach(r => {
            const topRolePlayer = sorted.find(p => roles[p.role] === r && !selected.includes(p));
            if (topRolePlayer) {
                selected.push(topRolePlayer);
                counters[r]++;
            }
        });

        // Pass 2: Fill remains based on score
        for (const p of sorted) {
            if (selected.length >= 11) break;
            if (selected.includes(p)) continue;

            const r = roles[p.role];
            if (r === 'WK' && counters.WK >= 2) continue;
            if (r === 'BAT' && counters.BAT >= 5) continue;
            if (r === 'AR' && counters.AR >= 3) continue;
            if (r === 'BOW' && counters.BOW >= 5) continue;

            selected.push(p);
            counters[r]++;
        }

        // 3. Captain & Vice-Captain (Highest scores)
        const finalSelection = selected.sort((a, b) => b.aiScore - a.aiScore);
        const captain = finalSelection[0];
        const viceCaptain = finalSelection[1];

        return {
            squad: finalSelection,
            captain: captain.name,
            viceCaptain: viceCaptain.name,
            riskProfile,
            coachNote: getCoachNote(riskProfile, captain, viceCaptain),
            statsSummary: {
                avgForm: (selected.reduce((acc, p) => acc + p.aiScore, 0) / 11).toFixed(1),
                totalPrice: "Optimized"
            }
        };
    }
};

/**
 * Utility to parse complex stat strings into comparable numbers
 */
const parseStats = (statStr, role) => {
    const stats = { matches: 0, runs: 0, sr: 0, wickets: 0, econ: 0 };
    if (!statStr) return stats;

    const matches = statStr.match(/Matches: (\d+)/);
    const runs = statStr.match(/Runs: (\d+)/);
    const sr = statStr.match(/SR: ([\d.]+)/);
    const wickets = statStr.match(/Wickets: (\d+)/);
    const econ = statStr.match(/Econ: ([\d.]+)/);

    if (matches) stats.matches = parseInt(matches[1]);
    if (runs) stats.runs = parseInt(runs[1]);
    if (sr) stats.sr = parseFloat(sr[1]);
    if (wickets) stats.wickets = parseInt(wickets[1]);
    if (econ) stats.econ = parseFloat(econ[1]);

    return stats;
};

/**
 * Weighted scoring based on risk profile
 */
const calculateScore = (player, stats, profile) => {
    let score = 50; // Base score

    // Form Multipliers
    const formWeights = { "🔥": 20, "🌟": 15, "💎": 18, "👑": 25, "🚀": 22, "💥": 18, "🎯": 15 };
    score += formWeights[player.form] || 10;

    // Role Specific Logic
    if (player.role.includes("Batter") || player.role === "Batter") {
        const avg = stats.matches > 0 ? stats.runs / stats.matches : 0;
        score += avg * 0.5;
        score += (stats.sr - 100) * 0.2;
    }

    if (player.role.includes("Bowler") || player.role === "Bowler") {
        score += stats.wickets * 1.5;
        score += (10 - stats.econ) * 5;
    }

    // Risk Profile Adjustments
    if (profile === "safe") {
        if (!player.isForeign) score += 10; // Domestic stability
        if (stats.matches > 100) score += 15; // Experience
    } else if (profile === "aggressive") {
        if (stats.sr > 145) score += 20; // Explosion
        if (stats.econ > 9) score -= 5; // Penalty for leaking runs in aggressive
    }

    return Math.round(score);
};

const getAIReasoning = (player, stats, profile) => {
    if (player.form === "👑" || player.form === "💎") return "Elite consistent performer with high ceiling.";
    if (player.form === "🔥" || player.form === "🚀") return "Currently in explosive form; high impact potential.";
    if (stats.matches > 150) return "Wealth of experience in pressure situations.";
    if (stats.sr > 150) return "Strike rate monster; perfect for dead-overs acceleration.";
    if (stats.econ < 7.5 && stats.econ > 0) return "Economical bowling makes them a safe fantasy pick.";
    return "Technically sound pick based on recent match-up data.";
};

const getCoachNote = (profile, cap, vc) => {
    const notes = {
        safe: `🛡️ Defensive Strategy: Built around ${cap}'s reliability. We've prioritized players with 100+ match experience to minimize variance.`,
        aggressive: `🔥 Blitzkrieg Mode: Led by ${cap}, this squad is designed to maximize bonus points via boundaries and strike rates. High ceiling strategy.`,
        balanced: `⚖️ Optimal Equilibrium: Balanced distribution of domestic and international talent. ${cap} provides the stability needed for consistent wins.`
    };
    return notes[profile] || notes.balanced;
};
