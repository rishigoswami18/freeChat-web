import { useQuery } from "@tanstack/react-query";
import { Sparkles, Activity, AlertCircle, Info } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import { memo } from "react";

/**
 * AI Empathy Radar View — Predictive Ghosting Prevention
 * Implements a glassmorphic dashboard for real-time emotional intelligence.
 */
const EmpathyRadarView = memo(({ channelId }) => {
  const { data: radar, isLoading, error, refetch } = useQuery({
    queryKey: ["empathyRadar", channelId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/radar/${channelId}`);
      return res.data;
    },
    refetchInterval: 10000, // Sync every 10 seconds for "Live" monitoring
    staleTime: 5000,
  });

  if (isLoading && !radar) {
    return (
      <div className="p-4 bg-base-100/40 backdrop-blur-2xl border border-base-content/5 rounded-3xl mb-4 transition-all">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="size-3 text-primary animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40">Radar Initializing...</span>
        </div>
        <div className="w-full bg-base-content/5 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-primary/20 w-1/2 animate-shimmer" />
        </div>
      </div>
    );
  }

  // If there's an error or no radar data, show a subtle "Recalibrating" state instead of null
  if (error || !radar) {
    return (
      <div className="p-3 bg-base-100/20 backdrop-blur-md border border-base-content/5 rounded-2xl mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <Activity className="size-3 opacity-20" />
           <span className="text-[10px] font-bold uppercase tracking-widest opacity-30">Radar Recalibrating...</span>
        </div>
        <button 
          onClick={() => refetch()} 
          className="text-[10px] font-bold text-primary hover:underline"
        >
          Check Pulse
        </button>
      </div>
    );
  }

  const vibe = radar.currentVibe;
  const latestInsight = radar.insights?.[radar.insights.length - 1];

  // Map label to premium brand colors
  const palette = {
    "Romantic": "from-rose-500 to-pink-500",
    "Tense": "from-orange-500 to-red-500",
    "Playful": "from-yellow-400 to-orange-400",
    "Neutral": "from-blue-400 to-indigo-400",
    "Ghosting Risk": "from-violet-600 to-indigo-900 animate-pulse",
  };

  const currentGradient = palette[vibe.label] || palette.Neutral;

  return (
    <div className="p-4 bg-base-100/40 backdrop-blur-2xl border border-base-content/5 rounded-3xl mb-4 transition-all duration-700 hover:shadow-xl hover:shadow-primary/5 group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-full bg-gradient-to-br ${currentGradient} shadow-lg shadow-primary/20`}>
            <Activity className="size-3 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 block leading-none">
              AI Empathy Radar
            </span>
            <span className="text-xs font-black tracking-tight">{vibe.label} Pulse</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
             <Sparkles className="size-3 text-info animate-pulse" />
             <span className="text-sm font-black italic">{vibe.score}%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full bg-base-content/5 h-2 rounded-full overflow-hidden mb-4">
        <div 
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${currentGradient} transition-all duration-1000 ease-out`}
          style={{ width: `${vibe.score}%` }}
        />
        <div className="absolute inset-0 bg-shimmer pointer-events-none opacity-20" />
      </div>

      {/* Predictive Insight Card */}
      {latestInsight?.actionableAdvice && (
        <div className="relative overflow-hidden bg-primary/5 border border-primary/10 p-3 rounded-2xl group-hover:bg-primary/10 transition-colors">
          <div className="flex gap-2 relative z-10">
            <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
               <p className="text-[11px] font-bold text-primary uppercase tracking-wider opacity-80">Ghosting Prevention Hack</p>
               <p className="text-[12px] font-medium leading-[1.4] opacity-80">
                  {latestInsight.actionableAdvice}
               </p>
            </div>
          </div>
          
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
             <Info className="size-8 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
});

EmpathyRadarView.displayName = "EmpathyRadarView";

export default EmpathyRadarView;
