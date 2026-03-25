import React from "react";
import { motion } from "framer-motion";
import { Zap, Target, Users, BarChart3, Globe } from "lucide-react";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="px-4 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mb-6 inline-block">
                            Our Mission
                        </span>
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-8 leading-[0.9]">
                            Zyro — Redefining the <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/20">Fan Experience</span>
                        </h1>
                    </motion.div>
                </div>

                {/* Core Narrative */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-black italic tracking-tighter">Beyond Passive Viewing</h2>
                        <p className="text-xl text-white/60 leading-relaxed font-medium">
                            Zyro is a cutting-edge Sports-Tech platform designed to bring fans closer to the game they love. Our mission is to transform passive sports viewing into an active, data-driven social experience.
                        </p>
                        <p className="text-lg text-white/40 leading-relaxed">
                            Powered by our proprietary <strong>Antigravity Engine</strong>, we provide real-time analytics, high-fidelity match visualizations, and a community-centric platform where fans can engage, predict, and connect based on their sporting knowledge and analytical skills.
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full" />
                        <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 relative z-10 backdrop-blur-3xl">
                            <h3 className="text-2xl font-black italic mb-6">"Every fan is an analyst. We provide the tools; you provide the insights."</h3>
                            <div className="flex items-center gap-4">
                                <div className="size-12 rounded-full bg-white/10" />
                                <div>
                                    <p className="font-bold">Team Zyro</p>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Founder & CEO</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Values / Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard 
                        icon={Zap} 
                        title="Antigravity Engine" 
                        desc="Proprietary tech stack delivering sub-200ms real-time sports data synchronization."
                        color="amber"
                    />
                    <ValueCard 
                        icon={Target} 
                        title="Skill Analytics" 
                        desc="Advanced tools for fans to validate their match IQ through data-driven predictions."
                        color="indigo"
                    />
                    <ValueCard 
                        icon={Globe} 
                        title="Regional Hubs" 
                        desc="Local language support and cultural shoutouts tailored for the diverse Indian fan base."
                        color="emerald"
                    />
                </div>
            </div>
        </div>
    );
};

const ValueCard = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 group hover:bg-white/[0.08] transition-all">
        <div className={`size-14 rounded-2xl mb-8 flex items-center justify-center bg-${color}-500/10 text-${color}-500 group-hover:scale-110 transition-transform`}>
            <Icon className="size-7" />
        </div>
        <h3 className="text-2xl font-black italic mb-4">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default AboutPage;
