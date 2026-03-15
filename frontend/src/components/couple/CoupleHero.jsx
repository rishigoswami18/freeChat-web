import { memo } from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

/**
 * CoupleHero
 * Top section displaying "BONDBeyond", user's current streak and streak banner.
 */
const CoupleHero = memo(({ streakCount, showStreakBanner = true }) => {
    return (
        <div className="flex flex-col gap-10">
            {/* Header Titles */}
            <div className="flex items-center justify-between mb-2 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col"
                >
                    <h1 className="text-3xl sm:text-5xl font-black flex items-center gap-3 romantic-gradient-text tracking-tighter italic">
                        BONDBeyond
                        <span className="text-[10px] bg-primary/20 backdrop-blur-md text-primary border border-primary/20 px-3 py-1 rounded-full animate-pulse uppercase tracking-[0.2em] not-italic">v2.1 GOLD</span>
                    </h1>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mt-1 ml-1">THE WORLD'S BEST SOCIAL APP FOR COUPLES</p>
                </motion.div>

                {(streakCount || 0) > 0 && (
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex items-center gap-2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-red-500/40 border border-white/20"
                    >
                        <Flame className="size-5 fill-current animate-pulse" />
                        <span className="text-xl font-black italic tracking-tighter">{streakCount}</span>
                    </motion.div>
                )}
            </div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent -mt-2" />

            {/* Streak Hero Card */}
            {showStreakBanner && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ y: -5 }}
                    className={`card rounded-[40px] p-10 shadow-2xl relative overflow-hidden border-2 transition-all duration-700 ${(streakCount || 0) > 0
                        ? 'romantic-gradient-bg border-white/30 luxe-shadow-pink'
                        : 'bg-base-200 border-base-300'
                        }`}
                >
                    {/* Ultra Luxe Background Effects */}
                    {(streakCount || 0) > 0 && (
                        <>
                            <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-pulse" />
                            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/30 rounded-full blur-[60px]" />
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                        </>
                    )}
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                            <motion.div
                                animate={(streakCount || 0) > 0 ? {
                                    scale: [1, 1.15, 1],
                                    rotate: [0, 8, -8, 0],
                                    filter: ["drop-shadow(0 0 10px rgba(255,255,255,0.4))", "drop-shadow(0 0 25px rgba(255,255,255,0.8))", "drop-shadow(0 0 10px rgba(255,255,255,0.4))"]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className={`size-24 rounded-[32px] flex items-center justify-center text-5xl ${(streakCount || 0) > 0
                                    ? 'bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40'
                                    : 'bg-base-300'
                                    }`}>
                                {(streakCount || 0) > 0 ? '❤️‍🔥' : '❄️'}
                            </motion.div>
                            <div className="text-center sm:text-left">
                                <h3 className={`font-black text-[11px] uppercase tracking-[0.4em] ${(streakCount || 0) > 0 ? 'text-white/80' : 'opacity-40'}`}>
                                    ETERNAL SOUL BOND
                                </h3>
                                <p className={`text-8xl font-black italic tracking-tighter leading-none ${(streakCount || 0) > 0 ? 'text-white drop-shadow-2xl' : 'opacity-20'
                                    }`}>
                                    {streakCount || 0}
                                </p>
                                <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${(streakCount || 0) > 0 ? 'text-white/70' : 'opacity-30'}`}>
                                    {(streakCount || 0) > 0 ? "UNSTOPPABLE CONNECTION" : "LOGIN DAILY TO START"}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap sm:flex-col gap-3 justify-center items-end">
                            <div className="px-5 py-2 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                LEGENDARY STREAK
                            </div>
                            {(streakCount || 0) >= 7 && (
                                <div className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-amber-950 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-yellow-500/50 scale-110">
                                    ✨ ELITE COUPLE ✨
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
});

CoupleHero.displayName = "CoupleHero";
export default CoupleHero;
