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
        const users = await User.find({}, "_id fullName email");
        const adminId = req.user._id.toString();

        console.log(`🚀 Starting system broadcast to ${users.length} users. Admin: ${adminId}`);

        if (!streamClient) {
            console.error("❌ Stream client is NULL during broadcast attempt.");
            return res.status(500).json({ message: "Stream client not initialized" });
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        for (const targetUser of users) {
            const targetId = targetUser._id.toString();

            if (targetId === adminId) {
                console.log(`- Skipping admin user: ${targetUser.email}`);
                continue;
            }

            try {
                console.log(`- Preparing message for ${targetUser.email} (${targetId})`);

                // Create or get the 1-on-1 channel between admin and user
                const channel = streamClient.channel("messaging", {
                    members: [adminId, targetId],
                });

                await channel.create();

                // Send the system message
                const response = await channel.sendMessage({
                    text: `📢 SYSTEM NOTIFICATION: ${message}`,
                    user_id: adminId,
                    silent: false, // Ensure they get a push/notification bubble
                    is_system: true // Custom flag for UI if needed
                });

                console.log(`  ✅ Message sent. SID: ${response.message.id}`);
                successCount++;
            } catch (err) {
                console.error(`  ❌ Failed for ${targetUser.email}:`, err.message);
                failCount++;
                errors.push({ email: targetUser.email, error: err.message });
            }
        }

        console.log(`🏁 Broadcast finished. Success: ${successCount}, Failed: ${failCount}`);

        res.status(200).json({
            success: true,
            message: `Broadcast complete. Sent to ${successCount} users. Errors: ${failCount}`,
            errors: failCount > 0 ? errors : undefined
        });
    } catch (error) {
        console.error("Error in broadcastSystemNotification:", error);
        res.status(500).json({ message: "Internal Server Error during broadcast" });
    }
};
