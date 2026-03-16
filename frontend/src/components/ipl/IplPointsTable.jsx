import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { PulseSkeleton } from '../Skeletons';

const IplPointsTable = () => {
  const { data: table, isLoading } = useQuery({
    queryKey: ['iplPointsTable'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/table');
      return res.data;
    },
    refetchInterval: 60000 // Refresh every minute
  });

  if (isLoading) return <PulseSkeleton />;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl"
    >
      <div className="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-600/20 to-transparent">
        <h2 className="text-3xl font-black italic tracking-tighter flex items-center gap-3">
          <Trophy className="text-amber-400 size-8" />
          POINTS TABLE 2026
        </h2>
        <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mt-2">The Battle for the Top 4</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Pos</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40">Team</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">P</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">W</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">L</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">NRR</th>
              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-white/40 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {(table || []).map((row, index) => (
              <motion.tr 
                key={row.team}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`border-b border-white/5 hover:bg-white/10 transition-colors ${index < 4 ? 'bg-indigo-500/5' : ''}`}
              >
                <td className="p-6">
                  <span className={`size-8 rounded-full flex items-center justify-center font-black text-sm ${
                    index < 4 ? 'bg-amber-400 text-black' : 'bg-white/10 text-white/60'
                  }`}>
                    {index + 1}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="size-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center border border-white/10">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(row.team)}&background=random&color=fff`} 
                        alt={row.team} 
                        className="size-full object-contain"
                      />
                    </div>
                    <span className="font-black tracking-tight">{row.team}</span>
                  </div>
                </td>
                <td className="p-6 text-center font-bold">{row.played}</td>
                <td className="p-6 text-center font-bold text-emerald-400">{row.won}</td>
                <td className="p-6 text-center font-bold text-red-400">{row.lost}</td>
                <td className={`p-6 text-center font-bold ${parseFloat(row.nrr) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {row.nrr}
                </td>
                <td className="p-6 text-center">
                  <span className="px-4 py-2 bg-indigo-600 rounded-xl font-black">{row.pts}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 bg-white/5 flex items-center justify-center gap-8">
        <div className="flex items-center gap-2">
          <div className="size-3 rounded-full bg-amber-400" />
          <span className="text-[10px] font-black uppercase text-white/40">Playoffs Zone</span>
        </div>
      </div>
    </motion.div>
  );
};

export default IplPointsTable;
