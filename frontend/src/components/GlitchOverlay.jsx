import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppMode } from "../context/ModeContext";

const GlitchOverlay = () => {
    const { isRebooting, appMode } = useAppMode();

    return (
        <AnimatePresence>
            {isRebooting && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[999] bg-black flex flex-col items-center justify-center overflow-hidden pointer-events-none"
                >
                    {/* Background Glitch Lines */}
                    <div className="absolute inset-0 opacity-20">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <motion.div
                                key={i}
                                className="h-[2px] w-full bg-white absolute"
                                style={{ top: `${Math.random() * 100}%` }}
                                animate={{
                                    x: [-500, 500],
                                    opacity: [0, 1, 0]
                                }}
                                transition={{
                                    duration: 0.2,
                                    repeat: Infinity,
                                    delay: Math.random() * 0.5
                                }}
                            />
                        ))}
                    </div>

                    {/* Central Morphing Message */}
                    <div className="relative text-center space-y-4">
                        <motion.div
                            animate={{
                                skewX: [0, 20, -20, 0],
                                scale: [1, 1.1, 0.9, 1]
                            }}
                            transition={{ duration: 0.1, repeat: Infinity }}
                            className="text-6xl font-black italic tracking-tighter text-white"
                        >
                            MORPHING...
                        </motion.div>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: 300 }}
                            className="h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto"
                        />
                        <div className={`text-[10px] font-black uppercase tracking-[0.5em] transition-colors duration-300 ${
                            appMode === 'fantasy' ? 'text-indigo-400' : 'text-orange-400'
                        }`}>
                            Switching to {appMode === 'fantasy' ? 'Social Mode' : 'Fantasy Mode'}
                        </div>
                    </div>

                    {/* Circular Expansion Pulse */}
                    <motion.div
                        initial={{ scale: 0, opacity: 0.5 }}
                        animate={{ scale: 20, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "circIn" }}
                        className={`absolute size-10 rounded-full border-[20px] ${
                            appMode === 'fantasy' ? 'border-indigo-500' : 'border-orange-500'
                        }`}
                    />

                    {/* Matrix Digital Rain (Subtle) */}
                    <div className="absolute inset-0 flex justify-around opacity-10 pointer-events-none">
                        {Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="text-[8px] text-white font-mono flex flex-col">
                                {Array.from({ length: 50 }).map((_, j) => (
                                    <motion.span
                                        key={j}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: Math.random() * 2, repeat: Infinity }}
                                    >
                                        {Math.round(Math.random())}
                                    </motion.span>
                                ))}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default GlitchOverlay;
