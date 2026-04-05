import React, { memo } from "react";
import { motion } from "framer-motion";
import { 
    BadgeCheck, 
    Share2, 
    Camera, 
    Edit3,
    Trophy,
    LogOut
} from "lucide-react";

/**
 * PremiumProfileHeader
 * High-impact profile header for the FreeChat Nexus.
 * Engineered for maximum stability and premium visual presence.
 */
const PremiumProfileHeader = ({ 
    authUser, 
    postsCount = 0, 
    onEditClick, 
    onShareClick, 
    onLogout 
}) => {
    // === DATA ROBUSTNESS LAYER ===
    const username = authUser?.username || "nexus_user";
    const fullName = authUser?.fullName || "Nexus Explorer";
    const bio = authUser?.bio || "Social pioneer navigating the FreeChat Nexus. Exploring community-driven social engines.";
    const role = authUser?.role || "Member";
    const isVerified = authUser?.isVerified || authUser?.role === "admin";
    const isPremium = authUser?.isPremium || false;
    
    // Stats calculation with triple-redundant null checks
    const followersCount = authUser?.followersCount ?? (Array.isArray(authUser?.friends) ? authUser.friends.length : 0);
    const walletBalance = authUser?.wallet?.totalBalance ?? 0;
    const profilePic = authUser?.profilePic || "/avatar.png";

    return (
        <section className="relative mb-12 sm:mb-20">
            {/* Cover Photo - High Impact Custom Imagery */}
            <div className="h-48 sm:h-72 w-full bg-[#050505] rounded-b-[40px] overflow-hidden relative border-b border-white/5">
                {authUser?.coverPhoto ? (
                    <img 
                        src={authUser.coverPhoto} 
                        alt="Profile Cover" 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0f172a] via-primary/20 to-[#020617]" />
                )}
                
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#020617] to-transparent opacity-60" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                
                {/* Visual Ambient Flourish */}
                {!authUser?.coverPhoto && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center opacity-10 pointer-events-none">
                        <Trophy size={160} className="text-primary blur-3xl opacity-30" />
                    </div>
                )}

                <button 
                  onClick={onEditClick}
                  className="absolute top-4 right-4 p-2.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white/60 hover:text-white transition-all z-20"
                >
                    <Camera size={18} />
                </button>
            </div>

            {/* Avatar & Identity Group */}
            <div className="container mx-auto px-6 -mt-16 sm:-mt-24 relative z-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        {/* Avatar Matrix */}
                        <div className="relative group self-center md:self-auto">
                            <motion.div 
                                whileHover={{ scale: 1.02 }}
                                className="size-32 sm:size-44 rounded-[40px] bg-[#020617] p-1.5 border-4 border-[#020617] shadow-2xl relative overflow-hidden ring-1 ring-white/10"
                            >
                                <img 
                                    src={profilePic} 
                                    alt={fullName} 
                                    className="w-full h-full object-cover rounded-[34px]"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </motion.div>
                            {isPremium && (
                                <motion.div 
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 p-2 rounded-2xl bg-primary text-white shadow-xl shadow-primary/20 ring-4 ring-[#020617]"
                                >
                                    <Trophy size={16} />
                                </motion.div>
                            )}
                        </div>

                        {/* Identity Context */}
                        <div className="text-center md:text-left space-y-2 mb-2">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <h1 className="text-3xl font-black text-white tracking-tighter italic">
                                    {fullName}
                                </h1>
                                {isVerified && (
                                    <BadgeCheck size={24} className="text-primary fill-primary/10" />
                                )}
                            </div>
                            <div className="flex items-center justify-center md:justify-start gap-3">
                                <p className="text-sm font-bold text-white/40 uppercase tracking-[0.15em]">@{username}</p>
                                <div className="h-1 w-1 rounded-full bg-white/20" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] px-2 py-0.5 rounded-lg bg-primary/10 border border-primary/20">
                                    {role}
                                </p>
                            </div>
                            <p className="text-sm text-white/60 font-medium max-w-sm mx-auto md:mx-0 pt-2 leading-relaxed">
                                {bio}
                            </p>
                        </div>
                    </div>

                    {/* Action Hub */}
                    <div className="flex items-center justify-center md:justify-end gap-3 mb-2">
                        <button 
                            onClick={onEditClick}
                            className="h-11 px-6 bg-white/5 border border-white/10 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all flex items-center gap-2"
                        >
                            <Edit3 size={16} />
                            Customize
                        </button>
                        <button 
                            onClick={onShareClick}
                            className="size-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-2xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
                        >
                            <Share2 size={18} />
                        </button>
                        <button 
                            onClick={onLogout}
                            className="size-11 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/10"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>

                {/* Performance Analytics - High Contrast Ledger */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/5 rounded-3xl mt-10 backdrop-blur-xl max-w-3xl">
                    <div className="flex flex-col items-center justify-center py-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group">
                        <p className="text-2xl font-black text-white tracking-tighter truncate">{postsCount}</p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Contributions</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group">
                        <p className="text-2xl font-black text-white tracking-tighter truncate">
                            {followersCount}
                        </p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-primary transition-colors">Network</p>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4 bg-white/[0.02] rounded-2xl border border-white/5 hover:bg-white/[0.05] transition-colors group">
                        <p className="text-2xl font-black text-primary tracking-tighter truncate">
                            ₹{(walletBalance / 10).toLocaleString()}
                        </p>
                        <p className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em] group-hover:text-emerald-500 transition-colors">Equity Hub</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default memo(PremiumProfileHeader);
