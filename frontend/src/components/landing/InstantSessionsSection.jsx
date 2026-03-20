import { memo } from "react";
import { motion } from "framer-motion";
import { Timer, Zap, BarChart3 } from "lucide-react";
import { fadeUp } from "../../animations/landingAnimations";

const InstantSessionsSection = memo(() => {
    return (
        <section className="py-24 bg-base-200/50">
            <div className="container mx-auto px-6 sm:px-12 lg:px-20">
                <div className="text-center mb-16">
                    <motion.div 
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Micro-Predictions: <span className="text-accent italic">Instant Thrill</span>
                        </h2>
                        <p className="opacity-70 max-w-xl mx-auto">
                            Don't wait for the whole match to end. Predict the next 3 overs or 6 overs and get instant results.
                        </p>
                    </motion.div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-stretch">
                    {[
                        {
                            title: "6-Over Flash",
                            period: "Powerplay Special",
                            desc: "Predict boundaries and wickets in the first 6 overs to double your engagement rewards.",
                            accent: "border-accent/30 bg-accent/5",
                            icon: <Timer className="text-accent" />
                        },
                        {
                            title: "3-Over Sprint",
                            period: "Death Overs",
                            desc: "High-speed predictions for the end of the innings. Perfect for fans who love fast-paced action.",
                            accent: "border-primary/30 bg-primary/5",
                            icon: <Zap className="text-primary" />
                        },
                        {
                            title: "Live Odds Analysis",
                            period: "Real-time Metrics",
                            desc: "Leverage AI-driven insights to see how the pitch is behaving before making your next move.",
                            accent: "border-secondary/30 bg-secondary/5",
                            icon: <BarChart3 className="text-secondary" />
                        }
                    ].map((session, idx) => (
                        <motion.div 
                            key={idx}
                            className={`flex-1 p-8 rounded-[2.5rem] border ${session.accent} flex flex-col items-center text-center`}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <div className="size-16 rounded-full bg-base-100 flex items-center justify-center mb-6 shadow-inner">
                                {session.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-1">{session.title}</h3>
                            <div className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-4">{session.period}</div>
                            <p className="text-sm opacity-60 leading-relaxed mb-6">{session.desc}</p>
                            <div className="mt-auto">
                                <button className="btn btn-sm btn-ghost no-animation opacity-20 cursor-default">
                                    Flash Enabled
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

InstantSessionsSection.displayName = "InstantSessionsSection";
export default InstantSessionsSection;
