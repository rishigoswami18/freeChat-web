import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useMatch } from "../context/MatchContext";
import useAuthUser from "../hooks/useAuthUser";

const FanPulse = ({ teamA, teamB, stats }) => {
  const { submitVote, activeMatch } = useMatch();
  const { authUser } = useAuthUser();

  const handleVote = (team) => {
    if (!authUser || !activeMatch) return;
    submitVote(authUser._id, activeMatch._id, team);
  };

  return (
    <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black flex items-center gap-3">
          <MessageSquare className="size-5 text-indigo-400" /> Fan Pulse
        </h3>
        <div className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
          {stats.trendingEmotion} Detected
        </div>
      </div>

      <div className="space-y-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleVote(teamA)}
            className="size-10 rounded-xl bg-orange-500/20 flex items-center justify-center font-black text-xs text-orange-400 hover:bg-orange-500/40 transition-all active:scale-90"
          >
            {teamA}
          </button>
          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.teamA}%` }}
              className="h-full bg-orange-500 rounded-full shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            />
          </div>
          <span className="font-black text-sm">{stats.teamA}%</span>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleVote(teamB)}
            className="size-10 rounded-xl bg-red-500/20 flex items-center justify-center font-black text-xs text-red-400 hover:bg-red-500/40 transition-all active:scale-90"
          >
            {teamB}
          </button>
          <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${stats.teamB}%` }}
              className="h-full bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            />
          </div>
          <span className="font-black text-sm">{stats.teamB}%</span>
        </div>
      </div>

      <p className="mt-8 text-xs font-bold text-white/30 leading-relaxed italic text-center">
        *Vote for your team! Stats analyzed in real-time from Zyro fans.
      </p>
    </div>
  );
};

export default FanPulse;
