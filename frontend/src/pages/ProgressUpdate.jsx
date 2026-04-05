import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Target, Clock, Coins, ShieldCheck, 
    ArrowRight, Sparkles, Zap, DollarSign,
    Calendar, CheckCircle2, ChevronDown,
    Image, Link as LinkIcon, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const ProgressCard = memo(({ goal, active, onClick }) => {
    return (
        <button 
            type="button"
            onClick={onClick}
            className={`w-full p-4 rounded-2xl border transition-all duration-500 flex items-center justify-between gap-4 ${
                active ? 'bg-primary/20 border-primary shadow-xl shadow-primary/20' : 'bg-white/5 border-white/5 opacity-40 hover:opacity-100 hover:bg-white/10'
            }`}
        >
            <div className="flex items-center gap-4">
                <div className={`size-10 rounded-xl flex items-center justify-center transition-colors ${active ? 'bg-primary text-white' : 'bg-white/10 text-white/40'}`}>
                    <Target size={20} strokeWidth={3} />
                </div>
                <div className="text-left">
                    <h3 className="text-xs font-black uppercase italic tracking-tighter truncate max-w-[140px]">{goal.title}</h3>
                    <p className="text-[8px] font-black uppercase text-white/20 tracking-widest">Day {goal.completedDays + goal.missedDays + 1} • {goal.currentStreak}d Streak</p>
                </div>
            </div>
            {active && <CheckCircle2 size={20} className="text-primary" />}
        </button>
    );
});

const ProgressUpdate = ({ goals, onSubmitted }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState(goals[0]?._id || "");
    const [formData, setFormData] = useState({
        note: "",
        evidenceText: "",
        evidenceLink: "",
        evidenceImageKey: ""
    });

    const activeGoals = goals.filter(g => g.status === 'active');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedGoalId) return toast.error("Select objective protocol");
        if (!formData.note) return toast.error("System note required");
        
        setLoading(true);
        try {
            await axios.post("/api/progress", { ...formData, goalId: selectedGoalId });
            toast.success("Signal Submitted for Peer Validation");
            onSubmitted();
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Signal Frequency Interference");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-10 pb-20">
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-3 mb-1">
                    <div className="h-px w-8 bg-primary/40" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Protocol Check-in</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">Execution Log</h1>
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Submit your proof of progress</p>
            </div>

            {activeGoals.length > 0 ? (
                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Goal Selector */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Active Objective</label>
                        <div className="grid grid-cols-1 gap-2">
                            {activeGoals.map(g => (
                                <ProgressCard 
                                    key={g._id} 
                                    goal={g} 
                                    active={selectedGoalId === g._id} 
                                    onClick={() => setSelectedGoalId(g._id)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Note */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Execution Note</label>
                        <textarea 
                            required
                            placeholder="What did you execute today?"
                            className="w-full h-32 bg-white/[0.02] border border-white/5 rounded-2xl p-6 font-medium text-sm focus:border-primary/50 outline-none"
                            value={formData.note}
                            onChange={(e) => setFormData(p => ({ ...p, note: e.target.value }))}
                        />
                    </div>

                    {/* Evidence Link */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Validation Signal (Link)</label>
                        <div className="relative">
                            <LinkIcon size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" />
                            <input 
                                type="url" 
                                placeholder="Public Repository or Social Post"
                                className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl pl-14 pr-6 text-sm"
                                value={formData.evidenceLink}
                                onChange={(e) => setFormData(p => ({ ...p, evidenceLink: e.target.value }))}
                            />
                        </div>
                    </div>

                    {/* Peer Audit Info */}
                    <div className="p-8 rounded-[2.5rem] bg-primary/10 border border-primary/20 flex gap-4">
                        <ShieldCheck size={28} className="text-primary shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase italic tracking-tighter">Peer Validation Active</p>
                            <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest leading-relaxed mt-1">
                                This signal will be sent to 3 independent validators. Approvals contribute to your streak and eventual stake redemption.
                            </p>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full h-20 nexus-button-primary shadow-2xl shadow-primary/40 disabled:opacity-50 group flex items-center justify-center gap-4"
                    >
                        {loading ? (
                            <span className="loading loading-spinner" />
                        ) : (
                            <>
                                <Sparkles size={24} strokeWidth={4} />
                                <span className="text-xl font-black italic uppercase tracking-tighter">Submit Signal</span>
                                <ArrowRight size={24} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>
            ) : (
                <div className="py-20 flex flex-col items-center justify-center opacity-20 space-y-4">
                    <Target size={64} strokeWidth={1} />
                    <p className="text-sm font-black uppercase tracking-[0.28em] italic">No Active Signals to Check-in</p>
                </div>
            )}

            <div className="bg-noise" />
        </div>
    );
};

import { memo } from "react";
export default ProgressUpdate;
