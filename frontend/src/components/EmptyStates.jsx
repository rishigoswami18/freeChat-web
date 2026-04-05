import React from "react";
import { Briefcase, Bell, LayoutGrid, Sparkles, UserPlus, Globe } from "lucide-react";
import { motion } from "framer-motion";

/**
 * EmptyBusinessHubState - Professional empty state for the Business/Professional Hub
 */
export const EmptyBusinessHubState = ({ title = "Business Hub Ready", description = "Your professional growth starts here. Connect with experts and scale your business." }) => (
    <div className="relative w-full h-[400px] rounded-[3rem] bg-indigo-500/[0.02] border border-white/5 flex flex-col items-center justify-center p-12 text-center overflow-hidden">
        {/* Glow Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-6">
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="size-24 bg-white/[0.03] border border-white/10 rounded-[2rem] flex items-center justify-center mx-auto mb-2 shadow-2xl"
            >
                <Briefcase className="size-10 text-indigo-400/50" />
            </motion.div>
            
            <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white tracking-tight">
                    {title}
                </h3>
                <p className="text-white/30 text-sm max-w-sm mx-auto leading-relaxed">
                    {description}
                </p>
            </div>

            <button className="px-8 h-12 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl flex items-center gap-3 text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 group mx-auto">
                <Sparkles className="size-4 group-hover:rotate-12 transition-transform" /> Get Started
            </button>
        </div>
    </div>
);

/**
 * EmptyFeedState - When no posts are found
 */
export const EmptyFeedState = () => (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center space-y-6">
        <div className="size-20 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center mb-2">
            <LayoutGrid className="size-8 text-white/10" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Your feed is waiting</h3>
            <p className="text-sm text-white/30 max-w-xs mx-auto leading-relaxed">
                Connect with professionals and friends to see their latest updates here.
            </p>
        </div>
        <button className="h-11 px-6 bg-white text-black rounded-xl text-xs font-bold hover:bg-white/90 transition-all active:scale-95">
            Discover People
        </button>
    </div>
);

/**
 * EmptyNetworkState - When no friends/followers are found
 */
export const EmptyNetworkState = () => (
    <div className="p-12 rounded-[2.5rem] bg-white/[0.02] border border-dashed border-white/10 flex flex-col items-center text-center space-y-6">
        <div className="size-16 bg-white/[0.03] rounded-2xl flex items-center justify-center">
            <UserPlus className="size-8 text-indigo-400/40" />
        </div>
        <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Build your professional network</h3>
            <p className="text-xs text-white/30 max-w-xs leading-relaxed">
                Start following other creators and business leaders to grow your reach.
            </p>
        </div>
        <button className="h-10 px-6 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-500/20 transition-all">
            Find Professionals
        </button>
    </div>
);
