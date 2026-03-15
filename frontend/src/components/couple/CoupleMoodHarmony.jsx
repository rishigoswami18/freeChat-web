import { memo } from "react";
import { motion } from "framer-motion";
import { Waves, Sparkles } from "lucide-react";

export const moodEmojis = {
    happy: "😊",
    neutral: "😐",
    sad: "😢",
    angry: "😠",
    tired: "😴",
    excited: "🤩",
    romantic: "❤️"
};

/**
 * CoupleMoodHarmony
 * Renders the mood grid and the partner's current mood.
 */
const CoupleMoodHarmony = memo(({ authUser, partnerData, onUpdateMood, isUpdatingMood }) => {
    return (
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
                            onClick={() => onUpdateMood(key)}
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

                {partnerData && (
                    <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            <div className="avatar">
                                <div className="size-14 rounded-[22px] ring-2 ring-pink-500/30 ring-offset-4 ring-offset-transparent shadow-2xl">
                                    <img src={partnerData.profilePic || "/avatar.png"} alt="" className="object-cover" loading="lazy" decoding="async" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-pink-500 tracking-[0.2em] flex items-center gap-1.5">
                                    <span className="size-1.5 bg-pink-500 rounded-full animate-ping" />
                                    Partner's Frequency
                                </p>
                                <p className="font-bold text-lg tracking-tight">
                                    {partnerData?.fullName?.split(' ')[0] || "Partner"} is {partnerData?.mood ? (
                                        <span className="italic font-black text-pink-500">vibrating {partnerData.mood}...</span>
                                    ) : (
                                        <span className="opacity-30">silent right now</span>
                                    )}
                                </p>
                            </div>
                        </div>
                        {partnerData?.mood && (
                            <motion.span
                                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-6xl drop-shadow-[0_0_20px_rgba(255,78,80,0.4)]"
                            >
                                {moodEmojis[partnerData.mood]}
                            </motion.span>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
});

CoupleMoodHarmony.displayName = "CoupleMoodHarmony";
export default CoupleMoodHarmony;
