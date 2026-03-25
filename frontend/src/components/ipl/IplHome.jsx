import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Users, Award, ChevronRight, Zap, Target } from "lucide-react";
import StrategicAiWidget from "../StrategicAiWidget";
import { HeroSkeleton } from '../Skeletons';

const IplHome = () => {
  const [timeLeft, setTimeLeft] = React.useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  
  const { data: heroData, isLoading } = useQuery({
    queryKey: ['iplHeroStats'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/live-stats');
      return res.data;
    },
    refetchInterval: 30000
  });

  const { data: orangeCap } = useQuery({
    queryKey: ['iplStats', 'runs'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/stats?type=runs');
      return res.data;
    }
  });

  const { data: purpleCap } = useQuery({
    queryKey: ['iplStats', 'wickets'],
    queryFn: async () => {
      const res = await axiosInstance.get('/ipl/stats?type=wickets');
      return res.data;
    }
  });

  const targetDateStr = heroData?.meta?.targetDate || '2026-03-28T19:30:00';

  React.useEffect(() => {
    const targetDate = new Date(targetDateStr);
    
    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDateStr]);

  if (isLoading) return <HeroSkeleton />;

  const match = heroData?.match;
  const isSeasonStarted = heroData?.meta?.seasonStarted ?? (new Date() > new Date(targetDateStr));

  const topScorer = orangeCap?.[0];
  const topWicketTaker = purpleCap?.[0];

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative min-h-[400px] md:min-h-[500px] rounded-[2.5rem] md:rounded-[60px] overflow-hidden border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)]"
      >
        {/* Animated Background Engine */}
        <div className={`absolute inset-0 transition-all duration-1000 ${
          match?.status === 'live' ? 'bg-[#0a0a0a]' : 'bg-[#050505]'
        }`} />
        
        {/* Dynamic Mesh Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], x: [0, 50, 0], y: [0, -50, 0] }}
            transition={{ duration: 15, repeat: Infinity }}
            className={`absolute -top-1/2 -left-1/4 size-[800px] blur-[150px] rounded-full ${
              match?.status === 'live' ? 'bg-red-600/20' : 'bg-indigo-600/20'
            }`} 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], x: [0, -70, 0], y: [0, 100, 0] }}
            transition={{ duration: 12, repeat: Infinity, delay: 2 }}
            className={`absolute -bottom-1/2 -right-1/4 size-[600px] blur-[120px] rounded-full ${
              match?.status === 'live' ? 'bg-orange-600/10' : 'bg-amber-500/10'
            }`} 
          />
        </div>

        <div className="relative z-10 p-6 md:p-12 h-full flex flex-col justify-between items-center text-center md:items-start md:text-left">
          {/* Header Info */}
          <div className="w-full flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className={`px-5 py-2 rounded-full text-[10px] font-black tracking-[0.3em] flex items-center gap-2 w-fit mx-auto md:mx-0 shadow-2xl ${
                  match?.status === 'live' ? 'bg-red-600 animate-pulse' : 'bg-white/5 border border-white/10 text-amber-500'
                }`}>
                  <div className={`size-1.5 rounded-full ${match?.status === 'live' ? 'bg-white' : 'bg-amber-500 animate-pulse'}`} />
                  {match?.status === 'live' ? 'GLOBAL LIVE FEED' : 'IPL 2026 LAUNCH SEQUENCE'}
                </div>
                {match?.importantStatus && (
                  <div className="px-5 py-2 rounded-full text-[10px] font-black tracking-[0.3em] bg-white/10 border border-white/20 text-indigo-400 shadow-2xl uppercase">
                    {match.importantStatus}
                  </div>
                )}
              </div>
              <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.5em]">
                {match?.seriesName || 'Prime Tournament Arena'}
              </h2>
            </div>
            
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Grand Prize Allocation</p>
              <h3 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">
                {heroData?.meta?.prizePool || '1.5M GEMS'}
              </h3>
            </div>
          </div>

          {/* Main Visual Content */}
          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-12 mt-8">
            <div className="flex-1 space-y-8">
              {!isSeasonStarted || !match || !match._id ? (
                <div className="space-y-8">
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                    {[
                      { label: 'Days', val: timeLeft.days },
                      { label: 'Hrs', val: timeLeft.hours },
                      { label: 'Min', val: timeLeft.minutes },
                      { label: 'Sec', val: timeLeft.seconds },
                    ].map((t, idx) => (
                      <div key={idx} className="flex flex-col items-center bg-white/5 backdrop-blur-3xl border border-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] min-w-[70px] md:min-w-[100px] shadow-inner">
                        <span className="text-3xl md:text-5xl font-black italic tracking-tighter leading-none text-white">{String(t.val).padStart(2, '0')}</span>
                        <span className="text-[8px] md:text-[9px] font-black text-white/30 tracking-widest mt-1 md:mt-2 uppercase">{t.label}</span>
                      </div>
                    ))}
                  </div>
                  <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-tight">
                    The Greatest Show <br/> 
                    <span className="text-amber-500 italic">Returns on March 28</span>
                  </h3>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-6 justify-center md:justify-start">
                    <TeamSphere name={match?.teams?.batting?.fullName} shortName={match?.teams?.batting?.name} logo={match?.teams?.batting?.logo} color="#ff4d4d" />
                    <div className="text-2xl font-black italic text-white/10 uppercase tracking-widest">VS</div>
                    <TeamSphere name={match?.teams?.bowling?.fullName} shortName={match?.teams?.bowling?.name} logo={match?.teams?.bowling?.logo} color="#4d79ff" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-5xl md:text-9xl font-black italic tracking-tighter leading-none text-white drop-shadow-2xl">
                      {match?.score || '0/0'}
                    </h3>
                    <div className="flex items-center gap-4 justify-center md:justify-start text-xs font-black text-white/40 tracking-[0.3em] uppercase">
                      <span>{match?.overs || '0.0'} Overs</span>
                      <div className="size-1 rounded-full bg-white/20" />
                      <span>{match?.battingTeam || 'Operational'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Card */}
            <div className="w-full md:w-[350px] bg-white text-black rounded-[32px] md:rounded-[40px] p-6 md:p-10 flex flex-col justify-between min-h-[250px] md:min-h-[300px] shadow-[0_15px_40px_rgba(255,255,255,0.1)] group hover:scale-[1.02] transition-transform cursor-pointer">
              <div className="space-y-4">
                <div className="size-16 rounded-2xl bg-black/5 flex items-center justify-center">
                  <Zap className="size-8 fill-black" />
                </div>
                <h4 className="text-3xl font-black italic tracking-tighter leading-tight">
                  {isSeasonStarted ? 'Enter the Live Arena Now' : 'Join the IPL Elite List'}
                </h4>
                <p className="text-[10px] font-bold text-black/50 uppercase tracking-widest leading-relaxed">
                  Earn double Bond Coins during the opening weekend festivities.
                </p>
              </div>
              
              <button className="w-full py-5 bg-black text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
                {isSeasonStarted ? 'START PREDICTING' : 'SECURE ACCESS'} <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Strategic AI Hub Insight */}
      <StrategicAiWidget matchData={match} />

      {/* Seasonal Insights Hub */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
        <InsightCard 
          icon={<Award className="size-6" />} 
          label="Orange Cap Hunt" 
          value={topScorer ? `${topScorer.player} leads field` : "Virat Kohli leads field"} 
          color="bg-orange-600/20 text-orange-500" 
        />
        <InsightCard 
          icon={<Trophy className="size-6" />} 
          label="Purple Cap Hunt" 
          value={topWicketTaker ? `${topWicketTaker.player} dominant` : "Bumrah on fire"} 
          color="bg-purple-600/20 text-purple-400" 
        />
        <InsightCard 
          icon={<Users className="size-6" />} 
          label="Squad Verification" 
          value="All 10 teams finalized" 
          color="bg-emerald-600/20 text-emerald-500" 
        />
      </div>
    </div>
  );
};

// --- Helper Components for Aesthetic Excellence ---

const TeamSphere = ({ name, shortName, logo, color }) => (
  <div className="group relative">
    <div className="size-24 md:size-32 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 p-1 shadow-2xl flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      <img 
        src={logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'T')}&background=random&color=fff&size=200`} 
        className="size-full object-cover rounded-full group-hover:scale-110 transition-transform duration-500"
        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'T')}&background=random&color=fff&size=200` }}
      />
    </div>
    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white text-black rounded-lg text-[10px] font-black uppercase tracking-widest shadow-xl">
      {shortName}
    </div>
  </div>
);

const InsightCard = ({ icon, label, value, color }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white/[0.03] backdrop-blur-3xl p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-white/5 flex flex-col justify-between gap-6 md:gap-8 group cursor-pointer hover:bg-white/[0.05] transition-colors"
  >
    <div className={`size-14 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
      {icon}
    </div>
    <div className="space-y-2">
      <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{label}</p>
      <h4 className="text-2xl font-black italic tracking-tighter text-white/90 group-hover:text-white transition-colors uppercase">{value}</h4>
    </div>
    <div className="flex items-center gap-2 text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-4">
      View Deep Analytics <ChevronRight className="size-3" />
    </div>
  </motion.div>
);

export default IplHome;
