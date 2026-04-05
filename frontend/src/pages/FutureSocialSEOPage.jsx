import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Link } from "react-router-dom";
import { Zap, ShieldCheck, Globe, Cpu, Users, EyeOff, Bot, Store, DollarSign, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const FutureSocialSEOPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center selection:bg-indigo-500/30">
            <DynamicSEO 
                title="The Future of Social Business | Next-Gen Professional Platform 2026"
                description="What is the future of social media? Discover FreeChat, the premier Indian platform for creators and businesses that merges community with economy."
                keywords="future of social business, next gen social platform India, professional social network, creator economy 2026, FreeChat social"
            />

            <section className="py-32 text-center px-6 max-w-5xl relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-10"
                >
                    <div className="bg-indigo-500/10 p-5 rounded-[2.5rem] border border-indigo-500/20 shadow-2xl">
                        <Rocket className="size-14 text-indigo-400" />
                    </div>
                </motion.div>
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-[1.05]"
                >
                    The Evolution of <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500">Social Commerce.</span>
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-white/40 max-w-2xl mx-auto mb-14 font-medium leading-relaxed"
                >
                    Traditional social platforms are built for consumption. FreeChat is architected for **Contribution** and **Commerce**. We are rebuilding the digital town square as a thriving professional ecosystem.
                </motion.p>
            </section>

            <div className="container px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-40">
                {[
                    { icon: Store, title: "Business Hub", desc: "Launch your brand instantly with specialized tools for service listings and digital showrooms." },
                    { icon: ShieldCheck, title: "Verified Trust", desc: "A network of verified professionals. No bots, no scams—just authentic business connections." },
                    { icon: DollarSign, title: "Creator Economy", desc: "Direct monetization through rewards and the FreeChat coin ecosystem. Your influence is your asset." },
                    { icon: Zap, title: "Local Reach", desc: "Hyperlocal discovery that connects you with customers and collaborators in your immediate vicinity." },
                    { icon: Globe, title: "Global Scaling", desc: "Communicate across borders with real-time AI translation and professional networking tools." },
                    { icon: Users, title: "Community First", desc: "Niche communities that foster deep engagement rather than superficial visibility." }
                ].map((item, i) => (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className="bg-white/[0.02] p-12 rounded-[3.5rem] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500 group"
                    >
                        <div className="size-16 rounded-2xl flex items-center justify-center mb-8 bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
                            <item.icon className="size-8" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 tracking-tight">{item.title}</h3>
                        <p className="text-white/30 leading-relaxed font-medium">{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            <section className="py-24 bg-white/[0.02] border-y border-white/5 w-full relative">
                <div className="container px-6 max-w-4xl mx-auto text-center space-y-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">A Message from the Architect</div>
                    <blockquote className="text-3xl md:text-4xl font-bold leading-tight tracking-tight text-white/80">
                        "The next decade belongs to the creators who treat their passion as a business. FreeChat is the OS for that future."
                    </blockquote>
                    <div className="space-y-1">
                        <p className="font-bold tracking-[0.2em] uppercase text-xs text-white">Hrishikesh Giri</p>
                        <p className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Founder & Lead Developer</p>
                    </div>
                </div>
            </section>

            <section className="py-40 text-center container px-6">
                <div className="space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Ready to build your <span className="text-indigo-500">legacy?</span></h2>
                        <p className="text-white/30 max-w-md mx-auto font-medium">Join 10,000+ creators and business owners building the future of India's professional network.</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Link to="/signup" className="h-16 px-14 inline-flex items-center bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold shadow-2xl shadow-indigo-500/20 transition-all gap-3">
                            Launch Your Business <Zap size={20} />
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default FutureSocialSEOPage;
