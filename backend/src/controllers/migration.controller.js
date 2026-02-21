import User from "../models/User.js";
import { generateUniqueUsername } from "../utils/usernameUtils.js";

export const migrateUsernames = async (req, res) => {
    try {
        const usersWithoutUsername = await User.find({
            $or: [
                { username: { $exists: false } },
                { username: null },
                { username: "" }
            ]
        });

        console.log(`Starting migration for ${usersWithoutUsername.length} users...`);

        for (const user of usersWithoutUsername) {
            const username = await generateUniqueUsername(user.fullName);
            user.username = username;
            await user.save();
            console.log(`Migrated user ${user.fullName} -> @${username}`);
        }

        res.json({
            success: true,
            message: `Successfully migrated ${usersWithoutUsername.length} users.`
        });
    } catch (error) {
        console.error("Migration error:", error);
        res.status(500).json({ message: "Migration failed" });
    }
};
