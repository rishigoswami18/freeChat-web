import React from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, Globe, Zap, Search,
    Flame, TrendingUp, Radio, Activity, Wallet, Target
} from 'lucide-react';
import useAuthUser from '../hooks/useAuthUser';

const EngineSidebar = () => {
    const { authUser } = useAuthUser();

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-left duration-700">
            {/* Search Bar */}
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/20 group-focus-within:text-orange-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Search teams or leagues..."
                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-orange-500/50 focus:bg-white/10 transition-all font-bold placeholder:text-white/20"
                />
            </div>

            {/* Categories */}
            <div className="space-y-1">
                <div className="px-4 py-2 flex items-center justify-between">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Main Arenas</span>
                </div>
                {[
                    { icon: Radio, name: 'Live Cricket', count: 12 },
                    { icon: Trophy, name: 'IPL 2026', count: 1, active: true },
                    { icon: Globe, name: 'World Cup', count: 8 },
                    { icon: TrendingUp, name: 'Top Predicted', count: 95 },
                ].map((item) => (
                    <button 
                        key={item.name}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${
                            item.active ? 'bg-orange-500 text-white shadow-[0_10px_20px_rgba(249,115,22,0.2)]' : 'text-white/40 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <item.icon className={`size-4 ${item.active ? 'text-white' : 'group-hover:text-orange-500'} transition-colors`} />
                            <span className="text-[11px] font-black uppercase tracking-tight">{item.name}</span>
                            {item.name === 'IPL 2026' && (
                                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                            )}
                        </div>
                        <span className={`text-[9px] font-black ${item.active ? 'text-white/60' : 'text-white/10 group-hover:text-white/30'}`}>{item.count}</span>
                    </button>
                ))}
            </div>

            {/* Performance Hub (One Page Console) */}
            <div className="bg-[#161B22] border border-white/5 rounded-[2.5rem] p-6 space-y-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-all rotate-12">
                    <Activity className="size-20 text-orange-500" />
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                        <Activity className="size-4" />
                    </div>
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">My Performance</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 relative z-10">
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Bond Coins</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-black text-white italic">{(authUser?.wallet?.totalBalance || 0).toLocaleString()}</span>
                            <div className="size-4 rounded-full bg-amber-500 flex items-center justify-center text-[10px] text-black"><Wallet className="size-2" /></div>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Global Rank</p>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xl font-black text-emerald-400 italic">#124</span>
                            <TrendingUp className="size-4 text-emerald-500/50" />
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "74%" }}
                            className="h-full bg-orange-500 shadow-[0_0_10px_#f97316]"
                        />
                    </div>
                    <div className="flex justify-between items-center text-[8px] font-black uppercase text-white/20">
                        <span>Success Rate</span>
                        <span className="text-white/60 italic">74.2%</span>
                    </div>
                </div>

                <button 
                    onClick={() => window.location.href = "/wallet"}
                    className="w-full py-4 bg-white/5 hover:bg-orange-500 hover:text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-white/20 transition-all border border-white/5 active:scale-95"
                >
                    Manage Funds
                </button>
            </div>
        </div>
    );
};

export default EngineSidebar;
