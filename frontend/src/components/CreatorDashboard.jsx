import React from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Users, TrendingUp, Gem, Activity, CreditCard, Award, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';

/**
 * Creator Dashboard — The monetization command center for BondBeyond Creators.
 * Features glassmorphism, real-time metrics, and Elite Fan tracking.
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
  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['creatorStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/stats');
      return res.data;
    }
  });

  // Fetch Bonds
  const { data: bonds, isLoading: bondsLoading } = useQuery({
    queryKey: ['creatorBonds'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/bonds');
      return res.data;
    }
  });

  // Fetch Elite Fans
  const { data: eliteFans, isLoading: fansLoading } = useQuery({
    queryKey: ['creatorEliteFans'],
    queryFn: async () => {
      const res = await axiosInstance.get('/creator/elite-fans');
      return res.data;
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] p-6 lg:p-12 text-white font-outfit overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-[0.3em]"
            >
              <div className="size-2 bg-indigo-500 animate-pulse rounded-full" /> LIVE REVENUE ENGINE
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-white to-white/40 bg-clip-text text-transparent">Creator Suite</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold hover:bg-white/10 transition-all flex items-center gap-2">
              <CreditCard className="size-4" /> Withdraw
            </button>
            <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-black shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all flex items-center gap-2">
              New Digital Bond <Gem className="size-4" />
            </button>
          </div>
        </header>

        {/* Global Performance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={DollarSign} label="Wallet Balance" value={stats?.walletBalance || "$0.00"} trend={stats?.trends?.revenue || 0} colorClass="bg-emerald-500" isLoading={statsLoading} />
          <StatCard icon={Users} label="Premium Bonds" value={stats?.totalBonds || "0"} trend={stats?.trends?.bonds || 0} colorClass="bg-indigo-500" isLoading={statsLoading} />
          <StatCard icon={Award} label="Top 1% Fans" value={stats?.eliteFansCount || "0"} trend={stats?.trends?.fans || 0} colorClass="bg-purple-500" isLoading={statsLoading} />
          <StatCard icon={Activity} label="Vibe Velocity" value={stats?.vibeVelocity || "Stable"} trend={0} colorClass="bg-orange-500" isLoading={statsLoading} />
        </div>

        {/* Main Content: Bonds & Elite Fans */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Active Bonds Table */}
          <div className="lg:col-span-8 bg-white/5 border border-white/5 rounded-[3rem] p-8 relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black tracking-tighter">Active Digital Bonds</h2>
                  <div className="flex gap-2">
                    <div className="size-2 rounded-full bg-indigo-500" />
                    <div className="size-2 rounded-full bg-white/10" />
                  </div>
                </div>

                <div className="space-y-4">
                  {bondsLoading ? (
                    <div className="p-10 text-center opacity-20">Scanning Assets...</div>
                  ) : bonds?.length === 0 ? (
                    <div className="p-10 text-center border-2 border-dashed border-white/5 rounded-[2rem] text-white/20 font-bold uppercase tracking-widest">
                       No Digital Bonds Minted Yet
                    </div>
                  ) : bonds?.map((item, idx) => (
                    <motion.div 
                      key={item._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/5 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-5">
                        <div className="size-14 bg-gradient-to-tr from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ring-4 ring-indigo-500/10">
                          {item.name[0]}
                        </div>
                        <div>
                          <h4 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{item.name}</h4>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">
                            {item.isSold ? "Owner: Syncing..." : "Awaiting Collector"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-12">
                         <div className="hidden md:block text-right">
                           <p className="text-[10px] font-black text-white/30 uppercase mb-1">Unit Price</p>
                           <p className="font-bold">{item.price} Gems</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[10px] font-black text-indigo-400 uppercase mb-1">Status</p>
                           <p className="font-black text-xl uppercase tracking-tighter">{item.rarity}</p>
                         </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
             </div>
          </div>

          {/* Elite Fan Leaderboard */}
          <div className="lg:col-span-4 space-y-8">
             <div className="bg-indigo-600 rounded-[3rem] p-8 shadow-2xl shadow-indigo-500/20">
                <h3 className="text-xl font-black mb-8 italic">The Elite Tier</h3>
                <div className="space-y-8">
                   {fansLoading ? (
                     <div className="opacity-50">Syncing Fan Neural States...</div>
                   ) : eliteFans?.length === 0 ? (
                     <div className="text-sm font-bold opacity-40 italic">Deep engagement data pending...</div>
                   ) : eliteFans?.map((fan, i) => (
                     <div key={fan._id} className="flex items-center gap-4">
                        <div className="size-10 rounded-full border-2 border-white/20 flex items-center justify-center font-bold text-xs">{i+1}</div>
                        <div className="flex-1">
                           <div className="flex justify-between items-center mb-2">
                             <span className="font-bold text-sm tracking-tight">{fan.fanId?.name || "Fan"}</span>
                             <span className="text-[10px] font-black">{fan.bondScore} pts</span>
                           </div>
                           <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(100, fan.bondScore / 100)}%` }}
                                className="h-full bg-white rounded-full" 
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
                {eliteFans?.length > 0 && (
                  <button className="w-full mt-10 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-gray-100 transition-all shadow-xl">
                    AIRDROP REWARDS
                  </button>
                )}
             </div>

             <div className="bg-white/5 border border-white/10 rounded-[3rem] p-8 text-center">
                <Activity className="size-8 text-white/20 mx-auto mb-4" />
                <h4 className="text-sm font-bold text-white/40 leading-relaxed italic">
                  {eliteFans?.length > 0 
                    ? `Your top 1% are currently responsible for the majority of your engagement velocity.`
                    : "Grow your bond score to unlock the 1% revenue engine."}
                </h4>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreatorDashboard;
