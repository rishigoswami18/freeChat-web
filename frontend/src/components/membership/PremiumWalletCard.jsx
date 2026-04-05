import React, { memo } from "react";
import { motion } from "framer-motion";
import { Wallet, ArrowUpRight, ArrowDownLeft, Activity, CreditCard, ChevronRight } from "lucide-react";

/**
 * PremiumWalletCard
 * A world-class financial dashboard component for creators.
 * Features glassmorphism, animated gradients, and high-precision typography.
 */
const PremiumWalletCard = ({ balance = 0, earnings = 0, currency = "INR" }) => {
    return (
        <section className="space-y-6">
            {/* Main Balance Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[32px] p-8 bg-gradient-to-br from-primary via-indigo-600 to-indigo-900 shadow-2xl shadow-primary/20"
            >
                {/* Decorative Elements */}
                <div className="absolute top-[-20%] right-[-10%] size-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-20%] left-[-10%] size-64 bg-black/20 rounded-full blur-3xl" />

                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <Wallet size={20} className="text-white" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Main Portfolio</span>
                        </div>
                        <CreditCard size={24} className="text-white/40" />
                    </div>

                    <div className="mb-8">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-1">Total Available Balance</p>
                        <h2 className="text-5xl font-black text-white tracking-tighter">
                            <span className="text-2xl text-white/40 font-medium mr-2">₹</span>
                            {(balance / 10).toLocaleString()}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="flex items-center justify-center gap-2 h-12 bg-white text-primary rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/90 transition-all active:scale-95 shadow-lg shadow-black/20">
                            <ArrowUpRight size={16} />
                            Withdraw
                        </button>
                        <button className="flex items-center justify-center gap-2 h-12 bg-white/10 backdrop-blur-md text-white rounded-2xl text-xs font-black uppercase tracking-widest border border-white/20 hover:bg-white/20 transition-all active:scale-95">
                            <ArrowDownLeft size={16} />
                            Deposit
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-3xl bg-[#0f172a]/40 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="size-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Activity size={14} className="text-emerald-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Yield Performance</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">
                        <span className="text-sm text-emerald-500 mr-1">+</span>
                        ₹{(earnings / 10).toLocaleString()}
                    </p>
                </div>

                <div className="p-6 rounded-3xl bg-[#0f172a]/40 border border-white/5 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="size-6 rounded-lg bg-primary/20 flex items-center justify-center">
                            <ArrowUpRight size={14} className="text-primary" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-black text-white tracking-tight">
                        ₹{((balance + earnings) / 10).toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Quick Actions / Navigation */}
            <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                            <Activity size={20} />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-black text-white">Transaction History</p>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">View all ledger entries</p>
                        </div>
                    </div>
                    <ChevronRight size={18} className="text-white/20 group-hover:text-primary transition-colors" />
                </button>
            </div>
        </section>
    );
};

export default memo(PremiumWalletCard);
