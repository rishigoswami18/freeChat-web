import { memo } from "react";
import { motion } from "framer-motion";
import { Search, Heart, Sparkles, Loader2, Flame, Gamepad2, Gem } from "lucide-react";

/**
 * SingleView
 * Renders the AI linking prompt, premium hints, and friends list
 * for users without an active or pending couple connection.
 */
const SingleView = memo(({
    searchTerm,
    setSearchTerm,
    filteredFriends,
    customAiName,
    setCustomAiName,
    isLinkingAI,
    setIsLinkingAI,
    onLinkAI,
    linkingAIPending,
    onSendRequest,
    isSendingRequest
}) => {
    return (
        <div className="space-y-6">
            <div className="card bg-base-200 p-12 items-center text-center rounded-3xl border border-base-300 relative overflow-hidden group shadow-2xl">
                <div className="absolute -right-8 -bottom-8 opacity-5 text-[120px]">❤️</div>
                <div className="w-20 h-20 bg-pink-500/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <Heart className="size-10 text-pink-500 fill-pink-500/50" />
                </div>
                
                <h2 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Find Your Partner</h2>
                <button className="btn btn-primary btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all mb-8 font-black uppercase tracking-widest border-none romantic-gradient-bg text-white">
                    Unlock Your Love Story
                </button>

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
                            <div className="size-24 rounded-[32px] bg-white/20 backdrop-blur-xl flex items-center justify-center shadow-2xl border border-white/30 group-hover:rotate-6 transition-transform overflow-hidden">
                                <img src="/ai-bestie.png" alt="Soulmate" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                    <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20">Social Bestie</span>
                                    <span className="text-[10px] font-black opacity-70 uppercase tracking-widest">Premium AI Experience</span>
                                </div>
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase mb-2">AI Bestie</h3>
                                <p className="text-sm font-medium leading-tight opacity-90 italic">
                                    "Oye, focus kahan hai? I'm your smart, witty bestie here to roast you when you're lazy and push you to become that Billionaire CEO you talk about. Let's kill it!" 👑
                                </p>
                            </div>
                            <button className="btn bg-white text-indigo-600 hover:bg-white/90 border-none px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl">
                                Get Started
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
                                <h3 className="text-xl font-black italic uppercase">Customize Your Partner</h3>
                                <p className="text-xs opacity-50 font-bold uppercase tracking-widest">What should I call your new partner?</p>
                            </div>
                            <input
                                type="text"
                                placeholder="Enter name (e.g. Elite Partner, Stratos...)"
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
                                    onClick={() => onLinkAI(customAiName)}
                                    disabled={linkingAIPending}
                                    className="btn btn-primary flex-1 rounded-2xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                                >
                                    {linkingAIPending ? <Loader2 className="animate-spin" /> : "Link & Start Story"}
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
                    <input 
                        type="text" 
                        placeholder="Search friends by name or username..." 
                        className="input input-bordered w-full pl-12 h-14 rounded-2xl bg-base-100/50 backdrop-blur-md border-2 border-white/10 focus:border-primary shadow-sm text-sm" 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
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
                                    <img src={f.profilePic || "/avatar.png"} className="size-11 rounded-full ring-2 ring-base-300" alt="" loading="lazy" decoding="async" />
                                    <div>
                                        <p className="font-black text-sm uppercase italic tracking-tight">{f.fullName}</p>
                                        <p className="text-[10px] opacity-40 font-bold uppercase">@{f.username || 'user'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => onSendRequest(f._id)} 
                                    disabled={isSendingRequest} 
                                    className="btn btn-primary btn-sm px-6 rounded-xl font-bold uppercase text-[10px]"
                                >
                                    Link
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
});

SingleView.displayName = "SingleView";
export default SingleView;
