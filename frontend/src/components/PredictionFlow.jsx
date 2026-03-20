import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, Wallet, ArrowUpRight, CheckCircle2, 
    Loader2, ShieldCheck, ArrowLeft, 
    TrendingUp, Radio, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getWalletBalance, submitIplPrediction } from '../lib/api';

const PredictionFlow = ({ match, onBack }) => {
    const [side, setSide] = useState('yes'); // 'yes' or 'no'
    const [stake, setStake] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [balance, setBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const data = await getWalletBalance();
                setBalance(data.totalBalance || 0);
            } catch (error) {
                console.error("Balance fetch failed", error);
            } finally {
                setLoadingBalance(false);
            }
        };
        fetchBalance();
    }, []);

    const payout = (stake * (side === 'yes' ? 1.85 : 2.10)).toFixed(2);

    const handleTrade = async () => {
        if (stake > balance) {
            toast.error("Insufficient coins! Add balance to continue.");
            return;
        }

        setIsProcessing(true);
        try {
            await submitIplPrediction({
                matchId: match._id,
                predictionValue: `${match.team1.name} (${side.toUpperCase()})`,
                wagerAmount: Number(stake)
            });
            
            setIsProcessing(false);
            setIsConfirmed(true);
            toast.success(`Trade Executed! Opinion: ${side.toUpperCase()} @ ${side === 'yes' ? '1.85' : '2.10'}`);
            
            setTimeout(() => {
                onBack();
            }, 2500);
        } catch (error) {
            toast.error(error.response?.data?.message || "Trade failed.");
            setIsProcessing(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="w-full max-w-2xl mx-auto bg-[#12161D] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
        >
            {/* Header */}
            <div className="p-10 bg-black/40 border-b border-white/5 flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-3 text-white/40 hover:text-white transition-all group"
                >
                    <ArrowLeft className="size-5 group-hover:-translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Exit Market</span>
                </button>
                <div className="flex items-center gap-4 px-6 py-2 bg-white/5 rounded-full border border-white/5">
                    <Wallet className="size-4 text-orange-500" />
                    <span className="text-sm font-black italic">₹{balance.toLocaleString()}</span>
                </div>
            </div>

            {/* Trading Area */}
            <div className="p-10 space-y-10">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black uppercase tracking-widest text-white/20">
                            Opinion ID: {match._id.slice(-8).toUpperCase()}
                        </div>
                        <TrendingUp className="size-4 text-emerald-400 animate-pulse" />
                    </div>
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-tight italic">
                        Will {match.team1.name} win vs {match.team2.name}?
                    </h2>
                </div>

                {/* Side Selector */}
                <div className="grid grid-cols-2 gap-4 p-2 bg-black/40 rounded-[2.5rem] border border-white/5">
                    <button 
                        onClick={() => setSide('yes')}
                        className={`py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                            side === 'yes' 
                            ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                            : 'text-white/20 hover:text-white'
                        }`}
                    >
                        Yes (Buy @ ₹7.5)
                    </button>
                    <button 
                        onClick={() => setSide('no')}
                        className={`py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest transition-all ${
                            side === 'no' 
                            ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                            : 'text-white/20 hover:text-white'
                        }`}
                    >
                        No (Buy @ ₹2.5)
                    </button>
                </div>

                {/* Stake Area */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Invest Amount</span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Low Risk Area</span>
                    </div>
                    
                    <div className="relative group">
                        <span className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 text-3xl font-black font-outfit">₹</span>
                        <input 
                            type="number" 
                            value={stake}
                            onChange={(e) => setStake(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 group-hover:border-white/10 rounded-[2.5rem] py-8 pl-16 pr-8 text-5xl font-black italic focus:outline-none focus:border-orange-500/50 transition-all text-white placeholder:text-white/5"
                            placeholder="0"
                        />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                        {[10, 50, 100, 500].map(amt => (
                            <button 
                                key={amt}
                                onClick={() => setStake(amt)}
                                className={`py-4 border rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    Number(stake) === amt 
                                    ? 'bg-white text-black border-white' 
                                    : 'bg-white/5 border-white/5 text-white/40 hover:text-white'
                                }`}
                            >
                                ₹{amt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Payout Summary */}
                <div className="bg-black/40 border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Contract Potential Payout</p>
                        <p className="text-4xl font-black italic text-emerald-400 tracking-tighter italic">₹{payout}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mb-1">Return Ratio</p>
                        <p className="text-lg font-black text-white/60 italic">{side === 'yes' ? '1.85' : '2.10'}X</p>
                    </div>
                </div>

                {/* Execution Button */}
                <button 
                    onClick={handleTrade}
                    disabled={isProcessing || isConfirmed}
                    className={`w-full py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group/trade shadow-2xl
                        ${isConfirmed 
                            ? 'bg-emerald-500 text-black' 
                            : side === 'yes' 
                                ? 'bg-orange-500 text-white hover:scale-[1.02] shadow-orange-500/20' 
                                : 'bg-red-500 text-white hover:scale-[1.02] shadow-red-500/20'}
                        ${isProcessing ? 'cursor-wait opacity-80' : ''}
                    `}
                >
                    {isProcessing ? (
                        <Loader2 className="size-6 animate-spin" />
                    ) : isConfirmed ? (
                        <>
                            <CheckCircle2 className="size-6" /> TRADE ANCHORED
                        </>
                    ) : (
                        <>
                            {side === 'yes' ? 'EXECUTE YES TRADE' : 'EXECUTE NO TRADE'} <ArrowUpRight className="size-6 transition-transform group-hover/trade:translate-x-1 group-hover/trade:-translate-y-1" />
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 text-[8px] font-black text-white/10 uppercase tracking-widest">
                    <ShieldCheck className="size-3" /> Secure Settlement via H-Velocity Protocol
                </div>
            </div>
        </motion.div>
    );
};

export default PredictionFlow;
