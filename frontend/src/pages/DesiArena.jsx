import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Zap, Trophy, MessageSquare, Users, Globe, Volume2, Share2, Award, Flame } from "lucide-react";
import io from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
let socket;

const DesiArena = () => {
    const { t, i18n } = useTranslation();
    const { authUser } = useAuthUser();
    
    const [matchState, setMatchState] = useState({
        matchId: "ipl-2024-match-1",
        battingTeam: "CSK",
        score: "184/4",
        overs: "18.2",
        lastEvent: null
    });

    const [shoutout, setShoutout] = useState(null);
    const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);

    // --- Regional Shoutout Logic ---
    const triggerRegionalCelebration = useCallback((type) => {
        let message = "";
        if (type === "6") message = t("boundary_6");
        if (type === "4") message = t("boundary_4");
        if (type === "WICKET") message = t("wicket");

        if (message) {
            setShoutout(message);
            if (isVoiceEnabled) speak(message);
            setTimeout(() => setShoutout(null), 4000);
        }
    }, [t, isVoiceEnabled]);

    // --- Web Speech API for Regional Voice ---
    const speak = (text) => {
        if (!window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = i18n.language === 'en' ? 'en-IN' : 'hi-IN'; // Fallback to Hindi for regional
        utterance.rate = 1.1;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        socket = io(SOCKET_URL);

        socket.on("connect", () => {
            socket.emit("join_match", matchState.matchId);
        });

        socket.on("match_update", (data) => {
            setMatchState(prev => ({ ...prev, ...data }));
        });

        socket.on("special_event_blast", (data) => {
            triggerRegionalCelebration(data.type);
        });

        return () => socket.disconnect();
    }, [triggerRegionalCelebration, matchState.matchId]);

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        toast.success(`Language changed to ${lng.toUpperCase()}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0c14] text-white p-4 lg:p-10 font-outfit relative overflow-hidden">
            {/* Desi Ambient Lights (Saffron & Green) */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-[#FF9933]/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#138808]/10 blur-[120px] rounded-full" />

            {/* Regional Shoutout Overlay */}
            <AnimatePresence>
                {shoutout && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808] p-[3px] rounded-[40px] shadow-2xl">
                            <div className="bg-[#0a0c14] px-12 py-8 rounded-[38px] text-center">
                                <h2 className="text-6xl font-black italic tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                    {shoutout}
                                </h2>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-6xl mx-auto relative z-10 space-y-8">
                {/* Header: Language & Voice Controls */}
                <header className="flex flex-wrap justify-between items-center gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6">
                    <div className="flex gap-2">
                        {[
                            { code: "en", label: "English" },
                            { code: "hi", label: "हिंदी" },
                            { code: "pa", label: "ਪੰਜਾਬੀ" },
                            { code: "bho", label: "भोजपुरी" }
                        ].map((lang) => (
                            <button
                                key={lang.code}
                                onClick={() => changeLanguage(lang.code)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                                    i18n.language === lang.code 
                                    ? "bg-[#000080] text-white shadow-lg" 
                                    : "bg-white/5 text-white/40 hover:bg-white/10"
                                }`}
                            >
                                {lang.label}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                        className={`p-4 rounded-full transition-all ${isVoiceEnabled ? "bg-[#138808] text-white" : "bg-white/5 text-white/40"}`}
                    >
                        <Volume2 className="size-6" />
                    </button>
                </header>

                {/* Score Card: Desi Glassmorphism */}
                <motion.section 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[48px] p-10 shadow-2xl relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Trophy className="size-64" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                        <div className="text-center md:text-left space-y-2">
                            <span className="px-5 py-1.5 bg-[#FF9933] text-black rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                                {t('desi_arena')}
                            </span>
                            <h1 className="text-8xl font-black italic tracking-tighter text-white">
                                {matchState.score}
                            </h1>
                            <p className="text-lg font-bold text-white/40 uppercase tracking-widest">
                                {matchState.battingTeam} • {matchState.overs} OVERS
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 text-center">
                                <p className="text-[10px] font-black text-white/30 uppercase mb-1">Target</p>
                                <p className="text-3xl font-black">202</p>
                            </div>
                            <div className="bg-[#138808]/20 p-6 rounded-[32px] border border-[#138808]/30 text-center">
                                <p className="text-[10px] font-black text-[#138808] uppercase mb-1">Req R/R</p>
                                <p className="text-3xl font-black">10.4</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Social Hub */}
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                        <h3 className="text-xl font-black flex items-center gap-3 italic tracking-tight">
                            <MessageSquare className="size-6 text-[#FF9933]" /> {t('ipl_arena')} Chat
                        </h3>
                        <div className="h-64 bg-black/40 rounded-[32px] border border-white/5 flex items-center justify-center p-6 text-center">
                            <p className="text-sm font-medium text-white/30 italic">
                                "MSD humara hai!" - 2.4K People Typing...
                            </p>
                        </div>
                    </div>

                    {/* Referral Chain: Desi Coins */}
                    <div className="bg-gradient-to-br from-[#000080]/40 to-indigo-900/10 border border-[#000080]/30 rounded-[40px] p-8 flex flex-col justify-between overflow-hidden relative group">
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-amber-500 rounded-2xl">
                                    <Flame className="size-6 text-white" />
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase">{t('invite_village')}</h3>
                            </div>
                            <p className="text-sm font-bold text-white/60">
                                Send an invite to your friends in the village and get **500 Desi Coins** instantly when they join their first match arena!
                            </p>
                            <button className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl">
                                <Share2 className="size-5" /> Copy Invite Link
                            </button>
                        </div>
                        <Globe className="size-40 text-blue-500/10 absolute -right-10 -bottom-10 group-hover:rotate-12 transition-transform duration-1000" />
                    </div>
                </div>

                {/* Leaderboard Snippet */}
                <footer className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="size-16 rounded-[24px] bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Award className="size-8" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black">Top Village Predictors</h4>
                            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Winning Daily Lassi Kits & Coins</p>
                        </div>
                    </div>
                    <div className="flex -space-x-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="size-12 rounded-full border-4 border-[#0a0c14] bg-white/10 shadow-lg" />
                        ))}
                        <div className="size-12 rounded-full border-4 border-[#0a0c14] bg-[#000080] flex items-center justify-center text-[10px] font-black">
                            +42
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default DesiArena;
