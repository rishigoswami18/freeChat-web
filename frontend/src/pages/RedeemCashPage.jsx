import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Coins, ArrowUpRight, ShieldCheck, 
    Smartphone, History, AlertTriangle, 
    CheckCircle2, X, Wallet
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const RedeemCashPage = () => {
    const { authUser } = useAuthUser();
    const [upiId, setUpiId] = useState("");
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    // 10 Coins = ₹1
    const cashValue = amount ? (parseFloat(amount) / 10).toFixed(2) : "0.00";
    const minWithdrawal = 500;
    const winnings = authUser?.wallet?.winnings || 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (amount < minWithdrawal) return toast.error(`Min withdrawal is ${minWithdrawal} Coins`);
        if (amount > winnings) return toast.error("Insufficient winnings balance!");
        if (!upiId.includes("@")) return toast.error("Invalid UPI ID format");
        
        setShowConfirm(true);
    };

    const confirmWithdrawal = async () => {
        setIsProcessing(true);
        try {
            const res = await axiosInstance.post("/wallet/withdraw", {
                amount: parseInt(amount),
                upiId
            });
            toast.success(res.data.message);
            setShowConfirm(false);
            setAmount("");
            setUpiId("");
        } catch (error) {
            toast.error(error.response?.data?.message || "Internal engine error");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050508] text-white font-outfit py-20 px-6 sm:px-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16 border-b border-white/5 pb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-500/20 rounded-xl">
                                    <Wallet className="size-5 text-indigo-400" />
                                </div>
                                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">Rewards Redemption</span>
                            </div>
                            <h1 className="text-5xl font-bold tracking-tight">Redeem Rewards</h1>
                        </div>
                    <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 flex items-center gap-6">
                        <div className="size-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <Coins className="size-6 text-black fill-current" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Withdrawable Winnings</p>
                            <p className="text-2xl font-black italic text-emerald-500">🪙 {winnings.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Left: Form Area */}
                    <div className="lg:col-span-3 space-y-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-2">Redemption Amount (Coins)</label>
                                <div className="relative group">
                                    <input 
                                        type="number"
                                        placeholder="500"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 h-20 rounded-[30px] px-8 text-2xl font-black focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                                    />
                                    <div className="absolute right-8 top-1/2 -translate-y-1/2 flex items-baseline gap-1 text-emerald-500">
                                        <span className="text-xs font-black uppercase">Est. Cash:</span>
                                        <span className="text-xl font-black italic">₹{cashValue}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between px-2">
                                    <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">Min: {minWithdrawal} BC</p>
                                    <button 
                                        type="button" 
                                        onClick={() => setAmount(winnings)}
                                        className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest hover:underline"
                                    >
                                        Withdraw Max
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 block ml-2">UPI ID (VPA)</label>
                                <div className="relative">
                                    <Smartphone className="absolute left-6 top-1/2 -translate-y-1/2 size-5 text-white/20" />
                                    <input 
                                        type="text"
                                        placeholder="yourname@upi"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 h-20 rounded-[30px] pl-16 pr-8 text-lg font-bold focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-white/10"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit"
                                className="w-full h-20 bg-emerald-500 text-black rounded-[30px] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                            >
                                Initiate Withdrawal <ArrowUpRight className="size-5" />
                            </button>
                        </form>

                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-6 flex items-start gap-4">
                            <AlertTriangle className="size-5 text-amber-500/60 mt-1 shrink-0" />
                            <p className="text-xs font-medium text-amber-500/60 leading-relaxed">
                                Ensure your UPI ID is correct. FreeChat is not responsible for transfers to incorrect VPAs. Only "Winnings" (earned from contributions & rewards) are withdrawable. Bonus coins are for platform use only.
                            </p>
                        </div>
                    </div>

                    {/* Right: Security & History */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                                <ShieldCheck className="size-4 text-emerald-500" /> Redemption Logic
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/40 font-medium">Exchange Rate</span>
                                    <span className="font-bold">10 BC = ₹1</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/40 font-medium">Processing Time</span>
                                    <span className="font-bold">&lt; 24 Hours</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-white/40 font-medium">Success Rate</span>
                                    <span className="font-bold text-emerald-500 font-mono tracking-tighter">99.2%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-2">
                                <History className="size-4" /> Recent Payouts
                            </h3>
                            <div className="space-y-4">
                                {[1, 2].map(i => (
                                    <div key={i} className="p-4 bg-black/20 rounded-2xl flex items-center justify-between border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="size-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="size-4 text-emerald-500" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-tighter">Processed</p>
                                                <p className="text-[8px] text-white/20 uppercase tracking-widest font-bold">14 Mar, 2026</p>
                                            </div>
                                        </div>
                                        <p className="font-black text-sm italic">₹1,250</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-6"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white/5 border border-white/10 w-full max-w-md rounded-[40px] p-10 text-center relative"
                        >
                            <button onClick={() => setShowConfirm(false)} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full hover:bg-white/10">
                                <X className="size-5" />
                            </button>

                            <div className="size-20 bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20 rotate-12">
                                <Smartphone className="size-10 text-black" />
                            </div>

                            <h2 className="text-3xl font-black italic tracking-tighter mb-4">Confirm Payout</h2>
                            <p className="text-white/40 font-medium mb-8 leading-relaxed">
                                You are about to redeem <span className="text-emerald-500 font-black">🪙 {amount}</span> for <span className="text-emerald-500 font-black">₹{cashValue}</span> to:
                                <br/>
                                <span className="text-white font-mono font-black italic text-lg mt-2 inline-block">{upiId}</span>
                            </p>

                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={confirmWithdrawal}
                                    disabled={isProcessing}
                                    className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-semibold uppercase tracking-wider text-xs flex items-center justify-center gap-3 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                                >
                                    {isProcessing ? "Processing..." : "Confirm Withdrawal"}
                                </motion.button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RedeemCashPage;
