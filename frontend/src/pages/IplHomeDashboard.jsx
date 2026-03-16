import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { 
    Trophy, Zap, Users, TrendingUp, ChevronRight, 
    MessageSquare, Award, Flame, Star, Bell 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import IplPredictionPopup from "../components/IplPredictionPopup";

// Lazy Load heavy components for <1.5s TTI
const FanPulse = React.lazy(() => import("../components/FanPulse.jsx"));

/**
 * Sticky Live Score Header - 'Antigravity' Layout
 */
const StickyScoreHeader = React.memo(({ matchData }) => {
    const { t } = useTranslation();
    const isCSK = matchData.battingTeam === "CSK";
    
    return (
        <motion.div 
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="sticky top-0 z-[100] w-full px-4 py-3"
        >
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-4 flex items-center justify-between shadow-2xl overflow-hidden relative">
                {/* Team Glow Effect */}
                <div className={`absolute inset-0 opacity-20 bg-gradient-to-r ${isCSK ? 'from-amber-500' : 'from-red-600'} to-transparent`} />
                
                <div className="flex items-center gap-4 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">{t('ipl_arena')}</span>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-black italic">{matchData.score}</h2>
                            <span className="px-2 py-0.5 bg-red-500 rounded-md text-[9px] font-black animate-pulse">LIVE</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                    <div className="text-right">
                        <p className="text-[9px] font-bold text-white/40 uppercase">Overs</p>
                        <p className="font-black italic">{matchData.overs}</p>
                    </div>
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Bell className="size-5 text-white/60" />
                    </div>
                </div>
            </div>
        </motion.div>
    );
});

/**
 * Swipeable Prediction Carousel
 */
const PredictionCarousel = ({ questions, onPredict }) => {
    const { t } = useTranslation();
    const [index, setIndex] = useState(0);

    return (
        <div className="relative h-64 w-full px-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={index}
                    initial={{ x: 300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    onDragEnd={(e, { offset, velocity }) => {
                        if (offset.x < -100) setIndex((prev) => (prev + 1) % questions.length);
                        if (offset.x > 100) setIndex((prev) => (prev - 1 + questions.length) % questions.length);
                    }}
                    className="absolute inset-x-4 bg-gradient-to-br from-indigo-600 to-violet-800 rounded-[40px] p-8 shadow-xl flex flex-col justify-between cursor-grab active:cursor-grabbing"
                >
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4 text-amber-400 fill-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Quick Prediction</span>
                        </div>
                        <h3 className="text-2xl font-black italic leading-tight">{questions[index].text}</h3>
                    </div>

                    <div className="flex gap-3">
                        {questions[index].options.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => onPredict(opt)}
                                className="flex-1 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-sm font-black transition-all"
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>
            
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                {questions.map((_, i) => (
                    <div key={i} className={`size-1.5 rounded-full transition-all ${i === index ? 'w-4 bg-indigo-500' : 'bg-white/20'}`} />
                ))}
            </div>
        </div>
    );
};

const IplHomeDashboard = () => {
    const { t, i18n } = useTranslation();
    const { authUser } = useAuthUser();
    
    // Dynamic Theme Color Mapping
    const themeColors = {
        CSK: "bg-[#FDB913]",
        RCB: "bg-[#D11D26]",
        MI: "bg-[#004BA0]",
        DEFAULT: "bg-[#050505]"
    };

    const [currentTheme, setCurrentTheme] = useState("CSK");

    const questions = [
        { id: 1, text: "Next Ball: Boundary?", options: ["Yes", "No"] },
        { id: 2, text: "Runs in this Over?", options: ["0-5", "6-10", "11+"] },
        { id: 3, text: "Who takes next wicket?", options: ["Siraj", "Hasaranga"] }
    ];

    const matchData = {
        score: "184/4",
        overs: "18.2",
        battingTeam: currentTheme,
        predictionPrompt: t('next_ball'),
    };

    return (
        <div className={`min-h-screen ${themeColors[currentTheme] || themeColors.DEFAULT} transition-colors duration-1000 font-outfit text-white relative`}>
            {/* Glossy Overlay to maintain BondBeyond look */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[100px] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col pb-24">
                <StickyScoreHeader matchData={matchData} />

                <main className="flex-1 space-y-10 py-6">
                    {/* Welcome Header */}
                    <div className="px-6 space-y-1">
                        <h1 className="text-4xl font-black tracking-tighter italic">
                            {t('welcome')}, {authUser?.fullName.split(' ')[0]}!
                        </h1>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                            {t('desi_arena')} is Heating Up 🔥
                        </p>
                    </div>

                    {/* Regional Community Pulse */}
                    <div className="px-6">
                        <Suspense fallback={<div className="h-48 bg-white/5 animate-pulse rounded-[40px]" />}>
                            <FanPulse 
                                teamA="CSK" 
                                teamB="RCB" 
                                stats={{ teamA: 74, teamB: 26, trendingEmotion: "Excited" }} 
                            />
                        </Suspense>
                    </div>

                    {/* Prediction Section */}
                    <PredictionCarousel 
                        questions={questions} 
                        onPredict={(val) => toast.success(`Predicted: ${val}`)}
                    />

                    {/* Featured Event Card */}
                    <div className="px-6">
                        <div className="bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 rounded-[40px] p-8 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 size-40 bg-indigo-500/20 blur-3xl animate-pulse" />
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-3 bg-amber-500 rounded-2xl shadow-glow">
                                    <Trophy className="size-6 text-white" />
                                </div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Week 1 Finale</span>
                            </div>
                            <h4 className="text-2xl font-black italic mb-2">CSK vs RCB Mega Arena</h4>
                            <p className="text-sm font-medium text-white/50 mb-6 italic leading-relaxed">
                                Join 100K fans for the biggest prediction clash of the season. 5,00,000 Bond Coins up for grabs!
                            </p>
                            <button className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3">
                                Enter Mega Arena <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Global Prediction Logic */}
            <IplPredictionPopup userId={authUser?._id} matchId="match-01" />

            <style dangerouslySetInnerHTML={{ __html: `
                .shadow-glow { filter: drop-shadow(0 0 10px #F59E0B); }
            `}} />
        </div>
    );
};

export default IplHomeDashboard;
