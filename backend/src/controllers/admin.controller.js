import User from "../models/User.js";
import Post from "../models/Post.js";

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

        res.status(200).json({
            stats: {
                totalUsers,
                onboardedUsers,
                memberUsers,
                totalPosts,
                newUsers,
                newPosts
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
