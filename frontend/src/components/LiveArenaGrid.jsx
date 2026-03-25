import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, ChevronRight } from 'lucide-react';
import { axiosInstance } from '../lib/axios';
import { useQuery } from '@tanstack/react-query';

const LiveArenaGrid = () => {
  const { data: tickerData, isLoading } = useQuery({
    queryKey: ['liveTicker'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/ticker');
      return res.data;
    },
    refetchInterval: 10000
  });

  const liveMatches = Array.isArray(tickerData) ? tickerData.filter(m => m.isLive) : [];

  if (isLoading || liveMatches.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-xl bg-red-600/20 flex items-center justify-center">
            <Zap className="size-4 text-red-500 fill-current" />
          </div>
          <div>
            <h3 className="text-xl font-black italic tracking-tight">GLOBAL ARENA</h3>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] leading-none mt-1">Real-time Score Feed</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase tracking-widest cursor-pointer hover:text-white transition-colors">
          View All <ChevronRight className="size-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {liveMatches.map((match) => (
          <motion.div 
            key={match.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            className="group relative bg-[#0a0a0f] border border-white/5 rounded-2xl md:rounded-[32px] p-5 md:p-6 overflow-hidden hover:border-red-500/30 transition-all shadow-2xl"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 size-32 bg-red-600/5 blur-[60px] rounded-full group-hover:bg-red-600/10 transition-colors" />
            
            <div className="relative z-10 flex flex-col h-full justify-between gap-6">
              <div className="flex justify-between items-center">
                <div className="flex -space-x-3">
                  {[match.team1, match.team2].map((t, i) => (
                    <div key={i} className="size-10 rounded-full bg-white/5 border border-white/10 p-1 backdrop-blur-xl">
                      <img 
                        src={t?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(t?.name || 'T')}&background=random&color=fff`} 
                        className="size-full object-contain"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(t?.name || 'T')}&background=random&color=fff` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="size-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-red-500/20 transition-colors">
                  <Trophy className="size-4 text-white/20 group-hover:text-amber-500 transition-colors" />
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-4xl font-black italic tracking-tighter text-white tabular-nums">
                  {match.score}
                </p>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  <span className="text-emerald-500">Live Prediction Active</span>
                </div>
              </div>

              <button className="w-full py-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all">
                Enter Arena
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LiveArenaGrid;
