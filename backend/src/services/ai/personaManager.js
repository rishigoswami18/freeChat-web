import { CORE_RULES, PERSONA_STRATEGIES } from "./personaConstants.js";

/**
 * Persona Management System — Strategy Pattern Refactoring
 * Production-Ready Class Implementation for Razorpay and Audit Compliance.
 */
class PersonaProvider {
    constructor() {
        this.personas = new Map(Object.entries(PERSONA_STRATEGIES));
        this.aliasMap = new Map([
            ["companion", "FEMALE_BESTIE"],
            ["bestie", "FEMALE_BESTIE"],
            ["female_bestie", "FEMALE_BESTIE"],
            ["strategy_partner", "ARENA_STRATEGIST"],
            ["wellness_partner", "ARENA_STRATEGIST"],
            ["bestfriend", "PEER_WIDGET"],
            ["doctor", "SUCCESS_COACH"],
            ["coach", "SUCCESS_COACH"],
            ["personal_coach", "SUCCESS_COACH"],
            ["match_analyst", "ARENA_STRATEGIST"],
            ["strategist", "ARENA_STRATEGIST"],
            ["ai-strategist-id", "ARENA_STRATEGIST"],
            ["face_call", "IMMERSIVE_INTERFACE"]
        ]);
        this.fallbackKey = "SUCCESS_COACH";
    }

    /**
     * Resolves the proper persona, handling aliases and safety fallbacks.
     */
    _resolveStrategy(key) {
        const resolvedKey = this.aliasMap.get(key) || key;
        const strategy = this.personas.get(resolvedKey);
        
        if (!strategy) {
            console.warn(`[PersonaProvider] Persona '${key}' not found. Falling back to ${this.fallbackKey}.`);
            return this.personas.get(this.fallbackKey);
        }
        return strategy;
    }

    /**
     * Generates deep-immersion instructions for the AI engine.
     */
    getInstructions(personaKey, { aiName = "Aria", userName = "Sunna" } = {}) {
        const strategy = this._resolveStrategy(personaKey);

        const instructions = [
            CORE_RULES,
            `- IDENTITY: ${aiName || strategy.systemIdentity}, ${strategy.systemIdentity}`,
            `- TONE: ${strategy.tone}`,
            `- MOOD_BIAS: ${strategy.moodBias}`,
            `- BEHAVIORAL_EXAMPLES: ${strategy.examples.map(ex => `"${ex}"`).join(", ")}`,
            `- USER_CONTEXT: The current user is ${userName}. Always address them correctly.`
        ].join("\n");

        return instructions;
    }

    /**
     * Returns the standardized initial greeting.
     */
    getInitialMessage(personaKey, userName) {
        const strategy = this._resolveStrategy(personaKey);
        return strategy.initialMessage;
    }

    /**
     * RAZORPAY COMPLIANCE: Returns a professional display name for the UI.
     */
    getDisplayName(personaKey) {
        const strategy = this._resolveStrategy(personaKey);
        return strategy.publicName;
    }

    /**
     * Returns metadata for high-performance bias injection.
     */
    getBias(personaKey) {
        const strategy = this._resolveStrategy(personaKey);
        return strategy.moodBias;
    }
}

// Singleton Instance For Core Logic
export const PersonaManager = new PersonaProvider();

// Sample JSON representation of the professional personas for reference
export const PersonaAuditJSON = Array.from(Object.values(PERSONA_STRATEGIES));
