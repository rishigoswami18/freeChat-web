import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
    getCoupleStatus,
    sendCoupleRequest,
    acceptCoupleRequest,
    unlinkCouple,
    getFriends,
    getMembershipStatus,
    updateRomanticNote,
    buyVerification,
    getDailyInsight,
    updateMood,
    linkAI,
} from "../lib/api";
import {
    Heart,
    HeartOff,
    Loader2,
    Search,
    CalendarHeart,
    User,
    HeartHandshake,
    Clock,
    Crown,
    Lock,
    Gamepad2,
    ArrowRight,
    PenLine,
    Sparkles,
    Waves,
    Globe,
    MessageCircle,
    MessageSquare,
    Gem,
    TrendingUp,
    Shield,
    Infinity as InfinityIcon,
    Compass,
    Rocket,
    CheckCircle2,
    Calendar,
} from "lucide-react";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { isPremiumUser } from "../lib/premium";
import { useMemo } from "react";

const HeartParticles = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 20}s`,
            duration: `${15 + Math.random() * 20}s`,
            size: `${10 + Math.random() * 20}px`
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="heart-particle opacity-0"
                    style={{
                        left: p.left,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        fontSize: p.size
                    }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
};

const CoupleProfilePage = () => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [noteDraft, setNoteDraft] = useState("");
    const [customAiName, setCustomAiName] = useState("");
    const [isLinkingAI, setIsLinkingAI] = useState(false);

    // BondBeyond Daily Insights
    const { data: insightData, isLoading: insightLoading } = useQuery({
        queryKey: ["dailyInsight"],
        queryFn: getDailyInsight,
    });

    const { mutate: handleUpdateMood, isPending: isUpdatingMood } = useMutation({
        mutationFn: updateMood,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["dailyInsight"] });
            queryClient.setQueryData(["authUser"], (old) => ({ ...old, user: { ...old.user, mood: data.user.mood, coupleStreak: data.user.coupleStreak } }));
            toast.success("Mood shared with your partner! ✨");
        }
    });

    const moodEmojis = {
        happy: "😊",
        neutral: "😐",
        sad: "😢",
        angry: "😠",
        tired: "😴",
        excited: "🤩",
        romantic: "❤️"
    };

    const { mutate: handleBuyVerification, isPending: isBuyingVerification } = useMutation({
        mutationFn: buyVerification,
        onSuccess: () => {
            toast.success("Verification badge activated! 🎉");
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to buy verification")
    });

    // Fetch couple status
    const { data: coupleData, isLoading: coupleLoading } = useQuery({
        queryKey: ["coupleStatus"],
        queryFn: getCoupleStatus,
    });

    // Update note draft when data is fetched
    useEffect(() => {
        if (coupleData?.romanticNote && !isEditingNote) {
            setNoteDraft(coupleData.romanticNote);
        }
    }, [coupleData, isEditingNote]);

    // Fetch friends list (for sending couple requests)
    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends,
    });

    // Check membership
    const { data: memberData, isLoading: memberLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
    });

    const { mutate: handleLinkAI, isPending: linkingAI } = useMutation({
        mutationFn: linkAI,
        onSuccess: (data) => {
            toast.success(`Linked with ${data.user.aiPartnerName}! ❤️`);
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            setIsLinkingAI(false);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to link AI")
    });

    // Update Romantic Note
    const { mutate: updateNote, isPending: isUpdatingNote } = useMutation({
        mutationFn: updateRomanticNote,
        onSuccess: () => {
            toast.success("Note left for your partner! ❤️");
            setIsEditingNote(false);
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to save note"),
    });

    // Send couple request
    const { mutate: sendRequest, isPending: isSending } = useMutation({
        mutationFn: sendCoupleRequest,
        onSuccess: () => {
            toast.success("Couple request sent! 💕");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
    });

    // Accept couple request
    const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
        mutationFn: acceptCoupleRequest,
        onSuccess: () => {
            toast.success("You're now a couple! 💑");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to accept"),
    });

    // Unlink couple
    const { mutate: doUnlink, isPending: isUnlinking } = useMutation({
        mutationFn: unlinkCouple,
        onSuccess: () => {
            toast.success("Couple unlinked");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to unlink"),
    });

    if (coupleLoading || memberLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const calculateAge = (dobString) => {
        if (!dobString) return 0;
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const monthDiff = today.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age;
    };

    const userAge = calculateAge(authUser?.dateOfBirth);

    // Age gate (Admins are exempt)
    if (userAge < 14 && memberData?.role !== "admin") {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-error/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <Lock className="size-8 text-error opacity-50 mb-2" />
                        <h2 className="text-lg font-bold">Age Restricted</h2>
                        <p className="text-sm opacity-60">
                            Available for users aged 14 and above.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Membership gate
    if (!isPremiumUser(authUser)) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-amber-500/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <Crown className="size-8 text-amber-500 mb-2" />
                        <h2 className="text-lg font-bold">Premium Feature</h2>
                        <p className="text-sm opacity-60">Subscribe to link with your partner.</p>
                        <Link to="/membership" className="btn btn-primary mt-4">Subscribe — ₹49/month</Link>
                    </div>
                </div>
            </div>
        );
    }

    const { coupleStatus, partner, anniversary, coupleRequestSenderId, romanticNote, romanticNoteLastUpdated, isBothAdult } = coupleData || {};

    const getDaysTogether = () => {
        if (!anniversary) return 0;
        return Math.floor((Date.now() - new Date(anniversary)) / (1000 * 60 * 60 * 24));
    };

    const handleOpenEditNote = () => {
        setNoteDraft(romanticNote || "");
        setIsEditingNote(true);
    };

    const handleSaveNote = () => {
        updateNote(noteDraft);
    };

    const iReceivedRequest =
        coupleStatus === "pending" && partner && coupleRequestSenderId && coupleRequestSenderId !== authUser._id;

    const filteredFriends = friends.filter((f) =>
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto pb-24 sm:pb-8 relative">
            <HeartParticles />

            <div className="flex items-center justify-between mb-2 relative z-10">
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex flex-col"
                >
                    <h1 className="text-3xl sm:text-5xl font-black flex items-center gap-3 romantic-gradient-text tracking-tighter italic">
                        BONDBeyond
                        <span className="text-[10px] bg-primary/20 backdrop-blur-md text-primary border border-primary/20 px-3 py-1 rounded-full animate-pulse uppercase tracking-[0.2em] not-italic">v2.1 GOLD</span>
                    </h1>
                    <p className="text-[10px] opacity-40 uppercase font-black tracking-[0.4em] mt-1 ml-1">THE WORLD'S BEST SOCIAL APP FOR COUPLES</p>
                </motion.div>

                {insightData?.coupleStreak > 0 && (
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        className="flex items-center gap-2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white px-5 py-2.5 rounded-2xl shadow-2xl shadow-red-500/40 border border-white/20"
                    >
                        <Flame className="size-5 fill-current animate-pulse" />
                        <span className="text-xl font-black italic tracking-tighter">{insightData.coupleStreak}</span>
                    </motion.div>
                )}
            </div>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-10" />

            <div className="space-y-6">
                {/* 🔥 HERO COUPLE STREAK CARD (PROMOTED TO TOP) */}
                {coupleStatus === "coupled" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -5 }}
                        className={`card rounded-[40px] p-10 shadow-2xl relative overflow-hidden border-2 transition-all duration-700 ${(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0
                            ? 'romantic-gradient-bg border-white/30 luxe-shadow-pink'
                            : 'bg-base-200 border-base-300'
                            }`}
                    >
                        {/* Ultra Luxe Background Effects */}
                        {(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 && (
                            <>
                                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/20 rounded-full blur-[100px] animate-pulse" />
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-yellow-400/30 rounded-full blur-[60px]" />
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            </>
                        )}
                        |
                        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-8">
                            <div className="flex items-center gap-8">
                                <motion.div
                                    animate={(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 ? {
                                        scale: [1, 1.15, 1],
                                        rotate: [0, 8, -8, 0],
                                        filter: ["drop-shadow(0 0 10px rgba(255,255,255,0.4))", "drop-shadow(0 0 25px rgba(255,255,255,0.8))", "drop-shadow(0 0 10px rgba(255,255,255,0.4))"]
                                    } : {}}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className={`size-24 rounded-[32px] flex items-center justify-center text-5xl ${(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0
                                        ? 'bg-white/30 backdrop-blur-xl shadow-2xl border border-white/40'
                                        : 'bg-base-300'
                                        }`}>
                                    {(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 ? '❤️‍🔥' : '❄️'}
                                </motion.div>
                                <div className="text-center sm:text-left">
                                    <h3 className={`font-black text-[11px] uppercase tracking-[0.4em] ${(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 ? 'text-white/80' : 'opacity-40'}`}>
                                        ETERNAL SOUL BOND
                                    </h3>
                                    <p className={`text-8xl font-black italic tracking-tighter leading-none ${(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 ? 'text-white drop-shadow-2xl' : 'opacity-20'
                                        }`}>
                                        {insightData?.coupleStreak || authUser?.coupleStreak || 0}
                                    </p>
                                    <p className={`text-[10px] font-black uppercase mt-2 tracking-widest ${(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0 ? 'text-white/70' : 'opacity-30'}`}>
                                        {(insightData?.coupleStreak || authUser?.coupleStreak || 0) > 0
                                            ? "UNSTOPPABLE CONNECTION"
                                            : "LOGIN DAILY TO START"
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap sm:flex-col gap-3 justify-center items-end">
                                <div className="px-5 py-2 bg-black/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                    LEGENDARY STREAK
                                </div>
                                {(insightData?.coupleStreak || authUser?.coupleStreak || 0) >= 7 && (
                                    <div className="px-5 py-2 bg-gradient-to-r from-yellow-400 to-amber-600 text-amber-950 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-yellow-500/50 scale-110">
                                        ✨ ELITE COUPLE ✨
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}


                {/* MOOD HARMONY SECTION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="romantic-card-luxe rounded-[40px] p-8 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                        <Waves className="size-32 text-primary" />
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-14 bg-primary/20 rounded-[22px] flex items-center justify-center text-primary luxe-shadow-pink">
                                <Sparkles className="size-7" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase tracking-[0.3em] romantic-gradient-text">Mood Harmony</h3>
                                <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-0.5">Let your partner feel your soul</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 mb-10">
                            {Object.entries(moodEmojis).map(([key, emoji]) => (
                                <motion.button
                                    key={key}
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleUpdateMood(key)}
                                    disabled={isUpdatingMood}
                                    className={`size-14 sm:size-16 rounded-[24px] text-3xl flex items-center justify-center transition-all duration-500 ${authUser?.mood === key
                                        ? 'romantic-gradient-bg text-white shadow-2xl scale-110 rotate-3 border-2 border-white/20'
                                        : 'bg-white/5 hover:bg-white/10 border border-white/5'
                                        }`}
                                >
                                    {emoji}
                                </motion.button>
                            ))}
                        </div>

                        {insightData?.partner && (
                            <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className="avatar">
                                        <div className="size-14 rounded-[22px] ring-2 ring-pink-500/30 ring-offset-4 ring-offset-transparent shadow-2xl">
                                            <img src={insightData.partner.profilePic || "/avatar.png"} alt="" className="object-cover" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-pink-500 tracking-[0.2em] flex items-center gap-1.5">
                                            <span className="size-1.5 bg-pink-500 rounded-full animate-ping" />
                                            Partner's Frequency
                                        </p>
                                        <p className="font-bold text-lg tracking-tight">
                                            {insightData?.partner?.fullName?.split(' ')[0] || "Partner"} is {insightData?.partner?.mood ? (
                                                <span className="italic font-black text-pink-500">vibrating {insightData.partner.mood}...</span>
                                            ) : (
                                                <span className="opacity-30">silent right now</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {insightData.partner.mood && (
                                    <motion.span
                                        animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="text-6xl drop-shadow-[0_0_20px_rgba(255,78,80,0.4)]"
                                    >
                                        {moodEmojis[insightData.partner.mood]}
                                    </motion.span>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* SACRED RITUAL (TOPIC OF THE DAY) */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="relative px-2 py-6"
                >
                    <div className="card romantic-card-luxe rounded-[40px] p-8 shadow-2xl relative overflow-hidden group border-2 border-white/5">
                        <div className="absolute -right-20 -bottom-20 size-64 bg-primary/10 rounded-full blur-[100px] group-hover:bg-primary/20 transition-all duration-1000" />

                        <div className="flex flex-col gap-8 relative z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-[20px] bg-primary/10 flex items-center justify-center luxe-shadow-pink">
                                        <MessageCircle className="size-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-primary">Sacred Ritual</h3>
                                        <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-0.5">Deepen the connection</p>
                                    </div>
                                </div>
                                <div className="flex -space-x-3">
                                    <motion.img whileHover={{ scale: 1.2, zIndex: 20 }} src={authUser?.profilePic} className="size-8 rounded-full border-2 border-white/20 shadow-xl" />
                                    <motion.img whileHover={{ scale: 1.2, zIndex: 20 }} src={insightData?.partner?.profilePic || "/avatar.png"} className="size-8 rounded-full border-2 border-white/20 shadow-xl" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <motion.h3
                                    className="text-2xl sm:text-3xl font-black italic leading-tight text-base-content tracking-tighter"
                                >
                                    “{insightData?.question?.text || "What is one thing you appreciate about your partner today?"}”
                                </motion.h3>
                                <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.3em]">Ignite a soul-to-soul conversation</p>
                            </div>

                            <Link
                                to={`/chat/${partner?._id || 'ai-user-id'}`}
                                className="btn romantic-gradient-bg text-white border-none btn-lg px-8 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3 group/btn"
                            >
                                <MessageSquare className="size-5 group-hover:rotate-12 transition-transform" />
                                Open Sacred Chat
                                <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </motion.div>
                {/* WALLET DASHBOARD - MONETIZATION HUB */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <Link
                        to="/gem-shop"
                        className="card bg-base-200 border border-yellow-500/10 p-4 rounded-3xl shadow-sm group hover:border-yellow-500/30 transition-all active:scale-95"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                <Gem className="size-4 text-yellow-500" />
                                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest text-base-content">My Gems</span>
                            </div>
                            <ArrowRight className="size-3 text-primary opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </div>
                        <p className="text-2xl font-black italic">{authUser?.gems || 0}</p>
                        <span className="text-[9px] text-primary font-bold uppercase mt-2 group-hover:underline">Top Up &rarr;</span>
                    </Link>
                    <div className="card bg-base-200 border border-success/10 p-4 rounded-3xl shadow-sm group hover:border-success/30 transition-all">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="size-4 text-success" />
                            <span className="text-[10px] font-black opacity-40 uppercase tracking-widest">Earnings</span>
                        </div>
                        <p className="text-2xl font-black italic">₹{authUser?.earnings?.toFixed(2) || "0.00"}</p>
                        <button onClick={() => toast("Payout feature coming soon!")} className="text-[9px] text-success font-bold uppercase mt-2 hover:underline">Withdraw -&gt;</button>
                    </div>
                </div>

                {/* VERIFICATION BANNER */}
                {!authUser?.isVerified && (
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="card bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-5 flex flex-row items-center justify-between shadow-lg"
                    >
                        <div className="flex items-center gap-4">
                            <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-primary-content shadow-lg shadow-primary/20">
                                <Shield className="size-7" />
                            </div>
                            <div>
                                <h3 className="font-black text-sm uppercase italic tracking-tighter">Get Verified</h3>
                                <p className="text-[10px] opacity-60">Unlock trust & visibility for 1000 Gems.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => window.confirm("Spend 1000 Gems for verification?") && handleBuyVerification()}
                            disabled={isBuyingVerification}
                            className="btn btn-primary btn-sm rounded-xl font-bold uppercase text-[10px]"
                        >
                            {isBuyingVerification ? <Loader2 className="size-3 animate-spin" /> : "Verify Now"}
                        </button>
                    </motion.div>
                )}
                {/* ===== COUPLED STATE ===== */}
                {coupleStatus === "coupled" && partner && (
                    <>
                        {/* 1. Romantic Note Section (Top Priority) */}
                        <div className="romantic-card-luxe rounded-[40px] overflow-hidden group relative p-1">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                                <Sparkles className="size-32 text-red-500" />
                            </div>
                            <div className="card-body p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="size-14 bg-red-500/20 rounded-[22px] flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20 luxe-shadow-pink">
                                            <Heart className="size-7 fill-current" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-sm uppercase tracking-[0.3em] opacity-80 romantic-gradient-text">Sacred Whisper</h3>
                                            <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-0.5">Your soul-to-soul message</p>
                                        </div>
                                    </div>
                                    {!isEditingNote && (
                                        <button
                                            onClick={handleOpenEditNote}
                                            className="btn btn-ghost btn-md text-primary gap-2 hover:bg-primary/10 rounded-2xl active:scale-95 transition-all"
                                        >
                                            <PenLine className="size-4" />
                                            <span className="text-xs font-black uppercase tracking-widest">{romanticNote ? "Change Whisper" : "Write Soul Note"}</span>
                                        </button>
                                    )}
                                </div>

                                {isEditingNote ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        <textarea
                                            className="textarea textarea-bordered w-full bg-base-100/50 backdrop-blur-xl border-2 border-primary/20 focus:border-primary text-xl min-h-[180px] rounded-[32px] resize-none italic font-serif p-8 shadow-2xl placeholder:opacity-30"
                                            placeholder="Whisper something eternal... ❤️"
                                            value={noteDraft}
                                            onChange={(e) => setNoteDraft(e.target.value)}
                                            maxLength={500}
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button onClick={() => setIsEditingNote(false)} className="btn btn-ghost btn-md font-black uppercase tracking-widest rounded-2xl">Cancel</button>
                                            <button onClick={handleSaveNote} disabled={isUpdatingNote} className="btn romantic-gradient-bg text-white border-none btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-2">
                                                {isUpdatingNote ? <Loader2 className="size-5 animate-spin" /> : <Heart className="size-5 fill-current" />}
                                                <span className="font-black uppercase tracking-widest">Seal with Love</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="relative group/note">
                                        {romanticNote ? (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                className="p-10 bg-gradient-to-br from-red-500/5 via-transparent to-pink-500/5 rounded-[32px] border-2 border-white/5 italic text-center relative overflow-hidden luxe-shadow-pink"
                                            >
                                                <p className="text-2xl sm:text-4xl font-medium leading-relaxed font-serif text-base-content/90 tracking-tight drop-shadow-sm">
                                                    “{romanticNote}”
                                                </p>
                                                <div className="mt-8 flex items-center justify-center gap-3 text-[10px] opacity-40 uppercase font-black tracking-[0.3em] pt-6 border-t border-white/5">
                                                    <Clock className="size-4" />
                                                    ETERNALIZED {new Date(romanticNoteLastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(romanticNoteLastUpdated).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <div className="py-16 text-center opacity-40 italic flex flex-col items-center gap-5 bg-white/5 rounded-[32px] border-2 border-dashed border-white/10">
                                                <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                                                    <Waves className="size-10 text-primary animate-pulse" />
                                                </div>
                                                <p className="text-lg font-bold uppercase tracking-widest">Silence awaits your soul's message</p>
                                                <button onClick={handleOpenEditNote} className="btn romantic-gradient-bg text-white border-none px-8 rounded-2xl uppercase font-black tracking-[0.2em] hover:scale-105 active:scale-95 transition-all">Start Your Story</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Partner Profile Card */}
                        <div className="card bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 shadow-xl overflow-hidden rounded-3xl">
                            <div className="card-body items-center text-center p-8">
                                <div className="flex items-center gap-6 mb-4">
                                    <div className="avatar">
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                                            <img src={authUser?.profilePic || "/avatar.png"} alt="You" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <Heart className="size-6 sm:size-10 text-pink-500 fill-pink-500 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60 mt-1">Linked</span>
                                    </div>
                                    <div className="avatar">
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                                            <img src={partner.profilePic || "/avatar.png"} alt="" />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase">
                                    {authUser?.fullName?.split(' ')[0] || "You"} & {partner?.fullName?.split(' ')[0] || "Partner"}
                                    {coupleData?.isCoupledWithAI && (
                                        <button
                                            onClick={() => setIsLinkingAI(true)}
                                            className="ml-2 btn btn-ghost btn-xs text-primary/40 hover:text-primary transition-all p-0"
                                            title="Rename AI Partner"
                                        >
                                            <PenLine className="size-3" />
                                        </button>
                                    )}
                                </h2>
                                {partner.bio && <p className="text-xs sm:text-sm opacity-60 mt-1 italic">"{partner.bio}"</p>}

                                <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full flex flex-col items-center gap-1 shadow-inner">
                                    <div className="flex items-center gap-2 text-pink-400">
                                        <CalendarHeart className="size-5" />
                                        <span className="text-xs font-black uppercase tracking-tighter">OUR JOURNEY</span>
                                    </div>
                                    <p className="text-sm sm:text-base font-bold uppercase">{getDaysTogether()} Days of Togetherness</p>
                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Since {new Date(anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                            </div>

                            {/* ===== ATTRACTION FEATURES (SOUL JOURNEY) ===== */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full px-2">
                                {/* Soul Milestones (Anniversary Tracker) */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="romantic-card-luxe rounded-[40px] p-8 border-2 border-white/5 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all">
                                        <InfinityIcon className="size-24 text-pink-500" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-10 bg-pink-500/20 rounded-xl flex items-center justify-center text-pink-500 shadow-lg shadow-pink-500/10">
                                            <Calendar className="size-5" />
                                        </div>
                                        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-pink-500">Soul Milestone</h3>
                                    </div>
                                    <div className="flex flex-col items-center justify-center py-4 text-center">
                                        <p className="text-4xl font-black italic tracking-tighter romantic-gradient-text drop-shadow-2xl">Coming Soon</p>
                                        <p className="text-[10px] font-black uppercase opacity-40 tracking-widest mt-2">Until Next Anniversary</p>
                                        <div className="w-full bg-white/5 h-1.5 rounded-full mt-6 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: "65%" }}
                                                className="h-full romantic-gradient-bg"
                                            />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Date Bucket List */}
                                <motion.div
                                    whileHover={{ y: -5 }}
                                    className="romantic-card-luxe rounded-[40px] p-8 border-2 border-white/5 relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-all">
                                        <Compass className="size-24 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="size-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary shadow-lg shadow-primary/10">
                                            <Rocket className="size-5" />
                                        </div>
                                        <h3 className="font-black text-[11px] uppercase tracking-[0.2em] text-primary">Date Bucket List</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group/item cursor-pointer">
                                            <CheckCircle2 className="size-5 text-success opacity-40 group-hover:opacity-100 transition-opacity" />
                                            <span className="text-sm font-bold opacity-80">Midnight Beach Drive</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group/item cursor-pointer">
                                            <CheckCircle2 className="size-5 text-success opacity-40" />
                                            <span className="text-sm font-bold opacity-80">Rooftop Stargazing</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5 group/item cursor-pointer shadow-inner">
                                            <div className="size-5 rounded-full border-2 border-white/20" />
                                            <span className="text-sm font-bold opacity-80">Paris Dream Trip</span>
                                        </div>
                                    </div>
                                </motion.div>
                            </div>

                            {/* AI LOVE GURU (DAILY WISDOM) */}
                            <motion.div
                                whileHover={{ scale: 1.01 }}
                                className="mt-6 border-2 border-white/5 bg-gradient-to-br from-indigo-500/10 via-base-200 to-purple-600/10 rounded-[40px] p-8 overflow-hidden relative group cursor-pointer shadow-2xl w-full"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl shadow-2xl transition-transform group-hover:rotate-12">
                                        🔮
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/20">AI Love Guru</span>
                                            <span className="text-[10px] font-black opacity-30 uppercase tracking-widest">Thought of the day</span>
                                        </div>
                                        <p className="text-xl font-medium italic leading-tight text-base-content/90 tracking-tight">
                                            "A great relationship isn't when a 'perfect couple' comes together. It's when an imperfect couple learns to enjoy their differences."
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* 3. Games Section */}
                        <div className="pt-2">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest">ACTIVITIES</h3>
                                {isBothAdult && <span className="badge badge-error badge-sm uppercase text-[9px] font-black px-2 py-2 rounded-lg">🔞 18+ Access</span>}
                            </div>
                            <Link to="/games" className="card bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group rounded-3xl overflow-hidden shadow-sm">
                                <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><Gamepad2 className="size-6" /></div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-primary italic uppercase tracking-tighter text-lg">Couple Games</h4>
                                        <p className="text-xs opacity-60">Play compatibility quizzes and more!</p>
                                    </div>
                                    <ArrowRight className="size-5 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                </div>
                            </Link>
                        </div>

                        {/* 4. Unlink Button */}
                        <div className="flex justify-center pt-8">
                            <button onClick={() => window.confirm("Unlink Partner?") && doUnlink()} disabled={isUnlinking} className="btn btn-ghost btn-xs text-error/30 hover:text-error transition-all font-bold uppercase tracking-tighter">
                                {isUnlinking ? <Loader2 className="size-3 animate-spin" /> : <HeartOff className="size-3" />}
                                Unlink Partner
                            </button>
                        </div>
                    </>
                )}

                {/* ===== PENDING STATE ===== */}
                {coupleStatus === "pending" && partner && (
                    <div className="card bg-base-200 border border-warning/10 rounded-3xl p-8 items-center text-center shadow-xl">
                        <Clock className="size-10 text-warning animate-spin-slow mb-4" />
                        <h2 className="text-xl font-black italic uppercase tracking-tight mb-2">Request Pending</h2>
                        <p className="text-xs opacity-60 mb-6">Waiting for relationship verification</p>
                        <div className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl border border-base-300 w-full mb-6">
                            <img src={partner.profilePic || "/avatar.png"} className="size-12 rounded-full ring-2 ring-primary/20" alt="" />
                            <div className="text-left font-black text-sm uppercase italic">{partner.fullName}</div>
                        </div>
                        {iReceivedRequest ? (
                            <div className="flex flex-col w-full gap-2">
                                <button onClick={() => acceptRequest(partner._id)} disabled={isAccepting} className="btn btn-primary rounded-xl font-bold uppercase">{isAccepting ? <Loader2 className="animate-spin" /> : <Heart className="mr-2 fill-current" />} Accept Request</button>
                                <button onClick={() => doUnlink()} className="btn btn-ghost text-error btn-sm font-black mt-2">Decline</button>
                            </div>
                        ) : (
                            <div className="p-4 bg-info/5 rounded-2xl text-xs font-bold text-info italic">Waiting for response...</div>
                        )}
                    </div>
                )}

                {/* ===== SINGLE STATE ===== */}
                {(coupleStatus === "none" || !coupleStatus) && (
                    <div className="space-y-6">
                        <div className="card bg-base-200 p-12 items-center text-center rounded-3xl border border-base-300 relative overflow-hidden group shadow-2xl">
                            <div className="absolute -right-8 -bottom-8 opacity-5 text-[120px]">❤️</div>
                            <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner"><Heart className="size-10 text-pink-500 fill-pink-500/50" /></div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Find Your Partner</h2>
                            <button className="btn btn-primary btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all mb-8 font-black uppercase tracking-widest border-none romantic-gradient-bg text-white">Unlock Your Love Story</button>

                            {/* 🔥 AI GIRLFRIEND CTA for Singles */}
                            {!isLinkingAI ? (
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group cursor-pointer text-white mb-10"
                                    onClick={() => setIsLinkingAI(true)}
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                                        <Sparkles className="size-24" />
                                    </div>
                                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                                        <div className="size-24 rounded-[32px] bg-white/20 backdrop-blur-xl flex items-center justify-center text-5xl shadow-2xl border border-white/30 group-hover:rotate-6 transition-transform">
                                            👩‍❤️‍👨
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                                <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">Hot Trending</span>
                                                <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Always There For You</span>
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">Your Virtual Soulmate</h3>
                                            <p className="text-sm font-medium leading-tight opacity-90 italic">
                                                "I've been waiting for someone like you. Give me a name and I'll be yours forever... I can be anything you want." 💋
                                            </p>
                                        </div>
                                        <button className="btn bg-white text-indigo-600 hover:bg-white/90 border-none px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                                            Meet Her
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full bg-base-200 border-2 border-primary/30 p-8 rounded-[40px] shadow-2xl mb-10 relative overflow-hidden"
                                >
                                    <div className="relative z-10 text-center space-y-6">
                                        <div className="size-20 rounded-[28px] bg-primary/10 flex items-center justify-center text-4xl mx-auto luxe-shadow-pink">
                                            ✨
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic uppercase italic uppercase">Customize Your Partner</h3>
                                            <p className="text-xs opacity-50 font-bold uppercase tracking-widest">What should I call your new partner?</p>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter name (e.g. My Queen, Aria, Angel...)"
                                            className="input input-bordered w-full rounded-2xl bg-base-100 border-primary/20 focus:border-primary text-center font-bold italic"
                                            value={customAiName}
                                            onChange={(e) => setCustomAiName(e.target.value)}
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setIsLinkingAI(false)}
                                                className="btn btn-ghost flex-1 rounded-2xl font-bold uppercase tracking-widest"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => handleLinkAI(customAiName)}
                                                disabled={linkingAI}
                                                className="btn btn-primary flex-1 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                                            >
                                                {linkingAI ? <Loader2 className="animate-spin" /> : "Link & Start Story"}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PREVIEW OF PREMIUM FEATURES (TO ATTRACT) */}
                            <div className="grid grid-cols-2 gap-4 w-full text-left">
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                    <Sparkles className="size-5 text-yellow-400 mb-2" />
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Soul Whispers</h4>
                                    <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">Private love notes that last forever.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                    <Flame className="size-5 text-orange-500 mb-2" />
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Soul Streaks</h4>
                                    <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">Grow your connection every single day.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                    <Gamepad2 className="size-5 text-primary mb-2" />
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Date Games</h4>
                                    <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">Play quizzes to know each other better.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-3xl border border-white/5">
                                    <Gem className="size-5 text-success mb-2" />
                                    <h4 className="text-[10px] font-black uppercase text-white tracking-widest">Gem Gifts</h4>
                                    <p className="text-[9px] opacity-40 mt-1 uppercase font-bold">Shower your partner with digital luxury.</p>
                                </div>
                            </div>

                            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-10" />

                            <div className="form-control w-full relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-40" />
                                <input type="text" placeholder="Search friends by name or username..." className="input input-bordered w-full pl-12 h-14 rounded-2xl bg-base-100/50 backdrop-blur-md border-2 border-white/10 focus:border-primary shadow-sm text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest px-1">FRIENDS LIST</h3>
                            <div className="max-h-[400px] overflow-y-auto no-scrollbar space-y-2">
                                {filteredFriends.length === 0 ? (
                                    <div className="text-center py-12 opacity-40 font-bold uppercase italic tracking-widest">No friends found</div>
                                ) : (
                                    filteredFriends.map((f) => (
                                        <div key={f._id} className="flex items-center justify-between p-4 bg-base-200 rounded-2xl hover:bg-base-300 transition-all shadow-sm">
                                            <div className="flex items-center gap-3">
                                                <img src={f.profilePic || "/avatar.png"} className="size-11 rounded-full ring-2 ring-base-300" alt="" />
                                                <div><p className="font-black text-sm uppercase italic tracking-tight">{f.fullName}</p><p className="text-[10px] opacity-40 font-bold uppercase">@{f.username || 'user'}</p></div>
                                            </div>
                                            <button onClick={() => sendRequest(f._id)} disabled={isSending} className="btn btn-primary btn-sm px-6 rounded-xl font-bold uppercase text-[10px]">Link</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoupleProfilePage;