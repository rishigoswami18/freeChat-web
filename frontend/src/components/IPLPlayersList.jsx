import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Search, DollarSign, Award, ChevronDown, ChevronUp, Star, Shield, Zap } from "lucide-react";
import { getIplSquads } from "../lib/api";

const PlayerCard = ({ player }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-5 group flex flex-col justify-between"
            style={{ 
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(5px)"
            }}
        >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {player.name}
                        {player.isForeign && <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30"> overseas </span>}
                    </h3>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                        {player.role.includes("Batter") ? <Shield size={14} className="text-blue-400"/> : player.role.includes("Bowler") ? <Zap size={14} className="text-red-400"/> : <Star size={14} className="text-green-400"/>}
                        {player.role}
                    </p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-lg font-mono font-bold text-sm flex items-center shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                        ₹ {player.price}
                    </span>
                    <span className="text-2xl mt-2 filter drop-shadow-md">{player.form}</span>
                </div>
            </div>

            <div className="pt-4 border-t border-white/10 relative z-10">
                <p className="text-xs text-indigo-200/70 font-mono tracking-wider mb-1 uppercase">Career Stats</p>
                <p className="text-sm font-medium text-white/90">{player.stats}</p>
            </div>
        </motion.div>
    );
};

const TeamSection = ({ team, isExpanded, toggleExpand }) => {
    return (
        <motion.div 
            layout
            className="mb-8 rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-xl"
        >
            <div 
                className="p-6 cursor-pointer flex items-center justify-between relative overflow-hidden"
                onClick={() => toggleExpand(team.shortName)}
                style={{
                    background: `linear-gradient(90deg, ${team.themeColor}22 0%, transparent 100%)`,
                    borderLeft: `4px solid ${team.themeColor}`
                }}
            >
                <div className="flex items-center gap-5 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-white/10 p-2 flex items-center justify-center border border-white/20 shadow-lg">
                        <img src={team.logo} alt={team.shortName} className="w-full h-full object-contain filter drop-shadow-lg" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-wide font-sans title-glow">{team.teamName}</h2>
                        <p className="text-sm font-medium text-white/60 mt-1 flex items-center gap-2">
                            <Star size={14} className="text-amber-400"/> Captain: <span className="text-white">{team.captain}</span> 
                            <span className="mx-2 opacity-30">•</span> 
                            <Users size={14}/> {team.players.length} Players
                        </p>
                    </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors border border-white/10">
                    {isExpanded ? <ChevronUp className="text-white/70" /> : <ChevronDown className="text-white/70" />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="px-6 pb-6 pt-2"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {team.players.map((player, idx) => (
                                <PlayerCard key={idx} player={player} />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const IPLPlayersList = () => {
    const [squads, setSquads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedTeams, setExpandedTeams] = useState({});

    useEffect(() => {
        const fetchSquads = async () => {
            try {
                const data = await getIplSquads();
                setSquads(data);
                
                // Auto-expand first team
                if (data && data.length > 0) {
                    setExpandedTeams({ [data[0].shortName]: true });
                }
            } catch (error) {
                console.error("Failed to fetch squads:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSquads();
    }, []);

    const toggleExpand = (teamCode) => {
        setExpandedTeams(prev => ({
            ...prev,
            [teamCode]: !prev[teamCode]
        }));
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
            <div className="flex flex-col items-center justify-center p-20">
                <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
                <p className="mt-4 text-amber-500 font-medium tracking-widest uppercase text-sm animate-pulse">Loading Auction Data...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto pb-24">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <DollarSign className="text-amber-400 w-10 h-10" />
                        Auction <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Market</span>
                    </h1>
                    <p className="text-gray-400 mt-2 text-lg">Official IPL 2024 Squads, Prices & Career Stats</p>
                </div>

                <div className="relative w-full md:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input 
                        type="text"
                        placeholder="Search players or teams..." 
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {filteredSquads.length === 0 ? (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No players found</h3>
                    <p className="text-gray-400">Try a different search term.</p>
                </div>
            ) : (
                <div className="space-y-6">
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

export default IPLPlayersList;
