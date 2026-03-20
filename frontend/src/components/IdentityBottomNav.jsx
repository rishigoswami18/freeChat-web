import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { 
    Home, Trophy, Wallet, BarChart3, User, 
    Newspaper, Compass, PlusSquare, MessageSquare, Bell,
    PlusCircle
} from "lucide-react";
import { useAppMode } from "../context/ModeContext";
import useAuthUser from "../hooks/useAuthUser";
import useNotificationCounts from "../hooks/useNotificationCounts";

const IdentityBottomNav = () => {
    const location = useLocation();
    const { appMode } = useAppMode();
    const { authUser } = useAuthUser();
    const { unreadMessages, notificationCount } = useNotificationCounts();

    const tabs = useMemo(() => {
        if (appMode === 'fantasy') {
            return [
                { to: "/", icon: Home, label: "Home" },
                { to: "/my-contests", icon: Trophy, label: "Contests" },
                { to: "/wallet", icon: Wallet, label: "Wallet" },
                { to: "/leaderboard", icon: BarChart3, label: "Rank" },
                { to: "/profile", icon: User, label: "Profile", isProfile: true }
            ];
        } else {
            return [
                { to: "/feed", icon: Newspaper, label: "Feed" },
                { to: "/friends", icon: Compass, label: "Explore" },
                { to: "/create", icon: PlusSquare, label: "Post", isCenter: true },
                { to: "/inbox", icon: MessageSquare, label: "Chat", badge: unreadMessages },
                { to: "/notifications", icon: Bell, label: "Alert", badge: notificationCount }
            ];
        }
    }, [appMode, unreadMessages, notificationCount]);

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] glass-panel-solid border-t border-white/5 safe-area-bottom pb-2">
            <div className="flex items-center justify-around py-2 px-1">
                {tabs.map((tab, i) => {
                    const isActive = location.pathname === tab.to;
                    const Icon = tab.icon;

                    if (tab.isCenter) {
                        return (
                            <button key={i} className="relative -top-6 size-14 bg-indigo-500 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/40 border-4 border-black active:scale-95 transition-transform">
                                <PlusCircle className="size-8 text-white" />
                            </button>
                        );
                    }

                    return (
                        <Link 
                            key={i} 
                            to={tab.to} 
                            className={`relative flex flex-col items-center gap-1 py-1 px-3 transition-all duration-300 ${
                                isActive ? (appMode === 'fantasy' ? 'text-orange-500' : 'text-indigo-400') : 'text-white/40'
                            }`}
                        >
                            <div className="relative">
                                {tab.isProfile ? (
                                    <div className={`size-6 rounded-full overflow-hidden border-2 transition-all ${
                                        isActive ? (appMode === 'fantasy' ? 'border-orange-500 scale-110' : 'border-indigo-400 scale-110') : 'border-transparent'
                                    }`}>
                                        <img src={authUser?.profilePic || "/avatar.png"} alt="Me" className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <Icon className={`size-6 transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                                )}
                                
                                {tab.badge > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[14px] h-3.5 px-0.5 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-black">
                                        {tab.badge > 9 ? "9+" : tab.badge}
                                    </span>
                                )}
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest ${isActive ? "opacity-100" : "opacity-0 invisible h-0"}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default IdentityBottomNav;
