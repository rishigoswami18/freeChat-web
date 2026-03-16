import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, Zap, Timer, TrendingUp, Target, Award, Gem, MessageSquare, ShieldAlert } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import IplPredictionPopup from "../components/IplPredictionPopup";
import useAuthUser from "../hooks/useAuthUser";
import FanPulse from "../components/FanPulse";

const ScoreCard = ({ team, isLive, color }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] relative overflow-hidden group"
  >
    <div className={`absolute -top-10 -right-10 size-40 blur-[80px] opacity-20 transition-all group-hover:opacity-40`} style={{ backgroundColor: color }} />
    <div className="flex items-center justify-between mb-8 relative z-10">
      <div className="flex items-center gap-4">
        <div className="size-16 rounded-2xl bg-white/5 p-2 flex items-center justify-center border border-white/10">
          <img src={team.logo} alt={team.name} className="size-12 object-contain" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tighter">{team.name}</h2>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">
            {isLive ? 'Current Inning' : 'Waiting...'}
          </span>
        </div>
      </div>
    </div>
    <div className="relative z-10">
       <h3 className="text-4xl font-black tracking-tighter text-white mb-2">{team.score}</h3>
       <p className="text-sm font-bold text-white/40">({team.overs} Overs)</p>
    </div>
  </motion.div>
);

const PredictSlider = ({ prompt, options, onPredict }) => {
  const [value, setValue] = useState(0);

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 p-8 opacity-10">
        <Zap className="size-24" />
      </div>
      <div className="relative z-10 space-y-8">
        <div>
          <h3 className="text-2xl font-black italic tracking-tight">{prompt}</h3>
          <p className="text-white/60 text-sm font-bold mt-2 uppercase tracking-widest">Stake your reputation & win Gems</p>
        </div>

        <div className="space-y-6">
          <input 
            type="range" 
            min="0" 
            max={options.length - 1} 
            step="1" 
            value={value} 
            onChange={(e) => setValue(parseInt(e.target.value))}
            className="w-full h-3 bg-white/20 rounded-full appearance-none cursor-pointer accent-white"
          />
          <div className="flex justify-between px-2">
            {options.map((opt, i) => (
              <span key={i} className={`text-xs font-black transition-all ${value === i ? 'text-white scale-125' : 'text-white/40'}`}>
                {opt}
              </span>
            ))}
          </div>
        </div>

        <button 
          onClick={() => onPredict(options[value])}
          className="w-full py-5 bg-white text-indigo-600 rounded-3xl font-black text-lg hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl"
        >
          LOCK PREDICTION <Target className="size-5" />
        </button>
      </div>
    </div>
  );
};


const IplDashboard = () => {
  const { authUser } = useAuthUser();
  const { data, isLoading } = useQuery({
    queryKey: ['iplLiveStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/live-stats');
      return res.data;
    },
    refetchInterval: 5000 // Polling every 5 seconds
  });

  const predictionMutation = useMutation({
    mutationFn: (prediction) => axiosInstance.post('/ipl/predict', { prediction }),
    onSuccess: (data) => {
      toast.success(data.data.message, {
        icon: '🏏',
        style: { borderRadius: '20px', background: '#333', color: '#fff' }
      });
    }
  });

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[#050505] text-white">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
        <Trophy className="size-12 text-indigo-500" />
      </motion.div>
    </div>
  );

  // Guard against undefined data (network failures or server errors)
  if (!data || !data.match) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#050505] text-white space-y-6">
        <ShieldAlert className="size-16 text-red-500 animate-bounce" />
        <div className="text-center">
          <h2 className="text-2xl font-black">Arena Disconnected</h2>
          <p className="text-white/40 font-bold">The stadium vibes are temporarily offline. Check your connection.</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-white text-black rounded-full font-black uppercase text-xs tracking-widest hover:scale-105 transition-all"
        >
          Re-enter Arena
        </button>
      </div>
    );
  }

  const { match, fanPulse } = data;

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 text-white font-outfit overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Header */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-12">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="px-4 py-1.5 bg-red-500 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">LIVE</div>
               <span className="text-white/40 font-black text-xs uppercase tracking-[0.3em]">IPL 2024 • MATCH 01</span>
             </div>
             <h1 className="text-6xl font-black tracking-tighter">The Arena</h1>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4">
                <div className="size-10 bg-indigo-500 rounded-2xl flex items-center justify-center">
                  <Timer className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/30 uppercase">Next Over In</p>
                  <p className="font-bold">01:42</p>
                </div>
             </div>
          </div>
        </header>

        {/* Live Scores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ScoreCard team={match.teams.teamA} isLive={true} color={match.teams.teamA.color} />
          <ScoreCard team={match.teams.teamB} isLive={false} color={match.teams.teamB.color} />
        </div>

        {/* Prediction & Pulse Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <PredictSlider 
              prompt={match.predictionPrompt} 
              options={match.predictionOptions} 
              onPredict={(val) => predictionMutation.mutate(val)}
            />
            
            <div className="mt-8 bg-white/5 rounded-[3rem] p-10 border border-white/5 flex flex-col md:flex-row gap-8 items-center justify-between">
               <div className="flex items-center gap-6">
                 <div className="size-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <TrendingUp className="size-8" />
                 </div>
                 <div>
                    <h4 className="text-2xl font-black">Winning Probability</h4>
                    <p className="text-sm font-bold text-white/40">Real-time Statistical Edge</p>
                 </div>
               </div>
               <div className="text-5xl font-black italic tracking-tighter text-indigo-500">
                 CSK 58%
               </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <FanPulse 
              teamA={match.teams.teamA.name} 
              teamB={match.teams.teamB.name} 
              stats={fanPulse} 
            />
            
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 p-10 rounded-[3rem] relative overflow-hidden group">
               <div className="relative z-10">
                 <Award className="size-10 text-indigo-500 mb-6" />
                 <h4 className="text-xl font-black mb-2">Weekend Leaderboard</h4>
                 <p className="text-sm font-bold text-white/30 mb-8 leading-relaxed">Top predictors this match-week win signed merchandise & 50K Gems.</p>
                 <button className="text-indigo-400 font-bold flex items-center gap-2 group-hover:gap-3 transition-all uppercase text-xs tracking-widest">
                   View Rankings <TrendingUp className="size-4" />
                 </button>
               </div>
          </div>
        </div>

      </div>
      <IplPredictionPopup userId={authUser?._id} matchId="ipl-2024-match-1" />
    </div>
  </div>
);
};

export default IplDashboard;
