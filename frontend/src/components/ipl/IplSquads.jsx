import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Target, Award, ChevronDown, ChevronUp, Star, Shield, Zap, TrendingUp, Info } from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

const PlayerCard = ({ player }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-white/5 border border-white/10 p-6 group flex flex-col justify-between hover:border-indigo-500/50 transition-all"
    >
        <div className="flex justify-between items-start mb-6">
            <div>
                <h3 className="text-xl font-black italic tracking-tighter text-white flex items-center gap-2 uppercase">
                    {player.name}
                </h3>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1 flex items-center gap-2">
                    {player.role.includes("Batter") ? <Shield size={12} className="text-indigo-400"/> : player.role.includes("Bowler") ? <Zap size={12} className="text-red-400"/> : <Star size={12} className="text-amber-400"/>}
                    {player.role}
                </p>
            </div>
            <div className="text-right">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block mb-1">VALUATION</span>
                <span className="font-black text-base tracking-tighter text-white">₹ {player.price}</span>
            </div>
        </div>

        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Form</span>
                    <span className="text-lg">{player.form}</span>
                </div>
                <div className="text-right">
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block">Primary Stat</span>
                    <span className="text-sm font-bold text-indigo-400">{player.stats}</span>
                </div>
            </div>
            
            {player.isForeign && (
                <div className="py-2 px-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">OVERSEAS ELITE</span>
                </div>
            )}
        </div>
    </motion.div>
);

const TeamSection = ({ team, isExpanded, toggleExpand }) => (
    <motion.div 
        layout
        className="mb-8 rounded-[3.5rem] overflow-hidden border border-white/10 bg-white/[0.02] backdrop-blur-3xl"
    >
        <div 
            className="p-8 cursor-pointer flex items-center justify-between relative group"
            onClick={() => toggleExpand(team.shortName)}
        >
            <div className="flex items-center gap-8 relative z-10">
                <div className="size-20 rounded-full bg-white/5 p-3 flex items-center justify-center border border-white/10 shadow-2xl group-hover:scale-105 transition-transform">
                    <img src={team.logo} alt={team.shortName} className="w-full h-full object-contain brightness-110" />
                </div>
                <div>
                    <h2 className="text-3xl font-black italic text-white tracking-tighter uppercase leading-none">{team.teamName}</h2>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-2">
                             <TrendingUp size={12} className="text-indigo-400"/>
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Captain: <span className="text-white">{team.captain}</span></span>
                        </div>
                        <div className="size-1 rounded-full bg-white/10" />
                        <div className="flex items-center gap-2">
                             <Users size={12} className="text-amber-400"/>
                             <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{team.players.length} Verified Squad</span>
                        </div>
                    </div>
                </div>
            </div>
            <button className={`size-12 rounded-2xl flex items-center justify-center transition-all ${isExpanded ? 'bg-white text-black' : 'bg-white/5 text-white/40'}`}>
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
        </div>

        <AnimatePresence>
            {isExpanded && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-8 pb-10 pt-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {team.players.map((player, idx) => (
                            <PlayerCard key={idx} player={player} />
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const IplSquads = () => {
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedTeams, setExpandedTeams] = useState({});

    useEffect(() => {
        const fetchSquads = async () => {
            try {
                const res = await axiosInstance.get('/ipl/squads');
                setSquads(res.data);
                if (res.data?.length > 0) {
                    setExpandedTeams({ [res.data[0].shortName]: true });
                }
            } catch (error) {
                console.error("Squad Sync Failure:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSquads();
    }, []);

    const toggleExpand = (teamCode) => {
        setExpandedTeams(prev => ({ ...prev, [teamCode]: !prev[teamCode] }));
    };

    const filteredSquads = useMemo(() => {
        if (!searchTerm) return squads;
        const lowerSearch = searchTerm.toLowerCase();
        return squads.map(team => {
            const matchesTeam = team.teamName.toLowerCase().includes(lowerSearch) || team.shortName.toLowerCase().includes(lowerSearch);
            const filteredPlayers = team.players.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.role.toLowerCase().includes(lowerSearch));
            if (matchesTeam) return team;
            if (filteredPlayers.length > 0) return { ...team, players: filteredPlayers };
            return null;
        }).filter(Boolean);
    }, [squads, searchTerm]);

    if (loading) {
        return (
            <div className="py-20 flex flex-col items-center justify-center">
                <div className="size-16 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" />
                <p className="mt-6 text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] animate-pulse">Syncing Official Squads...</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                <div>
                    <h2 className="text-4xl font-black italic tracking-tighter leading-none mb-2 text-white">SQUAD RECON</h2>
                    <p className="text-sm font-bold text-white/30 uppercase tracking-[0.3em]">IPL 2026 Official Verified Teams</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 size-5" />
                    <input 
                        type="text"
                        placeholder="SEARCH FRANCHISE OR PLAYER..." 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </header>

            {filteredSquads.length === 0 ? (
                <div className="py-24 text-center bg-white/5 rounded-[3rem] border border-white/5 border-dashed">
                    <Info className="size-16 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 font-black uppercase tracking-widest">No matching squads in sector</p>
                </div>
            ) : (
                <div className="space-y-8 pb-32">
                    {filteredSquads.map((team, index) => (
                        <TeamSection 
                            key={index} 
                            team={team} 
                            isExpanded={!!expandedTeams[team.shortName] || searchTerm !== ""} 
                            toggleExpand={toggleExpand}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default IplSquads;
