import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Trophy, Zap } from "lucide-react";
import { useAppMode } from "../context/ModeContext";

/**
 * ModeSwitcher - High-Performance Layout Toggle
 * Features: Framer Motion layout sync, Glassmorphism, Haptics (via context)
 */
const ModeSwitcher = () => {
    const { appMode, toggleMode } = useAppMode();

    return (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200]">
            <motion.div 
                className="bg-[#161B22]/60 backdrop-blur-xl border border-white/5 rounded-full p-2 flex items-center gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden group"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
                {/* Mode Indicator Glow */}
                <div className={`absolute inset-0 opacity-10 transition-colors duration-500 ${
                    appMode === 'social' ? 'bg-[#FF5722]' : 'bg-[#FF5722]'
                }`} />

                {/* Transition Indicator (Sliding Background) */}
                <div className="relative flex items-center gap-1 bg-white/5 rounded-full p-1">
                    <motion.div
                        layoutId="activeModeSelector"
                        className={`absolute inset-y-1 rounded-full z-0 bg-[#FF5722] shadow-[0_0_25px_rgba(255,87,34,0.4)]`}
                        initial={false}
                        animate={{
                            x: appMode === 'social' ? 0 : 100,
                            width: appMode === 'social' ? 100 : 100
                        }}
                        transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                    />

                    <button
                        onClick={() => appMode !== 'social' && toggleMode()}
                        className={`relative z-10 flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300 ${
                            appMode === 'social' ? 'text-white' : 'text-white/30 hover:text-white/50'
                        }`}
                    >
                        <Globe size={18} className={appMode === 'social' ? 'animate-pulse' : ''} />
                        <span className="text-[11px] font-black uppercase tracking-widest italic">Social</span>
                    </button>

                    <button
                        onClick={() => appMode !== 'fantasy' && toggleMode()}
                        className={`relative z-10 flex items-center gap-3 px-5 py-2.5 rounded-full transition-all duration-300 ${
                            appMode === 'fantasy' ? 'text-white' : 'text-white/30 hover:text-white/50'
                        }`}
                    >
                        <Trophy size={18} className={appMode === 'fantasy' ? 'animate-bounce' : ''} />
                        <span className="text-[11px] font-black uppercase tracking-widest italic">Fantasy</span>
                    </button>
                </div>
                
                {/* Secondary Info (App Name) */}
                <div className="px-5 py-2 border-l border-white/5 flex items-center gap-3 ml-2">
                    <div className="size-2 rounded-full bg-[#FF5722] animate-pulse shadow-[0_0_8px_rgba(255,87,34,0.8)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Zyro</span>
                </div>
            </motion.div>
        </div>
    );
};

export default ModeSwitcher;
