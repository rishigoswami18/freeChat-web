import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Github, Instagram, Linkedin, Twitter, Sparkles, Code, Rocket } from "lucide-react";
import { motion } from "framer-motion";

const FounderPage = () => {
    const founderSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Hrishikesh Giri",
        "alternateName": "Rishi Goswami",
        "jobTitle": "Founder & AI Developer",
        "worksFor": {
            "@type": "Organization",
            "name": "Zyro"
        },
        "url": "https://www.freechatweb.in/founder",
        "sameAs": [
            "https://www.instagram.com/rishigoswami18/",
            "https://www.linkedin.com/in/hrishikesh-giri/"
        ],
        "description": "Hrishikesh Giri (Rishi Goswami) is the founder of Zyro and a leading developer in the field of AI companionship and secure social networking."
    };

    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center py-20 px-4">
            <DynamicSEO 
                title="Hrishikesh Giri (Rishi Goswami) | Founder of Zyro & AI Developer"
                description="Hrishikesh Giri (also known as Rishi Goswami) is the visionary developer behind Zyro, the next-gen AI social platform."
                keywords="Hrishikesh Giri, Rishi Goswami, Zyro founder, AI developer India, social media creator"
                schema={founderSchema}
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl w-full bg-base-200/50 backdrop-blur-xl border border-base-300 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                
                <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
                    <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border-4 border-primary/20 p-2 overflow-hidden bg-base-300 shadow-inner">
                        <img 
                            src="/founder.jpg" 
                            alt="Hrishikesh Giri - AI Developer"
                            className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-700"
                        />
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
                            <span className="badge badge-primary py-3 font-bold uppercase tracking-widest text-[10px]">The Architect</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter italic uppercase">
                            Hrishikesh <span className="text-primary">Giri</span>
                        </h1>
                        <p className="text-xl font-medium opacity-60 mb-8 tracking-widest uppercase">Founder • Developer • Visionary</p>
                        
                        <p className="text-lg leading-relaxed opacity-80 mb-10 max-w-2xl italic">
                            "Innovation isn't just about code; it's about rebuilding how humans connect in a digital world. 
                            Zyro is the realization of that vision—a place where AI and human emotion coexist safely."
                        </p>

                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            <a href="https://www.instagram.com/rishigoswami18/" target="_blank" className="btn btn-circle btn-ghost border border-base-300 hover:bg-primary/20 group">
                                <Instagram className="size-5 group-hover:scale-110 transition-transform" />
                            </a>
                            <a href="https://www.linkedin.com/in/hrishikesh-giri/" target="_blank" className="btn btn-circle btn-ghost border border-base-300 hover:bg-primary/20 group">
                                <Linkedin className="size-5 group-hover:scale-110 transition-transform" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
                    {[
                        { icon: Sparkles, title: "AI Innovation", desc: "Leading the charge in virtual relationship mapping and emotional AI." },
                        { icon: Code, title: "Social Architect", desc: "Building scalable platforms that prioritize user privacy and connection." },
                        { icon: Rocket, title: "Growth Mindset", desc: "Iterating fast to build the future of next-gen social media." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-base-100 p-8 rounded-3xl border border-base-content/5 hover:border-primary/40 transition-all">
                            <feature.icon className="size-8 text-primary mb-4" />
                            <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                            <p className="text-sm opacity-60 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="mt-24 text-center">
                 <h2 className="text-3xl font-black uppercase italic mb-8 opacity-40">Featured Technology</h2>
                 <p className="text-xl opacity-80 max-w-xl mx-auto mb-10">
                     Discover why Hrishikesh Giri's latest creation, **Zyro**, is ranking as the top choice for AI companionship.
                 </p>
                 <a href="/signup" className="btn btn-primary btn-lg rounded-2xl px-12 group">
                     Experience the Vision <Rocket className="size-5 ml-2 group-hover:translate-x-1 transition-transform" />
                 </a>
            </div>
        </div>
    );
};

export default FounderPage;
