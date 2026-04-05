import { useState, useEffect, memo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { acceptFriendRequest, getFriendRequests, getNotifications, markNotificationsAsRead } from "../lib/api";
import { Bell, UserCheck, Inbox, Heart, Sparkles, BadgeCheck, DollarSign, MessageCircle, UserPlus, RefreshCw, AlertCircle, CheckCircle2, MoreHorizontal } from "lucide-react";
import { ChatSkeleton, ProfileSkeleton } from "../components/Skeletons";
import { motion, AnimatePresence } from "framer-motion";
import { DateTime } from "luxon";
import { useMemo } from "react";

const NotificationsPage = () => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("activity");

    // 1. Fetch Friend Requests
    const { data: friendRequests, isLoading: requestsLoading, isError: requestsError, refetch: refetchRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: () => getFriendRequests(),
    });

    // 2. Fetch Engagement Notifications
    const { data: notifications = [], isLoading: notificationsLoading, isError: notificationsError, refetch: refetchNotifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => getNotifications(),
        refetchInterval: 30000,
    });

    // 3. Mutations
    const { mutate: acceptRequestMutation, isPending: isAccepting } = useMutation({
        mutationFn: acceptFriendRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
    });

    const { mutate: markRead } = useMutation({
        mutationFn: markNotificationsAsRead,
        onSuccess: () => {
            queryClient.setQueryData(["notifications"], (old) =>
                old?.map(n => ({ ...n, isRead: true }))
            );
        }
    });

    useEffect(() => {
        if (activeTab === "activity" && notifications.some(n => !n.isRead)) {
            markRead();
        }
    }, [activeTab, notifications, markRead]);

    const incomingRequests = (friendRequests?.incomingReqs || []).filter(req => req.sender);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const tabs = [
        { id: "activity", label: "Activity", icon: Bell, count: unreadCount },
        { id: "requests", label: "Requests", icon: UserCheck, count: incomingRequests.length }
    ];

    const getIconForType = (type) => {
        switch (type) {
            case "FOLLOW": return <UserPlus className="size-4 text-sky-400" />;
            case "POST_UNLOCK": return <DollarSign className="size-4 text-emerald-400" />;
            case "CHAT_UNLOCK": return <MessageCircle className="size-4 text-amber-400" />;
            case "GIFT": return <Heart className="size-4 text-rose-400" />;
            default: return <Sparkles className="size-4 text-indigo-400" />;
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen pb-24 bg-[#020617] text-white selection:bg-indigo-500/30 selection:text-indigo-200">
            {/* Header Area */}
            <header className="sticky top-0 z-30 bg-[#020617]/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-xl mx-auto px-6 py-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500/80 mb-1 block">Account Center</span>
                            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                                Notifications
                            </h1>
                        </div>
                        <button 
                            onClick={() => markRead()}
                            className="p-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 transition-colors group"
                            title="Mark all as read"
                        >
                            <CheckCircle2 className="size-5 text-white/40 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {/* Pill Tabs */}
                    <div className="flex mt-8 p-1 bg-white/[0.03] border border-white/5 rounded-2xl">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 relative py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                                    activeTab === tab.id ? "text-white" : "text-white/40 hover:text-white/60"
                                }`}
                            >
                                <tab.icon className={`size-4 ${activeTab === tab.id ? "scale-110" : ""}`} />
                                {tab.label}
                                {tab.count > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-md bg-indigo-500 text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20">
                                        {tab.count}
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="active-pill"
                                        className="absolute inset-0 bg-white/5 border border-white/10 rounded-xl -z-10 shadow-sm"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-6 mt-8">
                {(requestsLoading || notificationsLoading) ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-[88px] w-full rounded-2xl bg-white/[0.02] border border-white/5 relative overflow-hidden animate-pulse">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            </div>
                        ))}
                    </div>
                ) : (notificationsError || requestsError) ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-white/10 rounded-3xl bg-white/[0.01]">
                        <div className="p-4 rounded-full bg-rose-500/10 mb-6">
                            <AlertCircle className="size-8 text-rose-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">Connection Issues</h3>
                        <p className="text-sm text-white/40 max-w-[240px] mb-8 leading-relaxed">
                            Something went wrong while fetching your updates.
                        </p>
                        <button 
                            onClick={() => { refetchRequests(); refetchNotifications(); }} 
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black text-xs font-bold transition-transform active:scale-95"
                        >
                            <RefreshCw size={14} /> Try again
                        </button>
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        {activeTab === "requests" ? (
                            <motion.div
                                key="requests"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="space-y-3"
                            >
                                {incomingRequests.length > 0 ? (
                                    incomingRequests.map((request) => (
                                        <motion.div
                                            key={request._id}
                                            variants={itemVariants}
                                            className="group p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-2xl flex items-center gap-4 transition-all"
                                        >
                                            <div className="relative">
                                                <div className="size-14 rounded-2xl overflow-hidden bg-white/5 ring-1 ring-white/10">
                                                    <img
                                                        src={request.sender.profilePic || "/avatar.png"}
                                                        alt=""
                                                        className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <h3 className="text-sm font-bold truncate">
                                                        {request.sender.fullName}
                                                    </h3>
                                                    {(request.sender.isVerified || request.sender.role === "admin") && (
                                                        <BadgeCheck className="size-3.5 text-sky-400 fill-sky-400/10" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-white/40 truncate">
                                                    sent you a connection request
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => acceptRequestMutation(request._id)}
                                                    disabled={isAccepting}
                                                    className="px-5 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-[11px] font-bold text-white shadow-lg shadow-indigo-500/20 transition-all"
                                                >
                                                    {isAccepting ? <span className="loading loading-spinner loading-xs" /> : "Accept"}
                                                </button>
                                                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
                                                    <MoreHorizontal className="size-4 text-white/40" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                                        <div className="size-20 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 relative">
                                            <div className="absolute inset-0 rounded-[32px] border border-indigo-500/20 animate-ping opacity-20" />
                                            <UserCheck className="size-10 text-indigo-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">No Network Requests</h3>
                                        <p className="text-xs text-white/40 max-w-[200px]">New professional connections will appear here.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="activity"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                                exit="hidden"
                                className="space-y-3"
                            >
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <motion.div
                                            key={notification._id}
                                            variants={itemVariants}
                                            className={`p-4 rounded-2xl border transition-all flex items-start gap-4 ${
                                                !notification.isRead 
                                                ? "bg-indigo-500/[0.03] border-indigo-500/10" 
                                                : "bg-white/[0.02] border-white/5 hover:border-white/10"
                                            }`}
                                        >
                                            <div className="relative shrink-0 mt-1">
                                                <div className="size-11 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10">
                                                    <img
                                                        src={notification.sender.profilePic || "/avatar.png"}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className={`absolute -bottom-1 -right-1 p-1 rounded-md border-2 border-[#020617] bg-white shadow-sm`}>
                                                    {getIconForType(notification.type)}
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-bold text-white/90">
                                                        @{notification.sender.username}
                                                    </span>
                                                    <span className="text-[10px] text-white/20 font-medium font-mono uppercase tracking-wider">
                                                        {DateTime.fromISO(notification.createdAt).toRelative()}
                                                    </span>
                                                </div>
                                                <p className="text-[13px] text-white/60 leading-relaxed font-medium">
                                                    {notification.content.replace(notification.sender.fullName, "").trim()}
                                                </p>
                                            </div>
                                            
                                            {!notification.isRead && (
                                                <div className="mt-2.5 size-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                                            )}
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-32 text-center opacity-60">
                                        <div className="size-20 rounded-[32px] bg-white/5 flex items-center justify-center mb-6 relative">
                                            <div className="absolute inset-0 rounded-[32px] border border-white/5 animate-pulse opacity-20" />
                                            <Inbox className="size-10 text-white/20" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">Inbox Empty</h3>
                                        <p className="text-xs text-white/40 max-w-[200px]">We'll notify you when something happens.</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                )}
            </main>

            {/* Subtle background effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-rose-500/5 blur-[100px] rounded-full" />
                <div className="bg-noise opacity-[0.02] absolute inset-0" />
            </div>
        </div>
    );
};

export default memo(NotificationsPage);

