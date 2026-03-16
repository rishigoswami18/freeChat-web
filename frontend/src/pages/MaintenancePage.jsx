import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Zap, Timer, BellRing } from "lucide-react";

/**
 * Maintenance & Hype Page — 'Antigravity' Edition
 * Built for the April 6th Launch event.
 */
const MaintenancePage = () => {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const launchDate = new Date("April 6, 2026 19:30:00").getTime();
        
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = launchDate - now;

            if (difference <= 0) {
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((difference % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-outfit">
            {/* Background Pulsing Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center relative z-10 max-w-2xl px-4"
            >
                <div className="flex justify-center mb-8">
                    <div className="size-20 bg-indigo-600 rounded-[30px] flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-12">
                        <Zap className="size-10 text-white fill-current" />
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-6 leading-none">
                    BRACE FOR <br/> <span className="text-indigo-500">IGNITION.</span>
                </h1>
                
                <p className="text-xl text-white/40 mb-12 font-medium">
                    The Antigravity Engine is priming for April 6. We are refining the code to handle 10M+ fans. Expect total domination.
                </p>

                {/* Countdown Grid */}
                <div className="grid grid-cols-4 gap-4 mb-16">
                    <TimeUnit value={timeLeft.days} label="Days" />
                    <TimeUnit value={timeLeft.hours} label="Hours" />
                    <TimeUnit value={timeLeft.minutes} label="Mins" />
                    <TimeUnit value={timeLeft.seconds} label="Secs" />
                </div>

                {/* Hype Input */}
                <div className="flex flex-col md:flex-row gap-4">
                    <input 
                        type="email" 
                        placeholder="Get notified for the coin-drop..." 
                        className="flex-1 bg-white/5 border border-white/10 rounded-3xl px-8 py-5 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <button className="bg-white text-black font-black uppercase tracking-widest px-10 py-5 rounded-3xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                        Notify Me <BellRing className="size-5" />
                    </button>
                </div>
            </motion.div>

            {/* Bottom Signature */}
            <div className="absolute bottom-10 left-10 flex items-center gap-3 opacity-30">
                <Timer className="size-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Priming: v2.4.6</span>
            </div>
        </div>
    );
};

const TimeUnit = ({ value, label }) => (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-3xl group hover:border-indigo-500/50 transition-colors">
        <p className="text-3xl md:text-5xl font-black italic text-indigo-400 mb-1 group-hover:scale-110 transition-transform">{String(value).padStart(2, '0')}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">{label}</p>
    </div>
);

export default MaintenancePage;
