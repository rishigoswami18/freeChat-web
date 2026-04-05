import React from "react";
import { motion } from "framer-motion";
import { Zap, Target, Users, BarChart3, Globe, Sparkles, ShieldCheck, Heart } from "lucide-react";

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white py-20 px-6 sm:px-12 overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-violet-600/5 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-[0.4em] mb-6 inline-block">
                            Our Mission
                        </span>
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-[1.05]">
                            FreeChat — Empowing <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-500">Indian Creators</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-lg text-white/40 font-medium leading-relaxed">
                            We are building the infrastructure for India's digital future, where every interaction adds value and every community has the tools to thrive.
                        </p>
                    </motion.div>
                </div>

                {/* Core Narrative */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-40">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold tracking-tight">Beyond Just Social Media</h2>
                        <p className="text-xl text-white/60 leading-relaxed font-medium">
                            FreeChat is India's premier social platform designed for the next generation of creators, professionals, and communities.
                        </p>
                        <p className="text-lg text-white/40 leading-relaxed">
                            Traditional platforms treat users as data points. At FreeChat, we prioritize <strong>verified identity</strong>, <strong>local discovery</strong>, and a <strong>built-in economy</strong> that rewards contribution. Whether you're a student, a professional, or a digital creator, FreeChat provides the tools you need to grow your influence and impact.
                        </p>
                        <div className="flex flex-wrap gap-4 pt-4">
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/60">
                                <ShieldCheck size={14} className="text-indigo-400" /> Verified Network
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-semibold text-white/60">
                                <Globe size={14} className="text-indigo-400" /> Made in India
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
                        <div className="bg-white/[0.02] border border-white/10 rounded-[3rem] p-10 md:p-12 relative z-10 backdrop-blur-3xl shadow-2xl">
                            <Sparkles className="size-10 text-indigo-400 mb-8" />
                            <h3 className="text-2xl font-bold leading-snug mb-8">"Technology should serve people, not lead them. We build for connection, not just attention."</h3>
                            <div className="flex items-center gap-4">
                                <div className="size-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                    <Heart className="size-6 text-indigo-400 fill-indigo-400/20" />
                                </div>
                                <div>
                                    <p className="font-bold text-lg">Team FreeChat</p>
                                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Phagwara, Punjab</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vision Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <ValueCard 
                        icon={Zap} 
                        title="Hyperlocal Reach" 
                        desc="Connect with what's happening around you. Our discovery engine prioritizes your local community."
                        color="indigo"
                    />
                    <ValueCard 
                        icon={Target} 
                        title="Creator Economy" 
                        desc="Built-in monetization tools from day one. Your content has value, and you should own it."
                        color="violet"
                    />
                    <ValueCard 
                        icon={Users} 
                        title="Trusted Circle" 
                        desc="A verification system that builds real trust. No bots, no noise, just authentic Indian voices."
                        color="emerald"
                    />
                </div>

                {/* Stats Section */}
                <div className="mt-40 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] text-center">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                        {[
                            { label: "Active Users", val: "10K+" },
                            { label: "Daily Chats", val: "50K+" },
                            { label: "Local Hubs", val: "100+" },
                            { label: "Uptime", val: "99.9%" }
                        ].map((s, i) => (
                            <div key={i} className="space-y-2">
                                <p className="text-4xl font-bold text-white tracking-tight">{s.val}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ValueCard = ({ icon: Icon, title, desc, color }) => (
    <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 group hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500">
        <div className={`size-16 rounded-2xl mb-8 flex items-center justify-center bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform duration-500`}>
            <Icon className="size-8" />
        </div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-sm text-white/40 leading-relaxed font-medium">{desc}</p>
    </div>
);

export default AboutPage;
