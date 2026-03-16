import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Award, Zap, Target, TrendingUp } from 'lucide-react';
import { PulseSkeleton } from '../Skeletons';

const StatCard = ({ player, value, rank, type, team }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="relative group bg-white/5 border border-white/10 p-6 rounded-[2.5rem] flex items-center justify-between hover:border-indigo-500/50 transition-all shadow-xl"
  >
    <div className="flex items-center gap-6">
      <div className={`size-14 rounded-2xl flex items-center justify-center font-black text-2xl ${
        rank === 1 ? 'bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.5)]' : 'bg-white/10 text-white/40'
      }`}>
        {rank}
      </div>
      <div>
        <h4 className="text-xl font-black italic tracking-tighter group-hover:text-indigo-400 transition-colors uppercase">
          {player}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none">{team || 'IPL STAR'}</span>
        </div>
      </div>
    </div>
    
    <div className="text-right">
      <p className="text-3xl font-black tracking-tighter text-white">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{type === 'runs' ? 'RUNS' : 'WICKETS'}</p>
    </div>
  </motion.div>
);

const IplPlayerStats = () => {
  const [activeStat, setActiveStat] = useState('runs');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['iplPlayerStats', activeStat],
    queryFn: async () => {
      const res = await axiosInstance.get(`/ipl/stats?type=${activeStat}`);
      return res.data;
    },
    refetchInterval: 300000 // 5 minutes refresh
  });

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex gap-4 p-2 bg-white/5 rounded-[2rem] border border-white/5 w-fit mx-auto">
        <button 
          onClick={() => setActiveStat('runs')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
            activeStat === 'runs' ? 'bg-orange-500 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Award className="size-4" /> ORANGE CAP
        </button>
        <button 
          onClick={() => setActiveStat('wickets')}
          className={`px-8 py-3 rounded-2xl font-black text-sm transition-all flex items-center gap-2 ${
            activeStat === 'wickets' ? 'bg-purple-600 text-white shadow-[0_0_30px_rgba(147,51,234,0.3)]' : 'text-white/40 hover:text-white'
          }`}
        >
          <Target className="size-4" /> PURPLE CAP
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Main Leaderboard */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">Leaderboard</h3>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Top 5 Performers</span>
          </div>

          <AnimatePresence mode="wait">
            {isLoading ? (
              <PulseSkeleton key="skeleton" />
            ) : (
              <motion.div 
                key={activeStat}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {stats?.map((p, i) => (
                  <StatCard 
                    key={p.player} 
                    player={p.player} 
                    value={p.value} 
                    rank={i + 1} 
                    type={activeStat}
                    team={p.team}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Feature Promo */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-800 p-10 rounded-[3rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <TrendingUp className="size-32" />
            </div>
            <div className="relative z-10">
              <div className="size-16 rounded-3xl bg-white/20 backdrop-blur-xl flex items-center justify-center mb-6 border border-white/20">
                <Zap className="size-8 text-amber-400 fill-amber-400" />
              </div>
              <h3 className="text-3xl font-black italic tracking-tight leading-none mb-4">
                WHO WILL WIN THE {activeStat === 'runs' ? 'ORANGE' : 'PURPLE'} CAP?
              </h3>
              <p className="text-white/70 text-sm font-bold leading-relaxed mb-8">
                Place your long-term prediction now. Correct predictions win a massive <span className="text-white font-black underline">50,000 Bond Coins 🪙</span> at the end of the season!
              </p>
              <button className="w-full py-5 bg-white text-indigo-700 rounded-3xl font-black text-lg hover:scale-[1.02] transition-all shadow-xl">
                PREDICT SEASON WINNER
              </button>
            </div>
          </div>
          
          <div className="bg-white/5 border border-white/5 p-8 rounded-[3rem] flex items-center gap-6">
             <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <TrendingUp className="size-6" />
             </div>
             <div>
               <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Trending Choice</p>
               <p className="font-bold text-lg">Virat Kohli (42.5% votes)</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IplPlayerStats;
