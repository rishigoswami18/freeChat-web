import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Radio, Calendar, Info, Zap, Trophy, TrendingUp, Loader2, History, Target, Users } from 'lucide-react';
import { getIplSchedule, getMyPredictions } from '../lib/api';

const MarketGrid = ({ onSelectMatch, onCreateSquad }) => {
    const [matches, setMatches] = useState({ live: [], upcoming: [], recent: [] });
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('live');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [scheduleData, predictionsData] = await Promise.all([
                    getIplSchedule(),
                    getMyPredictions()
                ]);
                setMatches(scheduleData);
                setPredictions(predictionsData || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, []);

    const currentMatches = matches[activeTab] || [];

    if (loading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center gap-4 text-white/20">
                <Loader2 className="size-8 animate-spin text-orange-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Waking up the Engine...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-8">
                    {['live', 'upcoming', 'recent', 'my'].map((tab) => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`text-sm font-black uppercase tracking-widest transition-all pb-4 -mb-[18px] border-b-2 ${
                                activeTab === tab 
                                ? 'text-orange-500 border-orange-500' 
                                : 'text-white/30 border-transparent hover:text-white/60'
                            }`}
                        >
                            {tab === 'recent' ? 'Settled' : tab === 'my' ? 'My Registry' : `${tab} Matches`}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-4 text-white/20">
                    <Radio className="size-4 animate-pulse text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                        {matches.live.length * 124 + 102} Active Predictions
                    </span>
                </div>
            </div>

            {/* Grid Area */}
            <div className="space-y-3">
                {activeTab === 'my' ? (
                    <div className="space-y-4">
                        {predictions.length === 0 ? (
                            <div className="py-20 text-center space-y-4 opacity-20">
                                <History className="size-12 mx-auto" />
                                <p className="text-sm font-black uppercase tracking-widest">Registry is empty. Place a prediction to start.</p>
                            </div>
                        ) : (
                            predictions.map((pred, idx) => (
                                <motion.div 
                                    key={pred._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-[#161B22] border border-white/5 p-4 rounded-3xl flex items-center justify-between group hover:border-orange-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`size-12 rounded-2xl flex items-center justify-center ${
                                            pred.status === 'won' ? 'bg-emerald-500/10 text-emerald-500' : 
                                            pred.status === 'lost' ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-white/40'
                                        }`}>
                                            <Target className="size-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase">PredictionID: {pred._id.slice(-8)}</p>
                                            <h4 className="text-base font-black text-white group-hover:text-orange-500 transition-colors uppercase italic truncate max-w-[200px]">
                                                {pred.predictionValue} Outcome
                                            </h4>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-8">
                                        <div>
                                            <p className="text-[10px] font-black text-white/20 uppercase">Wager</p>
                                            <p className="text-sm font-black text-white italic">₹{pred.wagerAmount}</p>
                                        </div>
                                        <div className="min-w-[100px]">
                                            <p className="text-[10px] font-black text-white/20 uppercase">Status</p>
                                            <p className={`text-sm font-black uppercase tracking-widest ${
                                                pred.status === 'won' ? 'text-emerald-400' : 
                                                pred.status === 'lost' ? 'text-red-400' : 'text-orange-400'
                                            }`}>
                                                {pred.status}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                ) : (
                    <>
                        {currentMatches.length === 0 ? (
                            <div className="py-20 text-center space-y-4 opacity-20">
                                <Trophy className="size-12 mx-auto" />
                                <p className="text-sm font-black uppercase tracking-widest">No {activeTab} matches at this moment</p>
                            </div>
                        ) : (
                            <>
                                {/* Table Header */}
                                <div className="grid grid-cols-12 px-6 text-[9px] font-black uppercase tracking-widest text-white/20 mb-4">
                                    <div className="col-span-1">Status</div>
                                    <div className="col-span-11">Event Details & Predictions</div>
                                </div>

                                {/* Match Rows */}
                                {currentMatches.map((match, idx) => (
                                    <motion.div 
                                        key={match._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-[#161B22] border border-white/5 hover:border-orange-500/20 rounded-[2.5rem] p-6 group transition-all"
                                    >
                                        <div className="grid grid-cols-12 items-center gap-6">
                                            {/* Status Column */}
                                            <div className="col-span-1 flex flex-col items-center gap-1 border-r border-white/5">
                                                {match.status === 'live' ? (
                                                    <>
                                                        <Radio className="size-4 text-red-500" />
                                                        <span className="text-[10px] font-black text-red-500 uppercase">Live</span>
                                                    </>
                                                ) : match.status === 'scheduled' ? (
                                                    <>
                                                        <Calendar className="size-4 text-white/20" />
                                                        <span className="text-[10px] font-black text-white/20 uppercase">Soon</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Trophy className="size-4 text-amber-500" />
                                                        <span className="text-[10px] font-black text-amber-500 uppercase">End</span>
                                                    </>
                                                )}
                                            </div>

                                            {/* Event Info */}
                                            <div className="col-span-5 flex items-center justify-between pr-8">
                                                <div className="space-y-1">
                                                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest mb-2">
                                                        {match.seriesId?.seriesName || "Standard Arena"}
                                                    </p>
                                                    <div className="flex items-center gap-6">
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="size-12 p-1.5 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                                                <img src={match.team1.logo} alt="" className="size-full object-contain" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-white/60 uppercase">{match.team1.name}</span>
                                                        </div>
                                                        <span className="text-sm font-black text-white/10 italic">VS</span>
                                                        <div className="flex flex-col items-center gap-1">
                                                            <div className="size-12 p-1.5 bg-white/5 rounded-2xl flex items-center justify-center border border-white/5">
                                                                <img src={match.team2.logo} alt="" className="size-full object-contain" />
                                                            </div>
                                                            <span className="text-[10px] font-black text-white/60 uppercase">{match.team2.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-2xl font-black italic tracking-tighter text-orange-500 group-hover:scale-110 transition-transform">
                                                        {match.currentScore?.split('(')[0].trim() || "0/0"}
                                                    </p>
                                                    <p className="text-[10px] font-black text-white/20 uppercase">
                                                        {match.currentScore?.match(/\(([^)]+)\)/)?.[1] || (match.status === 'completed' ? 'Final Result' : 'Pre-game')}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="col-span-6 grid grid-cols-3 gap-3">
                                                <button 
                                                    onClick={() => onCreateSquad && onCreateSquad(match)}
                                                    className="col-span-1 py-4 bg-orange-500 text-white rounded-2xl flex flex-col items-center justify-center gap-1 hover:bg-orange-400 transition-all shadow-lg shadow-orange-500/20 group/btn"
                                                >
                                                    <Users className="size-4" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Build Squad</span>
                                                </button>
                                                <button 
                                                    onClick={() => onSelectMatch && onSelectMatch(match)}
                                                    className="col-span-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group/btn"
                                                >
                                                    <Zap className="size-4 text-emerald-400" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Predict Yes</span>
                                                </button>
                                                <button 
                                                    onClick={() => onSelectMatch && onSelectMatch(match)}
                                                    className="col-span-1 py-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all group/btn"
                                                >
                                                    <Zap className="size-4 text-red-500" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Predict No</span>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MarketGrid;
