import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Copy, Check, Ticket, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const PrizeVaultPage = () => {
    const [copiedId, setCopiedId] = useState(null);

    const { data: prizes, isLoading } = useQuery({
        queryKey: ["prizeVault"],
        queryFn: async () => {
            const res = await axiosInstance.get("/api/users/prizes");
            return res.data;
        }
    });

    const handleCopy = (code, id) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        toast.success("Code Captured! 🎁");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16 border-b border-white/5 pb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-500 rounded-xl">
                                <ShieldCheck className="size-5 text-white" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Secure Vault</span>
                        </div>
                        <h1 className="text-6xl font-black italic tracking-tighter">Your Wins</h1>
                    </div>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex items-center gap-6">
                        <div className="size-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-12">
                            <Zap className="size-6 text-black fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Value Won</p>
                            <p className="text-2xl font-black italic text-amber-500">₹12,450</p>
                        </div>
                    </div>
                </div>

                {/* Prize Grid */}
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-48 bg-white/5 rounded-[40px] animate-pulse" />
                        ))}
                    </div>
                ) : prizes?.length === 0 ? (
                    <div className="text-center py-32 bg-white/5 rounded-[50px] border border-dashed border-white/10">
                        <Ticket className="size-20 text-white/10 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold opacity-30 italic">No Prizes Captured Yet.</h3>
                        <p className="text-white/20 mt-2 font-medium">Dominate the match analytics to unlock the vault.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {prizes?.map((prize) => (
                            <motion.div 
                                key={prize._id}
                                layoutId={prize._id}
                                className={`bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-[40px] p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-colors ${prize.isRedeemed ? 'opacity-50 grayscale' : ''}`}
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 -rotate-12">
                                    <Gift className="size-40" />
                                </div>

                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{prize.prizeType}</p>
                                            <h3 className="text-2xl font-black italic leading-none">{prize.prizeName}</h3>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black italic">{prize.prizeValue}</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button 
                                            onClick={() => handleCopy(prize.redemptionCode, prize._id)}
                                            className="flex-1 bg-white/5 border border-white/10 h-14 rounded-2xl flex items-center justify-between px-6 hover:bg-white/10 transition-colors group/btn"
                                        >
                                            <span className="font-mono font-black tracking-widest opacity-40">{prize.redemptionCode}</span>
                                            {copiedId === prize._id ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4 opacity-20 group-hover/btn:opacity-100 transition-opacity" />}
                                        </button>
                                        <button className="h-14 aspect-square bg-indigo-600 rounded-2xl flex items-center justify-center hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/30">
                                            <ChevronRight className="size-6" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrizeVaultPage;
