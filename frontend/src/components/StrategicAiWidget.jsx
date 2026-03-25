import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Info } from "lucide-react";

import { useNavigate } from "react-router-dom";

const StrategicAiWidget = ({ matchData }) => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/[0.03] backdrop-blur-3xl p-6 rounded-[2.5rem] border border-white/10 flex flex-col gap-4 relative overflow-hidden group shadow-2xl"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Sparkles className="size-16 text-indigo-500" />
      </div>

      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-indigo-600/20 text-indigo-500 flex items-center justify-center shadow-lg border border-indigo-500/10">
          <TrendingUp className="size-5" />
        </div>
        <div>
          <h4 className="text-sm font-black text-white/90 uppercase tracking-[0.2em]">Strategic AI Insight</h4>
          <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-0.5">Arena Strategist active</p>
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5">
          <p className="text-[13px] font-medium text-white/70 italic leading-relaxed">
            "Bhai, currently market liquidity indicate kar rahi hai ki underdogs solid entry le sakte hain. 95% winning strategy ke liye full focus Arena locking par rakho! 🚀"
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => navigate('/ai-face-call/ai-match-analyst')}
            className="flex-1 py-3 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            Digital Video Call
          </button>
          <button 
            onClick={() => navigate('/chat/ai-strategist-id')}
            className="flex-1 py-3 bg-white/10 backdrop-blur-xl text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-white/20 active:scale-95 transition-all border border-white/10"
          >
            Open Strategic Chat
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2 opacity-30 text-[9px] font-black uppercase tracking-widest">
        <Info className="size-3" /> Real-time IPL Data Integrated
      </div>
    </motion.div>
  );
};

export default StrategicAiWidget;
