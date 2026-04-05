import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, X, Sparkles, Send, Users, ShieldCheck, Zap } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { creatorAirdrop } from '../lib/api';
import toast from 'react-hot-toast';

const AirdropModal = ({ isOpen, onClose, eliteFans = [] }) => {
    const queryClient = useQueryClient();
    const [amountPerFan, setAmountPerFan] = useState(10);
    const [selectedFans, setSelectedFans] = useState(eliteFans.map(f => f.fanId?._id).filter(Boolean));

    const airdropMutation = useMutation({
        mutationFn: creatorAirdrop,
        onSuccess: (data) => {
            toast.success(`Succesfully sent 🪙 ${data.totalSent} to ${data.totalFans} fans! 🚀`);
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Airdrop failed")
    });

    const handleAirdrop = () => {
        if (!selectedFans.length) return toast.error("Select at least one fan");
        airdropMutation.mutate({ fanIds: selectedFans, amountPerFan });
    };

    const toggleFan = (id) => {
        setSelectedFans(prev => 
            prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
                    />
                    
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-[#0f0f12] border border-white/10 w-full max-w-lg rounded-[2.5rem] relative z-10 overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-8 text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                                <Zap className="size-24" />
                            </div>
                            <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all">
                                <X className="size-4" />
                            </button>
                            <h2 className="text-3xl font-black italic tracking-tighter mb-2">Fan Airdrop</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Reward your most loyal supporters</p>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Coin Amount */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/30 italic">Coins Per Fan</label>
                                    <span className="text-sm font-black text-amber-500">🪙 {amountPerFan}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="10" 
                                    max="500" 
                                    step="10"
                                    value={amountPerFan}
                                    onChange={(e) => setAmountPerFan(parseInt(e.target.value))}
                                    className="range range-xs range-primary"
                                />
                                <div className="flex justify-between text-[8px] font-black opacity-20 uppercase tracking-tighter">
                                    <span>10 BC</span>
                                    <span>250 BC</span>
                                    <span>500 BC</span>
                                </div>
                            </div>

                            {/* Fan Selection */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30 px-1 italic">Recipients ({selectedFans.length})</label>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {eliteFans.map((fan) => (
                                        <div 
                                            key={fan._id} 
                                            onClick={() => toggleFan(fan.fanId?._id)}
                                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${selectedFans.includes(fan.fanId?._id) ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img src={fan.fanId?.profilePic || "/avatar.png"} className="size-8 rounded-lg object-cover" alt="" />
                                                <div>
                                                    <p className="text-xs font-bold font-outfit uppercase tracking-tight">{fan.fanId?.name}</p>
                                                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Bond: {fan.bondScore}</p>
                                                </div>
                                            </div>
                                            {selectedFans.includes(fan.fanId?._id) && <ShieldCheck className="size-4 text-indigo-500" />}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Summary & Action */}
                            <div className="pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center mb-6 px-1">
                                    <div>
                                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Total Airdrop</p>
                                        <h3 className="text-2xl font-black italic tracking-tighter">🪙 {(amountPerFan * selectedFans.length).toLocaleString()}</h3>
                                    </div>
                                    <Sparkles className="size-6 text-amber-500 animate-pulse" />
                                </div>
                                <button 
                                    onClick={handleAirdrop}
                                    disabled={airdropMutation.isPending || selectedFans.length === 0}
                                    className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {airdropMutation.isPending ? <RefreshCw className="animate-spin" /> : <><Send className="size-4" /> Send Airdrop Now</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

const RefreshCw = ({ className }) => <Users className={`size-4 ${className}`} />;

export default AirdropModal;
