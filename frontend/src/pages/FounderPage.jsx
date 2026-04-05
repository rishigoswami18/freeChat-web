import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Github, Instagram, Linkedin, Twitter, Sparkles, Code, Rocket, Heart, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";

const FounderPage = () => {
    const founderSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Hrishikesh Giri",
        "alternateName": "Rishi Goswami",
        "jobTitle": "Founder & Lead Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "FreeChat"
        },
        "url": "https://www.freechatweb.in/founder",
        "sameAs": [
            "https://www.instagram.com/rishigoswami18/",
            "https://www.linkedin.com/in/hrishikesh-giri/"
        ],
        "description": "Hrishikesh Giri (Rishi Goswami) is the founder of FreeChat and a pioneer in building community-first social infrastructure and creator economies in India."
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center py-20 px-6 sm:px-12">
            <DynamicSEO 
                title="Hrishikesh Giri (Rishi Goswami) | Founder of FreeChat"
                description="Hrishikesh Giri is the visionary developer behind FreeChat, India's next-gen social platform for verified creators and communities."
                keywords="Hrishikesh Giri, Rishi Goswami, FreeChat founder, AI developer India, creator economy India"
                schema={founderSchema}
            />

            <motion.div 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-5xl w-full bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-8 md:p-16 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/5 rounded-full -ml-40 -mb-40 blur-[100px]"></div>
                
                <div className="flex flex-col md:flex-row gap-12 lg:gap-20 items-center relative z-10">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-[2.5rem] blur-xl group-hover:blur-2xl transition-all duration-700"></div>
                        <div className="w-56 h-56 md:w-72 md:h-72 rounded-[2.5rem] border-2 border-white/10 p-2 overflow-hidden bg-[#0f172a] shadow-2xl relative z-10">
                            <img 
                                src="/founder.jpg" 
                                alt="Hrishikesh Giri"
                                className="w-full h-full object-cover rounded-[2rem] filter grayscale hover:grayscale-0 transition-all duration-1000"
                            />
                        </div>
                        <div className="absolute -bottom-4 -right-4 bg-indigo-500 size-12 rounded-2xl flex items-center justify-center text-white shadow-xl z-20">
                            <Star size={20} className="fill-current" />
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest">The Architect</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
                                Hrishikesh <span className="text-indigo-500">Giri</span>
                            </h1>
                            <p className="text-lg font-semibold text-white/30 tracking-[0.2em] uppercase">Founder & Lead Developer</p>
                        </div>
                        
                        <p className="text-xl md:text-2xl leading-relaxed text-white/70 max-w-2xl font-medium italic">
                            "Technology is most powerful when it empowers communities. FreeChat isn't just an app; it's a movement to return digital ownership to Indian creators."
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <a href="https://www.instagram.com/rishigoswami18/" target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
                                <Instagram className="size-5 text-white/40 group-hover:text-white transition-all" />
                            </a>
                            <a href="https://www.linkedin.com/in/hrishikesh-giri/" target="_blank" rel="noopener noreferrer" className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group">
                                <Linkedin className="size-5 text-white/40 group-hover:text-white transition-all" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                    {[
                        { icon: Sparkles, title: "Community First", desc: "Building scalable infrastructure that prioritizes local discovery and real connections." },
                        { icon: Code, title: "Social Architect", desc: "Crafting secure, verified social ecosystems that protect user privacy and identity." },
                        { icon: Rocket, title: "Economy Enabler", desc: "Pioneering built-in monetization tools to foster India's growing creator economy." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/[0.01] p-8 rounded-[2.5rem] border border-white/5 hover:border-indigo-500/30 transition-all duration-500 group">
                            <feature.icon className="size-8 text-indigo-500 mb-6 group-hover:scale-110 transition-transform" />
                            <h3 className="font-bold text-lg mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-sm text-white/30 leading-relaxed font-medium">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="mt-24 text-center space-y-8">
                 <div className="space-y-4">
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20">The Visionary Choice</h2>
                    <p className="text-2xl md:text-3xl font-bold max-w-2xl mx-auto tracking-tight">
                        Discover why **FreeChat** is becoming India's most trusted platform for social growth.
                    </p>
                 </div>
                 <motion.a 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    href="/signup" 
                    className="inline-flex h-14 items-center px-10 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/20 transition-all gap-3"
                 >
                     Join the Community <Rocket className="size-5" />
                 </motion.a>
            </div>
        </div>
    );
};

export default FounderPage;
