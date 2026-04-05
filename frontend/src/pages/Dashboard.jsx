import { memo } from "react";
import { Link } from "react-router-dom";
import { 
    Coins, Target, TrendingUp, ShieldCheck, 
    ArrowRight, Clock, Zap, AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

const GoalCard = memo(({ goal }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 relative group overflow-hidden transition-all duration-500 hover:bg-white/[0.04]"
        >
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                        <Target size={24} strokeWidth={3} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black italic tracking-tighter uppercase truncate max-w-[160px]">{goal.title}</h3>
                        <p className="text-[10px] font-black uppercase text-white/20 tracking-widest">{goal.category}</p>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                    goal.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/40'
                }`}>
                    {goal.status}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/20 tracking-wider mb-1">
                        <Coins size={12} className="text-primary" /> Stake
                    </div>
                    <span className="text-xl font-black italic tracking-tighter">₹{goal.stakeAmountUnits / 100}</span>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/20 tracking-wider mb-1">
                        <Zap size={12} className="text-primary" /> Streak
                    </div>
                    <span className="text-xl font-black italic tracking-tighter">{goal.currentStreak} <span className="text-[10px]">DAYS</span></span>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.2em]">Execution Progress</span>
                    <span className="text-xs font-black italic text-primary">{goal.progressPct}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${goal.progressPct}%` }}
                        className="h-full bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)] transition-all"
                    />
                </div>
            </div>

            <Link to={`/goals/${goal._id}`} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-primary">
                <ArrowRight size={20} strokeWidth={4} />
            </Link>
        </motion.div>
    );
});

const Dashboard = ({ wallet, goals, queueLength }) => {
    return (
        <div className="p-6 space-y-8 pb-20">
            {/* Wallet Overview */}
            <section className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 p-8 text-primary/10 -rotate-12 scale-150 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-1000">
                    <ShieldCheck size={160} />
                </div>
                <div className="relative z-10 space-y-4">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={16} className="text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Action Credits (BC)</span>
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-7xl font-black italic tracking-tighter flex items-start gap-1">
                            <span className="text-2xl mt-2 tracking-normal uppercase">₹</span>
                            {(wallet.balance / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                        </h2>
                        <p className="text-[11px] font-bold text-white/30 uppercase tracking-widest pl-1">Unlocked Liquid Assets</p>
                    </div>
                    
                    <div className="pt-6 flex gap-4">
                        <div className="flex-1 p-4 bg-white/5 flex flex-col gap-1 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Total Staked</span>
                            <span className="text-lg font-black italic tracking-tighter">₹{wallet.staked / 100}</span>
                        </div>
                        <div className="flex-1 p-4 bg-white/5 flex flex-col gap-1 backdrop-blur-xl border border-white/10 rounded-2xl">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Goals Active</span>
                            <span className="text-lg font-black italic tracking-tighter">{goals.length}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Validation Nudge */}
            {queueLength > 0 && (
                <Link to="/validate" className="flex items-center justify-between p-6 bg-primary/10 border border-primary/40 rounded-[2.5rem] group hover:bg-primary/20 transition-all border-l-4">
                    <div className="flex items-center gap-4">
                        <div className="size-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/20 group-hover:animate-bounce">
                            <ShieldCheck size={20} strokeWidth={3} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase italic tracking-tighter">Audit Required</p>
                            <p className="text-[9px] font-bold uppercase text-white/40 tracking-widest">{queueLength} signals pending validation</p>
                        </div>
                    </div>
                    <ArrowRight size={20} strokeWidth={4} className="text-primary" />
                </Link>
            )}

            {/* Goals List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Active Signals</h2>
                    <Link to="/new" className="text-[10px] font-black uppercase text-primary tracking-widest">Forge Path</Link>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                    {goals.length > 0 ? (
                        goals.map(goal => (
                            <GoalCard key={goal._id} goal={goal} />
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center opacity-20 space-y-4">
                            <Target size={64} strokeWidth={1} />
                            <p className="text-sm font-black uppercase tracking-[0.28em] italic">The Void is Static</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-0 opacity-[0.015] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        </div>
    );
};

export default Dashboard;
