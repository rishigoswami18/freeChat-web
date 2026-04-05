import { Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Logo = ({ className = "size-8", showText = true, fontSize = "text-2xl", streak = 0 }) => {
    return (
        <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-3 group">
                <div className="relative flex items-center justify-center">
                    {/* Ambient Glow */}
                    <motion.div
                        animate={{
                            opacity: [0.08, 0.2, 0.08],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="absolute -inset-6 bg-indigo-500/20 rounded-full blur-[40px] pointer-events-none"
                    />

                    <motion.div
                        whileHover={{ scale: 1.05, rotate: -2 }}
                        whileTap={{ scale: 0.95 }}
                        className="size-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center relative z-10 shadow-xl shadow-indigo-500/25 group transition-all"
                    >
                        {/* Premium 'F' Mark */}
                        <svg viewBox="0 0 24 24" fill="none" className="size-6 text-white drop-shadow-sm" xmlns="http://www.w3.org/2000/svg">
                            <motion.path
                                d="M7 4H17M7 4V20M7 12H15"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 1.5, ease: "anticipate" }}
                            />
                        </svg>

                        {/* Gloss Sweep */}
                        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 translate-x-full group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out" />
                        </div>
                    </motion.div>
                </div>

                {showText && (
                    <div className="flex flex-col overflow-visible select-none">
                        <div className="flex items-baseline gap-1">
                            <span className={`${fontSize} font-extrabold tracking-[-0.03em] text-white leading-none transition-all duration-300 group-hover:text-indigo-400`}>
                                FreeChat
                            </span>
                        </div>
                        <div className="hidden sm:flex items-center gap-1.5 mt-0.5">
                             <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/30 whitespace-nowrap">
                                Social Platform
                             </span>
                        </div>
                    </div>
                )}
            </Link>

            {streak > 0 && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-500 ml-1"
                >
                    <Flame className="size-3.5 fill-current" />
                    <span className="font-bold text-xs">{streak}</span>
                </motion.div>
            )}
        </div>
    );
};

export default Logo;
