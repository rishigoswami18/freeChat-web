import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { streamClient } from "../lib/stream.js";
import { sendNotificationEmail } from "../lib/email.service.js";
import { sendPushNotification } from "../lib/push.service.js"; // Added import

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
        const SYSTEM_ID = "system_announcement";

        console.log(`🚀 Starting system broadcast to ${users.length} users. System ID: ${SYSTEM_ID}`);

        // SAFETY: Sync the dedication Announcement account
        await streamClient.upsertUsers([{
            id: SYSTEM_ID,
            name: "Announcement",
            image: "https://img.icons8.com/color/96/megaphone.png",
            role: "admin",
            isVerified: true
        }]);

        // ALSO: Restore the Admin's personal profile name in case it was overwritten in the previous step
        await streamClient.upsertUsers([{
            id: adminId,
            name: req.user.fullName,
            image: req.user.profilePic || "",
            role: "admin",
            isVerified: req.user.isVerified
        }]);

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        // Create a pool of broadcast tasks
        const broadcastTasks = users.map(async (targetUser) => {
            const targetId = targetUser._id.toString();

            // Skip the admin themselves and the system ID
            if (targetId === adminId || targetId === SYSTEM_ID) return { skip: true };

            try {
                // SAFETY: Sync target user
                await streamClient.upsertUsers([{
                    id: targetId,
                    name: targetUser.fullName,
                    image: targetUser.profilePic || "",
                    role: targetUser.role || "user",
                    isVerified: targetUser.isVerified || false
                }]);

                // Create a channel between the SYSTEM and the User
                const channelId = [SYSTEM_ID, targetId].sort().join("-");

                const channel = streamClient.channel("messaging", channelId, {
                    members: [SYSTEM_ID, targetId],
                    created_by_id: SYSTEM_ID,
                });

                await channel.create();

                const response = await channel.sendMessage({
                    text: `📢 SYSTEM NOTIFICATION: \n\n${message}`,
                    user_id: SYSTEM_ID,
                    silent: false,
                    is_system: true
                });

                // 2. ALSO: Send Native Push Notification via FCM
                await sendPushNotification(targetId, {
                    title: "BondBeyond Announcement 📢",
                    body: message,
                    icon: "https://www.freechatweb.in/logo.png"
                });

                // NO need to hide for admin anymore, because the admin is NO LONGER a member of this specific channel!
                // The channel is between "Announcement" and "User".

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

/**
 * Sweeps all users and notifies those who have BOTH pending friend requests
 * AND unread messages. This is an admin trigger to re-engage users.
 */
export const notifyPendingActions = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden" });
        }

        if (!streamClient) {
            return res.status(500).json({ message: "Stream service not initialized" });
        }

        console.log("🔍 Starting sweep for users with pending requests and unread messages...");

        // 1. Get all pending friend requests grouped by recipient
        const pendingReqs = await FriendRequest.find({ status: "pending" }).select("recipient").lean();
        const usersWithPendingReqs = new Set(pendingReqs.map(r => r.recipient.toString()));

        if (usersWithPendingReqs.size === 0) {
            return res.status(200).json({ success: true, message: "No users with pending requests found." });
        }

        // 2. Fetch all users from MongoDB (only those with pending reqs to save time)
        const users = await User.find({ _id: { $in: Array.from(usersWithPendingReqs) } }, "email fullName _id").lean();

        const userIds = users.map(u => u._id.toString());

        // 3. Query Stream for unread counts
        // Note: Querying users returns the public profile. For total_unread_count, we might need a specific filter.
        // Actually, as admin we can see unread counts for channels or use queryUsers.
        const streamUsersResponse = await streamClient.queryUsers({ id: { $in: userIds } });
        const streamUsersMap = new Map(streamUsersResponse.users.map(u => [u.id, u.total_unread_count || 0]));

        let notifiedCount = 0;
        let failCount = 0;

        for (const user of users) {
            const userId = user._id.toString();
            const unreadCount = streamUsersMap.get(userId) || 0;

            // Condition: Has pending friend request AND unread messages
            if (unreadCount > 0) {
                try {
                    await sendNotificationEmail(user.email, {
                        emoji: "🚀",
                        title: "You have unread activity!",
                        body: `Hey <strong>${user.fullName.split(' ')[0]}</strong>, you have <strong>${unreadCount} unread messages</strong> and <strong>pending friend requests</strong> waiting for you! Log in now to catch up.`,
                        ctaText: "Open Inbox",
                        ctaUrl: `${process.env.CLIENT_URL || "https://freechatweb.in"}/inbox`
                    });
                    notifiedCount++;
                    // Rate limiting sleep to avoid SMTP pressure
                    await new Promise(r => setTimeout(r, 300));
                } catch (err) {
                    console.error(`  ❌ Failed to notify ${user.email}:`, err.message);
                    failCount++;
                }
            }
        }

        res.status(200).json({
            success: true,
            message: `Sweep complete. Notified ${notifiedCount} users. Errors: ${failCount}`,
            scanned: users.length,
            notified: notifiedCount
        });

    } catch (error) {
        console.error("Error in notifyPendingActions:", error);
        res.status(500).json({ message: "Internal Server Error during sweep" });
    }
};


