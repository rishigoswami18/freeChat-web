import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, Trophy, DollarSign, ArrowRight, Play, 
    ShieldCheck, Sparkles, TrendingUp, History,
    CreditCard, Gem, Star, Coins, Users
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { createGemOrder, verifyGemPayment, claimDailyReward, getRazorpayKey } from "../lib/api";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

const COIN_PACKS = [
  { id: "starter_low", name: "Rookie Trial", coins: 200, price: 9, icon: Zap, color: "orange", trial: true },
  { id: "starter_mid", name: "Elite Trial", coins: 500, price: 19, icon: Sparkles, color: "blue", trial: true },
  { id: "starter", name: "Pro Pack", coins: 2500, price: 99, icon: ShieldCheck, color: "amber" },
  { id: "legend", name: "Master Chest", coins: 15000, price: 499, icon: Trophy, color: "purple" },
];

const EarningsWallet = () => {
    const { authUser } = useAuthUser();
    const [loadingPack, setLoadingPack] = useState(null);
    const [showAd, setShowAd] = useState(false);
    const [adTimer, setAdTimer] = useState(0);

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePurchase = async (pack) => {
        setLoadingPack(pack.id);
        const res = await loadRazorpay();

        if (!res) {
            toast.error("Razorpay SDK failed to load. Check your internet.");
            setLoadingPack(null);
            return;
        }

        try {
            const orderRes = await createGemOrder(pack.price, pack.id);
            const keyRes = await getRazorpayKey();

            const options = {
                key: keyRes.key,
                amount: orderRes.order.amount,
                currency: orderRes.order.currency,
                name: "Zyro",
                description: `Purchase ${pack.name} (Skill Analysis & Community Access)`,
                order_id: orderRes.order.id,
                handler: async (response) => {
                    try {
                        await verifyGemPayment({ ...response, gemAmount: pack.coins });
                        confetti({
                            particleCount: 150,
                            spread: 70,
                            origin: { y: 0.6 },
                            colors: ['#F59E0B', '#fbbf24', '#ffffff']
                        });
                        toast.success(`Succesfully added ${pack.coins} Coins! 🪙`);
                    } catch (err) {
                        toast.error("Verification failed!");
                    }
                },
                prefill: {
                    name: authUser?.fullName,
                    email: authUser?.email,
                },
                theme: { color: "#F59E0B" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Failed to create order");
        } finally {
            setLoadingPack(null);
        }
    };

    const startAd = () => {
        setShowAd(true);
        setAdTimer(5);
        const interval = setInterval(() => {
            setAdTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const claimBonus = async () => {
        try {
            await claimDailyReward();
            toast.success("Daily 10 Coins Claimed! ⚡");
            setShowAd(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Already claimed!");
        }
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white font-outfit pb-32">
            {/* Header / Wallet Card */}
            <div className="relative h-80 flex flex-col items-center justify-center px-6 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-600/20 to-transparent pointer-events-none" />
                
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 p-6 opacity-10">
                        <Gem className="size-24 text-amber-500" />
                    </div>
                    
                    <div className="space-y-6 relative z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em]">Vault Balance</p>
                                    <div className="px-2 py-0.5 bg-indigo-500 rounded-full text-[7px] font-black text-white uppercase">{authUser?.wallet?.tier || 'Bronze'}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-5xl font-black italic tracking-tighter">{(authUser?.wallet?.totalBalance || 0).toLocaleString()}</h1>
                                    <div className="size-8 rounded-full bg-amber-500 flex items-center justify-center text-black">
                                        <Coins className="size-5" />
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => window.location.href = "/redeem-cash"}
                                className="px-6 py-2 bg-emerald-500 text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                Redeem Cash
                            </button>
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-[8px] font-black text-emerald-400 uppercase mb-1">Withdrawable</p>
                                <p className="text-xl font-black tracking-tighter">🪙 {(authUser?.wallet?.winnings || 0).toLocaleString()}</p>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                                <p className="text-[8px] font-black text-white/30 uppercase mb-1">Bonus Credit</p>
                                <p className="text-xl font-black tracking-tighter">🪙 {(authUser?.wallet?.bonusBalance || 0).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Shop Section */}
            <main className="px-6 space-y-12">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black italic">Coin Emporium</h2>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Unlocking Community Access & Analytics</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">100% Secure Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {COIN_PACKS.map((pack) => {
                        const Icon = pack.icon;
                        return (
                            <motion.div
                                key={pack.id}
                                whileHover={{ y: -5 }}
                                className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col justify-between h-80 relative overflow-hidden group"
                            >
                                {pack.trial && (
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="px-2 py-0.5 bg-indigo-500 text-white text-[8px] font-black rounded-full uppercase tracking-tighter shadow-lg shadow-indigo-500/40">Limited Offer</span>
                                    </div>
                                )}
                                <div className={`absolute -top-10 -right-10 size-32 bg-${pack.color}-500/10 blur-3xl group-hover:bg-${pack.color}-500/20 transition-all`} />
                                
                                <div className="space-y-4">
                                    <div className={`size-12 rounded-2xl bg-${pack.color}-500/20 flex items-center justify-center text-${pack.color}-500`}>
                                        <Icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black italic">{pack.name}</h3>
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-black text-amber-500">🪙 {pack.coins.toLocaleString()}</p>
                                            {pack.trial && <p className="text-[10px] line-through text-white/20">₹49</p>}
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handlePurchase(pack)}
                                    disabled={loadingPack === pack.id}
                                    className="w-full h-14 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {loadingPack === pack.id ? "Processing..." : `Buy for ₹${pack.price}`}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Referral Section (Billionaire Edge) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-black border border-white/5 rounded-[40px] p-10 flex flex-col justify-between relative overflow-hidden group min-h-[300px]">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-all scale-150 rotate-12">
                            <Users className="size-48" />
                        </div>
                        <div className="space-y-4 relative z-10">
                            <h3 className="text-4xl font-black italic tracking-tighter">Chain Reaction Referral 🔗</h3>
                            <p className="text-sm font-bold text-white/40 max-w-md leading-relaxed">
                                Share the code and earn passive income. When your friend buys their first pack, <span className="text-indigo-400">you get 20% of their coins</span> as an instant royalty bonus.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                            <div className="w-full sm:w-auto px-8 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-black italic text-indigo-400 tracking-widest uppercase">
                                BOND-{authUser?._id.toString().slice(-6).toUpperCase()}
                            </div>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(`JOIN ZYRO: Use code BOND-${authUser?._id.toString().slice(-6).toUpperCase()} for extra 500 coins!`);
                                    toast.success("Referral link copied! 🚀");
                                }}
                                className="w-full sm:w-auto px-10 h-14 bg-indigo-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                            >
                                Copy Link <ArrowRight className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 flex flex-col justify-between">
                        <div className="space-y-2">
                            <h4 className="text-xl font-black italic">Recent Activity</h4>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Trust & Transparency</p>
                        </div>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-500 text-[10px] font-black">
                                            {i}
                                        </div>
                                        <p className="text-[10px] font-black italic">Pack Verified</p>
                                    </div>
                                    <ShieldCheck className="size-4 text-emerald-500" />
                                </div>
                            ))}
                        </div>
                        <p className="text-[9px] font-bold text-center text-white/20 italic">Payments secured by Razorpay Standard Checkout</p>
                    </div>
                </div>

                {/* Match Pass / Subscription Card */}
                <div className="bg-gradient-to-r from-orange-600 to-amber-600 rounded-[40px] p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                        <Trophy className="size-48" />
                    </div>
                    
                    <div className="space-y-4 relative z-10 text-center md:text-left">
                        <div className="px-3 py-1 bg-black/20 backdrop-blur-xl rounded-full text-[9px] font-black tracking-widest inline-block">SEASON PASS</div>
                        <h3 className="text-4xl font-black italic tracking-tighter leading-tight">Master the IPL Season<br/>with Pro Pass</h3>
                        <p className="text-sm font-bold text-white/50 max-w-md">Unlimited predictions, 2X Coin rewards, and exclusive early access to Arena events.</p>
                    </div>

                    <button className="relative z-10 px-10 h-16 bg-white text-black rounded-3xl font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:scale-105 transition-all">
                        Upgrade Now ₹299 <ArrowRight className="size-4" />
                    </button>
                </div>
            </main>

            {/* Mock Video Ad Modal */}
            <AnimatePresence>
                {showAd && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black backdrop-blur-2xl flex items-center justify-center p-6"
                    >
                        <div className="w-full max-w-lg aspect-video bg-white/5 rounded-[40px] border border-white/10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
                            <Play className="size-16 text-white/20 animate-pulse" />
                            <div className="text-center">
                                <h4 className="text-lg font-black uppercase tracking-widest mb-1">Reward Advertisement</h4>
                                <p className="text-white/40 text-xs font-bold">Claiming 10 Bond Coins in {adTimer}s</p>
                            </div>
                            
                            {adTimer === 0 && (
                                <motion.button 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    onClick={claimBonus}
                                    className="px-10 h-12 bg-amber-500 text-black rounded-2xl font-black uppercase text-xs tracking-widest"
                                >
                                    Claim Reward
                                </motion.button>
                            )}

                            {/* Decorative Lines */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20">
                                <motion.div 
                                    className="h-full bg-amber-500"
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style dangerouslySetInnerHTML={{ __html: `
                .bg-orange-500\\/20 { background-color: rgba(249, 115, 22, 0.2); }
                .text-orange-500 { color: rgb(249, 115, 22); }
                .bg-blue-500\\/20 { background-color: rgba(59, 130, 246, 0.2); }
                .text-blue-500 { color: rgb(59, 130, 246); }
                .bg-amber-500\\/20 { background-color: rgba(245, 158, 11, 0.2); }
                .text-amber-500 { color: rgb(245, 158, 11); }
                .bg-purple-500\\/20 { background-color: rgba(168, 85, 247, 0.2); }
                .text-purple-500 { color: rgb(168, 85, 247); }
            `}} />
        </div>
    );
};

export default EarningsWallet;
