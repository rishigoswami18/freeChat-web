import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Zap, Trophy, ShieldCheck, Sparkles, 
    CreditCard, Gem, Coins, ArrowRight,
    TrendingUp, Activity, History, ChevronRight,
    Plus, DollarSign
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { createGemOrder, verifyGemPayment, claimDailyReward, getRazorpayKey, getWalletBalance } from "../lib/api";
import toast from "react-hot-toast";
import PremiumWalletCard from "../components/membership/PremiumWalletCard";
import AppLayout from "../components/layout/AppLayout";

const COIN_PACKS = [
  { id: "starter_low", name: "Rookie Pack", coins: 200, price: 9, icon: Zap, color: "from-blue-500 to-indigo-600", popular: false },
  { id: "starter_mid", name: "Expert Pack", coins: 500, price: 19, icon: Sparkles, color: "from-purple-500 to-pink-600", popular: true },
  { id: "starter", name: "Pro Pack", coins: 2500, price: 99, icon: ShieldCheck, color: "from-amber-400 to-orange-600", popular: false },
  { id: "legend", name: "Legend Pack", coins: 15000, price: 499, icon: Trophy, color: "from-emerald-400 to-teal-600", popular: false },
];

const EarningsWallet = () => {
    const { authUser } = useAuthUser();
    const [loadingPack, setLoadingPack] = useState(null);

    const { data: walletData, refetch: refetchWallet } = useQuery({
        queryKey: ["walletBalance"],
        queryFn: getWalletBalance,
        refetchInterval: 10000 
    });

    const wallet = walletData || authUser?.wallet || { totalBalance: 0, winnings: 0, bonusBalance: 0 };

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
            toast.error("Fintech Engine failed to initialize.");
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
                name: "FreeChat Pro",
                description: `Acquire ${pack.coins} Coins (Social Capital)`,
                order_id: orderRes.order.id,
                handler: async (response) => {
                    try {
                        await verifyGemPayment({ ...response, gemAmount: pack.coins });
                        refetchWallet();
                        toast.success(`Social Capital increased by ${pack.coins} Coins! ✦`);
                    } catch (err) {
                        toast.error("Capital verification failed!");
                    }
                },
                prefill: {
                    name: authUser?.fullName,
                    email: authUser?.email,
                },
                theme: { color: "#6366f1" },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            toast.error("Order creation failed.");
        } finally {
            setLoadingPack(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-12 pb-32">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-white tracking-tighter italic">Capital Hub</h1>
                    <p className="text-[11px] font-bold text-white/30 uppercase tracking-[0.2em]">Manage your social earnings and community assets</p>
                </div>
            </div>

            {/* Primary Wallet Component */}
            <PremiumWalletCard 
                balance={wallet.totalBalance} 
                earnings={wallet.winnings} 
            />

            {/* Social Capital Shop */}
            <section className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black text-white italic">Acquire Capital</h2>
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">Global Currency for Premium Access</p>
                    </div>
                    <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
                        <ShieldCheck size={12} className="text-primary" />
                        <span className="text-[8px] font-black text-primary uppercase tracking-widest">Encrypted Checkout</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {COIN_PACKS.map((pack) => (
                        <motion.div
                            key={pack.id}
                            whileHover={{ y: -8 }}
                            className={`relative group p-6 rounded-[32px] bg-[#0f172a]/40 border border-white/5 backdrop-blur-xl overflow-hidden flex flex-col justify-between h-72 transition-all hover:border-white/20 ${pack.popular ? 'ring-2 ring-primary/40 active:ring-primary h-80 lg:-mt-4' : ''}`}
                        >
                            {pack.popular && (
                                <div className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest z-20">Most Viral</div>
                            )}
                            
                            <div className={`absolute -top-12 -right-12 size-32 bg-gradient-to-br ${pack.color} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity`} />

                            <div className="space-y-4">
                                <div className={`size-12 rounded-2xl bg-gradient-to-br ${pack.color} flex items-center justify-center text-white shadow-xl`}>
                                    <pack.icon size={24} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white/40 uppercase tracking-widest">{pack.name}</h3>
                                    <div className="flex items-end gap-1">
                                        <p className="text-3xl font-black text-white tracking-tighter">{pack.coins.toLocaleString()}</p>
                                        <span className="text-[10px] font-bold text-white/30 uppercase mb-2">Coins</span>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handlePurchase(pack)}
                                disabled={loadingPack === pack.id}
                                className={`w-full h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all overflow-hidden relative ${
                                    pack.popular ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {loadingPack === pack.id ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="size-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Initializing...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        Invest ₹{pack.price}
                                        <ArrowRight size={14} />
                                    </div>
                                )}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Governance Section */}
            <section className="p-8 rounded-[40px] bg-gradient-to-r from-indigo-500/10 to-transparent border border-white/5 backdrop-blur-3xl overflow-hidden relative group">
                <div className="absolute right-[-2%] top-0 size-40 bg-indigo-500/10 blur-3xl rounded-full" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-2xl font-black text-white italic tracking-tight">Creator Governance</h2>
                        <p className="text-sm text-white/40 font-medium max-w-md">Unlock analytics, communities, and high-fidelity video services by maintaining a healthy social balance.</p>
                    </div>
                    <button className="h-14 px-10 bg-white text-primary rounded-[20px] text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/20">
                        Apply for Partner
                    </button>
                </div>
            </section>

        </div>
    );
};

export default EarningsWallet;
