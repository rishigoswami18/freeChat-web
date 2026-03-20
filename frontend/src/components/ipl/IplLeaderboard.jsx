import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Trophy, Target, Zap, MapPin, Users, ChevronRight, Search, Home, Building } from 'lucide-react';
import { LeaderboardSkeleton } from '../Skeletons';
import useAuthUser from '../../hooks/useAuthUser';

const IplLeaderboard = () => {
  const { authUser } = useAuthUser();
  const [type, setType] = useState('accuracy'); // accuracy, coins
  const [activeOrg, setActiveOrg] = useState('Global');
  const [activeSubLoc, setActiveSubLoc] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: orgs } = useQuery({
    queryKey: ['leaderboardOrgs'],
    queryFn: async () => {
      const res = await axiosInstance.get('/leaderboards/organizations');
      return res.data.data;
    }
  });

  const { data: leaders, isLoading } = useQuery({
    queryKey: ['leaderboard', type, activeOrg, activeSubLoc],
    queryFn: async () => {
      let url = `/leaderboards?type=${type}&limit=50`;
      if (activeOrg !== 'Global') url += `&organization=${activeOrg}`;
      if (activeSubLoc !== 'All') url += `&subLocation=${activeSubLoc}`;
      const res = await axiosInstance.get(url);
      return res.data.data;
    }
  });

  const filteredLeaders = leaders?.filter(l => 
    l.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase mb-2">Hall of <span className="text-amber-500">Legends</span></h2>
          <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Compete globally or dominate your local turf.</p>
        </div>

        <div className="flex flex-wrap gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
          <button 
            onClick={() => setType('accuracy')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'accuracy' ? 'bg-amber-500 text-black shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            By Accuracy
          </button>
          <button 
            onClick={() => setType('coins')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === 'coins' ? 'bg-indigo-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
          >
            By BondCoins
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-6 space-y-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20" />
                    <input 
                        type="text" 
                        placeholder="SEARCH PROS..."
                        className="w-full bg-base-100 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-amber-500/50 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Territory Selection</p>
                    <div className="space-y-2">
                        <button 
                            onClick={() => { setActiveOrg('Global'); setActiveSubLoc('All'); }}
                            className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeOrg === 'Global' ? 'bg-white text-black' : 'hover:bg-white/5 text-white/40'}`}
                        >
                            <Home className="size-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Global Field</span>
                        </button>
                        
                        {orgs?.map(org => (
                            <button 
                                key={org}
                                onClick={() => { setActiveOrg(org); setActiveSubLoc('All'); }}
                                className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${activeOrg === org ? 'bg-emerald-600 text-white' : 'hover:bg-white/5 text-white/40'}`}
                            >
                                <Building className="size-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">{org}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {activeOrg !== 'Global' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-4 border-t border-white/5">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest px-2">Sub-Location</p>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Hostel A', 'Hostel B', 'Main Campus', 'Phagwara'].map(loc => (
                                <button 
                                    key={loc}
                                    onClick={() => setActiveSubLoc(loc)}
                                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeSubLoc === loc ? 'bg-indigo-600 text-white' : 'bg-base-100 border border-white/5 text-white/40 hover:border-white/20'}`}
                                >
                                    {loc}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-[40px] p-8 space-y-4">
                <Target className="size-8 text-amber-500" />
                <h4 className="text-xl font-black italic tracking-tighter uppercase leading-tight">Master <br/> Predictor</h4>
                <p className="text-[10px] font-bold text-amber-500/60 uppercase leading-relaxed tracking-wider">Maintain 75%+ accuracy over 100 predictions to earn the Elite Crown.</p>
            </div>
        </div>

        {/* Leaderboard Table */}
        <div className="lg:col-span-3 space-y-4">
            {isLoading ? (
                <LeaderboardSkeleton />
            ) : filteredLeaders?.length > 0 ? (
                <div className="space-y-4">
                    {filteredLeaders.map((user, idx) => {
                        const isTopThree = idx < 3;
                        const isSelf = user._id === authUser?._id;

                        // Rank-specific styling
                        const rankStyles = [
                            { 
                                color: 'text-amber-400', 
                                bg: 'bg-amber-400/10', 
                                border: 'border-amber-400/20',
                                badge: '🥇', 
                                label: 'GRANDMASTER' 
                            },
                            { 
                                color: 'text-slate-300', 
                                bg: 'bg-slate-300/10', 
                                border: 'border-slate-300/20',
                                badge: '🥈', 
                                label: 'ELITE' 
                            },
                            { 
                                color: 'text-orange-400', 
                                bg: 'bg-orange-400/10', 
                                border: 'border-orange-400/20',
                                badge: '🥉', 
                                label: 'PRO' 
                            }
                        ];

                        const currentRank = rankStyles[idx] || { color: 'text-gray-500', bg: 'bg-white/5', border: 'border-white/5' };

                        return (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.01, x: 5 }}
                                transition={{ delay: idx * 0.03 }}
                                key={user._id}
                                className={`group flex items-center justify-between p-6 rounded-[32px] border transition-all cursor-pointer ${
                                    isSelf ? 'bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white border-transparent shadow-xl' :
                                    idx % 2 === 0 ? 'bg-[#161B22] border-white/5 hover:border-white/10' :
                                    'bg-[#0B0E14] border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`size-14 rounded-2xl flex flex-col items-center justify-center font-black italic shadow-inner ${
                                        isTopThree ? currentRank.bg + ' ' + currentRank.color : 'bg-base-100 text-white/20'
                                    }`}>
                                        <span className="text-xl leading-none">{idx + 1}</span>
                                        {isTopThree && <span className="text-[10px] uppercase mt-1 tracking-tighter">{currentRank.label}</span>}
                                    </div>

                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <div className={`size-16 rounded-2xl overflow-hidden border-2 ${isTopThree ? 'border-' + currentRank.color.split('-')[1] + '-500/50' : 'border-white/5'}`}>
                                                <img 
                                                    src={user.profilePic || "/avatar.png"} 
                                                    className="size-full object-cover" 
                                                    alt={user.fullName}
                                                />
                                            </div>
                                            {isTopThree && (
                                                <div className="absolute -top-3 -right-3 text-2xl animate-bounce duration-1000">
                                                    {currentRank.badge}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="font-black italic text-xl uppercase tracking-wider flex items-center gap-2">
                                                {user.fullName}
                                                {user.accuracy >= 70 && (
                                                    <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full text-[8px] font-black text-[#FF5722] uppercase tracking-widest">
                                                        VERIFIED PRO
                                                    </div>
                                                )}
                                            </h4>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelf ? 'text-white/70' : 'text-white/20'}`}>
                                                {user.organization || 'GLOBAL ARENA'} • {user.subLocation || 'WILD CARD'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10 pr-4">
                                    <div className="text-right">
                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 ${isSelf ? 'text-white/60' : 'text-white/20'}`}>Accuracy</p>
                                        <p className={`text-2xl font-black italic tracking-tighter ${user.accuracy >= 75 ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]' : ''}`}>{user.accuracy || 0}%</p>
                                    </div>
                                    <div className="text-right min-w-[100px]">
                                        <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1.5 ${isSelf ? 'text-white/60' : 'text-white/20'}`}>Winnings</p>
                                        <div className="flex items-center justify-end gap-1.5">
                                            <Zap className={`size-4 ${isSelf ? 'text-white' : 'text-[#FF5722] fill-[#FF5722]'}`} />
                                            <span className="text-lg font-black italic">{user.bondCoins || 0}</span>
                                        </div>
                                    </div>
                                    <div className={`p-3 rounded-2xl ${isSelf ? 'bg-white/20' : 'bg-white/5 group-hover:bg-[#FF5722] transition-colors'}`}>
                                        <ChevronRight className={`size-5 ${isSelf ? 'text-white' : 'text-white/20 group-hover:text-white'}`} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            ) : (
                <div className="p-20 text-center bg-[#161B22] rounded-[40px] border border-white/5">
                    <Users className="size-16 text-white/5 mx-auto mb-6" />
                    <h4 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Arena Empty</h4>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Be the first to claim the throne.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default IplLeaderboard;
