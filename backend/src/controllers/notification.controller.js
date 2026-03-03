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
        const users = await User.find({}, "_id fullName email profilePic");
        const adminId = req.user._id.toString();

        console.log(`🚀 Starting system broadcast to ${users.length} users. Admin: ${adminId}`);

        if (!streamClient) {
            console.error("❌ Stream client is NULL during broadcast attempt.");
            return res.status(500).json({ message: "Stream client not initialized" });
        }

        // SAFETY: Sync the admin user with the name "Announcement" for the broadcast
        await streamClient.upsertUsers([{
            id: adminId,
            name: "Announcement",
            image: "https://img.icons8.com/color/96/megaphone.png",
            role: "admin",
            isVerified: true
        }]);

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        // Create a pool of broadcast tasks
        const broadcastTasks = users.map(async (targetUser) => {
            const targetId = targetUser._id.toString();

            if (targetId === adminId) return { skip: true };

            try {
                // SAFETY: Upsert user to Stream right before messaging 
                // ensures they exist on the chat server even if login sync failed
                await streamClient.upsertUsers([{
                    id: targetId,
                    name: targetUser.fullName,
                    image: targetUser.profilePic || "",
                }]);

                // Match the frontend's channel ID logic: [id1, id2].sort().join("-")
                const channelId = [adminId, targetId].sort().join("-");

                const channel = streamClient.channel("messaging", channelId, {
                    members: [adminId, targetId],
                    created_by_id: adminId,
                });

                await channel.create();

                const response = await channel.sendMessage({
                    text: `📢 SYSTEM NOTIFICATION: \n\n${message}`,
                    user_id: adminId,
                    silent: false,
                    is_system: true
                });

                // HIDE the channel for the Admin so it doesn't clutter their inbox
                await channel.hide(adminId);

                return { success: true, email: targetUser.email, msgId: response.message.id };
            } catch (err) {
                console.error(`  ❌ Broadcast failed for ${targetUser.email}:`, err.message);
                return { success: false, email: targetUser.email, error: err.message };
            }
        });

        const results = await Promise.all(broadcastTasks);

        results.forEach(res => {
            if (res.skip) return;
            if (res.success) successCount++;
            else {
                failCount++;
                errors.push({ email: res.email, error: res.error });
            }
        });

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

/**
 * Hides all channels for the admin to clean up the inbox.
 */
export const clearAdminChats = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!streamClient) {
            return res.status(500).json({ message: "Stream service not initialized" });
        }

        const adminId = req.user._id.toString();

        // Query all channels where the admin is a member
        const filter = {
            type: "messaging",
            members: { $in: [adminId] }
        };

        const channels = await streamClient.queryChannels(filter);

        console.log(`🧹 Cleaning up ${channels.length} channels for Admin ${adminId}`);

        let count = 0;
        for (const channel of channels) {
            // Don't hide group chats if they exist
            if (channel.id.startsWith("group_")) continue;

            await channel.hide(adminId);
            count++;
        }

        res.status(200).json({
            success: true,
            message: `Cleaned up ${count} channels from your inbox.`
        });
    } catch (error) {
        console.error("Error in clearAdminChats:", error);
        res.status(500).json({ message: "Internal Server Error during cleanup" });
    }
};
