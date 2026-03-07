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
    CheckCircle2,
    Sparkles,
    Mail,
    UserPlus,
    CheckSquare,
    Square,
    UserCheck,
    LifeBuoy,
    Star,
    X,
    Smartphone,
    Package,
    ArrowDownToLine,
    Plus,
    CheckCircle
} from "lucide-react";
import {
    getAdminStats,
    getAdminUsers,
    getAdminPosts,
    deleteUserAdmin,
    toggleUserRole,
    broadcastNotification,
    broadcastEmail,
    deletePost,
    clearAdminInbox,
    getFirebaseNonUsers,
    sendInvites,
    sweepPendingActions,
    getAdminSupportMessages,
    deleteSupportMessage,
    sendNotificationToUser,
    getAllReleases,
    createRelease,
    updateRelease,
    deleteRelease
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
    const [emailSubject, setEmailSubject] = useState("");
    const [emailBody, setEmailBody] = useState("");
    const [isEmailSending, setIsEmailSending] = useState(false);
    const [isCleaning, setIsCleaning] = useState(false);
    const [isSweeping, setIsSweeping] = useState(false);
    const [supportMessages, setSupportMessages] = useState([]);
    const [isSupportLoading, setIsSupportLoading] = useState(false);

    // Individual Targeted Modal State
    const [targetedUser, setTargetedUser] = useState(null); // The user being targeted
    const [targetedType, setTargetedType] = useState(null); // 'email' or 'notification'
    const [targetedSubject, setTargetedSubject] = useState("");
    const [targetedBody, setTargetedBody] = useState("");
    const [isTargetedSending, setIsTargetedSending] = useState(false);

    // Invite system state
    const [firebaseUsers, setFirebaseUsers] = useState([]);
    const [firebaseStats, setFirebaseStats] = useState({ total: 0, registered: 0 });
    const [selectedEmails, setSelectedEmails] = useState(new Set());
    const [inviteLoading, setInviteLoading] = useState(false);
    const [isSendingInvites, setIsSendingInvites] = useState(false);
    const [inviteSearch, setInviteSearch] = useState("");
    const [inviteSubject, setInviteSubject] = useState("");
    const [inviteMessage, setInviteMessage] = useState("");

    // APK Manager State
    const [releases, setReleases] = useState([]);
    const [isApkLoading, setIsApkLoading] = useState(false);
    const [isApkUploading, setIsApkUploading] = useState(false);
    const [showApkModal, setShowApkModal] = useState(false);
    const [apkForm, setApkForm] = useState({
        versionCode: "",
        versionName: "",
        releaseNotes: "",
        isUpdateRequired: false,
        apkFile: null // base64
    });

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

    const fetchSupportMessages = async () => {
        setIsSupportLoading(true);
        try {
            const data = await getAdminSupportMessages();
            setSupportMessages(data || []);
        } catch (err) {
            toast.error("Failed to load support messages");
        } finally {
            setIsSupportLoading(false);
        }
    };

    const handleDeleteSupport = async (id) => {
        if (!window.confirm("Delete this support request?")) return;
        try {
            await deleteSupportMessage(id);
            toast.success("Support request deleted");
            fetchSupportMessages();
        } catch (err) {
            toast.error("Failed to delete request");
        }
    };

    const fetchFirebaseUsers = async () => {
        setInviteLoading(true);
        try {
            const data = await getFirebaseNonUsers();
            setFirebaseUsers(data.nonUsers || []);
            setFirebaseStats({ total: data.total, registered: data.registered });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to fetch Firebase users");
        } finally {
            setInviteLoading(false);
        }
    };

    const toggleEmailSelection = (email) => {
        setSelectedEmails((prev) => {
            const next = new Set(prev);
            if (next.has(email)) next.delete(email);
            else next.add(email);
            return next;
        });
    };

    const toggleSelectAll = () => {
        const filtered = filteredFirebaseUsers;
        if (selectedEmails.size === filtered.length) {
            setSelectedEmails(new Set());
        } else {
            setSelectedEmails(new Set(filtered.map((u) => u.email)));
        }
    };

    const handleSendInvites = async () => {
        if (selectedEmails.size === 0) return toast.error("No users selected");
        if (!window.confirm(`Send invite emails to ${selectedEmails.size} users?`)) return;

        setIsSendingInvites(true);
        try {
            const res = await sendInvites(
                Array.from(selectedEmails),
                inviteSubject.trim() || undefined,
                inviteMessage.trim() || undefined
            );
            toast.success(res.message);
            setSelectedEmails(new Set());
            setInviteSubject("");
            setInviteMessage("");
            // Refresh list to remove any that might have been registered
            fetchFirebaseUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to send invites");
        } finally {
            setIsSendingInvites(false);
        }
    };

    const filteredFirebaseUsers = firebaseUsers.filter(
        (u) =>
            u.email.toLowerCase().includes(inviteSearch.toLowerCase()) ||
            (u.displayName && u.displayName.toLowerCase().includes(inviteSearch.toLowerCase()))
    );

    useEffect(() => {
        if (activeTab === "users") fetchUsers(searchQuery);
        if (activeTab === "posts") fetchPosts();
        if (activeTab === "stats") fetchStats();
        if (activeTab === "invite") fetchFirebaseUsers();
        if (activeTab === "support") fetchSupportMessages();
        if (activeTab === "apk") fetchReleases();
    }, [activeTab]);

    const fetchReleases = async () => {
        setIsApkLoading(true);
        try {
            const data = await getAllReleases();
            setReleases(data || []);
        } catch (err) {
            toast.error("Failed to load releases");
        } finally {
            setIsApkLoading(false);
        }
    };

    const handleApkUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 100 * 1024 * 1024) return toast.error("File size exceeds 100MB limit");

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            setApkForm(prev => ({ ...prev, apkFile: reader.result }));
            toast.success("File ready for upload");
        };
    };

    const handleCreateRelease = async () => {
        if (!apkForm.versionCode || !apkForm.versionName || !apkForm.apkFile) {
            return toast.error("Please fill all required fields and upload an APK file");
        }

        setIsApkUploading(true);
        try {
            await createRelease({
                ...apkForm,
                versionCode: Number(apkForm.versionCode)
            });
            toast.success("Release created successfully!");
            setShowApkModal(false);
            setApkForm({
                versionCode: "",
                versionName: "",
                releaseNotes: "",
                isUpdateRequired: false,
                apkFile: null
            });
            fetchReleases();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create release");
        } finally {
            setIsApkUploading(false);
        }
    };

    const handleDeleteRelease = async (id) => {
        if (!window.confirm("Delete this release forever?")) return;
        try {
            await deleteRelease(id);
            toast.success("Release deleted");
            fetchReleases();
        } catch (err) {
            toast.error("Failed to delete release");
        }
    };

    const handleToggleApkActive = async (release) => {
        try {
            await updateRelease(release._id, { isActive: !release.isActive });
            toast.success(`Release marked as ${!release.isActive ? 'active' : 'inactive'}`);
            fetchReleases();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

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

    const handleEmailBroadcast = async () => {
        if (!emailSubject.trim() || !emailBody.trim()) return toast.error("Subject and message are required");
        if (!window.confirm(`Send this email to all registered users? This cannot be undone.`)) return;

        setIsEmailSending(true);
        try {
            const res = await broadcastEmail(emailSubject, emailBody);
            toast.success(res.message);
            setEmailSubject("");
            setEmailBody("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Email broadcast failed");
        } finally {
            setIsEmailSending(false);
        }
    };

    const handleSendTargeted = async () => {
        if (!targetedUser || !targetedBody.trim()) return toast.error("Message is required");
        if (targetedType === 'email' && !targetedSubject.trim()) return toast.error("Subject is required");

        setIsTargetedSending(true);
        try {
            if (targetedType === 'email') {
                await sendEmailToUser(targetedUser._id, targetedSubject, targetedBody);
                toast.success(`Email sent to ${targetedUser.fullName}`);
            } else {
                await sendNotificationToUser(targetedUser._id, targetedSubject || "BondBeyond Update", targetedBody);
                toast.success(`Notification sent to ${targetedUser.fullName}`);
            }
            setTargetedUser(null);
            setTargetedType(null);
            setTargetedSubject("");
            setTargetedBody("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Action failed");
        } finally {
            setIsTargetedSending(false);
        }
    };

    const handleClearInbox = async () => {
        if (!window.confirm("This will hide all individual chats from your admin inbox to clean up after the broadcast. History is not deleted. Proceed?")) return;
        setIsCleaning(true);
        try {
            const res = await clearAdminInbox();
            toast.success(res.message);
        } catch (err) {
            toast.error("Cleanup failed");
        } finally {
            setIsCleaning(false);
        }
    };

    const handleSweepPending = async () => {
        if (!window.confirm("This will search for all users who have BOTH pending friend requests and unread messages, and send them a catch-up email. Proceed?")) return;
        setIsSweeping(true);
        try {
            const res = await sweepPendingActions();
            toast.success(res.message);
        } catch (err) {
            toast.error(err.response?.data?.message || "Sweep failed");
        } finally {
            setIsSweeping(false);
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
        <div className="p-4 sm:p-8 max-w-7xl mx-auto min-h-screen font-outfit">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center gap-4 bg-base-100 rounded-2xl p-4 ring-1 ring-base-content/5">
                        <div className="p-3 bg-primary/10 rounded-xl text-primary animate-pulse-slow">
                            <ShieldAlert className="size-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase italic leading-none">
                                Admin <span className="text-primary">Command</span>
                            </h1>
                            <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                                <span className="size-1.5 rounded-full bg-success"></span>
                                Secure System Access
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            if (activeTab === 'stats') fetchStats();
                            else if (activeTab === 'users') fetchUsers(searchQuery);
                            else if (activeTab === 'posts') fetchPosts();
                            else if (activeTab === 'support') fetchSupportMessages();
                            else if (activeTab === 'invite') fetchFirebaseUsers();
                        }}
                        className="btn btn-primary btn-md rounded-2xl gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 px-6"
                    >
                        <RefreshCcw className={`size-4 ${loading || isSupportLoading || inviteLoading ? 'animate-spin' : ''}`} />
                        <span className="font-bold uppercase tracking-tight text-xs">Refresh Core</span>
                    </button>
                </div>
            </div>

            {/* Premium Tabs */}
            <div className="flex gap-1.5 mb-12 p-1.5 bg-base-200 rounded-[2rem] border border-base-content/5 overflow-x-auto no-scrollbar max-w-fit mx-auto lg:mx-0 shadow-inner">
                {[
                    { id: "stats", label: "Overview", icon: BarChart3 },
                    { id: "users", label: "Users", icon: Users },
                    { id: "posts", label: "Posts", icon: FileText },
                    { id: "support", label: "Support", icon: LifeBuoy },
                    { id: "broadcast", label: "Mass Broadcast", icon: Megaphone },
                    { id: "invite", label: "Invite System", icon: UserPlus },
                    { id: "apk", label: "APK Manager", icon: Smartphone },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn btn-sm rounded-[1.5rem] gap-2 border-none px-6 h-10 transition-all duration-300 ${activeTab === tab.id
                            ? "bg-primary text-primary-content shadow-md shadow-primary/25 scale-105"
                            : "bg-transparent text-base-content/50 hover:text-base-content hover:bg-base-300/50"
                            }`}
                    >
                        <tab.icon className={`size-4 ${activeTab === tab.id ? 'animate-bounce-short' : ''}`} />
                        <span className="font-black uppercase tracking-tight text-[10px]">{tab.label}</span>
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
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {[
                                { label: "Total Users", val: stats.totalUsers, icon: Users, color: "from-blue-500 to-indigo-600", light: "bg-blue-500/10 text-blue-600" },
                                { label: "Onboarded", val: stats.onboardedUsers, icon: CheckCircle2, color: "from-emerald-500 to-teal-600", light: "bg-emerald-500/10 text-emerald-600" },
                                { label: "Members", val: stats.memberUsers, icon: Star, color: "from-amber-400 to-orange-500", light: "bg-amber-500/10 text-amber-600" },
                                { label: "Total Posts", val: stats.totalPosts, icon: FileText, color: "from-purple-500 to-fuchsia-600", light: "bg-purple-500/10 text-purple-600" },
                                { label: "Users (24h)", val: `+${stats.newUsers}`, icon: Users, color: "from-rose-500 to-pink-600", light: "bg-rose-500/10 text-rose-600" },
                                { label: "Posts (24h)", val: `+${stats.newPosts}`, icon: FileText, color: "from-sky-500 to-blue-600", light: "bg-sky-500/10 text-sky-600" },
                            ].map((s, i) => (
                                <div key={i} className="relative group perspective-1000">
                                    <div className={`absolute -inset-0.5 bg-gradient-to-br ${s.color} rounded-[2.5rem] opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition duration-500`}></div>
                                    <div className="relative card bg-base-100/50 backdrop-blur-xl shadow-sm border border-base-content/5 p-8 rounded-[2.5rem] transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-xl group-hover:shadow-primary/5">
                                        <div className="flex flex-col gap-6">
                                            <div className={`size-14 rounded-2xl ${s.light} flex items-center justify-center transition-transform duration-500 group-hover:rotate-12`}>
                                                <s.icon className="size-7" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mb-1.5">{s.label}</p>
                                                <div className="flex items-baseline gap-2">
                                                    <h4 className="text-4xl font-black tracking-tight">{s.val}</h4>
                                                    {s.label.includes('24h') && <span className="text-[10px] font-bold text-success uppercase">Growth</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute top-6 right-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <s.icon className="size-16" />
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
                                                        onClick={() => {
                                                            setTargetedUser(u);
                                                            setTargetedType('notification');
                                                            setTargetedSubject("Important Update 🚀");
                                                        }}
                                                        className="btn btn-ghost btn-xs btn-circle text-primary"
                                                        title="Send Direct Push Notification"
                                                    >
                                                        <Megaphone className="size-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTargetedUser(u);
                                                            setTargetedType('email');
                                                            setTargetedSubject("Message from BondBeyond Admin");
                                                        }}
                                                        className="btn btn-ghost btn-xs btn-circle text-secondary"
                                                        title="Send Direct Email"
                                                    >
                                                        <Mail className="size-4" />
                                                    </button>
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

                            {/* Mass Email Section */}
                            <div className="card bg-base-200 p-8 rounded-[40px] border-2 border-primary/10 shadow-xl shadow-primary/5 mt-8">
                                <div className="text-center mb-8">
                                    <div className="size-20 bg-primary/10 text-primary rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-primary/5">
                                        <Mail className="size-10" />
                                    </div>
                                    <h2 className="text-3xl font-black italic tracking-tighter uppercase">Mass Email</h2>
                                    <p className="text-xs font-bold opacity-40 mt-1 uppercase tracking-widest">Send specialized HTML mail to all registers</p>
                                </div>

                                <div className="space-y-6">
                                    <input
                                        type="text"
                                        placeholder="Email Subject..."
                                        className="input input-bordered w-full rounded-2xl bg-base-100 ring-1 ring-base-content/5"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                    />

                                    <div className="bg-base-100 p-4 rounded-3xl ring-1 ring-base-content/5">
                                        <textarea
                                            className="textarea textarea-ghost w-full bg-transparent resize-none text-base font-medium placeholder:italic p-0 min-h-[120px] focus:ring-0"
                                            placeholder="Type your official email body here..."
                                            value={emailBody}
                                            onChange={(e) => setEmailBody(e.target.value)}
                                        />
                                    </div>

                                    <div className="p-4 bg-primary/5 rounded-2xl flex items-start gap-3">
                                        <Mail className="size-5 text-primary flex-shrink-0 mt-0.5" />
                                        <p className="text-[10px] font-bold text-primary italic leading-relaxed uppercase">
                                            Warning: This sends an email directly to every user's inbox. Ensure the content is accurate and professional.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleEmailBroadcast}
                                        disabled={isEmailSending || !emailSubject.trim() || !emailBody.trim()}
                                        className="btn btn-primary btn-lg w-full rounded-[24px] shadow-lg shadow-primary/20 gap-3 group active:scale-95 transition-all"
                                    >
                                        {isEmailSending ? (
                                            <Loader2 className="size-6 animate-spin" />
                                        ) : (
                                            <>
                                                <span className="font-black italic uppercase tracking-tighter text-lg">Send Mass Email</span>
                                                <Send className="size-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Catch-up Sweep Section */}
                            <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 p-8 rounded-[40px] border-2 border-amber-500/10 shadow-xl shadow-amber-500/5 mt-8">
                                <div className="text-center mb-6">
                                    <div className="size-16 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-amber-500/5">
                                        <RefreshCcw className="size-8" />
                                    </div>
                                    <h2 className="text-2xl font-black italic tracking-tighter uppercase">Activity Catch-up</h2>
                                    <p className="text-[10px] font-bold opacity-40 mt-1 uppercase tracking-widest">WAKE UP INACTIVE USERS</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-white/5 rounded-2xl border border-dashed border-amber-500/20">
                                        <p className="text-xs font-medium opacity-70 leading-relaxed text-center">
                                            This tool identifies users who have <strong>unread messages</strong> AND <strong>pending requests</strong> but haven't logged in recently. It sends them a personalized "Rocket" email to bring them back.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleSweepPending}
                                        disabled={isSweeping}
                                        className="btn btn-warning btn-md w-full rounded-2xl gap-2 font-black uppercase text-xs tracking-widest active:scale-95 transition-all shadow-lg shadow-amber-500/20"
                                    >
                                        {isSweeping ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <>
                                                <Sparkles className="size-4" />
                                                Run Activity Sweep
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Clean Inbox Helper */}
                            <div className="mt-8 bg-base-200/50 p-6 rounded-[32px] border border-dashed border-base-content/10 text-center">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-4">Inbox flooded after broadcast?</p>
                                <button
                                    onClick={handleClearInbox}
                                    disabled={isCleaning}
                                    className="btn btn-outline btn-sm rounded-xl gap-2 hover:bg-primary hover:border-primary transition-all active:scale-95"
                                >
                                    {isCleaning ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                                    <span className="font-bold uppercase tracking-tight text-[10px]">Clean My Admin Inbox</span>
                                </button>
                                <p className="text-[9px] opacity-30 mt-3 italic">This hides empty/old 1-on-1 threads. It won't delete messages.</p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === "invite" && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            {/* Header Card */}
                            <div className="card bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 p-8 rounded-[40px] shadow-xl text-center">
                                <div className="size-20 bg-violet-500/20 text-violet-500 rounded-[28px] flex items-center justify-center mx-auto mb-4 border-2 border-violet-500/10">
                                    <UserPlus className="size-10" />
                                </div>
                                <h2 className="text-3xl font-black italic tracking-tighter uppercase">Invite Firebase Users</h2>
                                <p className="text-xs font-bold opacity-40 mt-1 uppercase tracking-widest">Send personalized invitations to people who haven't joined yet</p>

                                {/* Stats Row */}
                                <div className="flex justify-center gap-6 mt-6">
                                    <div className="text-center">
                                        <p className="text-2xl font-black">{firebaseStats.total}</p>
                                        <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">Firebase Users</p>
                                    </div>
                                    <div className="w-px bg-base-content/10" />
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-success">{firebaseStats.registered}</p>
                                        <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">Already Joined</p>
                                    </div>
                                    <div className="w-px bg-base-content/10" />
                                    <div className="text-center">
                                        <p className="text-2xl font-black text-violet-500">{firebaseUsers.length}</p>
                                        <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest">To Invite</p>
                                    </div>
                                </div>
                            </div>

                            {inviteLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="size-10 animate-spin text-violet-500" />
                                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Fetching Firebase users...</p>
                                </div>
                            ) : firebaseUsers.length === 0 ? (
                                <div className="card bg-base-200 p-12 rounded-3xl text-center border border-base-content/5">
                                    <UserCheck className="size-12 text-success mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-black uppercase italic tracking-tight">All Caught Up!</h3>
                                    <p className="text-sm opacity-50 mt-2">Every Firebase user has already joined freeChat. 🎉</p>
                                </div>
                            ) : (
                                <>
                                    {/* Search + Actions Bar */}
                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-30" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                className="input input-bordered w-full pl-12 rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5"
                                                value={inviteSearch}
                                                onChange={(e) => setInviteSearch(e.target.value)}
                                            />
                                        </div>
                                        <button
                                            onClick={toggleSelectAll}
                                            className="btn btn-outline btn-sm rounded-xl gap-2 px-6"
                                        >
                                            {selectedEmails.size === filteredFirebaseUsers.length && filteredFirebaseUsers.length > 0
                                                ? <CheckSquare className="size-4" />
                                                : <Square className="size-4" />
                                            }
                                            <span className="font-bold uppercase text-[10px] tracking-tight">
                                                {selectedEmails.size === filteredFirebaseUsers.length && filteredFirebaseUsers.length > 0 ? "Deselect All" : "Select All"}
                                            </span>
                                        </button>
                                    </div>

                                    {/* Email Composer */}
                                    {selectedEmails.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="card bg-base-100 border-2 border-violet-500/20 shadow-xl p-6 mt-4"
                                        >
                                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                                <Mail className="size-5 text-violet-500" />
                                                Compose Custom Invitation
                                            </h3>
                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Subject (Leave empty for default)"
                                                    className="input input-bordered w-full rounded-xl bg-base-200"
                                                    value={inviteSubject}
                                                    onChange={(e) => setInviteSubject(e.target.value)}
                                                />
                                                <textarea
                                                    className="textarea textarea-bordered w-full bg-base-200 min-h-[120px] rounded-xl text-base"
                                                    placeholder="Write your custom message here (Leave empty for default)..."
                                                    value={inviteMessage}
                                                    onChange={(e) => setInviteMessage(e.target.value)}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Selected Count + Send Button */}
                                    {selectedEmails.size > 0 && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="sticky top-4 z-10 card bg-violet-500 text-white p-4 rounded-2xl flex flex-row items-center justify-between shadow-xl shadow-violet-500/30 mt-4"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                    <Mail className="size-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase tracking-tight">{selectedEmails.size} Selected</p>
                                                    <p className="text-[10px] opacity-70 font-bold">Ready to send invite emails</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleSendInvites}
                                                disabled={isSendingInvites}
                                                className="btn btn-sm bg-white text-violet-600 border-none rounded-xl font-black uppercase gap-2 hover:bg-white/90 active:scale-95 transition-all"
                                            >
                                                {isSendingInvites ? (
                                                    <Loader2 className="size-4 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Send className="size-4" />
                                                        Send Invites
                                                    </>
                                                )}
                                            </button>
                                        </motion.div>
                                    )}

                                    {/* User Cards Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto no-scrollbar">
                                        {filteredFirebaseUsers.map((u) => (
                                            <motion.div
                                                key={u.uid}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => toggleEmailSelection(u.email)}
                                                className={`card p-4 rounded-2xl cursor-pointer transition-all border-2 flex flex-row items-center gap-4 ${selectedEmails.has(u.email)
                                                    ? "bg-violet-500/10 border-violet-500/40 shadow-lg shadow-violet-500/10"
                                                    : "bg-base-200 border-transparent hover:border-base-content/10 hover:bg-base-300/50"
                                                    }`}
                                            >
                                                <div className={`size-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${selectedEmails.has(u.email)
                                                    ? "bg-violet-500 text-white"
                                                    : "bg-base-300 text-base-content/30"
                                                    }`}>
                                                    {selectedEmails.has(u.email)
                                                        ? <CheckSquare className="size-5" />
                                                        : <Square className="size-5" />
                                                    }
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-bold text-sm tracking-tight truncate">
                                                        {u.displayName || "Unknown User"}
                                                    </p>
                                                    <p className="text-[10px] opacity-40 italic truncate">{u.email}</p>
                                                </div>
                                                {u.photoURL && (
                                                    <img
                                                        src={u.photoURL}
                                                        alt=""
                                                        className="size-9 rounded-full ring-2 ring-base-content/10 flex-shrink-0"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                )}
                                            </motion.div>
                                        ))}
                                    </div>

                                    {filteredFirebaseUsers.length === 0 && inviteSearch && (
                                        <div className="text-center py-12 opacity-40 font-bold uppercase italic tracking-widest">
                                            No matching users found
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "support" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-6"
                        >
                            {isSupportLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="size-10 animate-spin text-primary" />
                                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Loading support tickets...</p>
                                </div>
                            ) : supportMessages.length === 0 ? (
                                <div className="card bg-base-200 p-12 rounded-[2.5rem] border border-base-content/5 text-center">
                                    <CheckCircle2 className="size-16 text-success mx-auto mb-4 opacity-30" />
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Zero Tickets</h3>
                                    <p className="text-sm opacity-40 mt-2">All users seem happy! No support messages found.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {supportMessages.map((msg) => (
                                        <motion.div
                                            key={msg._id}
                                            layout
                                            className="card bg-base-100 border border-base-content/5 rounded-[2.5rem] p-6 group hover:shadow-xl transition-all duration-300"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black">
                                                        {msg.fullName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-sm tracking-tight">{msg.fullName}</h4>
                                                        <p className="text-[10px] opacity-40 font-mono italic">{msg.email}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteSupport(msg._id)}
                                                    className="btn btn-ghost btn-xs btn-circle text-error group-hover:bg-error/10 transition-colors"
                                                >
                                                    <Trash2 className="size-4" />
                                                </button>
                                            </div>
                                            <div className="bg-base-200/50 p-4 rounded-2xl border border-base-content/5 flex-1 shadow-inner">
                                                <p className="text-sm leading-relaxed">{msg.message}</p>
                                            </div>
                                            <div className="mt-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest opacity-30">
                                                <span>Ticket #{msg._id.slice(-6).toUpperCase()}</span>
                                                <span>{new Date(msg.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                    {activeTab === "apk" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="space-y-8"
                        >
                            {/* Header Section */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-base-200 p-8 rounded-[2.5rem] border border-base-content/5 shadow-inner">
                                <div className="flex items-center gap-5">
                                    <div className="size-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center border-2 border-primary/5">
                                        <Package className="size-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic tracking-tighter uppercase">Release Registry</h2>
                                        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest mt-1">Manage BondBeyond Build Artifacts</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowApkModal(true)}
                                    className="btn btn-primary btn-md rounded-2xl gap-2 font-black uppercase text-xs tracking-tight shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    <Plus className="size-4" />
                                    New Build Command
                                </button>
                            </div>

                            {isApkLoading ? (
                                <div className="flex flex-col items-center justify-center py-32 gap-4">
                                    <Loader2 className="size-10 animate-spin text-primary" />
                                    <p className="font-black uppercase tracking-widest text-xs opacity-40">Scanning archives...</p>
                                </div>
                            ) : releases.length === 0 ? (
                                <div className="card bg-base-200 p-16 rounded-[2.5rem] border-2 border-dashed border-base-content/5 text-center">
                                    <Package className="size-16 text-primary mx-auto mb-4 opacity-20" />
                                    <h3 className="text-xl font-black uppercase italic tracking-tight opacity-40">No Releases Logged</h3>
                                    <p className="text-sm opacity-30 mt-2">Deploy your first APK version to get started.</p>
                                    <button onClick={() => setShowApkModal(true)} className="btn btn-link btn-xs mt-4 text-primary no-underline font-black uppercase tracking-widest">Create Release v1.0.0</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {releases.map((release) => (
                                        <motion.div
                                            key={release._id}
                                            layout
                                            className={`card bg-base-100 border-2 rounded-[2.5rem] p-6 group transition-all duration-500 overflow-hidden relative ${release.isActive ? 'border-primary/20 shadow-xl shadow-primary/5' : 'border-base-content/5 opacity-70'}`}
                                        >
                                            {release.isUpdateRequired && (
                                                <div className="absolute top-0 right-10 px-4 py-1.5 bg-error text-error-content text-[8px] font-black uppercase tracking-[0.2em] rounded-b-xl z-10 shadow-lg">
                                                    Critical Update
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`size-12 rounded-xl flex items-center justify-center font-black ${release.isActive ? 'bg-primary text-primary-content' : 'bg-base-200 text-base-content/40'}`}>
                                                        {release.versionName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black tracking-tight">{release.versionName}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Build {release.versionCode}</span>
                                                            <div className="size-1 rounded-full bg-base-content/20" />
                                                            <span className="text-[10px] font-bold opacity-40">{new Date(release.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleDeleteRelease(release._id)} className="btn btn-ghost btn-sm btn-circle text-error">
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-base-200/50 p-5 rounded-2xl border border-base-content/5 mb-6 shadow-inner min-h-[80px]">
                                                <p className="text-[11px] leading-relaxed font-medium italic opacity-70">
                                                    {release.releaseNotes || "No transmission logs provided for this build."}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <button
                                                    onClick={() => handleToggleApkActive(release)}
                                                    className={`btn btn-sm flex-1 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 transition-all ${release.isActive ? 'btn-success text-white' : 'btn-outline border-base-content/10'}`}
                                                >
                                                    {release.isActive ? <CheckCircle className="size-3.5" /> : <Smartphone className="size-3.5" />}
                                                    {release.isActive ? 'Active Node' : 'Initialize Node'}
                                                </button>
                                                <a
                                                    href={`/api/apk/download/${release._id}`}
                                                    className="btn btn-sm btn-circle bg-base-200 hover:bg-primary hover:text-white transition-all border-none"
                                                    title="Download Artifact"
                                                >
                                                    <ArrowDownToLine className="size-4" />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Release Upload Modal */}
                            {showApkModal && (
                                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="bg-base-100 rounded-[3rem] w-full max-w-xl overflow-hidden shadow-2xl ring-1 ring-base-content/5"
                                    >
                                        <div className="p-8 bg-gradient-to-br from-primary/10 to-transparent flex items-center justify-between border-b border-base-content/5">
                                            <div className="flex items-center gap-4">
                                                <div className="size-12 bg-primary text-primary-content rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                                                    <Plus className="size-6" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black uppercase tracking-tight italic">Direct <span className="text-primary">Build Upload</span></h3>
                                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Upload APK Artifact to Cloudinary</p>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowApkModal(false)} className="btn btn-ghost btn-sm btn-circle opacity-50 hover:opacity-100">
                                                <X className="size-5" />
                                            </button>
                                        </div>

                                        <div className="p-8 space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Version Code (Number)</label>
                                                    <input
                                                        type="number"
                                                        className="input input-bordered w-full rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5 font-bold"
                                                        placeholder="e.g. 1"
                                                        value={apkForm.versionCode}
                                                        onChange={(e) => setApkForm({ ...apkForm, versionCode: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Version Name (String)</label>
                                                    <input
                                                        type="text"
                                                        className="input input-bordered w-full rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5 font-bold"
                                                        placeholder="e.g. 1.0.0"
                                                        value={apkForm.versionName}
                                                        onChange={(e) => setApkForm({ ...apkForm, versionName: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1 text-primary">APK Artifact (Direct Upload)</label>
                                                <div className="flex flex-col gap-3">
                                                    <div
                                                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-8 transition-all cursor-pointer ${apkForm.apkFile ? 'border-success/50 bg-success/5' : 'border-primary/20 bg-primary/5 hover:border-primary/40'}`}
                                                        onClick={() => document.getElementById('apk-file-input').click()}
                                                    >
                                                        <Plus className={`size-10 mb-2 ${apkForm.apkFile ? 'text-success' : 'text-primary opacity-40'}`} />
                                                        <span className={`text-xs font-black uppercase tracking-widest ${apkForm.apkFile ? 'text-success' : 'opacity-40'}`}>
                                                            {apkForm.apkFile ? "Build Ready for Transmission" : "Click to select .apk file"}
                                                        </span>
                                                        <input
                                                            id="apk-file-input"
                                                            type="file"
                                                            accept=".apk"
                                                            className="hidden"
                                                            onChange={handleApkUpload}
                                                        />
                                                    </div>
                                                    {apkForm.apkFile && (
                                                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase text-success">
                                                            <CheckCircle className="size-3" />
                                                            Upload Verified
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Release Intel</label>
                                                <textarea
                                                    className="textarea textarea-bordered w-full rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5 min-h-[80px] font-medium text-sm leading-relaxed"
                                                    placeholder="Document build changes or transmission logs..."
                                                    value={apkForm.releaseNotes}
                                                    onChange={(e) => setApkForm({ ...apkForm, releaseNotes: e.target.value })}
                                                />
                                            </div>

                                            <div className="flex items-center gap-3 p-4 bg-base-200 rounded-2xl border border-base-content/5">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary checkbox-sm"
                                                    checked={apkForm.isUpdateRequired}
                                                    onChange={(e) => setApkForm({ ...apkForm, isUpdateRequired: e.target.checked })}
                                                />
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Mandatory System Update Required</p>
                                            </div>

                                            <button
                                                onClick={handleCreateRelease}
                                                disabled={isApkUploading}
                                                className="btn btn-primary btn-lg w-full rounded-3xl gap-3 shadow-xl shadow-primary/20 transition-all active:scale-95 group overflow-hidden relative"
                                            >
                                                {isApkUploading ? (
                                                    <Loader2 className="size-6 animate-spin" />
                                                ) : (
                                                    <>
                                                        <span className="font-black italic uppercase tracking-tighter text-lg relative z-10">Broadcast Registry</span>
                                                        <Send className="size-5 relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            )}

            {/* Targeted Communication Modal */}
            {targetedUser && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="bg-base-100 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl ring-1 ring-base-content/5"
                    >
                        <div className={`p-6 bg-gradient-to-r ${targetedType === 'email' ? 'from-secondary/20 to-primary/20' : 'from-primary/20 to-secondary/20'} flex items-center justify-between`}>
                            <div className="flex items-center gap-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center ${targetedType === 'email' ? 'bg-secondary text-secondary-content' : 'bg-primary text-primary-content'}`}>
                                    {targetedType === 'email' ? <Mail className="size-6" /> : <Megaphone className="size-6" />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black uppercase tracking-tight italic">
                                        Direct <span className={targetedType === 'email' ? 'text-secondary' : 'text-primary'}>{targetedType}</span>
                                    </h3>
                                    <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">Targeting: {targetedUser.fullName}</p>
                                </div>
                            </div>
                            <button onClick={() => setTargetedUser(null)} className="btn btn-ghost btn-sm btn-circle opacity-50 hover:opacity-100">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">{targetedType === 'email' ? 'Email Subject' : 'Notification Title'}</label>
                                    <input
                                        type="text"
                                        className="input input-bordered w-full rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5 font-bold"
                                        placeholder={targetedType === 'email' ? "Enter subject..." : "Enter short title..."}
                                        value={targetedSubject}
                                        onChange={(e) => setTargetedSubject(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-1">Message Body</label>
                                    <textarea
                                        className="textarea textarea-bordered w-full rounded-2xl bg-base-200 border-none ring-1 ring-base-content/5 min-h-[150px] font-medium leading-relaxed"
                                        placeholder={`Write your ${targetedType} message here...`}
                                        value={targetedBody}
                                        onChange={(e) => setTargetedBody(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSendTargeted}
                                disabled={isTargetedSending || !targetedBody.trim()}
                                className={`btn btn-lg w-full rounded-[2rem] gap-3 shadow-xl ${targetedType === 'email' ? 'btn-secondary shadow-secondary/20' : 'btn-primary shadow-primary/20'} transition-all active:scale-95`}
                            >
                                {isTargetedSending ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    <>
                                        <span className="font-black italic uppercase tracking-tighter">Release Command</span>
                                        <Send className="size-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

