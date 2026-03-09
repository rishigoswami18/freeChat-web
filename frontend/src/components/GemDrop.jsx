import { motion, AnimatePresence } from "framer-motion";
import { Gem, Flame, Sparkles, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { claimDailyReward } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const GemDrop = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [isVisible, setIsVisible] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [showBlast, setShowBlast] = useState(false);

    useEffect(() => {
        if (authUser) {
            const todayStr = new Date().toISOString().split('T')[0];
            const lastClaimDate = authUser.lastRewardClaimDate ? new Date(authUser.lastRewardClaimDate) : null;
            const lastClaimStr = lastClaimDate ? lastClaimDate.toISOString().split('T')[0] : null;

            if (lastClaimStr !== todayStr) {
                // Only show if not on a "distraction-free" page like chat or reels
                const path = window.location.pathname;
                if (!path.includes("/chat") && !path.includes("/call") && !path.includes("/reels")) {
                    // Delay briefly for impact
                    const timer = setTimeout(() => setIsVisible(true), 1500);
                    return () => clearTimeout(timer);
                }
            }
        }
    }, [authUser]);

    const handleClaim = async () => {
        if (isClaiming) return;
        setIsClaiming(true);

        try {
            if (window.AndroidBridge) window.AndroidBridge.vibrate(100);
            const res = await claimDailyReward();
            setShowBlast(true);

            toast.success(res.message, {
                icon: '💎',
                style: { borderRadius: '20px', background: '#1c1c1c', color: '#fff' }
            });

            queryClient.invalidateQueries({ queryKey: ["authUser"] });

            // Keep visible for blast animation
            setTimeout(() => {
                setIsVisible(false);
                setIsClaiming(false);
                setShowBlast(false);
            }, 1200);

        } catch (err) {
            toast.error(err.response?.data?.message || "Reward no longer available");
            setIsVisible(false);
            setIsClaiming(false);
        }
    };

    if (!authUser) return null;

    const nextMilestone = Math.ceil((authUser.streak + 1) / 7) * 7;
    const progress = (authUser.streak % 7) / 7 * 100;

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md lg:hidden"
                >
                    {/* Confetti Blast Layer */}
                    {showBlast && (
                        <div className="absolute inset-0 pointer-events-none overflow-hidden">
                            {[...Array(15)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                                    animate={{
                                        scale: [0, 1, 0.5],
                                        x: (Math.random() - 0.5) * 400,
                                        y: (Math.random() - 0.5) * 600,
                                        opacity: [1, 1, 0]
                                    }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                >
                                    <Gem className={`size-${Math.floor(Math.random() * 4) + 4} text-amber-400 fill-amber-300 shadow-lg`} />
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <motion.div
                        initial={{ scale: 0.5, y: 100, rotate: -10 }}
                        animate={{ scale: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 1.2, opacity: 0, filter: "blur(10px)" }}
                        transition={{ type: "spring", damping: 15 }}
                        className="w-full max-w-sm relative"
                    >
                        {/* Glossy Card */}
                        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 p-1 shadow-[0_20px_50px_rgba(245,158,11,0.5)] border border-white/30">

                            {/* Background Glow */}
                            <div className="absolute -top-24 -right-24 size-48 bg-white/20 blur-3xl rounded-full" />
                            <div className="absolute -bottom-24 -left-24 size-48 bg-black/20 blur-3xl rounded-full" />

                            <div className="relative bg-black/10 backdrop-blur-sm rounded-[30px] p-6 sm:p-8 flex flex-col items-center text-center gap-6">

                                {/* Visual Header */}
                                <div className="relative">
                                    <motion.div
                                        animate={{
                                            scale: [1, 1.1, 1],
                                            rotate: [0, 5, -5, 0]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="size-24 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-2xl"
                                    >
                                        <Gem className="size-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]" />
                                    </motion.div>
                                    <motion.div
                                        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="absolute -top-2 -right-2"
                                    >
                                        <Sparkles className="size-8 text-yellow-200 fill-yellow-100" />
                                    </motion.div>
                                </div>

                                {/* Text Content */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-[10px] font-black text-white/60 uppercase tracking-[0.4em]">Daily Drop</span>
                                        <div className="h-px w-8 bg-white/20" />
                                        <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full">
                                            <Flame className="size-3 text-white fill-white" />
                                            <span className="text-[10px] font-black text-white">{authUser.streak}d</span>
                                        </div>
                                    </div>
                                    <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">
                                        Gem Rain Incoming!
                                    </h2>
                                    <p className="text-sm text-white/80 font-medium px-4">
                                        Claim your daily dose of gems and keep your {authUser.streak} day streak alive.
                                    </p>
                                </div>

                                {/* Progress Bar */}
                                <div className="w-full space-y-2 px-2">
                                    <div className="flex justify-between items-end mb-1">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Streak Progress</span>
                                        <span className="text-xs font-black text-white tracking-widest">Day {authUser.streak}/{nextMilestone}</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden border border-white/10 p-0.5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                            className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                        />
                                    </div>
                                    {progress > 80 && (
                                        <p className="text-[9px] font-black text-white/70 uppercase tracking-tighter animate-pulse flex items-center justify-center gap-1">
                                            <TrendingUp className="size-3" /> Massive reward bonus at Day {nextMilestone}
                                        </p>
                                    )}
                                </div>

                                {/* Claim Button */}
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    disabled={isClaiming}
                                    onClick={handleClaim}
                                    className="w-full py-4 mt-2 rounded-2xl bg-white text-amber-600 font-black uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_15px_40px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-3 relative overflow-hidden"
                                >
                                    {isClaiming ? (
                                        <span className="loading loading-spinner loading-sm" />
                                    ) : (
                                        <>
                                            <Gem className="size-5" />
                                            Claim Drop
                                        </>
                                    )}
                                    {/* Glossy Sweep */}
                                    <motion.div
                                        animate={{ x: ["-100%", "200%"] }}
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent -skew-x-12"
                                    />
                                </motion.button>

                                <button
                                    onClick={() => setIsVisible(false)}
                                    className="text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white/60 transition-colors"
                                >
                                    Maybe Later
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GemDrop;
