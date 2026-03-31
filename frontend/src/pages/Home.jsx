import React, { useState, useEffect, useMemo, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
    Zap, Trophy, TrendingUp, Users, DollarSign,
    ShieldCheck, Bell, ChevronRight, Play, LayoutGrid,
    MessageSquare, Award, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StrategicAiWidget from "../components/StrategicAiWidget";
import useAuthUser from "../hooks/useAuthUser";
import { useMatch } from "../context/MatchContext";
import { DateTime } from "luxon";
import IplPredictionPopup from "../components/IplPredictionPopup";
import GlobalErrorBoundary from "../components/GlobalErrorBoundary";
import { HeroSkeleton, PulseSkeleton, MatchListSkeleton } from "../components/Skeletons";
import { EmptyArenaState } from "../components/EmptyStates";
import UpcomingMatchesWidget from "../components/UpcomingMatchesWidget";
import LiveTicker from "../components/LiveTicker";
import LiveArenaGrid from "../components/LiveArenaGrid";
import IPLPlayersList from "../components/IPLPlayersList";

// Lazy Load heavy components
const FanPulse = React.lazy(() => import("../components/FanPulse.jsx"));

/**
 * Hero Arena Widget — The 'Antigravity' Heart of Zyro.
 * Automatically toggles between Live Arena and Upcoming Countdown.
 */
const HeroArenaWidget = ({ matchData, upcomingMatches, isMatchToday }) => {
    const [displayTime, setDisplayTime] = useState("");
    const [isBoundary, setIsBoundary] = useState(false);

    // API PROOF: Logging data from database
    useEffect(() => {
        if (upcomingMatches?.length > 0) {
            console.log("🏟️ [API PROOF] Upcoming Match from DB:", {
                id: upcomingMatches[0]._id,
                name: upcomingMatches[0].matchName,
                time: upcomingMatches[0].startTime,
                venue: upcomingMatches[0].venue
            });
        }
    }, [upcomingMatches]);

    // Boundary Detection for Glow Effect
    useEffect(() => {
        if (matchData?.lastBall?.includes("4") || matchData?.lastBall?.includes("6")) {
            setIsBoundary(true);
            setTimeout(() => setIsBoundary(false), 3000);
        }
    }, [matchData?.lastBall]);

    // Countdown Logic for Next Match
    useEffect(() => {
        const isLive = matchData?.status === "live";
        if (!isLive && upcomingMatches?.length > 0) {
            const updateTimer = () => {
                const nextMatch = upcomingMatches[0];
                const now = DateTime.now();
                const start = DateTime.fromISO(nextMatch.startTime);

                if (!start.isValid) {
                    setDisplayTime("Schedule TBA");
                    return;
                }

                const diff = start.diff(now);
                const hoursToMatch = diff.as("hours");

                if (hoursToMatch <= 0) {
                    setDisplayTime("Match Starting...");
                } else if (hoursToMatch > 24) {
                    setDisplayTime(start.toFormat("d LLL, hh:mm a"));
                } else {
                    const countdown = start.diff(now, ["hours", "minutes", "seconds"]).toObject();
                    const h = Math.floor(countdown.hours || 0);
                    const m = Math.floor(countdown.minutes || 0);
                    const s = Math.floor(countdown.seconds || 0);
                    setDisplayTime(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
                }
            };

            updateTimer();
            const timer = setInterval(updateTimer, 1000);
            return () => clearInterval(timer);
        }
    }, [matchData?.status, upcomingMatches]);

    const isLive = matchData?.status === "live";
    const currentMatch = isLive ? matchData : (upcomingMatches?.[0] || {});
    const hoursToStart = upcomingMatches?.[0] ? DateTime.fromISO(upcomingMatches[0].startTime).diffNow("hours").hours : 999;

    return (
        <motion.div
            animate={isBoundary ? { scale: [1, 1.02, 1] } : {}}
            className={`relative w-full overflow-hidden rounded-[40px] border border-white/10 shadow-3xl transition-all duration-700 ${isBoundary ? "shadow-[0_0_80px_rgba(251,191,36,0.3)] border-amber-500/50" : ""
                }`}
        >
            {/* Dynamic Backgrounds */}
            <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${isLive ? "bg-gradient-to-br from-red-600 via-orange-600 to-black" : "bg-gradient-to-br from-indigo-900 via-slate-900 to-black"
                }`} />

            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-1" />

            <AnimatePresence>
                {isBoundary && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-amber-400/10 blur-[50px] z-2"
                    />
                )}
            </AnimatePresence>

            <div className="relative z-10 p-5 md:p-10 h-72 md:h-80 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-2">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 ${isLive ? "bg-red-600 animate-pulse" : "bg-indigo-600"
                            }`}>
                            <div className={`size-2 rounded-full bg-white ${isLive ? "animate-ping" : ""}`} />                            {isLive ? "LIVE ARENA" : "FEATURED ARENA"}
                        </div>
                        <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] ml-1">
                            {matchData?.seriesName || "Global Cricket Hub"}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Lock Status</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                            <div className={`size-2 rounded-full ${isLive && matchData.isLockActive ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-emerald-500 shadow-[0_0_10px_#10b981]"}`} />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-white/60">
                                {isLive && matchData.isLockActive ? "LOCKED" : "READY"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Team Logos Overlay */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none">
                    <div className="flex items-center gap-12">
                        {currentMatch?.team1 && (
                            <img src={currentMatch.team1.logo} alt={currentMatch.team1.name} className="size-48 object-contain" />
                        )}
                        <div className="text-4xl font-black italic text-white/20">VS</div>
                        {currentMatch?.team2 && (
                            <img src={currentMatch.team2.logo} alt={currentMatch.team2.name} className="size-48 object-contain" />
                        )}
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="space-y-4">
                        {(!isMatchToday && !isLive) ? (
                            <>
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] block mb-2">Rest Day</span>
                                <h3 className="text-4xl md:text-6xl font-black italic tracking-tighter leading-none mb-2">
                                    NO MATCH TODAY
                                </h3>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                                    Next Arena: {displayTime || "Schedule TBA"}
                                </p>
                            </>
                        ) : isLive ? (
                            <>
                                <div className="flex flex-col gap-0">
                                    <motion.h3
                                        key={matchData.score}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        className="text-5xl md:text-8xl font-black italic tracking-tighter"
                                    >
                                        {matchData.score || "0/0"}
                                    </motion.h3>
                                    <p className="text-xs font-bold text-white/60 uppercase tracking-widest">
                                        {matchData.overs || "0.0"} Overs • {matchData.battingTeam || "TBA"}
                                    </p>
                                </div>
                                <div className="mt-4">
                                    <button className="px-8 h-12 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all">
                                        Predict Now <Zap className="size-3 fill-black" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] block mb-1">Arena Launch</span>
                                <h3 className="text-3xl md:text-6xl font-black italic tracking-tighter leading-none mb-1 uppercase">
                                    {currentMatch.matchName || "UPCOMING MATCH"}
                                </h3>
                                <div className="flex flex-col gap-1 text-xs font-bold text-white/40 uppercase tracking-[0.2em] mt-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="size-3 text-amber-500" />
                                        <span className="text-white">{displayTime || "Loading..." }</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="size-3" />
                                        {currentMatch.venue || "Global Arena"}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    <motion.div
                        animate={{ y: [0, -10, 0], rotate: isBoundary ? [0, 10, -10, 0] : 0 }}
                        className="size-20 md:size-24 rounded-[40px] bg-white/10 backdrop-blur-3xl border border-white/20 flex items-center justify-center shadow-inner"
                    >
                        <Trophy className={`size-10 md:size-12 ${isLive ? "text-amber-400" : "text-white/20"}`} />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * IPL Live Arena Card - 'Antigravity' Floating Effect
 */
const IplArenaWidget = ({ matchData }) => {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={{ y: -5 }}
            className="relative w-full aspect-[16/10] md:aspect-auto md:h-64 rounded-[40px] overflow-hidden group border border-white/10 shadow-2xl"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-amber-600 to-black z-0" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 z-1" />

            {/* Glow Effect */}
            <div className="absolute -top-20 -right-20 size-60 bg-amber-400/30 blur-[100px] animate-pulse rounded-full" />

            <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <div className="px-3 py-1 bg-red-600 rounded-full text-[9px] font-black animate-pulse tracking-widest flex items-center gap-1.5">
                        <div className="size-1.5 bg-white rounded-full animate-ping" /> LIVE ARENA
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">IPL 2024</p>
                </div>

                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h3 className="text-5xl font-black italic tracking-tighter">{matchData.score}</h3>
                        <p className="text-sm font-bold text-white/60 uppercase tracking-widest">{matchData.overs} Overs • {matchData.battingTeam} Batting</p>
                    </div>
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="size-16 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center shadow-2xl"
                    >
                        <Trophy className="size-8 text-amber-400" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

/**
 * AI Career Focus Mode Card
 */
const FocusModeWidget = () => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1500); // 25 mins

    useEffect(() => {
        let timer;
        if (isActive && timeLeft > 0) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
        }
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    return (
        <div className="bg-[#0c0c14] border border-white/5 rounded-[40px] p-8 flex flex-col justify-between h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="size-32" />
            </div>

            <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Zap className="size-5 fill-current" />
                    </div>
                    <div>
                        <h4 className="font-black italic text-lg leading-none">Focus Mode</h4>
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Powered by Gemini</p>
                    </div>
                </div>

                <div className="text-4xl font-black tabular-nums tracking-tighter">
                    {formatTime(timeLeft)}
                </div>
            </div>

            <button
                onClick={() => setIsActive(!isActive)}
                className={`w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${isActive ? "bg-white/10 text-white border border-white/10" : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                    }`}
            >
                {isActive ? "Pause Focus" : "Start Focus"}
            </button>
        </div>
    );
};

/**
 * Creator Monetization Widget
 */
const CreatorWidget = () => {
    return (
        <div className="bg-emerald-950/20 border border-emerald-500/10 backdrop-blur-3xl rounded-[40px] p-8 flex flex-col justify-between h-full group hover:border-emerald-500/30 transition-all">
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div className="size-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <DollarSign className="size-6" />
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest">Total Earnings</p>
                        <p className="text-2xl font-black italic">₹12,450.00</p>
                    </div>
                </div>

                <div className="flex items-end gap-1 px-2 h-16">
                    {[40, 70, 45, 90, 65, 85, 55, 95].map((h, i) => (
                        <motion.div
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            className="flex-1 bg-emerald-500/40 rounded-t-sm"
                        />
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="size-8 rounded-full border-2 border-[#0c0c14] overflow-hidden bg-gray-800">
                            <img src={`https://i.pravatar.cc/100?u=${i}`} alt="fan" className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">74K Active Fans</p>
            </div>
        </div>
    );
};

/**
 * Account/Profile Widget with Quick Verify
 */
const AccountWidget = ({ user }) => {
    return (
        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col justify-between h-full hover:bg-white/[0.07] transition-all cursor-pointer">
            <div className="flex items-center gap-5">
                <div className="size-20 rounded-[30px] overflow-hidden ring-4 ring-white/5 shadow-2xl relative">
                    <img src={user?.profilePic || "/avatar.png"} alt="profile" className="w-full h-full object-cover" />
                    {!user?.isVerified && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <ShieldCheck className="size-8 text-amber-500" />
                        </div>
                    )}
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-2xl font-black italic truncate max-w-[150px]">{user?.fullName?.split(' ')[0] || 'User'}</h4>
                        {!user?.isVerified && (
                            <span className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest animate-pulse">
                                Quick Verify
                            </span>
                        )}
                    </div>
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{user?.rank || 'Rookie'} Soldier</p>
                </div>
            </div>

            <div className="flex gap-4">
                <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-white/30 uppercase mb-1">Gems</p>
                    <p className="text-lg font-black">{user?.gems || 0}</p>
                </div>
                <div className="flex-1 p-4 bg-white/5 rounded-3xl border border-white/5 text-center">
                    <p className="text-[8px] font-black text-white/30 uppercase mb-1">Coins</p>
                    <p className="text-lg font-black">{user?.bondCoins || 500}</p>
                </div>
            </div>
        </div>
    );
};



const Home = () => {
    const { t } = useTranslation();
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("arena");

    // Antigravity Sync: Using Central Match Context
    const {
        liveMatch,
        upcomingMatches,
        isUpcomingLoading,
        matchStats
    } = useMatch();

    // Unified State: Determine if we should show Live or Upcoming
    const displayMatch = liveMatch || upcomingMatches?.[0];
    const isLive = liveMatch?.status === "live";
    const hasAnyMatch = Boolean(liveMatch || upcomingMatches?.length > 0);

    const isMatchToday = useMemo(() => {
        if (isLive) return true; // Force true if we have a live match
        const localToday = DateTime.now().toISODate();
        const checkMatch = (match) => {
            if (!match?.startTime) return false;
            return DateTime.fromISO(match.startTime).toISODate() === localToday;
        };
        return checkMatch(upcomingMatches?.[0]);
    }, [isLive, upcomingMatches]);

    const tabs = [
        { id: "arena", icon: trophyIcon, label: "Arena" },
        { id: "market", icon: dollarIcon, label: "Market" },
        { id: "focus", icon: zapIcon, label: "Focus" },
        { id: "account", icon: userIcon, label: "Account" },
    ];

    function trophyIcon(props) { return <Trophy {...props} /> }
    function zapIcon(props) { return <Zap {...props} /> }
    function dollarIcon(props) { return <DollarSign {...props} /> }
    function userIcon(props) { return <Users {...props} /> }


    return (
        <GlobalErrorBoundary>
            <div className="min-h-screen bg-[#050508] text-white font-outfit relative flex flex-col">
                {/* Background Decorative Blobs */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-[10%] -left-[10%] size-[60%] bg-indigo-600/10 blur-[150px] rounded-full" />
                    <div className="absolute top-[40%] -right-[10%] size-[50%] bg-orange-600/10 blur-[150px] rounded-full" />
                    <div className="absolute -bottom-[10%] left-[20%] size-[55%] bg-emerald-600/5 blur-[150px] rounded-full" />
                </div>

                <div className="relative z-10 flex-1 flex flex-col pt-0 pb-32">
                    <LiveTicker />
                    {/* Fixed Top Header */}
                    <header className="px-6 md:px-8 mt-4 md:mt-8 mb-6 md:mb-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-primary">ZYRO</h1>
                            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.3em] leading-none mt-1 text-accent">Unified Edge Dashboard</p>
                        </div>
                        <div className="size-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center relative">
                            <Bell className="size-6 text-white/70" />
                            <span className="absolute top-4 right-4 size-2 bg-red-500 rounded-full animate-ping" />
                        </div>
                    </header>

                    <main className="px-6 flex-1">
                        <AnimatePresence mode="wait">
                            {activeTab === "arena" && (
                                <motion.div
                                    key="arena"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="space-y-8"
                                >
                                    {isUpcomingLoading ? (
                                        <>
                                            <HeroSkeleton />
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <PulseSkeleton />
                                                <div className="h-48 bg-white/5 animate-pulse rounded-[40px]" />
                                                <div className="md:col-span-2">
                                                    <MatchListSkeleton />
                                                </div>
                                            </div>
                                        </>
                                    ) : !hasAnyMatch ? (
                                        <EmptyArenaState />
                                    ) : (
                                        <>
                                            <HeroArenaWidget 
                                                matchData={displayMatch} 
                                                upcomingMatches={upcomingMatches} 
                                                isMatchToday={isMatchToday}
                                            />

                                            <LiveArenaGrid />

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {isLive && (
                                                    <div className="md:col-span-1">
                                                        <Suspense fallback={<PulseSkeleton />}>
                                                            <FanPulse
                                                                teamA={displayMatch?.battingTeam || "T1"}
                                                                teamB={displayMatch?.bowlingTeam || "T2"}
                                                                stats={matchStats}
                                                            />
                                                        </Suspense>
                                                    </div>
                                                )}

                                                <div className={`${isLive ? "md:col-span-1" : "md:col-span-2"} bg-gradient-to-br from-indigo-900/20 to-black border border-white/5 rounded-[40px] p-8 flex flex-col justify-center min-h-[200px]`}>
                                                    <Trophy className="size-10 text-amber-500 mb-4" />
                                                    <h4 className="text-xl font-black italic mb-2">Mega Arena Clash</h4>
                                                    <p className="text-xs font-bold text-white/40 mb-6 leading-relaxed">Join 100K+ fans and predict outcomes in real-time. Highest accuracy wins 10x Gems.</p>
                                                    <button
                                                        onClick={() => navigate('/ipl-dashboard')}
                                                        className="h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
                                                    >
                                                        Open IPL Hub <ChevronRight className="size-4" />
                                                    </button>
                                                </div>

                                                <div className="md:col-span-2 bg-white/5 border border-white/5 rounded-[40px] p-8 flex flex-col md:flex-row items-center gap-8 group cursor-pointer hover:border-orange-500/30 transition-all" onClick={() => navigate('/ipl-dashboard')}>
                                                    <div className="size-24 rounded-[32px] bg-orange-600/10 flex items-center justify-center text-orange-500 shadow-inner group-hover:scale-110 transition-transform">
                                                        <Award className="size-12" />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <h4 className="text-2xl font-black italic tracking-tight">WHO WILL WIN ORANGE CAP?</h4>
                                                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Stake your Bond Coins now • Massive Jackpot Awaits</p>
                                                        <div className="flex gap-2 pt-2">
                                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/60">Virat Kohli</span>
                                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/60">Ruturaj Gaikwad</span>
                                                            <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-white/60">+8 Others</span>
                                                        </div>
                                                    </div>
                                                    <div className="size-14 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-orange-500 group-hover:text-white transition-all">
                                                        <Zap className="size-6" />
                                                    </div>
                                                </div>

                                                <div className="md:col-span-2">
                                                    <StrategicAiWidget matchData={displayMatch} />
                                                </div>

                                                {upcomingMatches?.length > 0 && (
                                                    <div className="md:col-span-2">
                                                        <UpcomingMatchesWidget matches={upcomingMatches} isLoading={isUpcomingLoading} />
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            {activeTab === "focus" && (
                                <motion.div
                                    key="focus"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div className="md:col-span-1">
                                        <FocusModeWidget />
                                    </div>
                                    <div className="md:col-span-1 bg-white/5 border border-white/5 rounded-[40px] p-10 flex flex-col justify-center gap-6">
                                        <h3 className="text-3xl font-black italic italic">Deep Work Assistant</h3>
                                        <p className="text-sm font-bold text-white/50 leading-relaxed italic">"AI will now block all social distractions for the next 25 minutes. Good luck, Soldier!"</p>
                                        <div className="space-y-3">
                                            {['Block Notification', 'Lo-Fi Chill Beats', 'Ambient White Noise'].map((task, i) => (
                                                <div key={i} className="flex items-center gap-3 text-xs font-black text-white/30 uppercase tracking-widest">
                                                    <ShieldCheck className="size-4 text-indigo-500" /> {task}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "market" && (
                                <motion.div
                                    key="market"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="w-full"
                                >
                                    <IPLPlayersList />
                                </motion.div>
                            )}

                            {activeTab === "account" && (
                                <motion.div
                                    key="account"
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: -20, opacity: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div className="md:col-span-1">
                                        <AccountWidget user={authUser} />
                                    </div>
                                    <div className="md:col-span-1 space-y-4">
                                        <button className="w-full p-6 bg-white/5 hover:bg-white/10 rounded-[30px] border border-white/5 flex items-center justify-between transition-all">
                                            <div className="flex items-center gap-4">
                                                <ShieldCheck className="size-6 text-amber-500" />
                                                <span className="font-black italic">Identity Verification</span>
                                            </div>
                                            <ChevronRight className="size-5 text-white/20" />
                                        </button>
                                        <button
                                            onClick={() => navigate("/wallet")}
                                            className="w-full p-6 bg-white/5 hover:bg-white/10 rounded-[30px] border border-white/5 flex items-center justify-between transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <Award className="size-6 text-indigo-500" />
                                                <span className="font-black italic">Redeem Bond Coins</span>
                                            </div>
                                            <ChevronRight className="size-5 text-white/20" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>

                {/* Bottom Unified Navigation Tab Bar - Optimized Antigravity Design */}
                <nav className="fixed bottom-6 md:bottom-8 left-0 right-0 z-[100] px-4">
                    <div className="max-w-md mx-auto h-16 md:h-20 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-[2rem] md:rounded-[40px] flex items-center justify-between px-1 md:px-2 relative shadow-2xl">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className="relative flex-1 h-full flex flex-col items-center justify-center gap-1.5 transition-all duration-300 outline-none"
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute inset-2 bg-gradient-to-tr from-white/10 to-white/5 border border-white/10 rounded-3xl z-0"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        >
                                            <div className="absolute inset-0 bg-white/5 blur-xl rounded-full" />
                                        </motion.div>
                                    )}

                                    <div className={`relative z-10 transition-all duration-300 ${isActive ? "text-white scale-110" : "text-white/40"}`}>
                                        <Icon className={`size-6 ${isActive ? "fill-current" : ""}`} />
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTabGlow"
                                                className="absolute -inset-4 bg-white/10 blur-2xl rounded-full pointer-events-none"
                                            />
                                        )}
                                    </div>

                                    <span className={`relative z-10 text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${isActive ? "text-white opacity-100" : "text-white/20 opacity-0 scale-90"
                                        }`}>
                                        {tab.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* Global Prediction Logic */}
                {isLive && <IplPredictionPopup userId={authUser?._id} />}
            </div>
        </GlobalErrorBoundary>
    );
};

export default Home;
