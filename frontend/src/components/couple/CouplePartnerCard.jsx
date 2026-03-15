import { memo } from "react";
import { motion } from "framer-motion";
import { Heart, BadgeCheck, PenLine, CalendarHeart, Infinity as InfinityIcon, Calendar, Compass, Rocket, CheckCircle2 } from "lucide-react";

/**
 * CouplePartnerCard
 * Contains the profile pictures, names, anniversary, milestones, and bucket list.
 */
const CouplePartnerCard = memo(({ authUser, partner, coupleData, onRenameAI }) => {
    
    // Memoized computation inside block 
    const daysTogether = (() => {
        if (!coupleData?.anniversary) return 0;
        return Math.floor((Date.now() - new Date(coupleData.anniversary)) / (1000 * 60 * 60 * 24));
    })();

    return (
        <div className="card bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 shadow-xl overflow-hidden rounded-3xl">
            <div className="card-body items-center text-center p-8">
                <div className="flex items-center gap-6 mb-4">
                    <div className="avatar">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                            <img src={authUser?.profilePic || "/avatar.png"} alt="You" loading="lazy" decoding="async" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        <Heart className="size-6 sm:size-10 text-pink-500 fill-pink-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60 mt-1">Linked</span>
                    </div>
                    <div className="avatar">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full ring ring-pink-500/30 ring-offset-4 ring-offset-base-100 shadow-2xl overflow-hidden">
                            <img src={partner?.profilePic || "/avatar.png"} alt="Partner" loading="lazy" decoding="async" />
                        </div>
                    </div>
                </div>

                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight uppercase flex items-center justify-center gap-1">
                    {authUser?.fullName?.split(' ')[0] || "You"}
                    {(authUser?.isVerified || authUser?.role === "admin") && (
                        <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                    )}
                    <span className="mx-1">&</span>
                    {partner?.fullName?.split(' ')[0] || "Partner"}
                    {(partner?.isVerified || partner?.role === "admin") && (
                        <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                    )}
                    {coupleData?.isCoupledWithAI && (
                        <button
                            onClick={onRenameAI}
                            className="ml-2 btn btn-ghost btn-xs text-primary/40 hover:text-primary transition-all p-0"
                            title="Rename AI Partner"
                        >
                            <PenLine className="size-3" />
                        </button>
                    )}
                </h2>
                
                {partner?.bio && <p className="text-xs sm:text-sm opacity-60 mt-1 italic">"{partner.bio}"</p>}

                <div className="mt-6 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 w-full flex flex-col items-center gap-1 shadow-inner">
                    <div className="flex items-center gap-2 text-pink-400">
                        <CalendarHeart className="size-5" />
                        <span className="text-xs font-black uppercase tracking-tighter">OUR JOURNEY</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold uppercase">{daysTogether} Days of Togetherness</p>
                    {coupleData?.anniversary && (
                        <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">
                            Since {new Date(coupleData.anniversary).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    )}
                </div>
            </div>

            {/* ===== ATTRACTION FEATURES (SOUL JOURNEY) ===== */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10 w-full px-2">
                {/* Soul Milestones */}
                <motion.div
                    whileHover={{ y: -5 }}
                    className="romantic-card-luxe rounded-[40px] p-8 border-2 border-white/5 relative overflow-hidden group shadow-2xl mx-1 mb-1"
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
                    className="romantic-card-luxe rounded-[40px] p-8 border-2 border-white/5 relative overflow-hidden group shadow-2xl mx-1 mb-1"
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
            <div className="px-3 pb-3">
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    className="mt-6 border-2 border-white/5 bg-gradient-to-br from-indigo-500/10 via-base-200 to-purple-600/10 rounded-[40px] p-8 overflow-hidden relative group cursor-pointer shadow-2xl w-full"
                >
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="size-20 rounded-[28px] bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-shrink-0 items-center justify-center text-white text-4xl shadow-2xl transition-transform group-hover:rotate-12">
                            🔮
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-2 mb-2">
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
        </div>
    );
});

CouplePartnerCard.displayName = "CouplePartnerCard";
export default CouplePartnerCard;
