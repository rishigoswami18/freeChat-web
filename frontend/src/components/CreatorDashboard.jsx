import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Gem, Activity, CreditCard, Award, ArrowUpRight, Sparkles, Send, Settings, Lightbulb, RefreshCw, ChevronRight, Trophy, Medal, Star, Gamepad2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import { getAIContentStrategy, updateAutomationSettings, getCreatorLeaderboard } from '../lib/api';
import toast from 'react-hot-toast';
import useAuthUser from '../hooks/useAuthUser';
import AirdropModal from './AirdropModal';

/**
 * Creator Dashboard — The monetization command center for Zyro Creators.
 * Features glassmorphism, real-time metrics, and AI-driven growth tools.
 */

const StatCard = ({ icon: Icon, label, value, trend, colorClass, isLoading }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className={`bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] relative overflow-hidden group ${isLoading ? 'animate-pulse' : ''}`}
  >
    <div className={`absolute top-0 right-0 size-24 blur-[60px] opacity-20 transition-all group-hover:opacity-40 ${colorClass}`} />
    <div className="flex justify-between items-start mb-6">
      <div className={`p-4 rounded-2xl ${colorClass}/10 text-white`}>
        <Icon className="size-6" />
      </div>
      {!isLoading && (
        <div className={`flex items-center gap-1 text-xs font-black ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
          <ArrowUpRight className={`size-3 ${trend < 0 ? 'rotate-90' : ''}`} />
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <div>
      <p className="text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
      <h3 className="text-3xl font-black text-white mt-1 tracking-tighter">
        {isLoading ? "---" : value}
      </h3>
    </div>
  </motion.div>
);

const CreatorDashboard = () => {
  const queryClient = useQueryClient();
  const { authUser } = useAuthUser();
  const [isAutomationOpen, setIsAutomationOpen] = useState(false);
  const [isAirdropOpen, setIsAirdropOpen] = useState(false);
  const [automationMessage, setAutomationMessage] = useState(authUser?.autoReplyMessage || "");
  const [isAutoReplyEnabled, setIsAutoReplyEnabled] = useState(authUser?.isAutoReplyEnabled || false);
  const [niche, setNiche] = useState(authUser?.contentNiche || "Lifestyle");

  // --- QUERIES ---
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['creatorStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/stats');
      return res.data;
    }
  });

  const { data: eliteFans, isLoading: fansLoading } = useQuery({
    queryKey: ['creatorEliteFans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/elite-fans');
      return res.data;
    }
  });

  const { data: activities, isLoading: tickerLoading } = useQuery({
    queryKey: ['creatorActivities'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/activities');
      return res.data;
    },
    refetchInterval: 10000 
  });

  const { data: analytics } = useQuery({
    queryKey: ['creatorAnalytics'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/analytics');
      return res.data;
    }
  });

  const { data: leaderboard, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['creatorLeaderboard'],
    queryFn: getCreatorLeaderboard,
    refetchInterval: 60000 
  });

  const { data: aiSuggestions, isFetching: suggestionsLoading, refetch: getSuggestions } = useQuery({
    queryKey: ['aiSuggestions'],
    queryFn: getAIContentStrategy,
    enabled: false 
  });

  // --- MUTATIONS ---
  const updateSettingsMutation = useMutation({
    mutationFn: updateAutomationSettings,
    onSuccess: () => {
        toast.success("Engagement automation synced! ⚡");
        queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: () => toast.error("Failed to sync settings")
  });

  const handleSaveAutomation = () => {
    updateSettingsMutation.mutate({
        isAutoReplyEnabled,
        autoReplyMessage: automationMessage,
        contentNiche: niche
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] p-4 lg:p-12 text-white font-outfit overflow-x-hidden pb-32">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-indigo-500 font-black text-[10px] uppercase tracking-[0.3em]"
            >
              <div className="size-2 bg-indigo-500 animate-pulse rounded-full" /> LIVE REVENUE ENGINE
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent italic">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link 
                to="/mini-games" 
                className="flex-1 md:flex-none px-6 py-4 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-2xl font-bold hover:bg-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Gamepad2 className="size-4" /> Play & Earn
            </Link>
            <button className="flex-1 md:flex-none px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
              <CreditCard className="size-4" /> Withdraw
            </button>
            <button 
                onClick={() => setIsAutomationOpen(!isAutomationOpen)}
                className={`flex-1 md:flex-none px-6 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 ${isAutomationOpen ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" : "bg-white/5 border border-white/10"}`}
            >
              <Settings className={`size-4 ${isAutomationOpen ? "animate-spin-slow" : ""}`} /> Settings
            </button>
          </div>
        </header>

        {/* Global Performance Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard icon={DollarSign} label="Net Revenue" value={`🪙 ${stats?.totalEarnings || "0"}`} trend={stats?.trends?.revenue || 0} colorClass="bg-emerald-500" isLoading={statsLoading} />
          <StatCard icon={Gem} label="Total Unlocks" value={stats?.totalBonds || "0"} trend={stats?.trends?.bonds || 0} colorClass="bg-amber-500" isLoading={statsLoading} />
          <StatCard icon={Award} label="Top 1% Fans" value={stats?.eliteFansCount || "0"} trend={stats?.trends?.fans || 0} colorClass="bg-purple-500" isLoading={statsLoading} />
          <StatCard icon={Activity} label="Vibe Velocity" value={stats?.vibeVelocity || "Stable"} trend={0} colorClass="bg-orange-500" isLoading={statsLoading} />
        </div>

        {/* Creator Level Tier */}
        {stats?.creatorLevel && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 size-32 blur-[80px] opacity-20 bg-amber-500" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="text-4xl">{stats.creatorLevel.icon}</div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">Creator Tier</p>
                  <h3 className="text-2xl font-black italic tracking-tighter">{stats.creatorLevel.name}</h3>
                </div>
              </div>
              <div className="flex-1 max-w-md w-full space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-white/30">{stats.creatorLevel.next ? `Next: 🪙 ${stats.creatorLevel.next?.toLocaleString()}` : "MAX LEVEL"}</span>
                  <span className="text-amber-500">{Math.round(stats.nextLevelProgress)}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.nextLevelProgress}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" 
                  />
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Platform Fee</p>
                <p className="text-xl font-black text-emerald-400">{stats.creatorLevel.fee}%</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* --- AI AUTOMATION PANEL --- */}
        <AnimatePresence>
            {isAutomationOpen && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-10 space-y-10">
                        <div className="flex flex-col md:flex-row justify-between gap-10">
                            <div className="flex-1 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                            <Send className="size-5" />
                                        </div>
                                        <h3 className="text-xl font-black italic tracking-tight">Auto-Welcome Pulse</h3>
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        className="toggle toggle-primary"
                                        checked={isAutoReplyEnabled}
                                        onChange={(e) => setIsAutoReplyEnabled(e.target.checked)}
                                    />
                                </div>
                                <textarea 
                                    className="w-full h-32 bg-white/5 border border-white/10 rounded-3xl p-6 text-sm font-bold focus:border-indigo-500 transition-all outline-none resize-none"
                                    placeholder="Compose your custom welcome message..."
                                    value={automationMessage}
                                    onChange={(e) => setAutomationMessage(e.target.value)}
                                />
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="w-full sm:flex-1">
                                        <select 
                                            className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-6 text-sm font-black outline-none appearance-none cursor-pointer"
                                            value={niche}
                                            onChange={(e) => setNiche(e.target.value)}
                                        >
                                            {["Lifestyle", "Gaming", "Finance", "Entertainment", "Fitness", "Tech"].map(n => (
                                                <option key={n} value={n} className="bg-[#121212]">{n}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <button 
                                        onClick={handleSaveAutomation}
                                        disabled={updateSettingsMutation.isPending}
                                        className="w-full sm:w-auto h-14 px-10 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                                    >
                                        {updateSettingsMutation.isPending ? <RefreshCw className="animate-spin size-4" /> : "Save Settings"}
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                        <Sparkles className="size-5" />
                                    </div>
                                    <h3 className="text-xl font-black italic tracking-tight">AI Strategy Engine</h3>
                                </div>
                                <div className="bg-gradient-to-br from-white/5 to-transparent rounded-3xl p-6 border border-white/5 min-h-[12rem] flex flex-col justify-center items-center text-center space-y-4">
                                    <p className="text-[10px] font-black uppercase text-white/30 max-w-[200px] leading-relaxed">Gemini will analyze your niche and suggest content strategies</p>
                                    <button 
                                        onClick={() => getSuggestions()}
                                        disabled={suggestionsLoading}
                                        className="h-12 px-8 bg-amber-500 text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                                    >
                                        {suggestionsLoading ? <RefreshCw className="animate-spin size-4" /> : "Generate Ideas"}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {aiSuggestions && (
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/5"
                            >
                                {aiSuggestions.map((idea, i) => (
                                    <div key={i} className="bg-white/5 rounded-[2rem] p-6 border border-white/5 space-y-4 hover:bg-white/10 transition-all cursor-default">
                                        <h4 className="text-sm font-black leading-tight italic">{idea.title}</h4>
                                        <p className="text-[10px] font-bold text-white/40 line-clamp-3">{idea.description}</p>
                                        <div className="pt-2">
                                            <p className="text-[10px] font-black underline decoration-amber-500 decoration-2 underline-offset-4 italic line-clamp-2">"{idea.caption}"</p>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        {/* Main Content: Pulse & Elite League */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Live Revenue Pulse (Ticker) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-2xl font-black tracking-tighter italic">Live Pulse</h2>
                 <div className="flex items-center gap-2 text-[8px] font-black uppercase text-white/30 tracking-[0.3em]">
                   <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> STREAMING EVENTS
                 </div>
               </div>

               <div className="space-y-4">
                 {tickerLoading ? (
                   <div className="flex justify-center p-10 opacity-20"><Activity className="animate-spin" /></div>
                 ) : activities?.length === 0 ? (
                   <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20 font-bold uppercase tracking-widest text-[10px]">
                      Awaiting your first social unlock...
                   </div>
                 ) : activities?.map((activity, idx) => (
                   <motion.div 
                     key={activity._id}
                     initial={{ opacity: 0, x: -10 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: idx * 0.05 }}
                     className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all"
                   >
                     <div className="flex items-center gap-4">
                       <div className="relative">
                            <img src={activity.userId?.profilePic || "/avatar.png"} className="size-10 rounded-xl object-cover ring-2 ring-white/5" alt="" />
                            <div className="absolute -top-1 -right-1 size-3 bg-emerald-500 border-2 border-[#121212] rounded-full" />
                       </div>
                       <div>
                         <p className="font-bold text-sm">@{activity.userId?.fullName.split(' ')[0]}</p>
                         <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{activity.type.replace('_', ' ')}</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <p className="font-black text-emerald-400 uppercase text-xs">+ 🪙 {Math.abs(activity.amount)}</p>
                     </div>
                   </motion.div>
                 ))}
               </div>
            </div>

            {/* Global Trends Leaderboard */}
            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8">
               <div className="flex justify-between items-center mb-10">
                 <h2 className="text-xl font-black tracking-tighter italic">Global Arena Rankings</h2>
                 <Trophy className="size-5 text-amber-500" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {leaderboardLoading ? (
                    <div className="col-span-full py-10 opacity-20 text-center"><RefreshCw className="animate-spin mx-auto" /></div>
                 ) : leaderboard?.map((creator, i) => (
                    <div key={creator._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={`size-8 rounded-lg flex items-center justify-center font-black text-xs ${i < 3 ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'bg-white/10'}`}>
                             {i === 0 ? <Medal className="size-4" /> : i + 1}
                          </div>
                          <img src={creator.userId?.profilePic || "/avatar.png"} className="size-10 rounded-xl object-cover" alt="" />
                          <div>
                             <p className="text-xs font-black italic">{creator.userId?.fullName}</p>
                             <p className="text-[8px] font-black text-white/30 truncate max-w-[100px]">@{creator.userId?.username}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-black text-emerald-400">🪙 {creator.winnings.toLocaleString()}</p>
                          <p className="text-[8px] font-black opacity-30 uppercase tracking-[0.2em]">{creator.userId?.followersCount || 0} FANS</p>
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          </div>

          {/* Elite Fan Leaderboard */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-indigo-600 rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                   <TrendingUp className="size-24" />
                </div>
                <h3 className="text-xl font-black mb-10 italic relative z-10">Elite League</h3>
                <div className="space-y-8 relative z-10">
                   {fansLoading ? (
                     <div className="opacity-50">Syncing Fan Neural States...</div>
                   ) : eliteFans?.length === 0 ? (
                     <div className="text-sm font-bold opacity-40 italic py-10">Engagement engine pending...</div>
                   ) : eliteFans?.map((fan, i) => (
                     <div key={fan._id} className="flex items-center gap-4">
                        <div className="size-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs ring-2 ring-white/10">{i+1}</div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-sm tracking-tight">{fan.fanId?.name.split(' ')[0]}</span>
                             <span className="text-[10px] font-black">🪙 {fan.bondScore}</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, (fan.bondScore / (eliteFans[0]?.bondScore || 1)) * 100)}%` }}
                                className="h-full bg-white rounded-full" 
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                {eliteFans?.length > 0 && (
                  <button 
                    onClick={() => setIsAirdropOpen(true)}
                    className="w-full mt-10 py-5 bg-white text-indigo-600 rounded-2xl font-black hover:scale-[1.02] transition-all shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <Star className="size-4 fill-indigo-600" /> REWARD TOP FANS
                  </button>
                )}
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-center group cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Activity className="size-8 text-indigo-500/40" />
                    <ChevronRight className="size-4 text-white/10 group-hover:translate-x-1 transition-transform" />
                </div>
                <h4 className="text-[10px] font-black text-white/40 leading-relaxed italic uppercase tracking-widest leading-loose">
                  {eliteFans?.length > 0 
                    ? `Elite fans drive massive social earn velocity.`
                    : "Grow your bond score to unlock the revenue engine."}
                </h4>
             </div>
          </div>

        </div>
      </div>

      <AirdropModal 
        isOpen={isAirdropOpen} 
        onClose={() => setIsAirdropOpen(false)} 
        eliteFans={eliteFans} 
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .animate-spin-slow { animation: spin 8s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}} />
    </div>
  );
};

export default CreatorDashboard;
