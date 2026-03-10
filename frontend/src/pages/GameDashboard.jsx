import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameTemplates, getActiveGameSessions, getGameHistory, startGame } from "../lib/api";
import { Gamepad2, Play, Users, CheckCircle2, Loader2, ArrowLeft, History, Trophy, Calendar, Sparkles, Zap, Heart, Flame } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { GameSkeleton } from "../components/Skeletons";

const GameDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: templates, isLoading: templatesLoading } = useQuery({
        queryKey: ["gameTemplates"],
        queryFn: getGameTemplates,
    });

    // Smart-Sync Normalizer: Handles both Array and Object formats while preserving identity keys
    const processedTemplates = useMemo(() => {
        if (Array.isArray(templates)) return templates;
        if (templates && typeof templates === 'object') {
            return Object.entries(templates).map(([key, value]) => ({
                ...value,
                type: key
            }));
        }
        return [];
    }, [templates]);

    const { data: activeSessions, isLoading: activeLoading } = useQuery({
        queryKey: ["activeGameSessions"],
        queryFn: getActiveGameSessions,
    });

    const { data: gameHistory, isLoading: historyLoading } = useQuery({
        queryKey: ["gameHistory"],
        queryFn: getGameHistory,
    });

    const { mutate: handleStartGame, isPending: isStarting } = useMutation({
        mutationFn: startGame,
        onSuccess: (data) => {
            toast.success("Royale started!");
            navigate(`/game/${data.session._id}`);
            queryClient.invalidateQueries({ queryKey: ["activeGameSessions"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to start game"),
    });

    if (templatesLoading || activeLoading || historyLoading) {
        return <GameSkeleton />;
    }

    return (
        <div className="min-h-screen bg-[#060606] text-white p-4 sm:p-6 lg:p-10 font-outfit relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                <header className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <Link to="/couple" className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest text-white/60">
                            <ArrowLeft className="size-4" />
                            Back to Profile
                        </Link>
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter uppercase flex items-center gap-4">
                                <span className="bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent italic">BOND</span> ARENA
                            </h1>
                            <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] mt-2 italic flex items-center gap-2">
                                <Flame className="size-3 text-orange-400" /> Challenge your partner in strategic matches
                            </p>
                        </div>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-10">
                    {/* LEFT COLUMN: ACTIVE SESSIONS */}
                    <div className="lg:col-span-1 space-y-8">
                        {activeSessions?.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-amber-400 mb-6 flex items-center gap-2">
                                    <Zap className="size-4 animate-pulse" /> Continue Royale
                                </h2>
                                <div className="space-y-4">
                                    {activeSessions.map((session) => (
                                        <motion.div
                                            key={session._id}
                                            whileHover={{ x: 5 }}
                                            className="p-5 bg-white/[0.03] rounded-[32px] border border-white/5 border-l-amber-500/50 flex items-center justify-between group transition-all"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-14 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-transform">
                                                    <Gamepad2 className="size-7 text-amber-500" />
                                                </div>
                                                <div>
                                                    <h3 className="font-black uppercase tracking-tighter text-sm italic">{session.gameType.split('_').join(' ')}</h3>
                                                    <p className="text-[9px] font-bold opacity-30 uppercase">In Progress</p>
                                                </div>
                                            </div>
                                            <Link to={`/game/${session._id}`} className="p-3 bg-amber-500 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-110 active:scale-95 transition-all">
                                                <Play className="size-4 fill-white text-white" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <section>
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-6 flex items-center gap-2">
                                <Trophy className="size-4" /> Global Ranking
                            </h2>
                            <div className="p-8 bg-gradient-to-br from-primary/20 to-pink-500/20 rounded-[40px] border border-white/10 text-center space-y-4 relative overflow-hidden group">
                                <Heart className="absolute -bottom-6 -right-6 size-32 text-white/5 group-hover:scale-125 transition-transform duration-1000" />
                                <div className="text-4xl font-black italic tracking-tighter">LVL 42</div>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Your Couple Synergy</p>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mt-6">
                                    <div className="h-full bg-primary w-[70%] shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN: GAME TEMPLATES */}
                    <div className="lg:col-span-2 space-y-10">
                        <section>
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8">Choose Your Arena</h2>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {processedTemplates.map((template) => (
                                    <motion.div
                                        key={template.type}
                                        whileHover={{ y: -5 }}
                                        className="relative group p-8 rounded-[40px] bg-white/[0.03] border border-white/10 hover:border-primary/50 transition-all overflow-hidden cursor-pointer"
                                        onClick={() => handleStartGame(template.type)}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="relative z-10 flex flex-col h-full space-y-6">
                                            <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                                                <Gamepad2 className="size-8 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-3xl font-black italic tracking-tighter uppercase mb-2">{template.name}</h3>
                                                <p className="text-xs text-white/40 font-bold leading-relaxed">{template.description}</p>
                                            </div>
                                            <div className="mt-auto flex items-center justify-between pt-6 border-t border-white/5">
                                                <div className="flex items-center gap-2">
                                                    <Users className="size-3 text-primary" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">2 PLAYERS</span>
                                                </div>
                                                <div className="px-5 py-2 rounded-full bg-white/5 text-[9px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                    Start Match <Sparkles className="size-3 text-amber-400" />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Recent History */}
                        {gameHistory?.length > 0 && (
                            <section>
                                <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8 flex items-center gap-2">
                                    <History className="size-4" /> Match History
                                </h2>
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {gameHistory.slice(0, 6).map((session) => (
                                        <div key={session._id} className="p-5 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-4">
                                            <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Trophy className={`size-5 ${session.score >= 50 ? "text-yellow-400" : "text-white/20"}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-[10px] font-black uppercase italic truncate">{session.gameType.split('_').join(' ')}</h4>
                                                <p className="text-[11px] font-bold text-primary">{session.score}% SYNC</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
        </div>
    );
};

export default GameDashboard;
