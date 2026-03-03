import { useState, useEffect } from "react";
import {
    Users,
    FileText,
    Megaphone,
    BarChart3,
    Search,
    ShieldAlert,
    UserX,
    ShieldCheck,
    Trash2,
    Send,
    Loader2,
    RefreshCcw,
    CheckCircle2
} from "lucide-react";
import {
    getAdminStats,
    getAdminUsers,
    getAdminPosts,
    deleteUserAdmin,
    toggleUserRole,
    broadcastNotification,
    deletePost
} from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("stats");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data.stats);
        } catch (err) {
            toast.error("Failed to load stats");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (query = "") => {
        try {
            setLoading(true);
            const data = await getAdminUsers(query);
            setUsers(data);
        } catch (err) {
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await getAdminPosts();
            setPosts(data);
        } catch (err) {
            toast.error("Failed to load posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "users") fetchUsers(searchQuery);
        if (activeTab === "posts") fetchPosts();
        if (activeTab === "stats") fetchStats();
    }, [activeTab]);

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return toast.error("Empty message");
        setIsBroadcasting(true);
        try {
            await broadcastNotification(broadcastMsg);
            toast.success("Broadcast sent to all users!");
            setBroadcastMsg("");
        } catch (err) {
            toast.error("Broadcast failed");
        } finally {
            setIsBroadcasting(false);
        }
    };

    const handleToggleRole = async (userId) => {
        try {
            const res = await toggleUserRole(userId);
            toast.success(`User role updated to ${res.role}`);
            if (activeTab === "users") fetchUsers(searchQuery);
        } catch (err) {
            toast.error("Failed to update role");
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Permanently delete this user and all their content?")) return;
        try {
            await deleteUserAdmin(userId);
            toast.success("User deleted");
            fetchUsers(searchQuery);
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            await deletePost(postId);
            toast.success("Post deleted");
            fetchPosts();
        } catch (err) {
            toast.error("Deletion failed");
        }
    };

    return (
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter italic uppercase flex items-center gap-3">
                        <ShieldAlert className="size-10 text-primary" />
                        Admin Command
                    </h1>
                    <p className="text-base-content/50 font-medium uppercase tracking-widest text-[10px] mt-1">
                        System Control & User Management
                    </p>
                </div>

                <button
                    onClick={() => activeTab === 'stats' ? fetchStats() : activeTab === 'users' ? fetchUsers() : fetchPosts()}
                    className="btn btn-primary btn-sm rounded-xl gap-2 active:scale-95 transition-transform"
                >
                    <RefreshCcw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                {[
                    { id: "stats", label: "Overview", icon: BarChart3 },
                    { id: "users", label: "Users", icon: Users },
                    { id: "posts", label: "Posts", icon: FileText },
                    { id: "broadcast", label: "Announce", icon: Megaphone },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-sm rounded-xl gap-2 border-none px-6 transition-all ${activeTab === tab.id
                                ? "bg-primary text-primary-content shadow-lg shadow-primary/20"
                                : "bg-base-200 text-base-content/60 hover:bg-base-300"
                            }`}
                    >
                        <tab.icon className="size-4" />
                        <span className="font-bold uppercase tracking-tight text-xs">{tab.label}</span>
                    </button>
                ))}
            </div>

            {loading && !stats && !users.length && !posts.length ? (
                <div className="flex flex-col items-center justify-center py-32 gap-4">
                    <Loader2 className="size-10 animate-spin text-primary" />
                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Accessing mainframes...</p>
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    {activeTab === "stats" && stats && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[
                                { label: "Total Users", val: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
                                { label: "Onboarded", val: stats.onboardedUsers, icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50" },
                                { label: "Members", val: stats.memberUsers, icon: Star, color: "text-amber-500", bg: "bg-amber-50" },
                                { label: "Total Posts", val: stats.totalPosts, icon: FileText, color: "text-purple-500", bg: "bg-purple-50" },
                                { label: "Users (24h)", val: `+${stats.newUsers}`, icon: Users, color: "text-indigo-500", bg: "bg-indigo-50" },
                                { label: "Posts (24h)", val: `+${stats.newPosts}`, icon: FileText, color: "text-rose-500", bg: "bg-rose-50" },
                            ].map((s, i) => (
                                <div key={i} className="card bg-base-200 shadow-sm border border-base-content/5 p-6 rounded-3xl group hover:shadow-md transition-shadow">
                                    <div className="flex items-center gap-4">
                                        <div className={`p-4 rounded-2xl ${s.bg} ${s.color}`}>
                                            <s.icon className="size-8" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</p>
                                            <h4 className="text-3xl font-black tracking-tight">{s.val}</h4>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "users" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    className="input input-bordered w-full pl-12 rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers(searchQuery)}
                                />
                            </div>

                            <div className="overflow-x-auto rounded-3xl bg-base-200 p-2 border border-base-content/5">
                                <table className="table">
                                    <thead className="text-[10px] uppercase font-black tracking-widest opacity-40">
                                        <tr>
                                            <th>User</th>
                                            <th>Status</th>
                                            <th>Role</th>
                                            <th>Gems</th>
                                            <th className="text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(u => (
                                            <tr key={u._id} className="hover:bg-base-300/50 transition-colors">
                                                <td>
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="w-10 h-10 rounded-full">
                                                                <img src={u.profilePic || "/avatar.png"} alt="" />
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-sm tracking-tight">{u.fullName}</div>
                                                            <div className="text-[10px] opacity-40 italic">{u.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    {u.isMember ? (
                                                        <span className="badge badge-primary badge-xs py-2 font-bold uppercase tracking-widest text-[8px]">PRO</span>
                                                    ) : (
                                                        <span className="badge badge-outline badge-xs py-2 font-bold uppercase tracking-widest text-[8px] opacity-40">FREE</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`text-[10px] font-black uppercase tracking-tighter ${u.role === 'admin' ? 'text-primary' : 'opacity-40'}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className="font-mono text-xs font-bold">{u.gems || 0}</span>
                                                </td>
                                                <td className="text-right space-x-2">
                                                    <button
                                                        onClick={() => handleToggleRole(u._id)}
                                                        className="btn btn-ghost btn-xs btn-circle text-info"
                                                        title="Toggle Admin Role"
                                                    >
                                                        {u.role === 'admin' ? <ShieldCheck className="size-4" /> : <ShieldAlert className="size-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(u._id)}
                                                        className="btn btn-ghost btn-xs btn-circle text-error"
                                                        title="Delete User"
                                                    >
                                                        <UserX className="size-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "posts" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-6"
                        >
                            {posts.map(post => (
                                <div key={post._id} className="card bg-base-200 p-5 rounded-3xl border border-base-content/5 flex flex-col gap-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img src={post.userId?.profilePic || "/avatar.png"} alt="" className="size-8 rounded-full" />
                                            <div>
                                                <p className="text-xs font-bold tracking-tight">{post.userId?.fullName}</p>
                                                <p className="text-[9px] opacity-40 font-mono italic">{new Date(post.createdAt).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeletePost(post._id)}
                                            className="btn btn-ghost btn-xs btn-circle text-error"
                                        >
                                            <Trash2 className="size-4" />
                                        </button>
                                    </div>

                                    {post.content && <p className="text-sm border-l-2 border-primary/20 pl-3 leading-snug">{post.content}</p>}

                                    {post.mediaUrl && (
                                        <div className="rounded-2xl overflow-hidden h-40">
                                            {post.mediaType === 'image' ? (
                                                <img src={post.mediaUrl} className="w-full h-full object-cover" />
                                            ) : (
                                                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase opacity-20">
                                        <span>{post.likes?.length || 0} Likes</span>
                                        <span>{post.comments?.length || 0} Comments</span>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {activeTab === "broadcast" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="max-w-2xl mx-auto"
                        >
                            <div className="card bg-base-200 p-8 rounded-[40px] border-2 border-primary/10 shadow-xl shadow-primary/5">
                                <div className="text-center mb-8">
                                    <div className="size-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-primary/5">
                                        <Megaphone className="size-10" />
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Mass Announcement</h2>
                                    <p className="text-xs font-bold opacity-40 mt-1 uppercase tracking-widest">Transmit signal to all receivers</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-base-100 p-4 rounded-3xl ring-1 ring-base-content/5">
                                        <textarea
                                            className="textarea textarea-ghost w-full bg-transparent resize-none text-base font-medium placeholder:italic p-0 min-h-[120px] focus:ring-0"
                                            placeholder="Type your official system message here..."
                                            value={broadcastMsg}
                                            onChange={(e) => setBroadcastMsg(e.target.value)}
                                        />
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-3">
                                        <ShieldAlert className="size-5 text-primary flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-primary italic leading-relaxed uppercase">
                                            Warning: This action will send an immediate push notification and chat message to every single user on the platform. Use with discretion.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleBroadcast}
                                        disabled={isBroadcasting || !broadcastMsg.trim()}
                                        className="btn btn-primary btn-lg w-full rounded-[24px] shadow-lg shadow-primary/20 gap-3 group active:scale-95 transition-all"
                                    >
                                        {isBroadcasting ? (
                                            <Loader2 className="size-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="font-black italic uppercase tracking-tighter text-lg">Transmit signal</span>
                                                <Send className="size-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};

// Simple Star icon as it was missing from lucide imports in my brain but it might be there
const Star = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
);

export default AdminDashboard;
