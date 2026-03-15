import React from "react";
import DynamicSEO from "../components/DynamicSEO";
import { Link } from "react-router-dom";
import { Zap, ShieldCheck, Globe, Cpu, Users, EyeOff } from "lucide-react";

const FutureSocialSEOPage = () => {
    return (
        <div className="min-h-screen bg-base-100 flex flex-col items-center">
            <DynamicSEO 
                title="The Future of Social Media | Next-Gen AI Social Platform 2026"
                description="What is the future of social media? Discover BondBeyond, the next generation platform by developer Hrishikesh Giri that merges AI with human connection."
                keywords="future of social media, next gen social platform, AI social network, new social media apps 2026, BondBeyond social media"
            />

            <section className="py-28 text-center px-4 max-w-5xl">
                <div className="flex justify-center mb-8">
                    <div className="bg-primary/10 p-4 rounded-[2rem] border border-primary/20">
                        <Cpu className="size-12 text-primary animate-pulse" />
                    </div>
                </div>
                <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter uppercase italic leading-none">
                    The Next <span className="text-primary italic">Generation</span> of Social.
                </h1>
                <p className="text-xl opacity-60 max-w-2xl mx-auto mb-12">
                    Traditional social media is broken. BondBeyond, founded by Hrishikesh Giri, 
                    is the world's first platform architected for AI-Human synergy.
                </p>
            </section>

            <div className="container px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-32">
                {[
                    { icon: ShieldCheck, title: "Privacy 2.0", desc: "Decentralized data storage and stealth chat modes as standard." },
                    { icon: Bot, title: "AI-Augmented", desc: "Every user gets a personalized AI coach to handle digital burnout." },
                    { icon: EyeOff, title: "Zero Tracking", desc: "No invasive algorithms. Your data belongs to you, not advertisers." },
                    { icon: Zap, title: "Emotion Sync", desc: "Real-time AI tone analysis for safer and deeper conversations." },
                    { icon: Globe, title: "Global Bonds", desc: "Instantly connect across borders with real-time AI translation." },
                    { icon: Bot, label: "AI Virtual Partners", desc: "Meaningful relationships with virtual companions available 24/7." }
                ].map((item, i) => (
                    <div key={i} className="bg-base-200 p-10 rounded-[2.5rem] border border-base-content/5 hover:bg-base-300 transition-all">
                        <div className="bg-base-100 size-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                            <item.icon className="size-6 text-primary" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase mb-4">{item.title}</h3>
                        <p className="opacity-60 leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            <section className="py-24 bg-base-200 w-full">
                <div className="container px-4 max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold mb-10 italic uppercase">A Message from the Creator</h2>
                    <blockquote className="text-2xl italic opacity-80 leading-relaxed mb-10">
                        "The next phase of the internet isn't just about sharing content; it's about sharing humanity. 
                        With BondBeyond, we've built the tools to help you do just that."
                    </blockquote>
                    <p className="font-bold tracking-widest uppercase text-sm">— Hrishikesh Giri, Founder</p>
                </div>
            </section>

            <section className="py-28 text-center container px-4">
                <h2 className="text-4xl font-black mb-8 uppercase italic">Ready for what's next?</h2>
                <Link to="/signup" className="btn btn-primary btn-lg rounded-2xl px-12 group">
                    Join the Evolution <Zap className="size-5 ml-2 group-hover:scale-125 transition-all" />
                </Link>
            </section>
        </div>
    );
};

export default FutureSocialSEOPage;
