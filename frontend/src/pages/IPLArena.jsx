import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Zap, Trophy, Users, MessageSquare, Send, Award, Crown, 
  BarChart2, Flame, Clock, ChevronDown, Filter, LayoutGrid,
  Info, TrendingUp, Target, Shield, Heart, Share2, MoreHorizontal,
  Camera, Eye, Globe, Phone, X, Loader2, Languages
} from "lucide-react";
import Lottie from "lottie-react";
import { useMatch } from "../context/MatchContext";
import useAuthUser from "../hooks/useAuthUser";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

// Design Tokens
const TEAM_THEMES = {
  MI: { primary: "#004BA0", accent: "#00FFC8", secondary: "#001D4A" },
  CSK: { primary: "#F9CD05", accent: "#FDB913", secondary: "#704900" },
  RCB: { primary: "#EC1C24", accent: "#FFB800", secondary: "#2B2A29" },
  KKR: { primary: "#3A225D", accent: "#B3A123", secondary: "#1C112D" },
  SRH: { primary: "#FF822E", accent: "#000000", secondary: "#A05018" },
  DC: { primary: "#000080", accent: "#EF1B23", secondary: "#000040" },
  RR: { primary: "#EA1A85", accent: "#254AA5", secondary: "#700D40" },
  GT: { primary: "#1B2133", accent: "#CBA35C", secondary: "#0B0E1B" },
  LSG: { primary: "#0057E2", accent: "#E20E0E", secondary: "#002B70" },
  PBKS: { primary: "#D71920", accent: "#ED1B24", secondary: "#7A0E12" },
};

const IPLArena = () => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const { liveMatch } = useMatch();
    const [activeTab, setActiveTab] = useState("commentary");
    const [isSquadSheetOpen, setIsSquadSheetOpen] = useState(false);
    const [boundaryAlert, setBoundaryAlert] = useState(null);

    // ═══ AI WAR ROOM STATE ═══
    const [showExpertEye, setShowExpertEye] = useState(false);
    const [expertEyeAnalysis, setExpertEyeAnalysis] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [translatingMsg, setTranslatingMsg] = useState(null);
    const [translatedText, setTranslatedText] = useState({});
    const expertEyeInputRef = useRef(null);

    // Theme calculation
    const teamTheme = useMemo(() => {
        const teamCode = liveMatch?.battingTeam?.split(' ')?.[0]?.toUpperCase();
        return TEAM_THEMES[teamCode] || { primary: "#FF5722", accent: "#FF8A65", secondary: "#0B0E14" };
    }, [liveMatch]);

    // Mock "Arena Alert" trigger
    useEffect(() => {
        if (liveMatch?.lastBallEvent === '4' || liveMatch?.lastBallEvent === '6' || liveMatch?.lastBallEvent === 'W') {
            setBoundaryAlert(liveMatch.lastBallEvent);
            const timer = setTimeout(() => setBoundaryAlert(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [liveMatch?.lastBallEvent]);

    return (
        <div 
          className="relative min-h-screen bg-[#0B0E14] text-white overflow-hidden transition-colors duration-1000"
          style={{ 
            '--arena-accent': teamTheme.accent,
            '--arena-primary': teamTheme.primary 
          }}
        >
            {/* 1. IMMERSIVE STADIUM WALLPAPER */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center brightness-[0.4] scale-105 pointer-events-none transition-transform duration-[20s] ease-linear"
              style={{ 
                backgroundImage: 'url("/bg-arena.png")',
                animation: 'slowPan 30s infinite alternate'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E14]/20 via-[#0B0E14]/80 to-[#0B0E14] z-0" />

            {/* 2. ARENA ALERT GLOW */}
            <AnimatePresence>
                {boundaryAlert && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 pointer-events-none ring-[12px] ring-inset transition-all duration-300 ${
                            boundaryAlert === '6' ? 'ring-amber-500 shadow-[inset_0_0_100px_rgba(245,158,11,0.5)]' :
                            boundaryAlert === '4' ? 'ring-blue-500 shadow-[inset_0_0_100px_rgba(59,130,246,0.5)]' :
                            'ring-red-600 shadow-[inset_0_0_100px_rgba(220,38,38,0.5)]'
                        }`}
                    />
                )}
            </AnimatePresence>

            {/* 3. TOP NAVIGATION (MATCH SELECTOR & MODE) */}
            <header className="relative z-20 px-6 py-4 flex items-center justify-between border-b border-white/5 backdrop-blur-md bg-black/20">
                <div className="flex items-center gap-6">
                    <button 
                      onClick={() => navigate(-1)}
                      className="p-2 rounded-full hover:bg-white/5 transition-colors"
                    >
                      <ChevronDown className="size-6 rotate-90" />
                    </button>
                    {/* PC Header */}
                    <div className="hidden md:block">
                        <div className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Live Match Center</span>
                        </div>
                        <h1 className="text-xl font-black italic tracking-tight">{liveMatch?.matchName || "IPL 2026: MI vs CSK"}</h1>
                    </div>
                </div>

                {/* Mobile Header (Centered) */}
                <div className="md:hidden absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
                    <h2 className="text-lg font-black italic tracking-tighter uppercase">{liveMatch?.matchName || "ICC Champions Trophy"}</h2>
                </div>

                <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
                    {["scorecard", "fantasy", "commentary", "stats", "social"].map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === tab 
                              ? "bg-[var(--arena-primary)] text-white shadow-lg" 
                              : "text-white/40 hover:text-white"
                          }`}
                        >
                            {tab}
                        </button>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-black text-white/30 uppercase">Your Wallet</p>
                        <p className="text-sm font-black text-orange-500">🪙 {authUser?.bondCoins || 0}</p>
                    </div>
                    <div className="size-10 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <Zap className="size-5 fill-white" />
                    </div>
                </div>
            </header>

            <main className="relative z-10 p-6 max-w-[1920px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* LEFT COLUMN: BROADCAST & STATS (Span 3) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <section className="glass-card p-6 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-white/40 flex items-center gap-2">
                                    <Clock className="size-4" /> Match Info
                                </h3>
                                <Info className="size-4 text-white/20" />
                            </div>
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Venue</p>
                                    <p className="text-sm font-black italic">M. Chinnaswamy Stadium</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Weather</p>
                                    <p className="text-sm font-black italic">24°C - Clear Sky</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-[10px] font-bold text-white/30 uppercase mb-1">Toss</p>
                                    <p className="text-sm font-black italic">CSK won & opted to bowl</p>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card p-6 rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6 flex items-center gap-2">
                                <TrendingUp className="size-4" /> Win Probability
                            </h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex-1 h-3 bg-blue-600 rounded-full overflow-hidden flex">
                                    <div className="h-full bg-yellow-400" style={{ width: '42%' }} />
                                </div>
                            </div>
                            <div className="flex justify-between text-xs font-black uppercase">
                                <span className="text-yellow-400">CSK 42%</span>
                                <span className="text-blue-500">MI 58%</span>
                            </div>
                        </section>
                    </aside>

                    {/* CENTER COLUMN: LIVE SCOREBOARD & SQUAD (Span 6) */}
                    <div className="lg:col-span-6 space-y-6">
                        
                        {/* Mobile Navigation Tabs - Only on Small Screens */}
                        <div className="md:hidden flex bg-[#1A1F2E] p-1.5 rounded-2xl border border-white/5 mx-2">
                            {["point", "scorecard", "summary"].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        activeTab === tab 
                                            ? "bg-[#FF3366] text-white shadow-lg" 
                                            : "text-white/30"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        
                        {/* THE HERO BANNER */}
                        <motion.section 
                          initial={{ scale: 0.95, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          className="relative h-[280px] rounded-[48px] overflow-hidden border border-white/10 group bg-[#004BA0]/20"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--arena-primary)]/40 to-black/80 z-0" />
                            
                            <div className="relative z-10 h-full flex flex-col items-center justify-center p-8">
                                <div className="flex items-center justify-between w-full max-w-lg mb-8">
                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <div className="size-24 rounded-full bg-white/10 p-4 border border-white/20 backdrop-blur-xl mb-4">
                                            <Shield className="size-full text-blue-500 fill-blue-500/20" />
                                        </div>
                                        <p className="font-black italic text-xl">MI</p>
                                    </div>

                                    <div className="text-center">
                                        <motion.h2 
                                          key={liveMatch?.score}
                                          initial={{ scale: 0.8 }}
                                          animate={{ scale: 1.2 }}
                                          className="text-7xl font-black italic tracking-tighter drop-shadow-2xl"
                                        >
                                            {liveMatch?.score || "184/5"}
                                        </motion.h2>
                                        <p className="text-sm font-bold tracking-[0.3em] text-white/60 mt-2 uppercase">18.4 OVERS</p>
                                    </div>

                                    <div className="text-center group-hover:scale-110 transition-transform">
                                        <div className="size-24 rounded-full bg-white/10 p-4 border border-white/20 backdrop-blur-xl mb-4">
                                            <Shield className="size-full text-yellow-500 fill-yellow-500/20" />
                                        </div>
                                        <p className="font-black italic text-xl">CSK</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {(liveMatch?.last12Balls || ["0", "1", "4", "0", "1", "W"]).map((b, i) => (
                                        <motion.div 
                                          key={i}
                                          initial={{ x: 20, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          transition={{ delay: i * 0.05 }}
                                          className={`size-10 rounded-xl flex items-center justify-center font-black text-sm border ${
                                            b === 'W' ? 'bg-red-600 border-red-500' :
                                            b === '6' ? 'bg-amber-500 border-amber-400 text-black' :
                                            b === '4' ? 'bg-blue-600 border-blue-500' :
                                            'bg-white/5 border-white/10 text-white/40'
                                          }`}
                                        >
                                            {b}
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Strike Rate/Economy Glow */}
                            <div className="absolute bottom-6 right-10 flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-[8px] font-black uppercase text-white/40">CRR</p>
                                    <p className="text-lg font-black italic">9.24</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[8px] font-black uppercase text-white/40">RRR</p>
                                    <p className="text-lg font-black italic text-amber-500">11.60</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* SUB-TABS CONTENT AREA */}
                        <section className="min-h-[400px]">
                            {activeTab === 'commentary' && (
                                <div className="space-y-4">
                                    {[
                                        { over: "18.4", text: "Wide! Bumrah tries the yorker but spills it outside off. Frustration on his face.", tag: "EX-RUN" },
                                        { over: "18.3", text: "SIX! Into the stands. Dhoni connects purely and it's sailing over long on.", tag: "6 RUNS" },
                                        { over: "18.2", text: "OUT! Hardik catches it. A miscue from Jadeja and MI get the breakthrough.", tag: "WICKET" }
                                    ].map((c, i) => (
                                        <motion.div 
                                          key={i}
                                          initial={{ x: -20, opacity: 0 }}
                                          animate={{ x: 0, opacity: 1 }}
                                          className="p-6 rounded-[32px] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex gap-6 items-start"
                                        >
                                            <div className="bg-white/10 px-4 py-2 rounded-2xl font-black italic text-lg">{c.over}</div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium leading-relaxed text-white/80">{c.text}</p>
                                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    c.tag === 'WICKET' ? 'bg-red-600' : 
                                                    c.tag === '6 RUNS' ? 'bg-amber-500 text-black' : 'bg-white/20'
                                                }`}>{c.tag}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'point' && (
                                <div className="space-y-3 px-2">
                                    {/* Leaderboard Header */}
                                    <div className="bg-[#1A1F2E] p-5 rounded-2xl flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/40 mb-4 border border-white/5">
                                        <div className="flex-1">Names</div>
                                        <div className="w-20 text-center">Points</div>
                                        <div className="w-16 text-right">Ranks</div>
                                    </div>
                                    
                                    {[
                                        { name: "Sonya R", points: 325, rank: 1, img: "/avatar-1.png" },
                                        { name: "Akshay", points: 305, rank: 2, img: "/avatar-2.png" },
                                        { name: "joey KK", points: 315, rank: 3, img: "/avatar-3.png" },
                                        { name: "Phillip A", points: 250, rank: 4, img: "/avatar-4.png" }
                                    ].map((user, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="bg-[#1A1F2E] p-4 rounded-2xl flex items-center justify-between border border-white/5 group hover:bg-white/5 transition-all"
                                        >
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="size-12 rounded-full overflow-hidden border border-white/10 p-0.5 bg-gradient-to-tr from-orange-500/20 to-transparent">
                                                    <img src={user.img} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                                </div>
                                                <p className="text-sm font-black italic">{user.name}</p>
                                            </div>
                                            <div className="w-20 text-center">
                                                <p className="text-sm font-black italic text-white/60">{user.points}</p>
                                            </div>
                                            <div className="w-16 text-right">
                                                <p className="text-sm font-black italic opacity-40">{user.rank}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {activeTab === 'fantasy' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-card p-8 rounded-[40px] bg-orange-500/10 border border-orange-500/20 text-center space-y-4">
                                        <Award className="size-16 text-orange-500 mx-auto" />
                                        <h4 className="text-2xl font-black italic">My Live Score</h4>
                                        <p className="text-5xl font-black text-white italic">412 <span className="text-xl opacity-50 font-medium">pts</span></p>
                                        <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">Rank #124  •  Top 5%</p>
                                    </div>

                                    <div 
                                      onClick={() => setIsSquadSheetOpen(true)}
                                      className="glass-card p-8 rounded-[40px] bg-white/5 border border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all group"
                                    >
                                        <LayoutGrid className="size-12 text-white/40 mb-4 group-hover:scale-110 transition-transform" />
                                        <p className="font-black italic text-lg">Veiw Detailed Squad</p>
                                        <p className="text-xs text-white/30 font-bold uppercase mt-2">Check Individual stats</p>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* RIGHT COLUMN: MARKETS & CHAT (Span 3) */}
                    <aside className="lg:col-span-3 space-y-6">
                        <section className="glass-card rounded-[32px] overflow-hidden border border-white/10 bg-[#0B0E14]/40">
                            <div className="p-6 bg-white/[0.03] border-b border-white/10">
                                <h3 className="text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Target className="size-4 text-orange-500" /> Active Sessions
                                </h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-2xl">
                                    <p className="text-xs font-black">20 Over Score</p>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-xl font-black text-xs border border-blue-500/20">194.5 Y</button>
                                        <button className="px-4 py-2 bg-red-600/20 text-red-400 rounded-xl font-black text-xs border border-red-500/20">194.5 N</button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="glass-card h-[400px] flex flex-col rounded-[32px] overflow-hidden border border-white/10 bg-[#0B0E14]/60">
                            <div className="p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
                                <p className="text-xs font-black uppercase tracking-widest text-white/40">Arena Chat</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-orange-500 text-white px-2 py-0.5 rounded-full font-black">1.2k</span>
                                    <button 
                                      className="p-1.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors" 
                                      title="Global Translator"
                                    >
                                        <Languages className="size-3.5 text-white/40" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto space-y-4 no-scrollbar">
                                {/* Chat messages with translate buttons */}
                                {[
                                    { user: "Virat_Fan", text: "This is going to the final ball! 😱", color: "blue" },
                                    { user: "CSK_Ultra", text: "Dhoni bhai aaj toh kuch alag hi khel rahe hain! 🐐", color: "amber" },
                                    { user: "Seoul_Cricket", text: "이번 시즌 최고의 경기예요!", color: "pink" },
                                ].map((msg, idx) => (
                                    <div key={idx} className="flex gap-3 group">
                                        <div className={`size-8 rounded-full bg-${msg.color}-500/20 flex items-center justify-center shrink-0`}>
                                            <Users className={`size-4 text-${msg.color}-500`} />
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none flex-1">
                                            <p className={`text-[10px] font-black text-${msg.color}-400 mb-1`}>{msg.user}</p>
                                            <p className="text-xs font-medium">{translatedText[idx] || msg.text}</p>
                                            {translatedText[idx] && (
                                                <p className="text-[9px] text-white/30 mt-1 italic">Original: {msg.text}</p>
                                            )}
                                            {/* Translate Button */}
                                            <button 
                                              className="opacity-0 group-hover:opacity-100 transition-opacity mt-1.5 flex items-center gap-1 text-[9px] text-cyan-400 font-bold uppercase tracking-wider hover:text-cyan-300"
                                              onClick={async () => {
                                                  if (translatedText[idx]) {
                                                      setTranslatedText(prev => { const n = {...prev}; delete n[idx]; return n; });
                                                      return;
                                                  }
                                                  setTranslatingMsg(idx);
                                                  try {
                                                      const { data } = await axiosInstance.post("/chat/ai-translate", {
                                                          text: msg.text,
                                                          targetLang: "en"
                                                      });
                                                      setTranslatedText(prev => ({ ...prev, [idx]: data.translatedText }));
                                                  } catch {
                                                      toast.error("Translation failed");
                                                  } finally {
                                                      setTranslatingMsg(null);
                                                  }
                                              }}
                                            >
                                                {translatingMsg === idx ? (
                                                    <Loader2 className="size-3 animate-spin" />
                                                ) : (
                                                    <Globe className="size-3" />
                                                )}
                                                {translatedText[idx] ? "Show Original" : "Translate"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-white/[0.02] border-t border-white/10 flex gap-2">
                                <input 
                                  type="text" 
                                  placeholder="Type here..." 
                                  className="flex-1 bg-white/5 rounded-xl px-4 py-2 text-xs focus:outline-none"
                                />
                                <button className="p-2 bg-orange-500 rounded-xl"><Send className="size-4" /></button>
                            </div>
                        </section>
                    </aside>
                </div>
            </main>

            {/* ═══ AI WAR ROOM FLOATING CONTROLS ═══ */}
            <div className="fixed bottom-10 right-10 z-40 flex flex-col gap-3 items-end">
                {/* Expert Eye Button */}
                <button 
                  onClick={() => setShowExpertEye(true)}
                  className="size-14 bg-gradient-to-tr from-cyan-600 to-cyan-400 rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-2 border-white/10 group"
                  title="Expert Eye — Analyze Match"
                >
                    <Eye className="size-6 text-white group-hover:scale-110 transition-transform" />
                </button>

                {/* Commander Call Button */}
                <button 
                  onClick={() => navigate("/ai-face-call/ai-match-analyst")}
                  className="size-16 bg-gradient-to-tr from-orange-600 to-orange-400 rounded-full shadow-2xl shadow-orange-500/40 flex items-center justify-center hover:scale-110 active:scale-90 transition-all border-4 border-white/10 group relative"
                  title="Call Commander — AI Match Analyst"
                >
                    <Phone className="size-7 text-white group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 size-5 bg-red-500 rounded-full flex items-center justify-center border-2 border-[#0B0E14]">
                        <span className="text-[7px] font-black text-white">AI</span>
                    </div>
                </button>
            </div>

            {/* ═══ EXPERT EYE — Screenshot Analysis Modal ═══ */}
            <AnimatePresence>
                {showExpertEye && (
                    <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => { setShowExpertEye(false); setExpertEyeAnalysis(null); }}
                          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div 
                          initial={{ y: "100%", opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: "100%", opacity: 0 }}
                          className="fixed bottom-0 inset-x-0 max-h-[85vh] bg-[#0B0E14] border-t border-cyan-500/20 rounded-t-[40px] z-[70] p-6 shadow-2xl overflow-y-auto"
                        >
                            <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
                            
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-gradient-to-tr from-cyan-500 to-cyan-400 rounded-xl flex items-center justify-center">
                                        <Eye className="size-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black italic tracking-tighter">Expert Eye</h2>
                                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">AI Pitch & Match Analyzer</p>
                                    </div>
                                </div>
                                <button 
                                  onClick={() => { setShowExpertEye(false); setExpertEyeAnalysis(null); }}
                                  className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    <X className="size-5" />
                                </button>
                            </div>

                            {/* Upload Zone */}
                            {!expertEyeAnalysis && (
                                <div className="space-y-4">
                                    <div 
                                      onClick={() => expertEyeInputRef.current?.click()}
                                      className="border-2 border-dashed border-cyan-500/30 rounded-[32px] p-12 text-center cursor-pointer hover:bg-cyan-500/5 transition-all group"
                                    >
                                        {isAnalyzing ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="size-12 text-cyan-400 animate-spin" />
                                                <p className="text-sm font-bold text-white/60">Commander analyzing pitch...</p>
                                            </div>
                                        ) : (
                                            <>
                                                <Camera className="size-16 text-cyan-400/50 mx-auto mb-4 group-hover:scale-105 transition-transform" />
                                                <p className="text-sm font-black italic text-white/80">Snap your TV Screen</p>
                                                <p className="text-xs text-white/30 mt-2">AI will analyze pitch conditions, field placement & give fantasy advice</p>
                                            </>
                                        )}
                                    </div>
                                    <input 
                                      ref={expertEyeInputRef}
                                      type="file" 
                                      accept="image/*" 
                                      capture="environment"
                                      className="hidden" 
                                      onChange={async (e) => {
                                          const file = e.target.files?.[0];
                                          if (!file) return;
                                          setIsAnalyzing(true);
                                          try {
                                              const reader = new FileReader();
                                              reader.onloadend = async () => {
                                                  try {
                                                      const { data } = await axiosInstance.post("/chat/analyze-screenshot", {
                                                          image: reader.result,
                                                          context: liveMatch?.matchName || ""
                                                      });
                                                      setExpertEyeAnalysis(data.analysis);
                                                      toast.success("Analysis ready! 🏏");
                                                  } catch (err) {
                                                      toast.error("Analysis failed. Try again.");
                                                      console.error(err);
                                                  } finally {
                                                      setIsAnalyzing(false);
                                                  }
                                              };
                                              reader.readAsDataURL(file);
                                          } catch {
                                              setIsAnalyzing(false);
                                              toast.error("Could not read image");
                                          }
                                          if (expertEyeInputRef.current) expertEyeInputRef.current.value = "";
                                      }}
                                    />
                                </div>
                            )}

                            {/* Analysis Result */}
                            {expertEyeAnalysis && (
                                <div className="space-y-4">
                                    <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-[24px] border border-cyan-500/20">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Eye className="size-4 text-cyan-400" />
                                            <p className="text-xs font-black uppercase tracking-widest text-cyan-400">Commander's Analysis</p>
                                        </div>
                                        <p className="text-sm font-medium leading-relaxed text-white/80 whitespace-pre-wrap">{expertEyeAnalysis}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <button 
                                          onClick={() => { setExpertEyeAnalysis(null); setShowExpertEye(true); }}
                                          className="flex-1 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                        >
                                            Analyze Another
                                        </button>
                                        <button 
                                          onClick={() => navigate("/ai-face-call/ai-match-analyst")}
                                          className="flex-1 py-3 bg-cyan-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-cyan-500 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Phone className="size-4" /> Call Commander
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* MOBILE SQUAD SHEET */}
            <AnimatePresence>
                {isSquadSheetOpen && (
                    <>
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setIsSquadSheetOpen(false)}
                          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <motion.div 
                          initial={{ y: "100%" }}
                          animate={{ y: 0 }}
                          exit={{ y: "100%" }}
                          className="fixed bottom-0 inset-x-0 h-[80vh] bg-[#0B0E14] border-t border-white/10 rounded-t-[48px] z-[70] p-8 shadow-2xl"
                        >
                            <div className="w-16 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-3xl font-black italic tracking-tighter">Squad Management</h2>
                                <button 
                                  onClick={() => setIsSquadSheetOpen(false)}
                                  className="p-3 bg-white/5 rounded-2xl"
                                >
                                    <Filter className="size-6" />
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto h-[calc(80vh-160px)] no-scrollbar pb-20">
                                {[1,2,3,4,5,6,7,8,9,10,11].map(i => (
                                    <div key={i} className="p-6 rounded-[32px] bg-white/5 border border-white/5 flex items-center gap-6 group hover:bg-white/10 transition-all">
                                        <div className="size-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent p-1">
                                            <div className="size-full rounded-xl overflow-hidden bg-black/40">
                                                <img src={`/player-${i}.png`} alt="Player" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-black italic text-lg">Surya Kumar Yadav</p>
                                            <div className="flex gap-4 mt-1">
                                                <p className="text-[10px] font-bold text-white/30 uppercase">SR: 184.2</p>
                                                <p className="text-[10px] font-bold text-orange-400 uppercase">Points: 72</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes slowPan {
                    from { transform: scale(1.1) translateX(-2%); }
                    to { transform: scale(1.1) translateX(2%); }
                }
                .glass-card {
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
                }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}} />
        </div>
    );
};

export default IPLArena;
