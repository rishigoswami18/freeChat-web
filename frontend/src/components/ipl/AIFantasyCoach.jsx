import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { axiosInstance } from '../../lib/axios';
import { Brain, Zap, Target, Shield, Flame, RotateCcw, ChevronRight, User, Award, Crown, Info, TrendingUp, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const AIFantasyCoach = () => {
  const [riskProfile, setRiskProfile] = useState('balanced');
  const [generatedSquad, setGeneratedSquad] = useState(null);

  const { data: heroData } = useQuery({
    queryKey: ['iplHeroStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/live-stats');
      return res.data;
    }
  });

  const match = heroData?.match;

  const { mutate: generateSquad, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosInstance.post('/ipl/ai-coach/generate', {
        matchId: match._id,
        riskProfile
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.message);
        setGeneratedSquad(null);
      } else {
        setGeneratedSquad(data.data);
        toast.success('Strategy Optimized! 🚀');
      }
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to generate squad');
    }
  });

  const profiles = [
    { id: 'safe', label: 'Safe', icon: Shield, desc: 'High reliability, consistent performers.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'balanced', label: 'Balanced', icon: Target, desc: 'Mix of stability and explosive potential.', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
    { id: 'aggressive', label: 'Aggressive', icon: Flame, desc: 'High risk, massive reward. Go for the gold.', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ];

  const getRoleIcon = (role) => {
    if (role.includes('WK')) return <Target className="size-3" />;
    if (role.includes('Batter')) return <Zap className="size-3" />;
    if (role.includes('All-Rounder')) return <Activity className="size-3" />;
    return <TrendingUp className="size-3" />;
  };

  if (!match) return (
    <div className="p-12 text-center bg-white/5 rounded-[40px] border border-white/10">
      <Brain className="size-12 text-white/20 mx-auto mb-4" />
      <h3 className="text-xl font-black italic tracking-tighter uppercase mb-2">Awaiting Live Arena</h3>
      <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">AI Strategic Advisor will unlock when the next match kicks off.</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="bg-gradient-to-br from-indigo-600/20 to-transparent border border-indigo-500/20 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
            <Brain className="size-64" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Brain className="size-6 text-white" />
                        </div>
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Fantasy Engine v5.0</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase leading-tight">
                        Optimize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/40">Squad IQ</span>
                    </h2>
                </div>
                <p className="text-sm font-medium text-white/50 max-w-md leading-relaxed">
                    Our upgraded AI models analyze 1,000+ data points—including recent form, positional constraints, and historical match-ups—to calculate your highest-probability victory path.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {profiles.map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setRiskProfile(p.id)}
                            className={`p-4 rounded-3xl border transition-all text-left group ${
                                riskProfile === p.id 
                                ? 'bg-white border-white text-black shadow-2xl scale-105' 
                                : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                            }`}
                        >
                            <p.icon className={`size-5 mb-3 ${riskProfile === p.id ? 'text-indigo-600' : p.color}`} />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">{p.label}</p>
                            <p className={`text-[8px] font-bold uppercase tracking-tighter ${riskProfile === p.id ? 'text-black/40' : 'text-white/20'}`}>
                                {p.desc}
                            </p>
                        </button>
                    ))}
                </div>

                <button 
                    onClick={() => generateSquad()}
                    disabled={isPending}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <RotateCcw className="size-4 animate-spin" /> ANALYZING MATCH DATA...
                        </>
                    ) : (
                        <>
                            GENERATE AI SQUAD <ChevronRight className="size-4" />
                        </>
                    )}
                </button>
            </div>

            <div className="hidden lg:flex items-center justify-center">
                <div className="relative size-80">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                        className="absolute inset-0 border-2 border-dashed border-indigo-500/30 rounded-full"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="size-24 text-indigo-400 animate-bounce" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {generatedSquad && (
            <motion.div 
                key={generatedSquad.captain}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-6"
            >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-4">
                    <div>
                        <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-1">AI Optimized <span className="text-indigo-500">Selection</span></h3>
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">{generatedSquad.coachNote}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                            <TrendingUp className="size-4 text-emerald-400" />
                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Avg IQ: {generatedSquad.statsSummary.avgForm}</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <Award className="size-4 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Scientific Pick</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {generatedSquad.squad.map((player, idx) => {
                        const isCaptain = player.name === generatedSquad.captain;
                        const isViceCaptain = player.name === generatedSquad.viceCaptain;
                        
                        return (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                key={idx} 
                                className={`group bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-4 hover:bg-white/10 transition-all relative overflow-hidden ${isCaptain ? 'ring-2 ring-amber-500' : isViceCaptain ? 'ring-2 ring-indigo-400' : ''}`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="size-14 rounded-2xl bg-base-100 flex items-center justify-center border border-white/5 overflow-hidden">
                                                <User className="size-6 text-white/20" />
                                            </div>
                                            {isCaptain && (
                                                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                                                    <Crown className="size-3 text-black fill-current" />
                                                </div>
                                            )}
                                            {isViceCaptain && (
                                                <div className="absolute -top-2 -right-2 size-6 rounded-full bg-indigo-400 flex items-center justify-center shadow-lg">
                                                    <span className="text-[10px] font-black text-black">VC</span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black italic text-lg uppercase tracking-wider">{player.name}</p>
                                            <div className="flex items-center gap-1.5">
                                                <span className="bg-white/10 text-white/40 p-1 rounded-md">
                                                    {getRoleIcon(player.role)}
                                                </span>
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{player.role}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">AI Score</p>
                                        <p className="text-xl font-black italic tracking-tighter text-white">{player.aiScore}</p>
                                    </div>
                                </div>

                                <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                                    <Info className="size-3 text-indigo-400 mt-0.5 shrink-0" />
                                    <p className="text-[9px] font-bold text-white/60 uppercase leading-relaxed uppercase">
                                        {player.reasoning}
                                    </p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
                
                <div className="p-8 bg-indigo-600 text-white rounded-[40px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="space-y-2 relative z-10">
                        <div className="flex items-center gap-2">
                            <Zap className="size-5 fill-white" />
                            <h4 className="text-2xl font-black italic tracking-tighter uppercase leading-none">Ready to Deploy?</h4>
                        </div>
                        <p className="max-w-md text-[10px] font-bold uppercase tracking-wider opacity-60">Join the live contest now with this scientifically optimized squad. Users with AI assistance show 45% higher win probabilities.</p>
                    </div>
                    <button 
                        onClick={() => toast.success('Squad deployed to Fantasy Arena!')}
                        className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl relative z-10"
                    >
                        DEPLOY SQUAD NOW
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIFantasyCoach;
