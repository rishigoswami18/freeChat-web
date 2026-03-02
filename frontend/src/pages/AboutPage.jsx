import { motion } from "framer-motion";
import { Heart, Shield, Zap, Users, Sparkles, Globe } from "lucide-react";
import Logo from "../components/Logo";

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
};

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-base-100">
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden bg-gradient-to-b from-primary/10 to-transparent">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        className="flex justify-center mb-6"
                    >
                        <Logo className="size-16" fontSize="text-4xl" />
                    </motion.div>
                    <motion.h1
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                        className="text-4xl md:text-6xl font-black mb-6 tracking-tight"
                    >
                        Redefining Human <span className="text-primary italic">Connection</span>
                    </motion.h1>
                    <motion.p
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                        className="text-lg opacity-80 max-w-2xl mx-auto leading-relaxed"
                    >
                        freeChat isn't just another messaging app. It's a platform built for real bonds,
                        private conversations, and making your relationships stronger every single day.
                    </motion.p>
                </div>
            </section>

            {/* Our Vision */}
            <section className="py-20 container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
                        <p className="opacity-70 text-lg leading-relaxed mb-6">
                            In a world of algorithmic feeds and superficial interactions, freeChat was born
                            from a simple idea: <strong>Privacy and connection should be free for everyone.</strong>
                        </p>
                        <p className="opacity-70 text-lg leading-relaxed">
                            We believe that your personal conversations should stay personal, your data
                            should be yours alone, and that the best tools for communication shouldn't
                            be locked behind a paywall.
                        </p>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Heart, label: "Empathy First", color: "text-red-400" },
                            { icon: Shield, label: "Privacy Core", color: "text-blue-400" },
                            { icon: Zap, label: "Lightning Fast", color: "text-yellow-400" },
                            { icon: Globe, label: "Global Reach", color: "text-green-400" },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="bg-base-200 p-6 rounded-2xl flex flex-col items-center text-center hover:bg-base-300 transition-colors"
                            >
                                <item.icon className={`size-8 ${item.color} mb-3`} />
                                <span className="font-bold text-sm tracking-wide">{item.label}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why We Built This */}
            <section className="py-20 bg-base-200/50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-3xl font-bold mb-12 text-center text-primary italic">Why BondBeyond?</h2>
                        <div className="space-y-12">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="bg-primary/20 p-4 rounded-2xl">
                                    <Sparkles className="size-8 text-primary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-wider text-base-content/80">Emotional Intelligence</h3>
                                    <p className="opacity-70 leading-relaxed">
                                        Our AI-driven emotion detection helps users understand the tone
                                        behind messages, reducing misunderstandings and helping couples
                                        communicate more effectively.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="bg-accent/20 p-4 rounded-2xl">
                                    <Shield className="size-8 text-accent" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-wider text-base-content/80">The Hidden Chat App</h3>
                                    <p className="opacity-70 leading-relaxed">
                                        We understand that privacy is complex. Our <strong>Stealth Mode</strong>
                                        makes freeChat the perfect app for users who need a private space
                                        safe from prying eyes.
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="bg-secondary/20 p-4 rounded-2xl">
                                    <Users className="size-8 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold mb-2 uppercase tracking-wider text-base-content/80">Community Focused</h3>
                                    <p className="opacity-70 leading-relaxed">
                                        With Reels, Posts, and Story features, freeChat is more than a messenger;
                                        it's a vibrant community where you can express yourself freely and
                                        connect with like-minded individuals worldwide.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer-like CTA */}
            <section className="py-24 text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 italic uppercase tracking-widest opacity-40">Connecting the world</h2>
                    <p className="text-xl opacity-80 mb-12 max-w-xl mx-auto leading-relaxed">
                        Join the thousands of users already building stronger relationships on freeChat.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="btn btn-primary btn-lg rounded-2xl px-8 italic font-black uppercase">
                            Join Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
