import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Calendar, Clock, MapPin, Zap, ChevronRight, Trophy } from 'lucide-react';
import { DateTime } from 'luxon';
import { PulseSkeleton } from '../Skeletons';

const MatchCard = ({ match, type }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-6 transition-all hover:bg-white/10 ${
      type === 'live' ? 'border-indigo-500/50 shadow-[0_0_40px_rgba(79,70,229,0.1)]' : ''
    }`}
  >
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        {type === 'live' ? (
          <div className="flex flex-col gap-2">
            <div className="px-3 py-1 bg-red-600 rounded-full text-[9px] font-black animate-pulse tracking-widest text-center">LIVE</div>
            {match.importantStatus && (
              <div className="px-3 py-1 bg-white/10 border border-white/10 rounded-full text-[8px] font-black tracking-widest text-amber-500 uppercase">
                {match.importantStatus}
              </div>
            )}
          </div>
        ) : type === 'upcoming' ? (
          <div className="px-3 py-1 bg-indigo-600 rounded-full text-[9px] font-black tracking-widest uppercase">Upcoming</div>
        ) : (
          <div className="px-3 py-1 bg-white/10 rounded-full text-[9px] font-black tracking-widest uppercase opacity-40">Finished</div>
        )}
        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">IPL 2026</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-black text-white/40 uppercase">
        <MapPin className="size-3" /> {match.venue?.split(',')[0]}
      </div>
    </div>

    <div className="flex items-center justify-between gap-4 mb-8">
      <div className="flex flex-col items-center gap-3 flex-1">
        <div className="size-16 rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center group-hover:scale-110 transition-transform">
           <img 
             src={match.team1?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1?.name || 'T1')}&background=random&color=fff`} 
             className="size-full object-contain" 
             onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team1?.name || 'T1')}&background=random&color=fff` }}
           />
        </div>
        <span className="text-[11px] font-black uppercase text-center h-8 flex items-center tracking-tighter leading-none">{match.team1?.name}</span>
      </div>

      <div className="flex flex-col items-center gap-2">
         <div className={`text-xl font-black italic tracking-tighter ${type === 'live' ? 'text-indigo-500' : 'text-white/10'}`}>VS</div>
      </div>

      <div className="flex flex-col items-center gap-3 flex-1">
        <div className="size-16 rounded-3xl bg-white/5 border border-white/10 p-3 flex items-center justify-center group-hover:scale-110 transition-transform">
           <img 
             src={match.team2?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2?.name || 'T2')}&background=random&color=fff`} 
             className="size-full object-contain" 
             onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(match.team2?.name || 'T2')}&background=random&color=fff` }}
           />
        </div>
        <span className="text-[11px] font-black uppercase text-center h-8 flex items-center tracking-tighter leading-none">{match.team2?.name}</span>
      </div>
    </div>

    <div className="pt-6 border-t border-white/5 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">
          {type === 'live' ? 'Operational Score' : 'Kickoff'}
        </span>
        <span className="font-black text-sm italic tracking-tight">
          {type === 'live' ? match.currentScore : DateTime.fromISO(match.startTime).toFormat('LLL d, hh:mm a')}
        </span>
      </div>
      
      <button className={`size-10 rounded-2xl flex items-center justify-center transition-all ${
        type === 'live' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/40 hover:bg-white/10'
      }`}>
        <ChevronRight className="size-5" />
      </button>
    </div>
  </motion.div>
);

const IplSchedule = () => {
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['iplSchedule'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/upcoming');
      // Adapt to existing backend which might not have the new /schedule route yet
      if (Array.isArray(res.data)) {
        return {
          live: res.data.filter(m => m.status === 'live'),
          upcoming: res.data.filter(m => m.status === 'scheduled'),
          recent: res.data.filter(m => m.status === 'completed')
        };
      }
      return res.data;
    },
    refetchInterval: 60000 
  });

  const [activeType, setActiveType] = useState('upcoming');

  if (isLoading) return <PulseSkeleton />;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2">ARENA SCHEDULE</h2>
          <p className="text-sm font-bold text-white/30 uppercase tracking-[0.3em]">IPL 2026 Official Fixtures</p>
        </div>

        <div className="flex gap-2 p-1.5 bg-white/5 rounded-3xl border border-white/5">
          {['live', 'upcoming', 'recent'].map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeType === t ? 'bg-white text-black' : 'text-white/40 hover:text-white'
              }`}
            >
              {t === 'live' && <span className="inline-block size-1.5 bg-red-600 rounded-full animate-ping mr-2" />}
              {t}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {schedule?.[activeType]?.length > 0 ? (
            schedule[activeType].map((match) => (
              <MatchCard key={match._id} match={match} type={activeType} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
               <Calendar className="size-16 text-white/10 mx-auto" />
               <p className="text-white/40 font-bold uppercase tracking-widest">No matches found in this section</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IplSchedule;
