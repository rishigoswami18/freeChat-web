import { memo } from "react";
import { motion } from "framer-motion";
import { Trophy, Users2, Zap } from "lucide-react";
import { fadeUp } from "../../animations/landingAnimations";

const FantasySection = memo(() => {
    return (
        <section className="py-24 bg-base-100 overflow-hidden">
            <div className="container mx-auto px-6 sm:px-12 lg:px-20">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <motion.div 
                        className="flex-1 text-left"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <div className="text-secondary font-black uppercase tracking-widest text-sm mb-4">Precision Engineering</div>
                        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 leading-tight">
                            The Ultimate <br />
                            <span className="text-secondary italic">Fantasy Suite</span>
                        </h2>
                        
                        <div className="space-y-8">
                            {[
                                {
                                    title: "11-Player Squad Creation",
                                    desc: "Choose your captain, vice-captain, and balance your budget. Real-time player performance tracking based on our proprietary algorithms.",
                                    icon: <Users2 className="size-6 text-secondary" />
                                },
                                {
                                    title: "Live Point System",
                                    desc: "Watch your rank climb in real-time. Every wicket, every boundary, and every dot ball counts toward your victory.",
                                    icon: <Zap className="size-6 text-secondary" />
                                },
                                {
                                    title: "Skill-Based Rewards",
                                    desc: "BondBeyond is a Game of Skill. Leverage your sports knowledge to win engagement rewards and platform badges.",
                                    icon: <Trophy className="size-6 text-secondary" />
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6">
                                    <div className="size-14 shrink-0 rounded-2xl bg-secondary/10 flex items-center justify-center">
                                        {item.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                                        <p className="opacity-60 leading-relaxed text-sm sm:text-base">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div 
                        className="flex-1 relative"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative z-10 p-4 rounded-[3rem] bg-gradient-to-br from-secondary/20 to-primary/20 border border-white/10 backdrop-blur-sm">
                            <div className="bg-base-300 rounded-[2.5rem] overflow-hidden border border-base-content/10 shadow-2xl">
                                <div className="p-6 bg-base-200 border-b border-base-content/5 flex justify-between items-center">
                                    <span className="font-bold text-sm">Contest #8492</span>
                                    <span className="badge badge-error badge-sm">Live</span>
                                </div>
                                <div className="p-8 space-y-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-xs opacity-50 uppercase tracking-tighter">My Team</p>
                                            <p className="text-3xl font-black italic">1,482 <span className="text-sm not-italic opacity-40">pts</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs opacity-50">Rank</p>
                                            <p className="text-xl font-bold text-success">#4</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-base-100 border border-base-content/5">
                                                <div className="size-10 rounded-full bg-base-300" />
                                                <div className="flex-1">
                                                    <div className="h-3 w-24 bg-base-300 rounded-full mb-2" />
                                                    <div className="h-2 w-16 bg-base-200 rounded-full" />
                                                </div>
                                                <div className="text-right font-bold text-sm">+24</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 bg-secondary/20 rounded-full blur-[100px] -z-10" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

FantasySection.displayName = "FantasySection";
export default FantasySection;
