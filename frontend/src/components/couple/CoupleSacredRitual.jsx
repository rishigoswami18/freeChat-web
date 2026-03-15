import { memo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle, MessageSquare, ArrowRight } from "lucide-react";

/**
 * CoupleSacredRitual
 * Daily relationship question and chat entrypoint.
 */
const CoupleSacredRitual = memo(({ insightData, authUser, partnerId }) => {
    return (
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
                            <motion.img whileHover={{ scale: 1.2, zIndex: 20 }} src={authUser?.profilePic || "/avatar.png"} className="size-8 rounded-full border-2 border-white/20 shadow-xl" loading="lazy" decoding="async" />
                            <motion.img whileHover={{ scale: 1.2, zIndex: 20 }} src={insightData?.partner?.profilePic || "/avatar.png"} className="size-8 rounded-full border-2 border-white/20 shadow-xl" loading="lazy" decoding="async" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <motion.h3 className="text-2xl sm:text-3xl font-black italic leading-tight text-base-content tracking-tighter">
                            “{insightData?.question?.text || "What is one thing you appreciate about your partner today?"}”
                        </motion.h3>
                        <p className="text-[11px] font-black opacity-30 uppercase tracking-[0.3em]">Ignite a soul-to-soul conversation</p>
                    </div>

                    <Link
                        to={`/chat/${partnerId || 'ai-user-id'}`}
                        className="btn romantic-gradient-bg text-white border-none btn-lg px-8 rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-105 active:scale-95 transition-all gap-3 group/btn"
                    >
                        <MessageSquare className="size-5 group-hover:rotate-12 transition-transform" />
                        Open Sacred Chat
                        <ArrowRight className="size-5 group-hover:translate-x-2 transition-transform" />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
});

CoupleSacredRitual.displayName = "CoupleSacredRitual";
export default CoupleSacredRitual;
