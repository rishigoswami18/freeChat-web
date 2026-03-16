import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Zap, ShieldCheck, Timer, Award, Sparkles } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

/**
 * AI Career Focus Mode — Neural Scaling Dashboard
 * Implements a hyper-immersive productivity interface with Framer Motion.
 */
const FocusModeView = () => {
  const [goal, setGoal] = useState("");
  const queryClient = useQueryClient();

  // Fetch current focus status
  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ['focusStatus'],
    queryFn: async () => {
      const res = await axiosInstance.get('/focus/status');
      return res.data;
    },
    refetchInterval: (data) => (data?.isActive ? 10000 : false) // Pull metrics if active
  });

  // Start Session Mutation
  const startSession = useMutation({
    mutationFn: (data) => axiosInstance.post('/focus/start', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['focusStatus']);
      toast.success("Neural Shield Initialized. Deep work mode active.");
    },
    onError: () => toast.error("Failed to sync with Productivity OS.")
  });

  // End Session Mutation
  const endSession = useMutation({
    mutationFn: () => axiosInstance.post('/focus/end'),
    onSuccess: () => {
      queryClient.invalidateQueries(['focusStatus']);
      toast.custom((t) => (
        <div className="bg-slate-900 border border-indigo-500/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
          <Award className="text-yellow-400 size-8 animate-bounce" />
          <div>
            <p className="text-white font-bold">Session Synchronized!</p>
            <p className="text-slate-400 text-xs">Your XP and progress are now permanent.</p>
          </div>
        </div>
      ));
    }
  });

  if (statusLoading) return <div className="h-40 bg-slate-900/50 animate-pulse rounded-[2rem]" />;

  const isActive = status?.isActive;

  return (
    <div className="relative group w-full max-w-md mx-auto">
      {/* Background Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2.6rem] blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      
      <div className="relative bg-slate-950/90 backdrop-blur-xl border border-white/5 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        <AnimatePresence mode="wait">
          {!isActive ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/15 rounded-2xl shadow-inner">
                    <Target className="text-indigo-400 size-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-wider leading-none">Career Focus Mode</h3>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] opacity-60">Neural Shield v2.0</span>
                  </div>
                </div>
                <div className="flex gap-1">
                   {[1,2,3].map(i => <div key={i} className="size-1 rounded-full bg-indigo-500/20" />)}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase ml-2">Define Your High-Value Objective</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g., Master Advanced Microservices Architecture"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-white/10 font-medium"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20">
                     <Sparkles className="size-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                   <p className="text-[9px] font-bold text-white/30 uppercase">Expected XP</p>
                   <p className="text-sm font-bold text-white">+500 XP</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
                   <p className="text-[9px] font-bold text-white/30 uppercase">Intensity</p>
                   <p className="text-sm font-bold text-white">Deep Work</p>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startSession.mutate({ goal, duration: 25 })}
                disabled={!goal || startSession.isPending}
                className="w-full relative py-4 rounded-2xl font-black text-white overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 group-hover/btn:scale-110 transition-transform duration-500" />
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {startSession.isPending ? (
                    <Zap className="size-5 animate-spin" />
                  ) : (
                    <>ENGAGE FOCUS ENGINE <Zap className="size-4" /></>
                  )}
                </span>
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="active"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center py-6 space-y-6"
            >
              {/* Circular Progress — Simplified for example */}
              <div className="relative flex items-center justify-center">
                 <div className="size-32 rounded-full border-4 border-indigo-500/10 flex items-center justify-center">
                    <Timer className="size-10 text-indigo-400 animate-pulse" />
                 </div>
                 {/* Decorative Particles */}
                 <motion.div 
                   animate={{ rotate: 360 }}
                   transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                   className="absolute inset-x-0 top-0 flex justify-center"
                 >
                    <div className="size-3 bg-indigo-500 rounded-full blur-[2px] shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                 </motion.div>
              </div>

              <div className="text-center space-y-1">
                 <h4 className="text-white font-black text-xl tracking-tight uppercase">Neural Shield Optimized</h4>
                 <div className="flex items-center justify-center gap-2 text-indigo-400 text-xs font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    <ShieldCheck className="size-3" /> DISTRACTION GATEWAY CLOSED
                 </div>
              </div>

              <div className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 flex justify-between items-center">
                 <div className="text-left">
                    <p className="text-[9px] font-bold text-white/30 uppercase">Current Mission</p>
                    <p className="text-xs font-medium text-white/80 line-clamp-1">{status.goal || goal}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] font-bold text-white/30 uppercase">Uptime</p>
                    <p className="text-xs font-mono text-indigo-400 font-bold">12:44</p>
                 </div>
              </div>

              <button 
                onClick={() => endSession.mutate()}
                className="w-full p-4 rounded-xl border border-white/10 text-white/40 text-xs font-bold hover:bg-white/5 hover:text-white transition-all uppercase tracking-widest"
              >
                Disengage Neural Link
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FocusModeView;
