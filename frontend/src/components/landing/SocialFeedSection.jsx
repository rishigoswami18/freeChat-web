import { memo } from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, ShieldCheck } from "lucide-react";
import { fadeUp } from "../../animations/landingAnimations";

const SocialFeedSection = memo(() => {
    return (
        <section className="py-24 bg-base-200/50 relative overflow-hidden">
            <div className="container mx-auto px-6 sm:px-12 lg:px-20">
                <div className="text-center mb-16">
                    <motion.h2 
                        className="text-3xl sm:text-4xl font-bold mb-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        The <span className="text-primary italic">Expert Wall</span>
                    </motion.h2>
                    <p className="opacity-70 max-w-2xl mx-auto">
                        Don't just predict alone. Follow India's top sports analysts, mirror their strategies, and climb the global leaderboard.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            name: "Rohan K.",
                            stats: "88% Accuracy",
                            title: "IPL Strategy Expert",
                            desc: "Followed by 12.4K users for deep-dive pitch analysis.",
                            icon: <TrendingUp className="text-success" />
                        },
                        {
                            name: "Sneha M.",
                            stats: "Winner of Mega Contest",
                            title: "Fantasy Pro",
                            desc: "Specializes in 11-player squad optimization for T20 formats.",
                            icon: <ShieldCheck className="text-primary" />
                        },
                        {
                            name: "Global Community",
                            stats: "500K+ Active Fans",
                            title: "Social Ecosystem",
                            desc: "Real-time chat, expert opinions, and live match discussions.",
                            icon: <Users className="text-secondary" />
                        }
                    ].map((expert, idx) => (
                        <motion.div 
                            key={idx}
                            className="p-8 rounded-3xl bg-base-100 border border-base-content/5 shadow-xl shadow-base-content/5"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="size-12 rounded-2xl bg-base-200 flex items-center justify-center mb-6">
                                {expert.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-1">{expert.name}</h3>
                            <div className="text-xs font-black uppercase tracking-widest text-primary mb-4">{expert.stats}</div>
                            <p className="font-semibold mb-2">{expert.title}</p>
                            <p className="text-sm opacity-60 leading-relaxed">{expert.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

SocialFeedSection.displayName = "SocialFeedSection";
export default SocialFeedSection;
