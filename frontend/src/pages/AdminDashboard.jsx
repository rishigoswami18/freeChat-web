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
    Send,
    Loader2,
    RefreshCcw,
    CheckCircle2,
    Mail,
    UserPlus,
    X,
    Smartphone,
    ArrowDownToLine,
    Plus,
    Trophy,
    TrendingUp,
    Zap,
    LifeBuoy,
    ExternalLink,
    ChevronRight,
    Filter,
    Shield
} from "lucide-react";
import {
    getAdminStats,
    getAdminUsers,
    deleteUserAdmin,
    toggleUserRole,
    broadcastNotification,
    broadcastEmail,
    getAdminSupportMessages,
    sendEmailToUser,
    sendNotificationToUser,
    getAllReleases,
    getAdminMatches,
    getFinancialStats
} from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const StatCard = ({ label, value, icon: Icon, trend }) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                <Icon size={20} />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>
                    {trend > 0 ? <TrendingUp size={12} /> : null}
                    {trend}%
                </div>
            )}
        </div>
        <div className="space-y-1">
            <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</p>
        </div>
    </div>
);

const UserItem = ({ user, onAction }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-slate-200 hover:shadow-sm transition-all duration-200 group">
        <div className="flex items-center gap-4">
            <div className="relative">
                <img 
                    src={user.profilePic || "/avatar.png"} 
                    alt="" 
                    className="size-12 rounded-full object-cover border border-slate-100 shadow-sm"
                />
                {user.role === 'admin' && (
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-sm">
                        <ShieldCheck size={12} className="text-indigo-600" />
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
                    {user.isVerified && <CheckCircle2 size={14} className="text-blue-500 fill-blue-50" />}
                </div>
                <p className="text-xs text-slate-400 font-medium">{user.email}</p>
            </div>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end mr-4">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                    {user.role}
                </span>
                <span className="text-[10px] font-medium text-slate-300 mt-1">Gems: {user.gems || 0}</span>
            </div>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => onAction('notify', user)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Send Alert"
                >
                    <Megaphone size={16} />
                </button>
                <button 
                    onClick={() => onAction('email', user)}
                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Send Email"
                >
                    <Mail size={16} />
                </button>
                <button 
                    onClick={() => onAction('delete', user)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete User"
                >
                    <UserX size={16} />
                </button>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState("stats");
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    
    // Broadcast State
    const [broadcastMsg, setBroadcastMsg] = useState("");
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    
    // Targeted State
    const [targetedUser, setTargetedUser] = useState(null);
    const [targetedType, setTargetedType] = useState('notification');
    const [targetedSubject, setTargetedSubject] = useState("");
    const [targetedBody, setTargetedBody] = useState("");
    const [isTargetedSending, setIsTargetedSending] = useState(false);

    useEffect(() => {
        if (activeTab === "stats") fetchStats();
        if (activeTab === "users") fetchUsers();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getAdminStats();
            setStats(data.stats);
        } catch (err) {
            toast.error("Analytics sync failed");
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAdminUsers(searchQuery);
            const items = data?.data?.items || (Array.isArray(data) ? data : []);
            setUsers(items);
        } catch (err) {
            toast.error("User database sync failed");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (type, user) => {
        if (type === 'delete') {
            if (!window.confirm("Are you sure you want to delete this account?")) return;
            try {
                await deleteUserAdmin(user._id);
                toast.success("Account deleted");
                fetchUsers();
            } catch (err) { toast.error("Delete operation failed"); }
        } else {
            setTargetedUser(user);
            setTargetedType(type === 'email' ? 'email' : 'notification');
            setTargetedSubject("");
            setTargetedBody("");
        }
    };

    const handleSendTargeted = async () => {
        if (!targetedBody.trim()) return toast.error("Message content required");
        setIsTargetedSending(true);
        try {
            if (targetedType === 'email') {
                await sendEmailToUser({
                    userId: targetedUser._id,
                    subject: targetedSubject || "Application Update",
                    body: targetedBody
                });
            } else {
                await sendNotificationToUser({
                    userId: targetedUser._id,
                    title: targetedSubject || "New Notification",
                    body: targetedBody
                });
            }
            toast.success("Message sent successfully");
            setTargetedUser(null);
        } catch (err) {
            toast.error("Transmission failed");
        } finally {
            setIsTargetedSending(false);
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastMsg.trim()) return toast.error("Announcement cannot be empty");
        setIsBroadcasting(true);
        try {
            await broadcastNotification({
                title: "Platform Announcement",
                message: broadcastMsg,
                link: "/"
            });
            toast.success("Broadcast sent to all users");
            setBroadcastMsg("");
        } catch (err) {
            toast.error("Global announcement failed");
        } finally {
            setIsBroadcasting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900 antialiased">
            {/* Navigation Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="size-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                <Shield size={18} fill="currentColor" />
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Admin Console</h1>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => activeTab === 'stats' ? fetchStats() : fetchUsers()}
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-all"
                            >
                                <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                            </button>
                            <div className="h-4 w-px bg-slate-200" />
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
                    
                    {/* Sidebar Nav */}
                    <aside className="space-y-1">
                        <p className="px-3 mb-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Platform Control</p>
                        {[
                            { id: "stats", label: "Dashboard", icon: BarChart3 },
                            { id: "users", label: "Accounts", icon: Users },
                            { id: "broadcast", label: "Announcements", icon: Megaphone },
                            { id: "support", label: "Settings", icon: LifeBuoy },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-semibold transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                                    : 'text-slate-500 hover:bg-white hover:text-slate-900'
                                }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </aside>

                    {/* Content Area */}
                    <div className="space-y-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeTab === "stats" && stats && (
                                    <div className="space-y-8">
                                        <div className="flex flex-col gap-2">
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h2>
                                            <p className="text-sm text-slate-500 font-medium">Global analytics and performance indicators for the current period.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} trend={12} />
                                            <StatCard label="Daily Active" value={stats.dailyActiveUsers} icon={TrendingUp} trend={8} />
                                            <StatCard label="Verified" value={stats.onboardedUsers} icon={CheckCircle2} />
                                            <StatCard label="Downloads" value={stats.totalAppDownloads} icon={ArrowDownToLine} />
                                        </div>
                                    </div>
                                )}

                                {activeTab === "users" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h2>
                                                <p className="text-sm text-slate-500 font-medium">Search, moderate, and contact registered users.</p>
                                            </div>
                                            <div className="relative w-64">
                                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input 
                                                    className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all shadow-sm"
                                                    placeholder="Search users..."
                                                    value={searchQuery}
                                                    onChange={(e) => setSearchQuery(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {loading ? (
                                                [1,2,3,4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse border border-slate-100" />)
                                            ) : users.length > 0 ? (
                                                users.map(u => <UserItem key={u._id} user={u} onAction={handleAction} />)
                                            ) : (
                                                <div className="py-20 bg-white rounded-xl border border-dashed border-slate-200 text-center space-y-3">
                                                    <div className="size-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                                                        <Search size={22} />
                                                    </div>
                                                    <p className="text-sm font-semibold text-slate-400">No users found matching your search</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === "broadcast" && (
                                    <div className="max-w-xl space-y-8">
                                        <div className="space-y-2">
                                            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Global Announcements</h2>
                                            <p className="text-sm text-slate-500 font-medium">Dispatch a push notification to every registered device instantly.</p>
                                        </div>
                                        
                                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Announcement Content</label>
                                                <textarea 
                                                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:border-indigo-500 outline-none transition-all resize-none"
                                                    placeholder="What would you like to announce to the community?"
                                                    value={broadcastMsg}
                                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                                />
                                            </div>

                                            <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                                                <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                                <p className="text-xs text-amber-800 font-medium leading-relaxed italic">
                                                    Dispatching an announcement is an irreversible operation. Please verify the content for professional standards.
                                                </p>
                                            </div>

                                            <button 
                                                onClick={handleBroadcast}
                                                disabled={isBroadcasting || !broadcastMsg.trim()}
                                                className="w-full h-12 bg-slate-900 text-white rounded-xl font-bold text-sm tracking-tight hover:bg-slate-800 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isBroadcasting ? <Loader2 size={18} className="animate-spin" /> : <>Send Announcement <Send size={16} /></>}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "support" && (
                                    <div className="py-20 text-center space-y-4 opacity-40">
                                        <LifeBuoy size={48} className="mx-auto" />
                                        <p className="text-sm font-bold uppercase tracking-[0.2em]">Maintenance Mode Active</p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </main>

            {/* Direct Message Overlay */}
            <AnimatePresence>
                {targetedUser && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setTargetedUser(null)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative z-[101]"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                                        {targetedType === 'email' ? <Mail size={20} /> : <Megaphone size={20} />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900">Contact User</h3>
                                        <p className="text-xs text-slate-400 font-medium">Message for {targetedUser.fullName}</p>
                                    </div>
                                </div>
                                <button onClick={() => setTargetedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Subject</label>
                                    <input 
                                        type="text" 
                                        className="w-full h-11 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                                        placeholder="Enter subject line..."
                                        value={targetedSubject}
                                        onChange={(e) => setTargetedSubject(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Message Body</label>
                                    <textarea 
                                        className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all resize-none" 
                                        placeholder="Type your message here..."
                                        value={targetedBody}
                                        onChange={(e) => setTargetedBody(e.target.value)}
                                    />
                                </div>

                                <button 
                                    onClick={handleSendTargeted}
                                    disabled={isTargetedSending}
                                    className="w-full h-12 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                                >
                                    {isTargetedSending ? <Loader2 size={18} className="animate-spin" /> : <>Send Message <Send size={16} /></>}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
