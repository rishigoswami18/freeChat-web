import User from "../models/User.js";

/**
 * Generates a unique username based on full name
 * @param {string} fullName 
 * @returns {Promise<string>}
 */
export const generateUniqueUsername = async (fullName) => {
    // Basic format: john_doe
    let baseUsername = fullName
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');

    if (!baseUsername) baseUsername = "user";

    let username = baseUsername;
    let isUnique = false;
    let count = 0;

    while (!isUnique) {
        const existing = await User.findOne({ username });
        if (!existing) {
            isUnique = true;
        } else {
            count++;
            // Try john_doe_1, john_doe_2, etc.
            username = `${baseUsername}_${count}`;
        }
    }

    return username;
};
