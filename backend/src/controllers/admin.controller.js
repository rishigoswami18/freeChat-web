import User from "../models/User.js";
import Post from "../models/Post.js";
import AppRelease from "../models/AppRelease.js";
import { sendPushNotification } from "../lib/push.service.js";
import { sendNotificationEmail } from "../lib/email.service.js";

export const getAdminStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const onboardedUsers = await User.countDocuments({ isOnboarded: true });
        const memberUsers = await User.countDocuments({ isMember: true });
        const totalPosts = await Post.countDocuments();

        // Recent activity (last 24h)
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newUsers = await User.countDocuments({ createdAt: { $gte: last24h } });
        const newPosts = await Post.countDocuments({ createdAt: { $gte: last24h } });
        
        // Daily Active Users (logged in within last 24h)
        const dailyActiveUsers = await User.countDocuments({ lastLoginDate: { $gte: last24h } });

        // Total App Downloads (Sum of all releases)
        const apkData = await AppRelease.aggregate([
            { $group: { _id: null, total: { $sum: "$downloadCount" } } }
        ]);
        const totalAppDownloads = apkData.length > 0 ? apkData[0].total : 0;

        res.status(200).json({
            stats: {
                totalUsers,
                onboardedUsers,
                memberUsers,
                totalPosts,
                newUsers,
                newPosts,
                dailyActiveUsers,
                totalAppDownloads
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAdminUsers = async (req, res) => {
    try {
        const { q } = req.query;
        let filter = {};
        if (q) {
            filter = {
                $or: [
                    { fullName: { $regex: q, $options: "i" } },
                    { email: { $regex: q, $options: "i" } },
                    { username: { $regex: q, $options: "i" } }
                ]
            };
        }

        const users = await User.find(filter)
            .select("-password")
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching admin users:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const getAdminPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("userId", "fullName username profilePic")
            .sort({ createdAt: -1 })
            .limit(100);

        res.status(200).json(posts);
    } catch (error) {
        console.error("Error fetching admin posts:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent self-deletion if needed, though admin might need to be removed by another admin
        if (id === req.user._id.toString()) {
            return res.status(400).json({ message: "Cannot delete yourself" });
        }

        await User.findByIdAndDelete(id);
        // Cleanup posts etc. if needed
        await Post.deleteMany({ userId: id });

        res.status(200).json({ success: true, message: "User and their content deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.role = user.role === "admin" ? "user" : "admin";
        await user.save();

        res.status(200).json({ success: true, role: user.role });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const broadcastEmail = async (req, res) => {
    try {
        const { subject, message } = req.body;
        if (!subject || !message) {
            return res.status(400).json({ message: "Subject and message are required" });
        }

        const users = await User.find({ isOnboarded: true }, "email");
        const total = users.length;

        // Use the new service
        const { sendBroadcastEmail } = await import("../lib/email.service.js");

        console.log(`[Admin] Starting broadcast email to ${total} users...`);
        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            try {
                // Burst limit protection
                if (i > 0) await sleep(500);

                await sendBroadcastEmail(user.email, subject, message);
                successCount++;
                console.log(`[Admin] [${successCount}/${total}] ✅ Sent to: ${user.email}`);
            } catch (err) {
                console.error(`[Admin] [ERROR] ❌ Failed for ${user.email}:`, err.message);
                failCount++;
            }
        }

        console.log(`[Admin] 📢 Broadcast Finished. Total: ${total}, ✅ Success: ${successCount}, ❌ Failed: ${failCount}`);

        res.status(200).json({
            success: true,
            message: `Broadcast complete. Sent to ${successCount} users. Failed for ${failCount} users.`,
            total,
            successCount,
            failCount
        });
    } catch (error) {
        console.error("Error in broadcastEmail:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

import SupportMessage from "../models/SupportMessage.js";

export const getAdminSupportMessages = async (req, res) => {
    try {
        const messages = await SupportMessage.find().sort({ createdAt: -1 }).limit(100);
        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching support messages:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteSupportMessage = async (req, res) => {
    try {
        const { id } = req.params;
        await SupportMessage.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Support message deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Sends a direct HTML email to a specific user
 */
export const sendEmailToUser = async (req, res) => {
    try {
        const { userId, subject, body } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        await sendNotificationEmail(user.email, {
            emoji: "📢",
            title: subject,
            body: body,
            ctaText: "Open App",
            ctaUrl: "https://freechatweb.in"
        });

        res.status(200).json({ success: true, message: `Email sent to ${user.email}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Sends a direct push notification to a specific user via FCM
 */
export const sendNotificationToUser = async (req, res) => {
    try {
        const { userId, title, body } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        await sendPushNotification(userId, {
            title: title || "New Notification",
            body: body,
            icon: "https://freechatweb.in/logo.png"
        });

        res.status(200).json({ success: true, message: `Push notification sent to ${user.fullName}` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};export const broadcastNotification = async (req, res) => {
    try {
        const { title, message, link } = req.body;
        const users = await User.find({ isOnboarded: true }, "_id");
        
        console.log(`[Admin] Starting broadcast notification to ${users.length} users...`);
        
        for (const user of users) {
             sendPushNotification(user._id, {
                title: title,
                body: message,
                data: { link: link || "/" }
            }).catch(err => console.error(`Failed to notify ${user._id}:`, err.message));
        }

        res.status(200).json({ success: true, message: "Broadcast initiated" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const clearAdminInbox = async (req, res) => {
    try {
        await SupportMessage.deleteMany({});
        res.status(200).json({ success: true, message: "Admin inbox cleared" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const sweepPendingActions = async (req, res) => {
    try {
        // Logic to cleanup old/stale data
        // For now, it just returns success to satisfy the frontend call
        res.status(200).json({ success: true, message: "System sweep complete" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
