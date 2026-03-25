import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getWalletBalance, createGemOrder, verifyGemPayment, buyVerification, getRazorpayKey, boostProfile } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gem,
    Sparkles,
    ShieldCheck,
    BadgeCheck,
    Crown,
    Zap,
    Gift,
    Star,
    TrendingUp,
    Loader2,
    CheckCircle2,
    Lock,
    ArrowRight,
    Flame,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const gemPacks = [
    { id: 1, amount: 100, price: "Free", tag: "Starter", color: "from-sky-500 to-blue-600", icon: Sparkles, bonus: 0, popular: false },
    { id: 2, amount: 500, price: "₹49", tag: "Basic", color: "from-violet-500 to-purple-600", icon: Gem, bonus: 50, popular: false },
    { id: 3, amount: 1200, price: "₹99", tag: "Popular", color: "from-amber-400 to-orange-600", icon: Flame, bonus: 200, popular: true },
    { id: 4, amount: 3000, price: "₹199", tag: "Pro", color: "from-emerald-400 to-teal-600", icon: Zap, bonus: 500, popular: false },
    { id: 5, amount: 7500, price: "₹449", tag: "Elite", color: "from-rose-400 to-pink-600", icon: Crown, bonus: 1500, popular: false },
    { id: 6, amount: 20000, price: "₹999", tag: "Legend", color: "from-yellow-400 to-amber-600", icon: Star, bonus: 5000, popular: false },
];

const shopItems = [
    {
        id: "verify",
        name: "Professional Verification",
        description: "Official blue ✓ badge on your profile & posts",
        cost: 1000,
        icon: BadgeCheck,
        color: "text-white fill-[#1d9bf0]",
        bg: "bg-[#1d9bf0]/10",
        action: "verify",
    },
    {
        id: "premium_theme",
        name: "Premium Themes",
        description: "Unlock exclusive dark & neon themes",
        cost: 500,
        icon: Sparkles,
        color: "text-violet-500",
        bg: "bg-violet-500/10",
        action: "coming_soon",
    },
    {
        id: "profile_frame",
        name: "Profile Frame",
        description: "Animated ring around your avatar everywhere",
        cost: 750,
        icon: Crown,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        action: "coming_soon",
    },
    {
        id: "boost",
        name: "Profile Boost",
        description: "Be featured at the top of everyone's discovery for 24h",
        cost: 99,
        icon: TrendingUp,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        action: "boost",
    },
];

const GemShopPage = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    const [purchasing, setPurchasing] = useState(null);

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const { data: wallet, isLoading: isWalletLoading } = useQuery({
        queryKey: ["walletBalance"],
        queryFn: getWalletBalance,
    });

    const verifyMutation = useMutation({
        mutationFn: buyVerification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("🎉 You are now verified!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to purchase");
        },
    });

    const boostMutation = useMutation({
        mutationFn: boostProfile,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success(data.message || "Profile boosted! 🚀");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to boost");
        },
    });

    const handleBuyPack = async (pack) => {
        if (pack.price === "Free") {
            toast.error("Free gems are not yet available!");
            return;
        }

        try {
            setPurchasing(pack.id);
            const price = parseInt(pack.price.replace("₹", ""));

            // 1. Get Razorpay key
            const { key } = await getRazorpayKey();

            // 2. Create order
            const { order } = await createGemOrder(price, pack.id);

            // 3. Open Checkout
            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: "Zyro Gems",
                description: `${pack.amount} Gems + ${pack.bonus} Bonus`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        await verifyGemPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            gemAmount: pack.amount + pack.bonus
                        });
                        toast.success(`💎 Success! ${pack.amount + pack.bonus} gems added.`);
                        queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
                        queryClient.invalidateQueries({ queryKey: ["authUser"] });
                    } catch (err) {
                        toast.error("Payment verification failed");
                    } finally {
                        setPurchasing(null);
                    }
                },
                prefill: {
                    name: authUser?.fullName || "",
                    email: authUser?.email || "",
                },
                theme: { color: "#8b5cf6" },
                modal: {
                    ondismiss: () => {
                        setPurchasing(null);
                        toast.error("Payment cancelled");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (res) => {
                toast.error(`Payment failed: ${res.error.description}`);
                setPurchasing(null);
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to initiate payment");
            setPurchasing(null);
        }
    };

    const handleBuyItem = (item) => {
        if (item.action === "verify") {
            if (authUser?.isVerified) {
                toast("You're already verified! ✅", { icon: "💎" });
                return;
            }
            if ((wallet?.gems || 0) < item.cost) {
                toast.error(`Not enough gems. You need ${item.cost} 💎`);
                return;
            }
            verifyMutation.mutate();
        } else if (item.action === "boost") {
            if ((wallet?.gems || 0) < item.cost) {
                toast.error(`Not enough gems. You need ${item.cost} 💎`);
                return;
            }
            boostMutation.mutate();
        } else {
            toast("Coming soon! Stay tuned ✨", { icon: "🔮" });
        }
    };

    const currentGems = wallet?.gems || 0;

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-10">
            {/* Hero Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-6 sm:p-10 text-white shadow-2xl shadow-purple-500/20"
            >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L2c+PC9zdmc+')] opacity-50" />

                <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
                    <div className="text-center sm:text-left space-y-3">
                        <h1 className="text-3xl sm:text-4xl font-black tracking-tight flex items-center gap-3 justify-center sm:justify-start">
                            <Gem className="size-9 drop-shadow-lg" />
                            Gem Shop
                        </h1>
                        <p className="text-sm sm:text-base font-medium text-white/70 max-w-md">
                            Buy gems to unlock premium features, send gifts, and stand out from the crowd.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-2 bg-white/10 backdrop-blur-xl rounded-2xl p-5 border border-white/20 min-w-[180px]">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Your Balance</p>
                        {isWalletLoading ? (
                            <Loader2 className="size-6 animate-spin text-white/40" />
                        ) : (
                            <div className="flex items-center gap-2.5">
                                <Gem className="size-7 text-amber-300 drop-shadow-lg" />
                                <span className="text-4xl font-black tabular-nums">{currentGems.toLocaleString()}</span>
                            </div>
                        )}
                        {authUser?.boostUntil && new Date(authUser.boostUntil) > new Date() && (
                            <div className="mt-1 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                <TrendingUp className="size-3 text-emerald-300" />
                                <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
                                    Featured Profile
                                </span>
                            </div>
                        )}
                        {(wallet?.earnings || 0) > 0 && (
                            <p className="text-[10px] font-bold text-emerald-300">
                                ₹{wallet.earnings.toFixed(0)} earned from gifts
                            </p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Gem Packs */}
            <div>
                <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 tracking-tight uppercase italic">
                    <Gem className="text-primary size-6" />
                    Buy Gems
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5">
                    {gemPacks.map((pack, idx) => (
                        <motion.div
                            key={pack.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`relative group cursor-pointer rounded-2xl border border-base-300 bg-base-200/80 hover:bg-base-200 transition-all duration-300 overflow-hidden hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] ${pack.popular ? "ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10" : ""}`}
                            onClick={() => handleBuyPack(pack)}
                        >
                            {pack.popular && (
                                <div className="absolute top-0 inset-x-0 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-[9px] font-black text-center py-1 uppercase tracking-[0.2em]">
                                    🔥 Most Popular
                                </div>
                            )}

                            <div className={`p-4 sm:p-5 ${pack.popular ? "pt-8" : ""}`}>
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${pack.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <pack.icon className="size-6 sm:size-7 text-white drop-shadow" />
                                </div>

                                <p className="text-[10px] font-black uppercase tracking-[0.15em] opacity-40 mb-1">{pack.tag}</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-2xl sm:text-3xl font-black">{pack.amount.toLocaleString()}</span>
                                    <Gem className="size-4 text-primary" />
                                </div>

                                {pack.bonus > 0 && (
                                    <p className="text-[10px] font-bold text-emerald-500 mt-1 flex items-center gap-1">
                                        <Gift className="size-3" /> +{pack.bonus} bonus
                                    </p>
                                )}

                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-base font-black ${pack.price === "Free" ? "text-emerald-500" : "text-primary"}`}>
                                        {pack.price}
                                    </span>
                                    {purchasing === pack.id ? (
                                        <Loader2 className="size-4 animate-spin text-primary" />
                                    ) : (
                                        <ArrowRight className="size-4 opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-primary" />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Spend Gems */}
            <div>
                <h2 className="text-xl sm:text-2xl font-black mb-6 flex items-center gap-3 tracking-tight uppercase italic">
                    <ShieldCheck className="text-primary size-6" />
                    Spend Gems
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
                    {shopItems.map((item, idx) => {
                        const canAfford = currentGems >= item.cost;
                        const isOwned = item.action === "verify" && authUser?.isVerified;
                        const isComingSoon = item.action === "coming_soon";

                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => handleBuyItem(item)}
                                className={`relative group cursor-pointer flex items-center gap-4 p-4 sm:p-5 rounded-2xl border border-base-300 bg-base-200/80 hover:bg-base-200 transition-all duration-300 hover:shadow-lg active:scale-[0.98] ${isOwned ? "opacity-60" : ""}`}
                            >
                                <div className={`w-14 h-14 rounded-2xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                                    <item.icon className={`size-7 ${item.color}`} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                                        {item.name}
                                        {isOwned && (
                                            <span className="badge badge-success badge-xs gap-0.5 font-bold">
                                                <CheckCircle2 className="size-2.5" /> Owned
                                            </span>
                                        )}
                                        {isComingSoon && (
                                            <span className="badge badge-outline badge-xs font-bold opacity-50">Soon</span>
                                        )}
                                    </h3>
                                    <p className="text-xs opacity-50 mt-0.5">{item.description}</p>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                    <div className={`flex items-center gap-1 text-sm font-black ${canAfford ? "text-primary" : "text-error"}`}>
                                        <Gem className="size-3.5" />
                                        {item.cost.toLocaleString()}
                                    </div>
                                    {!canAfford && !isOwned && (
                                        <Lock className="size-3 text-error opacity-50" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Gifting CTA */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-violet-500/10 border border-rose-500/20 p-6 sm:p-8 text-center space-y-4"
            >
                <Gift className="size-10 mx-auto text-rose-500 animate-bounce" />
                <h3 className="text-lg font-black uppercase tracking-tight">Send Gems as Gifts</h3>
                <p className="text-sm opacity-50 max-w-md mx-auto">
                    Show love to your friends! Visit any user's profile or chat to send them gem gifts. Creators earn 70% of the gift value.
                </p>
                <Link
                    to="/friends"
                    className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-6"
                >
                    <Gift className="size-4" />
                    Visit Friends
                </Link>
            </motion.div>

            {/* Info Footer */}
            <div className="text-center pb-10 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-30">
                    Secure Transactions • Instant Delivery • No Refunds
                </p>
                <p className="text-[10px] opacity-20">
                    Gems are virtual currency for in-app features only. Not redeemable for real money.
                </p>
            </div>
        </div>
    );
};

export default GemShopPage;
