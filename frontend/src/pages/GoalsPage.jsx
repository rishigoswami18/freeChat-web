import { useState, memo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createGoal, getUserGoals } from "../lib/api";
import { 
    Target, 
    Plus, 
    Calendar, 
    DollarSign, 
    Clock, 
    CheckCircle2, 
    TrendingUp, 
    ShieldCheck,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const GoalCard = memo(({ goal }) => {
    const daysRemaining = Math.max(0, Math.ceil((new Date(goal.endDate) - new Date()) / (1000 * 60 * 60 * 24)));
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="nexus-card p-6 relative overflow-hidden group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                    <Target size={24} />
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                    <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">{goal.status}</span>
                </div>
            </div>

            <h3 className="text-xl font-black italic tracking-tight mb-2 uppercase">{goal.title}</h3>
            <p className="text-sm font-medium text-white/40 mb-6 line-clamp-2">{goal.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-wider mb-1">Stake</p>
                    <div className="flex items-center gap-1.5">
                        <DollarSign size={14} className="text-primary" />
                        <span className="text-lg font-black">{goal.stakeAmount}</span>
                    </div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black uppercase text-white/20 tracking-wider mb-1">Time Left</p>
                    <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-primary" />
                        <span className="text-lg font-black">{daysRemaining}d</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-white/40">Execution Progress</span>
                    <span className="text-primary">{goal.progress}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progress}%` }}
                        className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                    />
                </div>
            </div>
        </motion.div>
    );
});

const GoalsPage = () => {
    const queryClient = useQueryClient();
    const [isForgeOpen, setIsForgeOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        durationDays: 7,
        stakeAmount: 0
    });

    const { data: goals = [], isLoading } = useQuery({
        queryKey: ["goals"],
        queryFn: getUserGoals
    });

    const { mutate: createMutation, isPending } = useMutation({
        mutationFn: createGoal,
        onSuccess: () => {
            toast.success("Signal Established in the Forge");
            setIsForgeOpen(false);
            setFormData({ title: "", description: "", durationDays: 7, stakeAmount: 0 });
            queryClient.invalidateQueries({ queryKey: ["goals"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Sync Failed");
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title || !formData.description) return toast.error("Protocols Incomplete");
        createMutation(formData);
    };

    return (
        <div className="min-h-screen pb-24 bg-base-100 text-base-content relative overflow-x-hidden">
            {/* Header */}
            <div className="sticky top-0 z-30 bg-base-100/60 backdrop-blur-3xl border-b border-white/5 px-6 py-12">
                <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="h-px w-8 bg-primary/40" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Execution Grid</span>
                        </div>
                        <h1 className="text-5xl sm:text-6xl font-black tracking-tighter italic uppercase">
                            Action Hub <TrendingUp className="inline size-8 text-white/10" />
                        </h1>
                    </div>

                    <button 
                        onClick={() => setIsForgeOpen(true)}
                        className="nexus-button-primary h-16 px-10 flex items-center gap-3 shadow-2xl shadow-primary/30"
                    >
                        <Plus size={20} strokeWidth={3} /> Establish Goal
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 mt-12">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-[2rem]" />
                        ))}
                    </div>
                ) : goals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {goals.map(goal => (
                            <GoalCard key={goal._id} goal={goal} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-20 space-y-6">
                        <Target size={80} strokeWidth={1} />
                        <div className="text-center">
                            <p className="text-2xl font-black italic uppercase tracking-tighter">No Active Signals</p>
                            <p className="text-xs font-bold uppercase tracking-widest mt-1">The Forge is silent. Forge your path.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal: Forge Goal */}
            <AnimatePresence>
                {isForgeOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsForgeOpen(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-xl nexus-surface rounded-[3rem] p-10 overflow-hidden"
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-primary text-white">
                                    <Target size={24} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Forge Signal</h2>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Action Protocol Setup</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Goal Identity</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. Master Deep Learning in 14 days"
                                        className="w-full nexus-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Protocol Details</label>
                                    <textarea 
                                        placeholder="Define your success conditions..."
                                        className="w-full nexus-input min-h-[120px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Duration (Days)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary" />
                                            <input 
                                                type="number" 
                                                className="w-full nexus-input pl-12"
                                                value={formData.durationDays}
                                                onChange={(e) => setFormData(prev => ({ ...prev, durationDays: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Stake (Coins)</label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-primary" />
                                            <input 
                                                type="number" 
                                                className="w-full nexus-input pl-12"
                                                value={formData.stakeAmount}
                                                onChange={(e) => setFormData(prev => ({ ...prev, stakeAmount: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                                    <AlertCircle className="size-5 text-primary shrink-0 mt-0.5" />
                                    <p className="text-[10px] font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                                        The stake will be locked in the Forge. Succeed to reclaim with interest. Fail, and the signal is lost.
                                    </p>
                                </div>

                                <button 
                                    className="nexus-button-primary w-full h-[64px] shadow-2xl shadow-primary/30 disabled:opacity-50"
                                    disabled={isPending}
                                >
                                    {isPending ? "Syncing Forge..." : "Initialize Signal"}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-noise" />
        </div>
    );
};

export default memo(GoalsPage);
