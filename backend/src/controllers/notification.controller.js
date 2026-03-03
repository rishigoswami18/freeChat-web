import User from "../models/User.js";
import { streamClient } from "../lib/stream.js";

/**
 * Broadcasts a system notification to all registered users via Stream Chat.
 * This will create/update a channel with each user and the admin.
 */
export const broadcastSystemNotification = async (req, res) => {
    try {
        const { message } = req.body;

        // Security check: Only admins can broadcast
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden: Admin access required" });
        }

        if (!message || !message.trim()) {
            return res.status(400).json({ message: "Message content is required" });
        }

        if (!streamClient) {
            return res.status(500).json({ message: "Stream service is not initialized" });
        }

        // 1. Fetch all users from database
        const users = await User.find({}, "_id fullName");
        const adminId = req.user._id.toString();

        console.log(`🚀 Starting system broadcast to ${users.length} users...`);

        // 2. Loop through users and send message via Stream
        // Using Promise.all with chunks or simple loop for reliability
        let successCount = 0;
        let failCount = 0;

        for (const targetUser of users) {
            const targetId = targetUser._id.toString();

            // Don't send notification to self (the admin)
            if (targetId === adminId) continue;

            try {
                // Create or get the 1-on-1 channel between admin and user
                const channel = streamClient.channel("messaging", {
                    members: [adminId, targetId],
                });

                await channel.create();

                // Send the system message
                await channel.sendMessage({
                    text: `📢 SYSTEM NOTIFICATION: ${message}`,
                    user_id: adminId,
                    silent: false, // Ensure they get a push/notification bubble
                    is_system: true // Custom flag for UI if needed
                });

                successCount++;
            } catch (err) {
                console.error(`Failed to notify user ${targetId}:`, err.message);
                failCount++;
            }
        }

        res.status(200).json({
            success: true,
            message: `Broadcast complete. Sent to ${successCount} users. Errors: ${failCount}`,
        });
    } catch (error) {
        console.error("Error in broadcastSystemNotification:", error);
        res.status(500).json({ message: "Internal Server Error during broadcast" });
    }
};
