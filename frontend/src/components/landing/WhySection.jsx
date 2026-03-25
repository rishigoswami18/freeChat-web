import { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";
import { Eye, Shield, Globe, Star } from "lucide-react";

const whyReasons = [
    {
        icon: Eye,
        title: "No Algorithmic Feed",
        desc: "See what your friends actually post. No hidden algorithms deciding what you see.",
    },
    {
        icon: Shield,
        title: "Your Data Stays Yours",
        desc: "We don't sell your data. Zyro is built on trust and user privacy.",
    },
    {
        icon: Globe,
        title: "Connect Globally",
        desc: "Meet people from around the world. Break language barriers with built-in translation.",
    },
    {
        icon: Star,
        title: "Premium Features, Zero Cost",
        desc: "What other apps lock behind paywalls, Zyro gives you for free. Always.",
    },
];

const WhySection = memo(() => {
    return (
        <section className="py-20 sm:py-28">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-14"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 section-heading section-heading-center">
                        Why Choose <span className="text-primary">Zyro</span>?
                    </h2>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {whyReasons.map((item, i) => (
                        <motion.div
                            key={i}
                            className="flex gap-4 items-start p-5 rounded-2xl bg-base-200/40 border border-base-300/40 hover:border-primary/20 hover:bg-base-200/70 transition-all duration-300 group"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                        >
                            <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                                <item.icon className="size-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                <p className="opacity-60 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

WhySection.displayName = "WhySection";
export default WhySection;
