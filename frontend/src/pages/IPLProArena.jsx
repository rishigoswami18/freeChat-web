/**
 * IPL PRO ARENA — ProBO + Dream11 Style
 * The Ultimate Cricket Prediction & Fantasy Platform
 * © Zyro 2026
 */
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Trophy, Users, Award, Crown, Flame, Clock,
  TrendingUp, Target, Shield, ChevronRight, ChevronDown,
  Wallet, BarChart2, Star, ArrowLeft, Radio, Sparkles,
  CircleDot, Timer, Coins, Gift, ArrowUpRight, Lock,
  CheckCircle2, AlertCircle, Eye, Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// ═══ IPL 2026 MATCH DATA ═══
const IPL_MATCHES = [
  {
    id: "m1", matchNo: 1, status: "live",
    team1: { name: "KKR", short: "KKR", color: "#3A225D", accent: "#B3A123" },
    team2: { name: "RCB", short: "RCB", color: "#EC1C24", accent: "#FFB800" },
    venue: "Eden Gardens, Kolkata", time: "7:30 PM",
    score1: "186/4", overs1: "20.0", score2: "142/3", overs2: "16.2",
    crr: 8.69, rrr: 12.18, probability: [62, 38],
  },
  {
    id: "m2", matchNo: 2, status: "upcoming",
    team1: { name: "CSK", short: "CSK", color: "#F9CD05", accent: "#FDB913" },
    team2: { name: "MI", short: "MI", color: "#004BA0", accent: "#00FFC8" },
    venue: "MA Chidambaram Stadium", time: "3:30 PM",
    startTime: "2026-03-29T15:30:00+05:30",
  },
  {
    id: "m3", matchNo: 3, status: "upcoming",
    team1: { name: "DC", short: "DC", color: "#000080", accent: "#EF1B23" },
    team2: { name: "LSG", short: "LSG", color: "#0057E2", accent: "#E20E0E" },
    venue: "Arun Jaitley Stadium", time: "7:30 PM",
    startTime: "2026-03-29T19:30:00+05:30",
  },
  {
    id: "m4", matchNo: 4, status: "upcoming",
    team1: { name: "SRH", short: "SRH", color: "#FF822E", accent: "#000000" },
    team2: { name: "RR", short: "RR", color: "#EA1A85", accent: "#254AA5" },
    venue: "Rajiv Gandhi Stadium", time: "7:30 PM",
    startTime: "2026-03-30T19:30:00+05:30",
  },
];

// ═══ PREDICTION MARKETS ═══
const MARKETS = [
  { id: "winner", q: "Will KKR win this match?", yesPrice: 6.2, noPrice: 3.8, volume: "₹24.5L", trend: "up" },
  { id: "total", q: "Total score over 340.5?", yesPrice: 5.5, noPrice: 4.5, volume: "₹18.2L", trend: "up" },
  { id: "six", q: "15+ sixes in the match?", yesPrice: 4.8, noPrice: 5.2, volume: "₹12.1L", trend: "down" },
  { id: "fifty", q: "Virat Kohli to score 50+?", yesPrice: 3.5, noPrice: 6.5, volume: "₹31.8L", trend: "up" },
  { id: "wicket", q: "3+ wickets for any bowler?", yesPrice: 4.0, noPrice: 6.0, volume: "₹9.7L", trend: "stable" },
  { id: "pp", q: "Powerplay score over 55.5?", yesPrice: 5.8, noPrice: 4.2, volume: "₹15.3L", trend: "up" },
];

// ═══ CONTEST DATA ═══
const CONTESTS = [
  { id: "c1", name: "Mega Contest", entry: 49, prize: "₹25 Lakh", spots: 50000, filled: 42180, firstPrize: "₹5 Lakh", type: "mega", guaranteed: true },
  { id: "c2", name: "Head to Head", entry: 100, prize: "₹180", spots: 2, filled: 1, firstPrize: "₹180", type: "h2h" },
  { id: "c3", name: "Small League", entry: 25, prize: "₹1,000", spots: 10, filled: 7, firstPrize: "₹500", type: "small" },
  { id: "c4", name: "Winner Takes All", entry: 500, prize: "₹50,000", spots: 100, filled: 68, firstPrize: "₹50,000", type: "winner" },
  { id: "c5", name: "Practice", entry: 0, prize: "Glory", spots: 999, filled: 324, firstPrize: "Experience", type: "free" },
];

// ═══ LEADERBOARD ═══
const LEADERBOARD = [
  { rank: 1, name: "CricketKing_07", points: 1250, wins: 18, avatar: "🏆" },
  { rank: 2, name: "ViratFanX", points: 1180, wins: 15, avatar: "🔥" },
  { rank: 3, name: "DhoniFever", points: 1090, wins: 14, avatar: "⚡" },
  { rank: 4, name: "Bumrah_Army", points: 980, wins: 12, avatar: "🎯" },
  { rank: 5, name: "IPL_Predictor", points: 920, wins: 11, avatar: "🧠" },
];

const IPLProArena = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("prediction");
  const [selectedMatch, setSelectedMatch] = useState(IPL_MATCHES[0]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [tradeSide, setTradeSide] = useState("yes");
  const [tradeAmount, setTradeAmount] = useState(10);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [countdown, setCountdown] = useState("");
  const [animatePulse, setAnimatePulse] = useState(false);

  // Pulse animation for live match
  useEffect(() => {
    const interval = setInterval(() => setAnimatePulse(p => !p), 2000);
    return () => clearInterval(interval);
  }, []);

  // Countdown for upcoming matches
  useEffect(() => {
    if (selectedMatch?.status !== "upcoming") return;
    const timer = setInterval(() => {
      const diff = new Date(selectedMatch.startTime) - new Date();
      if (diff <= 0) { setCountdown("LIVE NOW!"); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setCountdown(`${h}h ${m}m ${s}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedMatch]);

  const handleTrade = async () => {
    if (tradeAmount < 1) return toast.error("Minimum ₹1 required!");
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowTradeModal(false);
      toast.success(`🎯 Trade placed! ${tradeSide.toUpperCase()} @ ₹${tradeAmount}`);
    }, 1500);
  };

  const payout = (tradeAmount * (tradeSide === "yes" ? (10 / (selectedMarket?.yesPrice || 5)) : (10 / (selectedMarket?.noPrice || 5)))).toFixed(1);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white font-outfit relative overflow-hidden">
      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] bg-purple-600/8 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-200px] right-[-200px] w-[600px] h-[600px] bg-orange-500/8 blur-[150px] rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[200px] rounded-full" />
      </div>

      {/* ═══ TOP HEADER ═══ */}
      <header className="relative z-20 sticky top-0 bg-[#0A0D14]/80 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
              <ArrowLeft className="size-4 text-white/60" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black italic tracking-tighter flex items-center gap-2">
                IPL PRO ARENA
                <span className="text-[8px] not-italic font-black px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-md uppercase tracking-widest animate-pulse">LIVE</span>
              </h1>
              <p className="text-[8px] font-black text-white/30 uppercase tracking-[0.3em]">Predict • Play • Win Real Cash</p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="hidden md:flex items-center bg-white/5 p-1 rounded-2xl border border-white/5">
            {[
              { id: "prediction", icon: Target, label: "ProBO" },
              { id: "fantasy", icon: Users, label: "Fantasy" },
              { id: "live", icon: Radio, label: "Live" },
              { id: "leaderboard", icon: Trophy, label: "Ranks" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeSection === tab.id
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-white/30 hover:text-white"
                }`}
              >
                <tab.icon className="size-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Wallet */}
          <div onClick={() => navigate("/wallet")} className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 transition-all group">
            <div className="text-right">
              <p className="text-[8px] font-black text-white/30 uppercase">Balance</p>
              <p className="text-sm font-black text-orange-500">₹{authUser?.bondCoins || 500}</p>
            </div>
            <div className="size-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <Wallet className="size-4 text-white" />
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden flex border-t border-white/5">
          {[
            { id: "prediction", icon: Target, label: "ProBO" },
            { id: "fantasy", icon: Users, label: "Fantasy" },
            { id: "live", icon: Radio, label: "Live" },
            { id: "leaderboard", icon: Trophy, label: "Ranks" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 text-[8px] font-black uppercase tracking-widest transition-all border-b-2 ${
                activeSection === tab.id
                  ? "text-orange-500 border-orange-500"
                  : "text-white/20 border-transparent"
              }`}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* ═══ MATCH SELECTOR STRIP ═══ */}
      <div className="relative z-10 border-b border-white/5 bg-[#0D1017]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex gap-3 overflow-x-auto no-scrollbar">
          {IPL_MATCHES.map(match => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className={`flex-shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all ${
                selectedMatch?.id === match.id
                  ? "bg-white/10 border-orange-500/50 shadow-lg shadow-orange-500/10"
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              {match.status === "live" && <div className="size-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_red]" />}
              <span className="text-xs font-black italic">{match.team1.short}</span>
              <span className="text-[10px] text-white/20">vs</span>
              <span className="text-xs font-black italic">{match.team2.short}</span>
              {match.status === "live" && <span className="text-[8px] font-black text-red-400 uppercase">LIVE</span>}
              {match.status === "upcoming" && <span className="text-[8px] font-black text-white/20 uppercase">{match.time}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-6">
        <AnimatePresence mode="wait">
          {/* ═══ ProBO PREDICTION SECTION ═══ */}
          {activeSection === "prediction" && (
            <motion.div key="prediction" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              {/* Hero Score Card */}
              {selectedMatch?.status === "live" ? (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 p-6 md:p-8" style={{ background: `linear-gradient(135deg, ${selectedMatch.team1.color}15, ${selectedMatch.team2.color}15)` }}>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-6 md:gap-10">
                      {/* Team 1 */}
                      <div className="text-center">
                        <div className="size-16 md:size-20 rounded-2xl border-2 flex items-center justify-center mb-2 mx-auto" style={{ borderColor: selectedMatch.team1.color + "60", background: selectedMatch.team1.color + "15" }}>
                          <Shield className="size-8 md:size-10" style={{ color: selectedMatch.team1.color }} />
                        </div>
                        <p className="text-lg font-black italic">{selectedMatch.team1.short}</p>
                        <p className="text-2xl md:text-3xl font-black italic tracking-tight">{selectedMatch.score1}</p>
                        <p className="text-[10px] text-white/40 font-bold">{selectedMatch.overs1} ov</p>
                      </div>

                      <div className="text-center px-4">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">VS</p>
                        <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                          <div className="size-1.5 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-[9px] font-black text-red-400 uppercase">Live</span>
                        </div>
                      </div>

                      {/* Team 2 */}
                      <div className="text-center">
                        <div className="size-16 md:size-20 rounded-2xl border-2 flex items-center justify-center mb-2 mx-auto" style={{ borderColor: selectedMatch.team2.color + "60", background: selectedMatch.team2.color + "15" }}>
                          <Shield className="size-8 md:size-10" style={{ color: selectedMatch.team2.color }} />
                        </div>
                        <p className="text-lg font-black italic">{selectedMatch.team2.short}</p>
                        <p className="text-2xl md:text-3xl font-black italic tracking-tight">{selectedMatch.score2}</p>
                        <p className="text-[10px] text-white/40 font-bold">{selectedMatch.overs2} ov</p>
                      </div>
                    </div>

                    {/* Win Probability */}
                    <div className="w-full md:w-64 space-y-3">
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Win Probability</p>
                      <div className="h-3 bg-white/5 rounded-full overflow-hidden flex">
                        <motion.div animate={{ width: `${selectedMatch.probability[0]}%` }} className="h-full rounded-full" style={{ background: selectedMatch.team1.color }} />
                      </div>
                      <div className="flex justify-between text-[10px] font-black">
                        <span style={{ color: selectedMatch.team1.color }}>{selectedMatch.team1.short} {selectedMatch.probability[0]}%</span>
                        <span style={{ color: selectedMatch.team2.color }}>{selectedMatch.team2.short} {selectedMatch.probability[1]}%</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="bg-white/5 rounded-xl p-2 text-center"><p className="text-[8px] font-bold text-white/30">CRR</p><p className="text-sm font-black">{selectedMatch.crr}</p></div>
                        <div className="bg-white/5 rounded-xl p-2 text-center"><p className="text-[8px] font-bold text-white/30">RRR</p><p className="text-sm font-black text-orange-400">{selectedMatch.rrr}</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center space-y-4">
                  <Timer className="size-10 text-orange-500 mx-auto" />
                  <h2 className="text-3xl font-black italic tracking-tighter">{selectedMatch?.team1?.short} vs {selectedMatch?.team2?.short}</h2>
                  <p className="text-sm text-white/40 font-bold">{selectedMatch?.venue}</p>
                  <p className="text-4xl font-black italic text-orange-500 tabular-nums">{countdown || "Loading..."}</p>
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Prediction markets open before match</p>
                </div>
              )}

              {/* ═══ PREDICTION MARKETS GRID ═══ */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-black italic tracking-tighter flex items-center gap-2">
                    <Target className="size-5 text-orange-500" /> Prediction Markets
                  </h2>
                  <div className="flex items-center gap-2 text-[9px] font-black text-white/20 uppercase tracking-widest">
                    <Radio className="size-3 text-green-500 animate-pulse" /> {MARKETS.length * 8}K+ trades
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MARKETS.map((market, idx) => (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="bg-[#12161F] border border-white/5 rounded-2xl p-4 hover:border-orange-500/20 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-bold text-white/80 leading-snug flex-1 pr-2">{market.q}</p>
                        <div className={`flex items-center gap-1 text-[8px] font-black uppercase ${market.trend === "up" ? "text-green-400" : market.trend === "down" ? "text-red-400" : "text-white/20"}`}>
                          <TrendingUp className={`size-3 ${market.trend === "down" ? "rotate-180" : ""}`} />
                          {market.volume}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => { setSelectedMarket(market); setTradeSide("yes"); setShowTradeModal(true); }}
                          className="py-3 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 hover:border-blue-500/40 rounded-xl text-center transition-all group-hover:scale-[1.02]"
                        >
                          <p className="text-lg font-black text-blue-400">₹{market.yesPrice}</p>
                          <p className="text-[9px] font-black text-blue-400/60 uppercase">Yes</p>
                        </button>
                        <button
                          onClick={() => { setSelectedMarket(market); setTradeSide("no"); setShowTradeModal(true); }}
                          className="py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-center transition-all group-hover:scale-[1.02]"
                        >
                          <p className="text-lg font-black text-red-400">₹{market.noPrice}</p>
                          <p className="text-[9px] font-black text-red-400/60 uppercase">No</p>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ FANTASY SECTION ═══ */}
          {activeSection === "fantasy" && (
            <motion.div key="fantasy" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center space-y-3 py-4">
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">Pick Your Dream Squad</h2>
                <p className="text-sm text-white/40 font-bold">{selectedMatch?.team1?.short} vs {selectedMatch?.team2?.short} • {selectedMatch?.venue}</p>
              </div>

              {/* Contests Grid */}
              <div className="space-y-3">
                {CONTESTS.map((contest, idx) => (
                  <motion.div
                    key={contest.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.08 }}
                    className="bg-[#12161F] border border-white/5 rounded-2xl p-5 hover:border-orange-500/20 transition-all group cursor-pointer"
                    onClick={() => navigate("/ipl-arena")}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`size-12 rounded-2xl flex items-center justify-center ${
                          contest.type === "mega" ? "bg-gradient-to-br from-orange-500/20 to-red-500/20 text-orange-500" :
                          contest.type === "h2h" ? "bg-blue-500/10 text-blue-400" :
                          contest.type === "winner" ? "bg-amber-500/10 text-amber-500" :
                          contest.type === "free" ? "bg-green-500/10 text-green-400" :
                          "bg-white/5 text-white/40"
                        }`}>
                          {contest.type === "mega" ? <Trophy className="size-6" /> :
                           contest.type === "h2h" ? <Users className="size-6" /> :
                           contest.type === "winner" ? <Crown className="size-6" /> :
                           contest.type === "free" ? <Gift className="size-6" /> :
                           <Star className="size-6" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black italic">{contest.name}</h3>
                            {contest.guaranteed && <span className="text-[7px] font-black px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded uppercase">Guaranteed</span>}
                          </div>
                          <p className="text-[10px] font-bold text-white/30">Prize Pool: <span className="text-white/60">{contest.prize}</span> • 1st: {contest.firstPrize}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        <div>
                          <p className="text-[9px] font-black text-white/20 uppercase">Spots</p>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${(contest.filled / contest.spots) * 100}%` }} />
                          </div>
                          <p className="text-[8px] text-white/20 mt-0.5">{contest.spots - contest.filled} left</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-black text-white">{contest.entry === 0 ? "FREE" : `₹${contest.entry}`}</span>
                          <ChevronRight className="size-4 text-white/20 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Squad CTA */}
              <div className="bg-gradient-to-r from-orange-500/10 via-red-500/10 to-purple-500/10 border border-orange-500/20 rounded-2xl p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="size-14 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <Sparkles className="size-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic">AI Smart Pick</h3>
                    <p className="text-xs text-white/40 font-bold">Let our AI build the optimal squad for you</p>
                  </div>
                </div>
                <button onClick={() => navigate("/ipl-arena")} className="px-6 py-3 bg-orange-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-orange-500/20">
                  Build Squad
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ LIVE SECTION ═══ */}
          {activeSection === "live" && (
            <motion.div key="live" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-[#12161F] rounded-2xl border border-white/5 p-6 text-center space-y-4">
                <Radio className="size-10 text-red-500 mx-auto animate-pulse" />
                <h2 className="text-2xl font-black italic">Live Match Center</h2>
                <p className="text-sm text-white/40">Get ball-by-ball action, expert commentary & real-time predictions</p>
                <button onClick={() => navigate("/live-arena")} className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">
                  Enter Live Arena →
                </button>
              </div>

              {/* Upcoming Matches */}
              <div>
                <h3 className="text-lg font-black italic mb-4 flex items-center gap-2"><Clock className="size-5 text-white/40" /> Upcoming Matches</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {IPL_MATCHES.filter(m => m.status === "upcoming").map((match, idx) => (
                    <div key={match.id} className="bg-[#12161F] border border-white/5 rounded-2xl p-5 flex items-center justify-between hover:border-white/15 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="text-center"><p className="text-xs font-black italic">{match.team1.short}</p><p className="text-[10px] text-white/20">vs</p><p className="text-xs font-black italic">{match.team2.short}</p></div>
                        <div><p className="text-[10px] text-white/30 font-bold">{match.venue}</p><p className="text-[10px] text-orange-400 font-black">{match.time}</p></div>
                      </div>
                      <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                        <Bell className="size-3 inline mr-1" /> Remind
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ LEADERBOARD SECTION ═══ */}
          {activeSection === "leaderboard" && (
            <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="text-center space-y-2 py-4">
                <h2 className="text-3xl font-black italic tracking-tighter">Season Leaderboard</h2>
                <p className="text-sm text-white/40 font-bold">Top predictors win exclusive rewards</p>
              </div>

              {/* Top 3 Podium */}
              <div className="flex justify-center items-end gap-4 py-6">
                {[LEADERBOARD[1], LEADERBOARD[0], LEADERBOARD[2]].map((user, idx) => (
                  <div key={user.rank} className={`text-center ${idx === 1 ? "pb-8" : ""}`}>
                    <div className={`mx-auto mb-3 rounded-2xl flex items-center justify-center text-3xl ${
                      idx === 1 ? "size-24 bg-gradient-to-br from-amber-500/20 to-orange-500/20 border-2 border-amber-500/30" :
                      "size-20 bg-white/5 border border-white/10"
                    }`}>
                      {user.avatar}
                    </div>
                    {idx === 1 && <Crown className="size-6 text-amber-500 mx-auto mb-1" />}
                    <p className="text-sm font-black italic">{user.name}</p>
                    <p className="text-2xl font-black italic text-orange-500">{user.points}</p>
                    <p className="text-[9px] text-white/30 font-black uppercase">{user.wins} wins</p>
                  </div>
                ))}
              </div>

              {/* Full List */}
              <div className="space-y-2">
                {LEADERBOARD.map((user, idx) => (
                  <div key={user.rank} className="bg-[#12161F] border border-white/5 rounded-2xl p-4 flex items-center justify-between hover:border-white/15 transition-all">
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-black italic w-8 ${user.rank <= 3 ? "text-amber-500" : "text-white/20"}`}>#{user.rank}</span>
                      <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-xl">{user.avatar}</div>
                      <p className="font-black italic">{user.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right"><p className="text-[9px] text-white/20 font-black uppercase">Points</p><p className="text-lg font-black text-orange-500">{user.points}</p></div>
                      <div className="text-right"><p className="text-[9px] text-white/20 font-black uppercase">Wins</p><p className="text-lg font-black">{user.wins}</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ═══ TRADE MODAL ═══ */}
      <AnimatePresence>
        {showTradeModal && selectedMarket && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTradeModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              className="fixed bottom-0 inset-x-0 max-h-[85vh] bg-[#0D1017] border-t border-white/10 rounded-t-[2rem] z-[70] p-6 overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <h3 className="text-xl font-black italic mb-2">{selectedMarket.q}</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mb-6">Place your opinion trade</p>

              <div className="grid grid-cols-2 gap-3 p-1.5 bg-white/5 rounded-2xl mb-6">
                <button onClick={() => setTradeSide("yes")} className={`py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tradeSide === "yes" ? "bg-blue-500 text-white shadow-lg" : "text-white/30"}`}>
                  Yes @ ₹{selectedMarket.yesPrice}
                </button>
                <button onClick={() => setTradeSide("no")} className={`py-4 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${tradeSide === "no" ? "bg-red-500 text-white shadow-lg" : "text-white/30"}`}>
                  No @ ₹{selectedMarket.noPrice}
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Investment Amount</p>
                <input
                  type="number" value={tradeAmount} onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-3xl font-black italic focus:outline-none focus:border-orange-500/50 transition-all"
                />
                <div className="grid grid-cols-4 gap-2">
                  {[10, 50, 100, 500].map(amt => (
                    <button key={amt} onClick={() => setTradeAmount(amt)} className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${tradeAmount === amt ? "bg-white text-black border-white" : "bg-white/5 border-white/5 text-white/40"}`}>
                      ₹{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center mb-6">
                <div><p className="text-[9px] text-white/20 font-black uppercase">Potential Return</p><p className="text-2xl font-black italic text-green-400">₹{payout}</p></div>
                <div className="text-right"><p className="text-[9px] text-white/20 font-black uppercase">Multiplier</p><p className="text-lg font-black text-white/60">{(payout / tradeAmount).toFixed(1)}x</p></div>
              </div>

              <button
                onClick={handleTrade}
                disabled={isProcessing}
                className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                  tradeSide === "yes" ? "bg-blue-500 shadow-blue-500/20 hover:bg-blue-400" : "bg-red-500 shadow-red-500/20 hover:bg-red-400"
                } ${isProcessing ? "opacity-60" : "hover:scale-[1.02]"}`}
              >
                {isProcessing ? <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><ArrowUpRight className="size-5" /> Place {tradeSide.toUpperCase()} Trade</>}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}` }} />
    </div>
  );
};

export default IPLProArena;
