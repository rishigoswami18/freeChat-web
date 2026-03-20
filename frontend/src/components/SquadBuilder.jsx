import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, User, Shield, Info, Sparkles, 
    ChevronRight, Trophy, Zap, Search, 
    ArrowLeft, Filter, AlertCircle, CheckCircle2,
    Crown, Star, Wallet, Activity, Play, Monitor, Layout,
    Globe, ArrowUpRight, ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getIplSquads, saveIplSquad } from '../lib/api';

const SquadBuilder = ({ match, onBack }) => {
    const [players, setPlayers] = useState([]);
    const [selectedPlayers, setSelectedPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [phase, setPhase] = useState('selection'); // 'selection' or 'captains'
    const [captainId, setCaptainId] = useState(null);
    const [viceCaptainId, setViceCaptainId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const data = await getIplSquads();
                const team1Data = data.find(t => t.teamName === match.team1.name || t.shortName === match.team1.name);
                const team2Data = data.find(t => t.teamName === match.team2.name || t.shortName === match.team2.name);

                const mapRole = (role) => {
                    const r = role.toUpperCase();
                    if (r.includes('WICKET')) return 'WK';
                    if (r.includes('BAT')) return 'BAT';
                    if (r.includes('ALL')) return 'ALL';
                    if (r.includes('BOWL')) return 'BOW';
                    return 'BAT';
                };

                const combined = [
                    ...(team1Data?.players?.map((p, idx) => ({ ...p, team: team1Data.shortName, role: mapRole(p.role), id: `t1-${idx}`, sel: Math.floor(Math.random() * 50) + 40 })) || []),
                    ...(team2Data?.players?.map((p, idx) => ({ ...p, team: team2Data.shortName, role: mapRole(p.role), id: `t2-${idx}`, sel: Math.floor(Math.random() * 40) + 30 })) || [])
                ].map(p => ({ 
                    ...p, 
                    points: Math.floor(Math.random() * 800) + 200 
                }));
                
                setPlayers(combined);
            } catch (error) {
                console.error("Failed to fetch players", error);
                toast.error("Cloud data sync failed.");
            } finally {
                setLoading(false);
            }
        };
        fetchPlayers();
    }, [match]);

    const creditsLeft = 100 - selectedPlayers.reduce((acc, p) => acc + (p.credits || 9.0), 0);
    
    const roleStats = {
        WK: selectedPlayers.filter(p => p.role === 'WK').length,
        BAT: selectedPlayers.filter(p => p.role === 'BAT').length,
        ALL: selectedPlayers.filter(p => p.role === 'ALL').length,
        BOW: selectedPlayers.filter(p => p.role === 'BOW').length,
    };

    const teamCount = {
        T1: selectedPlayers.filter(p => p.team === match.team1.name || p.team === (players.find(pl => pl.id.startsWith('t1'))?.team)).length,
        T2: selectedPlayers.filter(p => p.team === match.team2.name || p.team === (players.find(pl => pl.id.startsWith('t2'))?.team)).length,
    };

    // Correcting team counts based on index prefixes
    const t1Short = players.find(p => p.id.startsWith('t1'))?.team;
    const t2Short = players.find(p => p.id.startsWith('t2'))?.team;
    const realTeamCount = {
        [t1Short]: selectedPlayers.filter(p => p.team === t1Short).length,
        [t2Short]: selectedPlayers.filter(p => p.team === t2Short).length,
    };

    const filteredPlayers = useMemo(() => {
        return players.filter(p => {
            const matchesRole = activeTab === 'ALL' || p.role === activeTab;
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesRole && matchesSearch;
        });
    }, [activeTab, searchQuery, players]);

    const togglePlayer = (player) => {
        if (selectedPlayers.find(p => p.id === player.id)) {
            setSelectedPlayers(prev => prev.filter(p => p.id !== player.id));
        } else {
            if (selectedPlayers.length >= 11) {
                toast.error("Squad limit reached (Max 11)");
                return;
            }
            if (creditsLeft < (player.credits || 9.0)) {
                toast.error("Credit budget exceeded!");
                return;
            }
            
            // Standard Fantasy Constraints
            if (player.role === 'WK' && roleStats.WK >= 4) return toast.error("Max 4 WK allowed");
            if (player.role === 'BAT' && roleStats.BAT >= 6) return toast.error("Max 6 BAT allowed");
            if (player.role === 'ALL' && roleStats.ALL >= 4) return toast.error("Max 4 ALL allowed");
            if (player.role === 'BOW' && roleStats.BOW >= 6) return toast.error("Max 6 BOW allowed");
            
            // Team limit (max 7 from one team)
            if (realTeamCount[player.team] >= 7) return toast.error(`Max 7 players from ${player.team}`);

            setSelectedPlayers(prev => [...prev, player]);
        }
    };

    const handleSave = async () => {
        if (!captainId || !viceCaptainId) {
            toast.error("Please select Captain & Vice-Captain");
            return;
        }

        setIsSaving(true);
        try {
            await saveIplSquad({
                matchId: match._id,
                players: selectedPlayers,
                captainId,
                viceCaptainId,
                wagerAmount: 100 
            });
            toast.success("Squad Anchored! Winning logic deployed. 🚀");
            onBack();
        } catch (error) {
            toast.error(error.response?.data?.message || "Cloud sync error.");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return (
        <div className="w-full h-full flex flex-col items-center justify-center gap-6">
            <div className="relative">
                <Activity className="size-16 animate-spin text-orange-500" />
                <div className="absolute inset-0 size-16 rounded-full border-4 border-orange-500/20 animate-ping" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.5em] text-white/40">Calibrating Player Matrix...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full bg-[#0D0F14] rounded-[3rem] border border-white/5 flex flex-col overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] relative"
        >
            {/* Professional Header */}
            <div className="p-6 bg-black/60 border-b border-white/5 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all">
                        <ArrowLeft className="size-5" />
                    </button>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter">CREATE SQUAD</h3>
                        <div className="flex items-center gap-2">
                             <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{match.team1.name} vs {match.team2.name}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex items-center gap-8">
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Squad Matrix</span>
                        <div className="flex items-center gap-1">
                            {[...Array(11)].map((_, i) => (
                                <div key={i} className={`h-1.5 w-4 rounded-full transition-all duration-500 ${i < selectedPlayers.length ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]' : 'bg-white/5'}`} />
                            ))}
                            <span className="text-sm font-black italic ml-2 text-orange-500">{selectedPlayers.length}/11</span>
                        </div>
                    </div>
                    <div className="h-10 w-px bg-white/5" />
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em]">Credits Remaining</span>
                        <span className={`text-xl font-black italic ${creditsLeft < 10 ? 'text-red-500' : 'text-emerald-400'}`}>{creditsLeft.toFixed(1)}</span>
                    </div>
                </div>
            </div>

            {phase === 'selection' ? (
                <>
                    {/* Role Filtration & Team Split */}
                    <div className="flex flex-col border-b border-white/5 bg-black/40">
                        <div className="flex items-center justify-between px-8 border-b border-white/5">
                            {['ALL', 'WK', 'BAT', 'ALL', 'BOW'].map((role, idx) => {
                                const roleLabel = role === 'ALL' && idx === 0 ? 'ALL' : (role === 'ALL' ? 'AR' : role);
                                const isActualAR = roleLabel === 'AR' || roleLabel === 'ALL-ROUNDER';
                                const tabValue = role === 'ALL' && idx === 0 ? 'ALL' : (role === 'ALL' ? 'ALL' : role);
                                const isActive = activeTab === tabValue;

                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => setActiveTab(tabValue)}
                                        className={`px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] relative transition-all ${
                                            isActive ? 'text-orange-500' : 'text-white/20 hover:text-white'
                                        }`}
                                    >
                                        <span className="flex items-center gap-2">
                                            {roleLabel} 
                                            {roleLabel !== 'ALL' && <span className={`text-[8px] px-1.5 py-0.5 rounded-md ${roleStats[roleLabel === 'AR' ? 'ALL' : roleLabel] > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-white/5 text-white/20'}`}>({roleStats[roleLabel === 'AR' ? 'ALL' : roleLabel]})</span>}
                                        </span>
                                        {isActive && (
                                            <motion.div layoutId="roleIndicator" className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500 shadow-[0_-4px_15px_rgba(249,115,22,0.4)]" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        
                        <div className="px-8 py-3 flex items-center justify-between bg-black/20">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-6 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                                        <img src={match.team1.logo} className="size-4 object-contain" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{t1Short}: {realTeamCount[t1Short]}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-6 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                        <img src={match.team2.logo} className="size-4 object-contain" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{t2Short}: {realTeamCount[t2Short]}</span>
                                </div>
                            </div>
                            <div className="relative group w-48">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3 text-white/20 group-focus-within:text-orange-500 transition-all" />
                                <input 
                                    type="text" 
                                    placeholder="Search Player"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 text-[9px] font-black uppercase placeholder:text-white/10 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pro Player Grid */}
                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0D0F11]">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 pb-32">
                            {filteredPlayers.length === 0 ? (
                                <div className="col-span-full h-64 flex flex-col items-center justify-center gap-4 opacity-20">
                                    <Search className="size-12" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No players found in this sector</p>
                                </div>
                            ) : (
                                filteredPlayers.map(player => {
                                    const isSelected = selectedPlayers.find(p => p.id === player.id);
                                    return (
                                        <motion.div 
                                            key={player.id}
                                            onClick={() => togglePlayer(player)}
                                            whileTap={{ scale: 0.98 }}
                                            className={`group relative overflow-hidden p-4 rounded-3xl border transition-all cursor-pointer flex items-center justify-between ${
                                                isSelected
                                                ? 'bg-orange-500/5 border-orange-500/50 shadow-[0_10px_30px_rgba(249,115,22,0.1)]'
                                                : 'bg-[#151921] border-white/5 hover:border-white/10 hover:bg-[#1C222D]'
                                            }`}
                                        >
                                            {/* Team Indicator Strip */}
                                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${player.team === t1Short ? 'bg-orange-500' : 'bg-blue-500'}`} />

                                            <div className="flex items-center gap-4 relative z-10">
                                                <div className="relative">
                                                    <div className="size-14 rounded-2xl bg-white/5 border border-white/5 p-1 overflow-hidden">
                                                        <img src={player.logo || "https://static.thenounproject.com/png/3635175-200.png"} alt="" className="size-full object-contain filter grayscale group-hover:grayscale-0 transition-all" />
                                                    </div>
                                                    {isSelected && (
                                                        <div className="absolute -top-2 -right-2 size-6 bg-orange-500 rounded-full flex items-center justify-center border-4 border-[#151921] text-white">
                                                            <CheckCircle2 className="size-3" />
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div>
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{player.team} • {player.role}</span>
                                                        {player.isForeign && <Globe className="size-2 text-white/20" />}
                                                    </div>
                                                    <h4 className="text-base font-black italic uppercase leading-none mb-1 group-hover:text-orange-500 transition-colors italic">{player.name}</h4>
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex items-center gap-1">
                                                            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            <span className="text-[8px] font-bold text-emerald-500 uppercase">SEL {player.sel}%</span>
                                                        </div>
                                                        <span className="text-[8px] font-bold text-white/10 uppercase italic">Form: {player.form}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right flex items-center gap-8 relative z-10">
                                                <div className="space-y-0.5 hidden sm:block">
                                                     <p className="text-[8px] font-black text-white/20 uppercase">Last Match</p>
                                                     <p className="text-sm font-black italic text-white/60">{player.points} pts</p>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <p className="text-2xl font-black italic text-white tracking-tighter italic">{player.credits}</p>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">credits</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Sticky Pro Footer */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-transparent z-[100] flex items-center justify-between gap-6 pointer-events-none">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPreview(true)}
                            className="pointer-events-auto px-8 py-5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl flex items-center gap-3 transition-all backdrop-blur-xl"
                        >
                            <Layout className="size-4 text-orange-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Squad Preview</span>
                        </motion.button>

                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={selectedPlayers.length !== 11}
                            onClick={() => setPhase('captains')}
                            className={`pointer-events-auto flex-1 h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl
                                ${selectedPlayers.length === 11 
                                    ? 'bg-orange-500 text-white shadow-orange-500/20 hover:shadow-orange-500/40 cursor-pointer' 
                                    : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5 opacity-50'
                                }
                            `}
                        >
                            PICK CAPTAINS <ChevronRight className="size-5" />
                        </motion.button>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="pointer-events-auto p-5 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-2xl transition-all backdrop-blur-xl group"
                        >
                            <Sparkles className="size-5 group-hover:scale-120 transition-transform" />
                        </motion.button>
                    </div>
                </>
            ) : (
                // Phase 2: Captains & Multpliers
                <div className="flex-1 flex flex-col p-8 space-y-10 overflow-y-auto bg-[#0D0F11]">
                    <div className="flex flex-col items-center gap-3 text-center">
                        <div className="size-16 rounded-[2rem] bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 mb-2">
                             <Crown className="size-8" />
                        </div>
                        <h2 className="text-4xl font-black italic uppercase italic tracking-tighter">Strategic High-Command</h2>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Assign multipliers to maximize match equity</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                        {/* Captain Selection */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-6 py-3 bg-orange-500/10 border border-orange-500/20 rounded-2xl w-fit">
                                <Crown className="size-4 text-orange-500" />
                                <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Captain (2X Multiplier)</span>
                            </div>
                            <div className="space-y-3">
                                {selectedPlayers.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => {
                                            if (viceCaptainId === p.id) setViceCaptainId(null);
                                            setCaptainId(p.id);
                                        }}
                                        className={`w-full p-5 rounded-3xl border flex items-center justify-between transition-all group ${
                                            captainId === p.id 
                                            ? 'bg-orange-500 border-orange-500 shadow-xl shadow-orange-500/30 scale-[1.02]' 
                                            : 'bg-[#151921] border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-white/10 p-1">
                                                <img src={p.logo || "https://static.thenounproject.com/png/3635175-200.png"} className="size-full object-contain" alt="" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`text-base font-black italic uppercase italic leading-none mb-0.5 ${captainId === p.id ? 'text-black' : 'text-white'}`}>{p.name}</h4>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${captainId === p.id ? 'text-black/60' : 'text-white/20'}`}>{p.role} • {p.team}</p>
                                            </div>
                                        </div>
                                        {captainId === p.id ? <Zap className="size-5 text-black" /> : <div className="size-5 rounded-full border border-white/10 group-hover:border-orange-500/50" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Vice-Captain Selection */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 px-6 py-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl w-fit">
                                <Star className="size-4 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Vice-Captain (1.5X Multiplier)</span>
                            </div>
                            <div className="space-y-3">
                                {selectedPlayers.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => {
                                            if (captainId === p.id) setCaptainId(null);
                                            setViceCaptainId(p.id);
                                        }}
                                        className={`w-full p-5 rounded-3xl border flex items-center justify-between transition-all group ${
                                            viceCaptainId === p.id 
                                            ? 'bg-indigo-500 border-indigo-500 shadow-xl shadow-indigo-500/30 scale-[1.02]' 
                                            : 'bg-[#151921] border-white/5 hover:border-white/10'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-white/10 p-1">
                                                <img src={p.logo || "https://static.thenounproject.com/png/3635175-200.png"} className="size-full object-contain" alt="" />
                                            </div>
                                            <div className="text-left">
                                                <h4 className={`text-base font-black italic uppercase italic leading-none mb-0.5 ${viceCaptainId === p.id ? 'text-black' : 'text-white'}`}>{p.name}</h4>
                                                <p className={`text-[8px] font-black uppercase tracking-widest ${viceCaptainId === p.id ? 'text-black/60' : 'text-white/20'}`}>{p.role} • {p.team}</p>
                                            </div>
                                        </div>
                                        {viceCaptainId === p.id ? <Zap className="size-5 text-black" /> : <div className="size-5 rounded-full border border-white/10 group-hover:border-indigo-500/50" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto py-12 flex flex-col items-center gap-8 border-t border-white/5">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={() => setPhase('selection')}
                                className="px-10 py-5 bg-white/5 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest rounded-2xl transition-all border border-white/5"
                            >
                                Re-Calibrate Selection
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving || !captainId || !viceCaptainId}
                                className={`px-16 py-5 rounded-2xl font-black uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 transition-all shadow-2xl
                                    ${captainId && viceCaptainId 
                                        ? 'bg-orange-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.05] active:scale-95' 
                                        : 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5'
                                    }
                                    ${isSaving ? 'opacity-80' : ''}
                                `}
                            >
                                {isSaving ? <Activity className="size-5 animate-spin" /> : <>DEPLOY SQUAD <ArrowUpRight className="size-5" /></>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ground Preview Modal (Mini) */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md"
                        onClick={() => setShowPreview(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg bg-[#11141B] rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl flex flex-col h-[700px]"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-lg font-black italic uppercase">Squad Architecture</h3>
                                <button onClick={() => setShowPreview(false)} className="size-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all">
                                    <X className="size-5" />
                                </button>
                            </div>
                            
                            {/* Ground View Visualization */}
                            <div className="flex-1 bg-gradient-to-b from-emerald-600/20 to-emerald-900/40 p-8 relative overflow-hidden">
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none">
                                    <div className="absolute inset-0 border-[100px] border-white rounded-full translate-y-1/2 scale-150" />
                                </div>
                                
                                <div className="h-full flex flex-col justify-around">
                                    {/* WK Row */}
                                    <div className="flex justify-center gap-4">
                                        {selectedPlayers.filter(p => p.role === 'WK').map(p => (
                                            <div key={p.id} className="flex flex-col items-center gap-1">
                                                <div className="size-12 rounded-full bg-white border-2 border-orange-500 p-1"><img src={p.logo} /></div>
                                                <span className="text-[8px] font-black uppercase text-white bg-black/60 px-2 py-0.5 rounded shadow-lg">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* BAT Row */}
                                    <div className="flex justify-center gap-8">
                                        {selectedPlayers.filter(p => p.role === 'BAT').map(p => (
                                            <div key={p.id} className="flex flex-col items-center gap-1">
                                                <div className="size-10 rounded-full bg-black/40 border border-white/20 p-1"><img src={p.logo} /></div>
                                                <span className="text-[8px] font-black uppercase text-white/60">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* ALL Row */}
                                    <div className="flex justify-center gap-8">
                                        {selectedPlayers.filter(p => p.role === 'ALL').map(p => (
                                            <div key={p.id} className="flex flex-col items-center gap-1">
                                                <div className="size-10 rounded-full bg-black/40 border border-white/20 p-1"><img src={p.logo} /></div>
                                                <span className="text-[8px] font-black uppercase text-white/60">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {/* BOW Row */}
                                    <div className="flex justify-center gap-4">
                                        {selectedPlayers.filter(p => p.role === 'BOW').map(p => (
                                            <div key={p.id} className="flex flex-col items-center gap-1">
                                                <div className="size-10 rounded-full bg-black/40 border border-white/20 p-1"><img src={p.logo} /></div>
                                                <span className="text-[8px] font-black uppercase text-white/60">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-8 bg-black/60 border-t border-white/5 space-y-4">
                                <div className="grid grid-cols-4 gap-4">
                                    {Object.entries(roleStats).map(([role, count]) => (
                                        <div key={role} className="text-center">
                                            <p className="text-[8px] font-black text-white/20 uppercase mb-1">{role}</p>
                                            <p className="text-lg font-black italic text-orange-500">{count}</p>
                                        </div>
                                    ))}
                                </div>
                                <button 
                                    onClick={() => setShowPreview(false)}
                                    className="w-full py-5 bg-white text-black rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-black/40"
                                >
                                    BACK TO EDIT
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default SquadBuilder;
