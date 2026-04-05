import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Target, Clock, Coins, ShieldCheck, 
    ArrowRight, Sparkles, Zap, DollarSign,
    Calendar, CheckCircle2, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

const CreateGoal = ({ wallet, onCreated }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "learning",
        durationDays: 30,
        stakeAmountUnits: 50000,
        evidenceType: "any",
        completionThreshold: 0.8,
        minDailyFocusMinutes: 30,
        isPublic: true
    });

    const categories = ["health", "learning", "finance", "productivity", "other"];
    const durations = [7, 14, 21, 30, 60, 90];
    const stakes = [₹100, ₹200, ₹500, ₹1000, ₹2000, ₹5000];

    // Helper for INR presets
    const stakePresets = ["100", "200", "500", "1000", "2000", "5000"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title) return toast.error("Title protocol missing");
        if (formData.stakeAmountUnits > wallet.balance) return toast.error("Insufficient Action Credits");
        
        setLoading(true);
        try {
            await axios.post("/api/goals", formData);
            toast.success("Signal Established in the Forge");
            onCreated();
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Forge Sync Error");
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
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Forge Signal</span>
                </div>
                <h1 className="text-4xl font-black tracking-tighter italic uppercase">New Objective</h1>
                <p className="text-[10px] font-black uppercase text-white/30 tracking-widest pl-1">Establish your high-status path</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">
                {/* Title */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Objective Identity</label>
                    <input 
                        type="text" 
                        required
                        placeholder="e.g. Master React Core Architect"
                        className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl px-6 font-black italic tracking-tight uppercase shadow-inner focus:border-primary/50 outline-none transition-all"
                        value={formData.title}
                        onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                    />
                </div>

                {/* Category */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Context</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {categories.map(c => (
                            <button 
                                key={c}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, category: c }))}
                                className={`px-5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    formData.category === c ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40'
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Temporal Guard (Days)</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {durations.map(d => (
                            <button 
                                key={d}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, durationDays: d }))}
                                className={`px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                                    formData.durationDays === d ? 'bg-primary border-primary text-white' : 'bg-white/5 border-white/5 text-white/40'
                                }`}
                            >
                                {d}d
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stake */}
                <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Signal Stake (Units)</label>
                    <div className="grid grid-cols-3 gap-2">
                        {stakePresets.map(p => (
                            <button 
                                key={p}
                                type="button"
                                onClick={() => setFormData(p_ => ({ ...p_, stakeAmountUnits: parseInt(p) * 100 }))}
                                className={`px-4 py-4 rounded-2xl border text-xs font-black italic tracking-tighter transition-all ${
                                    formData.stakeAmountUnits === parseInt(p) * 100 ? 'bg-primary border-primary text-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40'
                                }`}
                            >
                                ₹{p}
                            </button>
                        ))}
                    </div>
                    <div className="relative">
                        <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" />
                        <input 
                            type="number" 
                            className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl pl-12 pr-6 font-black italic tracking-tight shadow-inner"
                            placeholder="Custom Amount"
                            value={formData.stakeAmountUnits / 100 === 0 ? '' : formData.stakeAmountUnits / 100}
                            onChange={(e) => setFormData(p => ({ ...p, stakeAmountUnits: parseInt(e.target.value) * 100 || 0 }))}
                        />
                    </div>
                    <div className="flex items-center gap-2 px-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Available Credits:</span>
                        <span className="text-[10px] font-black text-primary uppercase italic tracking-tighter">₹{wallet.balance / 100}</span>
                    </div>
                </div>

                {/* Evidence Select */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Validation Evidence</label>
                    <select 
                        className="w-full h-16 bg-white/[0.02] border border-white/5 rounded-2xl px-6 font-black uppercase text-xs tracking-widest outline-none"
                        value={formData.evidenceType}
                        onChange={(e) => setFormData(p => ({ ...p, evidenceType: e.target.value }))}
                    >
                        <option value="any">Auto + Multi-Mode</option>
                        <option value="photo">Visual Proof (Photo)</option>
                        <option value="link">Public Repository (Link)</option>
                        <option value="text">Execution Log (Text)</option>
                    </select>
                </div>

                {/* Completion Threshold */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end mb-2">
                        <label className="text-[10px] font-black uppercase text-white/20 tracking-widest ml-1">Fidelity Threshold</label>
                        <span className="text-[10px] font-black text-primary italic tracking-tighter">{formData.completionThreshold * 100}%</span>
                    </div>
                    <input 
                        type="range" 
                        min="50" max="100" step="5"
                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                        value={formData.completionThreshold * 100}
                        onChange={(e) => setFormData(p => ({ ...p, completionThreshold: parseInt(e.target.value) / 100 }))}
                    />
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl">
                        <p className="text-[9px] font-black text-primary/80 uppercase tracking-widest leading-relaxed">
                            You must submit {Math.ceil(formData.durationDays * formData.completionThreshold)} of {formData.durationDays} days to pass and reclaim your stake + reward.
                        </p>
                    </div>
                </div>

                {/* Summary / Submit */}
                <div className="pt-6 space-y-6">
                    <div className="p-8 rounded-[3rem] bg-white/[0.02] border border-white/5 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Stake (Lock)</span>
                            <span className="text-xl font-black italic tracking-tighter">₹{formData.stakeAmountUnits / 100}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-widest">Reward (Projected)</span>
                            <span className="text-xl font-black italic tracking-tighter text-emerald-400">+₹{(formData.stakeAmountUnits * 0.1) / 100}</span>
                        </div>
                        <div className="h-px bg-white/5" />
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-primary tracking-widest">Liquidation Risk</span>
                            <span className="text-xl font-black italic tracking-tighter text-rose-500">-₹{formData.stakeAmountUnits / 100}</span>
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
                                <Target size={24} strokeWidth={4} />
                                <span className="text-xl font-black italic uppercase tracking-tighter">Initialize Protocol</span>
                                <ArrowRight size={24} strokeWidth={4} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="bg-noise" />
        </div>
    );
};

export default CreateGoal;
