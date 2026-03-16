import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Users, MessageSquare, Send, Award, Crown, BarChart2, Flame, Clock } from "lucide-react";
import Lottie from "lottie-react";
import confetti from "canvas-confetti";
import io from "socket.io-client";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useMatch } from "../context/MatchContext";
import UpcomingMatchesWidget from "../components/UpcomingMatchesWidget";

// --- MOCK LOTTIE URLS (In production, replace with local paths or CDN) ---
const LOTTIE_6 = "https://assets9.lottiefiles.com/packages/lf20_m6cuL6.json";
const LOTTIE_4 = "https://assets10.lottiefiles.com/packages/lf20_tovunp.json";
const LOTTIE_WICKET = "https://assets5.lottiefiles.com/packages/lf20_f7h7gX.json";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
let socket;

const LiveArena = () => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const { liveMatch, upcomingMatches, isUpcomingLoading } = useMatch();
    const [matchState, setMatchState] = useState(null);
    const [timeLeft, setTimeLeft] = useState("");

    const [reactions, setReactions] = useState([]);
    const [showBlast, setShowBlast] = useState(null); 
    const [isLocked, setIsLocked] = useState(false);

    // Sync matchState with liveMatch from context
    const currentMatch = liveMatch || matchState; 

    // Countdown Logic for Next Match
    useEffect(() => {
        if (!liveMatch && upcomingMatches?.length > 0) {
            const timer = setInterval(() => {
                const start = new Date(nextMatch.startTime);
                const now = new Date();
                const diff = start - now;
                
                if (diff <= 0) {
                    setTimeLeft("LIVE");
                    return;
                }

                const hoursToMatch = diff / 3600000;
                if (hoursToMatch > 24) {
                    setTimeLeft(start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }));
                } else {
                    const h = Math.floor(diff / 3600000);
                    const m = Math.floor((diff % 3600000) / 60000);
                    const s = Math.floor((diff % 60000) / 1000);
                    setTimeLeft(`${h}h ${m}m ${s}s`);
                }
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [liveMatch, upcomingMatches]);

    const sendReaction = (emojiId) => {
        if (socket && currentMatch) {
            socket.emit("send_live_reaction", {
                matchId: currentMatch._id || currentMatch.matchId,
                emojiId,
                username: authUser?.fullName
            });
        }
    };

    if (!currentMatch) {
        const nextMatch = upcomingMatches?.[0];
        return (
            <div className="min-h-screen bg-[#080808] text-white flex items-center justify-center p-6 font-outfit relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full" />
                <div className="max-w-4xl w-full relative z-10 text-center space-y-12">
                     <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="space-y-6"
                     >
                        <div className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-600/20 border border-indigo-500/30 rounded-full">
                            <Clock className="size-4 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400">Next Arena Kicking Off</span>
                        </div>
                        <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter tabular-nums">
                            {timeLeft || "--h --m --s"}
                        </h2>
                        {nextMatch && (
                            <div className="space-y-2">
                                <p className="text-2xl font-black italic text-white/80">{nextMatch.matchName}</p>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest">{nextMatch.venue || "M. Chinnaswamy Stadium, Bengaluru"}</p>
                            </div>
                        )}
                     </motion.div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                        <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] text-left group hover:bg-white/10 transition-all cursor-pointer" onClick={() => navigate("/")}>
                             <Trophy className="size-8 text-amber-500 mb-4" />
                             <h4 className="font-black italic text-xl mb-2">Back to Dashboard</h4>
                             <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">Check full season schedule or your wallet.</p>
                        </div>
                        <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] text-left group hover:bg-white/10 transition-all">
                             <Zap className="size-8 text-indigo-500 mb-4" />
                             <h4 className="font-black italic text-xl mb-2">Instant Alerts</h4>
                             <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">Notifications will ping when toss happens.</p>
                        </div>
                     </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white p-4 lg:p-10 font-outfit relative overflow-hidden">
            {/* Antigravity Ambient Lighting */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pink-600/10 blur-[150px] rounded-full" />

            {/* Special Event Blast Overlay */}
            <AnimatePresence>
                {showBlast && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                        animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                        exit={{ scale: 2, opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
                    >
                        <div className="text-center">
                            <h2 className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.5)]">
                                {showBlast}
                            </h2>
                            <p className="text-4xl font-bold uppercase tracking-[1em] text-amber-400">BOOM!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT: Live Match Center (Glassmorphism) */}
                <div className="lg:col-span-8 space-y-8">
                    <motion.header 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 flex flex-col md:flex-row justify-between items-center gap-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <h2 className="text-5xl font-black italic tracking-tighter">{currentMatch?.score || "0/0"}</h2>
                                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">{currentMatch?.battingTeam || "TBA"} (OVERS: {currentMatch?.overs || "0.0"})</p>
                            </div>
                            <div className="h-12 w-px bg-white/10 mx-4" />
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">Match</p>
                                    <p className="text-xl font-bold italic">{currentMatch?.matchName || "IPL 2026"}</p>
                                </div>
                                <div className="px-4 py-2 bg-indigo-600/20 rounded-2xl border border-indigo-500/30">
                                    <p className="text-[9px] font-black uppercase text-indigo-400">Live Status: {currentMatch?.status || "Live"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                            <div 
                                onClick={() => navigate("/wallet")}
                                className="px-4 py-2 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-2 cursor-pointer hover:bg-white/10 transition-all group"
                            >
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Your Vault</p>
                                    <p className="text-sm font-black text-amber-500">🪙 {authUser?.bondCoins || 0}</p>
                                </div>
                                <div className="size-8 rounded-xl bg-amber-500 flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                    <Zap className="size-4 fill-current" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="size-8 rounded-full border-2 border-[#080808] bg-white/10" />
                                    ))}
                                </div>
                                <span className="text-[10px] font-extrabold text-white/30 uppercase tracking-widest">124K Watching</span>
                            </div>
                        </div>
                    </motion.header>

                    {/* Stats Matrix */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Batting Card */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[32px] p-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                <BarChart2 className="size-4" /> Batting Pipeline
                            </h3>
                             <div className="space-y-4">
                                {currentMatch?.batters ? currentMatch.batters.map((b, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                                        <div>
                                            <p className="font-bold text-sm italic">{b.name}</p>
                                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">SR: {b.sr}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black">{b.runs} <span className="text-xs font-medium opacity-40">({b.balls})</span></p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-white/20 font-black uppercase tracking-widest text-xs">
                                        Batter details loading...
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bowling Card */}
                        <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-[32px] p-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-6 flex items-center gap-2">
                                <Zap className="size-4 text-amber-400" /> Bowling Heat
                            </h3>
                             <div className="p-4 bg-indigo-600/10 rounded-2xl border border-indigo-500/20">
                                <div className="flex justify-between items-center mb-2">
                                    <p className="font-bold text-sm italic">{currentMatch?.bowler?.name || "TBA"}</p>
                                    <p className="font-black text-indigo-400">{currentMatch?.bowler?.figures || "0-0-0-0"}</p>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 w-[60%]" />
                                </div>
                            </div>
                             <div className="mt-6">
                                <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-3">Last 12 Balls</p>
                                <div className="flex flex-wrap gap-2">
                                    {(currentMatch?.last12Balls || ["0", "1", "4", "0", "1", "W"]).map((b, i) => (
                                        <div key={i} className={`size-7 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                            b === '6' ? 'bg-amber-500 text-black' : 
                                            b === '4' ? 'bg-indigo-500 text-white' :
                                            b === 'W' ? 'bg-red-500 text-white' : 'bg-white/5 text-white/40'
                                        }`}>
                                            {b}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Antigravity Fan Pass Promo */}
                    <section className="bg-gradient-to-r from-indigo-900/40 via-purple-900/40 to-pink-900/40 border border-white/10 rounded-[40px] p-10 flex items-center justify-between overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-500 rounded-xl">
                                    <Crown className="size-5 text-white shadow-glow" />
                                </div>
                                <h4 className="text-2xl font-black italic tracking-tighter">ELITE FAN PASS</h4>
                            </div>
                            <p className="text-sm font-medium text-white/60 max-w-md">Get sub-50ms score updates, AI-powered predictions, and exclusive 3D emojis for only ₹199/season.</p>
                            <button className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all shadow-xl shadow-white/10">
                                Upgrade Now
                            </button>
                        </div>
                        <Flame className="size-40 text-amber-500/10 absolute -right-10 -bottom-10 group-hover:rotate-12 transition-transform duration-700" />
                    </section>
                </div>

                {/* RIGHT: Live Social Arena (3D Flying Emojis) */}
                <div className="lg:col-span-4 h-[calc(100vh-140px)] flex flex-col bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                        <h3 className="font-black italic tracking-tighter uppercase flex items-center gap-3 text-lg">
                            <Users className="size-5 text-indigo-400" /> Commentary
                        </h3>
                        <button 
                            onClick={() => navigate("/wallet")}
                            className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center gap-2 hover:bg-amber-500/20 transition-all group"
                        >
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter">Quick Re-up</span>
                            <Zap className="size-3 text-amber-500 fill-current group-hover:animate-bounce" />
                        </button>
                    </div>

                    <div className="flex-1 relative overflow-hidden group">
                        {/* Flying Emojis Overlay */}
                        <div className="absolute inset-0 pointer-events-none z-50">
                            <AnimatePresence>
                                {reactions.map((r) => (
                                    <FlyingEmoji key={r.id} emojiId={r.emojiId} />
                                ))}
                            </AnimatePresence>
                        </div>

                        <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-4">
                            {/* Chat Messages */}
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="size-8 rounded-full bg-amber-500/10 border border-amber-500/20" />
                                    <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10">
                                        <p className="text-[10px] font-black text-amber-400 mb-1 uppercase tracking-widest">Rohit_Fan</p>
                                        <p className="text-xs font-medium text-white/70">MSD is just different gravy! 🐐</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reaction Bar & Input */}
                    <div className="p-6 bg-white/[0.02] space-y-4">
                        <div className="flex justify-between bg-black/40 p-2 rounded-2xl border border-white/5">
                            {["🔥", "🎯", "⚡", "🧤", "🧊"].map(e => (
                                <button 
                                    key={e}
                                    onClick={() => sendReaction(e)}
                                    className="p-2 hover:bg-white/10 rounded-xl transition-all hover:scale-125 hover:-translate-y-1 active:scale-95 text-xl"
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <input 
                                type="text" 
                                placeholder="Roast the bowler..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                            <button className="p-3 bg-indigo-600 rounded-2xl text-white hover:bg-indigo-500 transition-all active:scale-95 shadow-lg shadow-indigo-600/20">
                                <Send className="size-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                .shadow-glow { filter: drop-shadow(0 0 10px currentColor); }
            `}} />
        </div>
    );
};

// --- SUBCOMPONENT: 3D Flying Emoji ---
const FlyingEmoji = ({ emojiId }) => {
    const randomX = Math.random() * 80 + 10; // 10% to 90%
    const randomRotate = Math.random() * 360;

    return (
        <motion.div
            initial={{ y: "100%", x: `${randomX}%`, opacity: 0, scale: 0.5, rotate: 0 }}
            animate={{ 
                y: "-110%", 
                opacity: [0, 1, 1, 0], 
                scale: [0.5, 2, 2.5, 2],
                rotate: randomRotate
            }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute text-4xl select-none"
        >
            {emojiId}
        </motion.div>
    );
};

export default LiveArena;
