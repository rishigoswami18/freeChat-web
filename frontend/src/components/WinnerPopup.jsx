import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Gift, ArrowRight, Music, X } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * Match Winner Popup — 'Antigravity' Celebration
 * Triggered via Socket.io when user ranks in Top 10.
 */
const WinnerPopup = ({ rank, prizeName, anthemUrl, onClose }) => {
    const [audio] = useState(new Audio(anthemUrl || "/assets/anthems/default.mp3"));

    useEffect(() => {
        // 1. Trigger Golden Confetti Blast
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 }, colors: ['#fbbf24', '#f59e0b', '#ffffff'] });
        }, 250);

        // 2. Play Team Anthem (Muted by default/User interaction required usually)
        audio.volume = 0.4;
        audio.play().catch(e => console.log("Audio play blocked by browser."));

        return () => {
            audio.pause();
            clearInterval(interval);
        };
    }, [audio]);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
        >
            <motion.div
                initial={{ scale: 0.8, y: 50, rotate: -5 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                className="bg-gradient-to-b from-amber-500 to-amber-700 w-full max-w-md rounded-[50px] p-10 text-center relative overflow-hidden shadow-[0_0_100px_rgba(245,158,11,0.3)]"
            >
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 bg-white/20 blur-[60px] rounded-full" />
                
                <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-black/20 rounded-full hover:bg-black/40 transition-colors">
                    <X className="size-5 text-white" />
                </button>

                <div className="relative z-10">
                    <div className="size-24 bg-white rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl rotate-3">
                        <Trophy className="size-12 text-amber-500 animate-bounce" />
                    </div>

                    <h2 className="text-4xl font-black italic tracking-tighter text-white mb-2 uppercase">Match MVP!</h2>
                    <p className="text-white/80 font-bold mb-8 text-sm uppercase tracking-[0.2em]">Ranked #{rank} Globally</p>

                    <div className="bg-black/20 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/10">
                        <div className="flex items-center gap-4 text-left">
                            <div className="size-12 bg-white/10 rounded-2xl flex items-center justify-center mt-1">
                                <Gift className="size-6 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Unlocked Reward</p>
                                <p className="text-xl font-black text-white italic">{prizeName}</p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = "/prize-vault"}
                        className="w-full h-16 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        Go to Prize Vault <ArrowRight className="size-4" />
                    </button>
                    
                    <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                        <Music className="size-3 text-white" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Playing Team Anthem</span>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default WinnerPopup;
