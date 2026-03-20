import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, Zap, Target, Award, ChevronRight } from 'lucide-react';

const PlayerStatsModal = ({ player, isOpen, onClose }) => {
    if (!player) return null;

    // Dynamic data from player object or match history
    const matchHistory = player.recentMatches || [
        { opponent: 'MI', score: 45, balls: 32, date: '15 Mar' },
        { opponent: 'CSK', score: 12, balls: 8, date: '12 Mar' },
        { opponent: 'GT', score: 88, balls: 54, date: '08 Mar' },
        { opponent: 'DC', score: 0, balls: 1, date: '04 Mar' },
        { opponent: 'LSG', score: 22, balls: 15, date: '01 Mar' },
    ];

    const performanceData = [
        { label: 'SR', value: player.strikeRate || 145, color: '#f59e0b' },
        { label: 'AVG', value: player.average || 38.5, color: '#10b981' },
        { label: 'FORM', value: player.formScore || 82, color: '#3b82f6' },
        { label: 'REL', value: 92, color: '#ef4444' }, // Reliability Score
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-[#050508]/90 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#0c0c14] border border-white/10 w-full max-w-2xl rounded-[40px] overflow-hidden relative shadow-3xl flex flex-col max-h-[90vh]"
                    >
                        {/* Decorative background */}
                        <div className="absolute top-0 right-0 size-80 bg-indigo-600/10 blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="size-20 rounded-3xl bg-white/5 border border-white/10 overflow-hidden shadow-2xl">
                                    <img 
                                        src={player.image || `https://via.placeholder.com/150?text=${player.name}`} 
                                        alt={player.name}
                                        className="size-full object-cover"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-3xl font-black italic tracking-tighter uppercase">{player.name}</h2>
                                        <div className="px-2 py-0.5 bg-amber-500 text-black text-[8px] font-black rounded-full uppercase tracking-widest">
                                            Elite
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{player.team || 'Global Star'} • Batsman</p>
                                </div>
                            </div>
                            <button 
                                onClick={onClose}
                                className="size-12 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
                            >
                                <X className="size-6 text-white/60" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 space-y-10 overflow-y-auto relative z-10 custom-scrollbar">
                            
                            {/* Performance Radar/Heat-map Placeholder */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black italic tracking-widest uppercase text-white/40 flex items-center gap-2">
                                        <Target className="size-4 text-indigo-500" /> Scoring Zones
                                    </h3>
                                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full">AI Heatmap</span>
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {performanceData.map((data) => (
                                        <div key={data.label} className="bg-white/5 border border-white/5 rounded-3xl p-5 space-y-3">
                                            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">{data.label}</p>
                                            <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${data.value}%` }}
                                                    transition={{ duration: 1, delay: 0.5 }}
                                                    className="absolute inset-y-0 left-0 rounded-full"
                                                    style={{ backgroundColor: data.color }}
                                                />
                                            </div>
                                            <p className="text-xl font-black italic">{data.value}%</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Last 5 Matches Timeline */}
                            <section>
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black italic tracking-widest uppercase text-white/40 flex items-center gap-2">
                                        <History className="size-4 text-amber-500" /> Recent Form
                                    </h3>
                                    <TrendingUp className="size-4 text-emerald-500" />
                                </div>

                                <div className="space-y-3">
                                    {matchHistory.map((match, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-5 bg-white/5 border border-white/5 rounded-3xl group hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="text-[10px] font-black text-white/20 uppercase w-12">{match.date}</div>
                                                <div className="flex items-center gap-3">
                                                    <div className="size-8 rounded-xl bg-base-100 flex items-center justify-center font-black text-[10px] text-white/40">
                                                        {match.opponent}
                                                    </div>
                                                    <span className="text-[12px] font-black italic">vs {match.opponent}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="text-xl font-black italic leading-none">{match.score}</p>
                                                    <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">{match.balls} Balls</p>
                                                </div>
                                                <div className={`size-2 rounded-full ${parseInt(match.score) > 50 ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-white/20'}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Footer / CTA */}
                        <div className="p-8 bg-white/5 border-t border-white/5 flex gap-4">
                            <button className="flex-1 h-14 bg-indigo-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all">
                                Add to Dream Team <Zap className="size-4 fill-current" />
                            </button>
                            <button className="flex-1 h-14 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
                                Full Career Stats <ChevronRight className="size-4" />
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

// Internal Mock Icon for completeness
const History = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l1 1"/></svg>
);

export default PlayerStatsModal;
