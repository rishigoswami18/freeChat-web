import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info, Cloud, Wind, Droplets } from 'lucide-react';

const venues = [
    {
        name: "Narendra Modi Stadium",
        city: "Ahmedabad",
        capacity: "132,000",
        pitchType: "Balanced / High Scored",
        report: "Large boundaries make it hard for spinners. High-scoring venue with good bounce for pacers.",
        stats: { avgScore: "172", paceWkts: "62%", spinWkts: "38%" }
    },
    {
        name: "Wankhede Stadium",
        city: "Mumbai",
        capacity: "33,000",
        pitchType: "Batting Paradise",
        report: "Red soil offers good bounce and turn, but the small boundaries favor big hitters. Dew is a major factor at night.",
        stats: { avgScore: "185", paceWkts: "55%", spinWkts: "45%" }
    },
    {
        name: "M. Chinnaswamy Stadium",
        city: "Bengaluru",
        capacity: "40,000",
        pitchType: "Flat / Small Ground",
        report: "Short boundaries and high altitude make this a nightmare for bowlers. Expect 200+ scores.",
        stats: { avgScore: "192", paceWkts: "58%", spinWkts: "42%" }
    },
    {
        name: "MA Chidambaram Stadium",
        city: "Chennai",
        capacity: "50,000",
        pitchType: "Spin Friendly",
        report: "Slow and low track. Spinners dominate here. Hard for new batsmen to start immediately.",
        stats: { avgScore: "158", paceWkts: "35%", spinWkts: "65%" }
    }
];

const IplVenues = () => {
    return (
        <div className="space-y-12">
            <header>
                <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2">IPL ARENAS & PITCH REPORTS</h2>
                <p className="text-sm font-bold text-white/30 uppercase tracking-[0.3em]">Venue Analytics for 2026 Season</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {venues.map((venue, idx) => (
                    <motion.div
                        key={venue.name}
                        initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden group hover:border-indigo-500/50 transition-all"
                    >
                        <div className="p-8 space-y-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-indigo-400">
                                        <MapPin className="size-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{venue.city}</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic tracking-tight uppercase group-hover:text-indigo-400 transition-colors">
                                        {venue.name}
                                    </h3>
                                </div>
                                <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                                    <p className="text-[9px] font-black text-white/30 uppercase">Capacity</p>
                                    <p className="font-bold text-sm tracking-tight">{venue.capacity}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/30 uppercase mb-1">Avg Score</p>
                                    <p className="text-xl font-black text-indigo-500">{venue.stats.avgScore}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/30 uppercase mb-1">Pace Wkts</p>
                                    <p className="text-xl font-black text-emerald-400">{venue.stats.paceWkts}</p>
                                </div>
                                <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <p className="text-[9px] font-black text-white/30 uppercase mb-1">Spin Wkts</p>
                                    <p className="text-xl font-black text-amber-400">{venue.stats.spinWkts}</p>
                                </div>
                            </div>

                            <div className="bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-2xl space-y-3">
                                <div className="flex items-center gap-2 text-indigo-300">
                                    <Info className="size-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">Pitch Intelligence</span>
                                </div>
                                <p className="text-sm font-bold text-white/70 leading-relaxed italic">
                                    "{venue.report}"
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <Cloud className="size-4 text-white/40" />
                                        <span className="text-[10px] font-bold text-white/40">28°C Clearsky</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Wind className="size-4 text-white/40" />
                                        <span className="text-[10px] font-bold text-white/40">12km/h</span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {venue.pitchType}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default IplVenues;
