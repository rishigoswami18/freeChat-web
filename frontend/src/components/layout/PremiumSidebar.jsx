import React, { useState, memo } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Home, 
    Compass, 
    MessageSquare, 
    Bell, 
    User, 
    Wallet, 
    Settings, 
    Zap, 
    ChevronLeft, 
    ChevronRight,
    LogOut,
    Briefcase,
    LayoutGrid,
    Search,
    Shield,
    Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import useAuthUser from "../../hooks/useAuthUser";
import { logout } from "../../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Logo from "../Logo";

const navItems = [
    { id: "home", labelKey: "home", icon: Home, path: "/" },
    { id: "explore", labelKey: "explore", icon: Compass, path: "/friends" },
    { id: "messages", labelKey: "inbox", icon: MessageSquare, path: "/inbox" },
    { id: "notifications", labelKey: "notifications", icon: Bell, path: "/notifications" },
    { id: "pro-hub", labelKey: "desi_arena", icon: Briefcase, path: "/professional-hub" },
    { id: "wallet", labelKey: "wallet", icon: Wallet, path: "/wallet" },
    { id: "profile", labelKey: "profile", icon: User, path: "/profile" },
    { id: "settings", labelKey: "settings", icon: Settings, path: "/settings" },
];

const adminItems = [
    { id: "admin", labelKey: "admin_command", icon: Shield, path: "/admin" },
];

const PremiumSidebar = () => {
    const { authUser } = useAuthUser();
    const { t } = useTranslation();
    const location = useLocation();
    const queryClient = useQueryClient();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            queryClient.setQueryData(["authUser"], null);
            window.location.href = "/login";
        } catch {
            toast.error("Logout failed.");
        }
    };

    const isActive = (path) => {
        if (path === "/") return location.pathname === "/";
        return location.pathname.startsWith(path);
    };

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 88 : 280 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 h-screen hidden md:flex flex-col border-r border-white/5 bg-[#020617]/80 backdrop-blur-3xl"
        >
            {/* Header / Logo Section */}
            <div className="p-6 h-[88px] flex items-center justify-between border-b border-white/5 bg-white/[0.01]">
                <Logo showText={!isCollapsed} fontSize="text-xl" />

                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-white/40 border border-white/5 shadow-xl"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-8 no-scrollbar space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.id}
                        to={item.path}
                        className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                            isActive(item.path) 
                                ? "bg-primary/10 text-primary shadow-[inset_0_0_20px_rgba(99,101,241,0.05)] border border-primary/20" 
                                : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                        }`}
                    >
                        <div className={`p-2 rounded-xl transition-colors ${
                            isActive(item.path) ? "bg-primary text-white" : "bg-white/5 text-inherit group-hover:bg-white/10"
                        }`}>
                            <item.icon size={20} />
                        </div>
                        
                        {!isCollapsed && (
                            <div className="flex flex-col">
                                <span className={`text-sm font-black tracking-tight ${isActive(item.path) ? 'text-white' : ''}`}>
                                    {t(item.labelKey)}
                                </span>
                                {item.id === 'pro-hub' && (
                                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.15em] flex items-center gap-1 mt-0.5">
                                        <Sparkles size={8} /> {t(item.labelKey)}
                                    </span>
                                )}
                            </div>
                        )}

                        {isActive(item.path) && (
                            <motion.div 
                                layoutId="activePill"
                                className="absolute left-[-4px] top-4 w-1 h-6 rounded-r-full bg-primary"
                                transition={{ type: "spring", stiffness: 400, damping: 40 }}
                            />
                        )}
                    </Link>
                ))}

                {authUser?.role === "admin" && (
                    <div className="pt-6 mt-4 border-t border-white/5 space-y-2">
                        {!isCollapsed && (
                            <p className="px-5 text-[9px] font-black uppercase text-white/20 tracking-[0.3em] mb-4">System Console</p>
                        )}
                        {adminItems.map((item) => (
                            <Link
                                key={item.id}
                                to={item.path}
                                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                                    isActive(item.path) 
                                        ? "bg-rose-500/10 text-rose-500 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)] border border-rose-500/20" 
                                        : "text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent"
                                }`}
                            >
                                <div className={`p-2 rounded-xl transition-colors ${
                                    isActive(item.path) ? "bg-rose-500 text-white" : "bg-white/5 text-inherit group-hover:bg-white/10"
                                }`}>
                                    <item.icon size={20} />
                                </div>
                                
                                {!isCollapsed && (
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-black tracking-tight ${isActive(item.path) ? 'text-white' : ''}`}>
                                            {t(item.labelKey)}
                                        </span>
                                    </div>
                                )}

                                {isActive(item.path) && (
                                    <motion.div 
                                        layoutId="activePill"
                                        className="absolute left-[-4px] top-4 w-1 h-6 rounded-r-full bg-rose-500"
                                        transition={{ type: "spring", stiffness: 400, damping: 40 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </nav>

            {/* Footer Section / Profile Quick Access */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-4 overflow-hidden`}>
                    <img 
                        src={authUser?.profilePic || "/avatar.png"} 
                        alt="Profile" 
                        className="size-10 rounded-xl object-cover ring-2 ring-white/10"
                    />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-black text-white truncate truncate">@{authUser?.username}</p>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">
                                {authUser?.role}
                            </p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button 
                            onClick={handleLogout}
                            className="p-2 text-white/20 hover:text-rose-500 transition-colors"
                            title={t('logout')}
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
};

export default memo(PremiumSidebar);
