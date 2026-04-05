import { useState } from "react";
import { 
    ShieldCheck, Target, Clock, ArrowRight,
    Check, X, AlertOctagon, User, Info,
    Zap, Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const ValidationCard = memo(({ item, onVote }) => {
    const timeAgo = Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60)) + "m";
    const [voting, setVoting] = useState(null);

    const handleVote = async (decision) => {
        setVoting(decision);
        try {
            await axios.post(`/api/progress/${item._id}/validate`, { decision });
            toast.success(decision === 'approve' ? "Approving Signal..." : "Rejecting Signal...");
            onVote(item._id);
        } catch (err) {
            toast.error(err.response?.data?.message || "Audit Sync Error");
            setVoting(null);
        }
    };

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group shadow-2xl"
        >
            <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-2xl bg-white/5 flex items-center justify-center text-white/40">
                        <User size={20} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase italic tracking-tighter">{item.userId?.fullName}</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-primary">Validator Audit • {timeAgo} ago</p>
                    </div>
                </div>
                {item.totalFocusMinutes > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <Zap size={12} className="text-emerald-400" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">{item.totalFocusMinutes}m Focus</span>
                    </div>
                )}
            </div>

            <div className="space-y-6 mb-10">
                <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-white/20 tracking-[0.3em]">Objective Protocol</span>
                    <h2 className="text-xl font-black italic tracking-tighter uppercase truncate">{item.goalId?.title}</h2>
                </div>

                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl relative">
                    <div className="absolute -top-3 left-6 px-3 py-1 bg-white/5 border border-white/5 rounded-lg">
                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Day {item.dayNumber} Execution Log</span>
                    </div>
                    <p className="text-xs font-bold text-white/60 leading-relaxed italic tracking-tight">"{item.note}"</p>
                </div>

                {item.evidenceLink && (
                    <a 
                        href={item.evidenceLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest group-hover:underline"
                    >
                        <Info size={14} /> View Evidence Signal
                    </a>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button 
                    onClick={() => handleVote('reject')}
                    disabled={voting}
                    className={`h-14 rounded-2xl border flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest ${
                        voting === 'reject' ? 'bg-rose-500 border-rose-500 text-white' : 'border-rose-500/30 text-rose-500 hover:bg-rose-500/10 active:bg-rose-500/20'
                    }`}
                >
                    {voting === 'reject' ? <span className="loading loading-spinner loading-xs" /> : <><X size={16} strokeWidth={4} /> Reject Signal</>}
                </button>
                <button 
                    onClick={() => handleVote('approve')}
                    disabled={voting}
                    className={`h-14 rounded-2xl flex items-center justify-center gap-2 transition-all font-black uppercase text-[10px] tracking-widest ${
                        voting === 'approve' ? 'bg-emerald-500 text-white shadow-xl shadow-emerald-500/20 animate-pulse' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {voting === 'approve' ? <span className="loading loading-spinner loading-xs" /> : <><Check size={16} strokeWidth={4} /> Approve Signal</>}
                </button>
            </div>
        </motion.div>
    );
});

const ValidationQueue = ({ queue, onValidated }) => {
    return (
        <div className="p-6 space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-8 bg-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Audit Grid</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Validators Pulse</h1>
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Earn rewards by auditing peer progress</p>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Queue Activity</h2>
                    <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-full">
                        <Activity size={14} className="text-primary" />
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">{queue.length} Signals Pending</span>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 gap-8">
                    <AnimatePresence mode="popLayout">
                        {queue.length > 0 ? (
                            queue.map(item => (
                                <ValidationCard key={item._id} item={item} onVote={onValidated} />
                            ))
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="py-32 flex flex-col items-center justify-center opacity-20 space-y-6"
                            >
                                <ShieldCheck size={80} strokeWidth={1} />
                                <div className="text-center">
                                    <p className="text-2xl font-black italic uppercase tracking-tighter">All Signals Audited</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest mt-1">Protocols perfectly-synced. Rest for the next shift.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Reward Box */}
            <div className="p-8 rounded-[3rem] bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                <Coins size={28} className="text-indigo-400 shrink-0" />
                <div>
                    <p className="text-[10px] font-black uppercase italic tracking-tighter text-indigo-300">Validator Incentives</p>
                    <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest leading-relaxed mt-1">
                        Earn ₹0.10 for every consensus agreement. Penalties of ₹0.05 apply for outlier audit signals. Perfectly-synced audits earn higher trust scores.
                    </p>
                </div>
            </div>

            <div className="bg-noise" />
        </div>
    );
};

import { memo } from "react";
export default ValidationQueue;
