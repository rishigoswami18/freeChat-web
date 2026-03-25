import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo = ({ className = "size-8", showText = true, fontSize = "text-2xl", streak = 0 }) => {
    return (
        <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center">
                    {/* Elite Aura Glow */}
                    <motion.div
                        animate={{
                            opacity: [0.1, 0.25, 0.1],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -inset-6 bg-primary/15 rounded-full blur-[40px] pointer-events-none"
                    />

                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="size-12 rounded-2xl bg-[#080B14] border border-white/10 flex items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)] group"
                    >
                        {/* Dynamic Shifting Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 opacity-40" />

                        {/* Premium 'Z' Lightning Vector */}
                        <svg viewBox="0 0 24 24" fill="none" className="size-7 text-[#F97316] drop-shadow-[0_0_6px_rgba(249,115,22,0.8)]" xmlns="http://www.w3.org/2000/svg">
                            <motion.path
                                d="M3.5 4.5H17.5L6.5 19.5H20.5" // Mathematically centered sharp Z
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 2, ease: "anticipate" }}
                            />
                            {/* The 'Edge' Accent Strike */}
                            <path d="M14 11L18 7.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" className="animate-pulse" />
                        </svg>

                        {/* High-Performance Gloss Sweep (Isolated to avoid clipping shadow) */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out" />
                        </div>
                    </motion.div>
                </div>

                {showText && (
                    <div className="flex flex-col overflow-visible select-none transition-all duration-300">
                        <div className="flex items-baseline gap-0.5">
                            <span className={`${fontSize} font-black tracking-[-0.05em] text-base-content leading-none transition-colors duration-300 group-hover:text-primary`}>
                                ZYRO
                            </span>
                            <div className="size-1.5 rounded-full bg-primary shadow-[0_0_10px_rgba(249,115,22,1)]" />
                        </div>
                        {/* Hidden on small mobile screens to prevent layout break */}
                        <div className="hidden sm:flex items-center gap-1.5 mt-1.5 opacity-40 group-hover:opacity-100 transition-all duration-500">
                             <div className="h-[1px] w-4 bg-primary/50" />
                             <span className="text-[8px] font-black uppercase tracking-[0.5em] text-base-content whitespace-nowrap">
                                THE SOCIAL EDGE
                             </span>
                        </div>
                    </div>
                )}
            </Link>

            {streak > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 rounded-full border border-primary/20 text-primary ml-1"
                >
                    <Flame className="size-3.5 fill-current" />
                    <span className="font-bold text-xs">{streak}</span>
                </motion.div>
            )}
        </div>
    );
};

export default Logo;
