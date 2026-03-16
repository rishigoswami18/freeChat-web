import React, { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Zap, TrendingUp, Trophy, ArrowRight, Star } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Antigravity One-Tap Prediction Card
 * Designed for zero-friction user journeys.
 * Features: Haptic simulation, glassmorphism, and dopamine-tuned animations.
 */
const AntigravityPrediction = ({ matchData = { team: "CSK", over: 19, question: "Will MS Dhoni hit a 6?" } }) => {
    const [isPending, setIsPending] = useState(false);
    const controls = useAnimation();

    const triggerHaptic = () => {
        if ("vibrate" in navigator) {
            navigator.vibrate([15, 30, 15]); // Sharp, "weightless" haptic pulse
        }
    };

    const handleOneTap = async (prediction) => {
        setIsPending(true);
        triggerHaptic();

        // Simulate ultra-fast network roundtrip
        await new Promise(r => setTimeout(r, 400));

        await controls.start({
            scale: [1, 1.05, 1],
            transition: { duration: 0.2 }
        });

        toast.success(`Bet Locked on ${prediction}! 🚀`, {
            style: { 
                borderRadius: '30px', 
                background: 'rgba(255, 255, 255, 0.1)', 
                backdropFilter: 'blur(20px)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.14)'
            }
        });
        setIsPending(false);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white/5 backdrop-blur-[40px] border border-white/10 rounded-[3.5rem] relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.5)]"
        >
            {/* The "Orbit" Glow */}
            <div className="absolute top-0 right-0 size-64 bg-indigo-500/20 blur-[100px] pointer-events-none group-hover:bg-indigo-500/40 transition-all duration-700" />
            
            <div className="relative z-10 space-y-8">
                <header className="flex justify-between items-center">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl">
                        <Zap className="size-6 text-indigo-400 fill-indigo-400/20" />
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">H-VELOCITY PREDICTION</p>
                        <p className="text-white font-black italic">OVER {matchData.over}.1</p>
                    </div>
                </header>

                <div className="space-y-2">
                    <h3 className="text-3xl font-black tracking-tighter leading-none">{matchData.question}</h3>
                    <p className="text-white/40 font-bold text-sm">Winning probability: <span className="text-green-400">72%</span></p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {['YES', 'NO'].map((option) => (
                        <motion.button
                            key={option}
                            whileHover={{ y: -5, scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isPending}
                            onClick={() => handleOneTap(option)}
                            className={`py-6 rounded-3xl font-black text-xl transition-all border ${
                                option === 'YES' 
                                ? 'bg-white text-black border-white' 
                                : 'bg-white/5 text-white border-white/10 hover:border-white/20'
                            }`}
                        >
                            {option}
                        </motion.button>
                    ))}
                </div>

                <footer className="pt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="flex -space-x-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="size-8 rounded-full border-2 border-[#121212] bg-gray-800" />
                        ))}
                        <div className="pl-4 text-[10px] font-black text-white/40 uppercase self-center tracking-widest">
                            +12K FANS BETTING
                        </div>
                    </div>
                    <Star className="size-4 text-orange-400 fill-orange-400 animate-pulse" />
                </footer>
            </div>
        </motion.div>
    );
};

export default AntigravityPrediction;
