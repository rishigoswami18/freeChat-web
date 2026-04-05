import React, { useState, memo, useCallback } from "react";
import { Search, Bell, Menu, Plus, LayoutGrid, User, Settings, LogOut, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthUser from "../../hooks/useAuthUser";
import useLogout from "../../hooks/useLogout";
import { logout } from "../../lib/api";
import { Link } from "react-router-dom";
import LanguageSelector from "../LanguageSelector";
import ThemeSelector from "../ThemeSelector";

/**
 * PremiumNavbar
 * High-status navigation orchestrator for the FreeChat Nexus.
 * Manages identity access and global discovery with high-fidelity interactions.
 */
const PremiumNavbar = ({ onMenuClick }) => {
    const { authUser } = useAuthUser();
    const { logoutMutation } = useLogout();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const handleLogout = useCallback(() => {
        setIsProfileOpen(false);
        logoutMutation();
    }, [logoutMutation]);

    return (
        <header className="sticky top-0 z-40 w-full bg-[#020617]/60 backdrop-blur-xl border-b border-white/5">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
                
                {/* Search Bar - Professional Focus */}
                <div className="flex-1 max-w-md hidden md:block">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30 group-focus-within:text-primary transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Explore creators, posts, or trends..." 
                            className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
                        />
                    </div>
                </div>

                {/* Mobile Menu Trigger */}
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 text-white/60 hover:text-white transition-colors"
                >
                    <Menu size={24} />
                </button>

                {/* Action Suite */}
                <div className="flex items-center gap-2">
                    
                    {/* Create Button (Premium Feel) */}
                    <button className="hidden sm:flex items-center gap-2 h-10 px-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 mr-2">
                        <Plus size={16} />
                        <span>Create</span>
                    </button>

                    <LanguageSelector size="btn-md" />
                    <div className="ml-1">
                        <ThemeSelector />
                    </div>

                </div>
            </div>

            {/* Sub-navbar Ambient Trace */}
            <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-20" />
        </header>
    );
};

export default memo(PremiumNavbar);
