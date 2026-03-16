import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, FileText, Mic, Sparkles, CheckCircle2, ArrowRight, Shield, Rocket } from 'lucide-react';

const CareerAssistant = () => {
    const [activeTab, setActiveTab] = useState('resume');

    const features = {
        resume: {
            title: "AI Resume Architect",
            desc: "Optimized for ATS systems using the BondBeyond AI Engine.",
            items: ["Keyword Optimization", "Format Cleanup", "Skill Gap Analysis"],
            icon: FileText,
            color: "text-blue-400"
        },
        interview: {
            title: "Mock Interview AI",
            desc: "Practice with Dr. Bond (AI Career Coach) in real-time.",
            items: ["Tone Analysis", "Body Language Feedback", "Industry Questions"],
            icon: Mic,
            color: "text-purple-400"
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-12 font-outfit">
            <div className="max-w-6xl mx-auto space-y-12">
                
                {/* Compliance-Friendly Header */}
                <header className="space-y-4">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.3em]"
                    >
                        <Shield className="size-4" /> SECURE PRODUCTIVITY SUITE
                    </motion.div>
                    <h1 className="text-5xl font-black tracking-tighter">AI Career Focus</h1>
                    <p className="text-white/40 text-lg max-w-2xl font-medium">
                        Empowering students to transition from academic excellence to professional success through advanced AI mentorship.
                    </p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Navigation */}
                    <div className="lg:col-span-4 space-y-4">
                        {Object.entries(features).map(([key, data]) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`w-full p-6 rounded-[2rem] border transition-all text-left group relative overflow-hidden ${
                                    activeTab === key 
                                    ? 'bg-white/10 border-white/20' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-4 relative z-10">
                                    <div className={`p-3 rounded-2xl bg-white/5 ${activeTab === key ? data.color : 'text-white/30'}`}>
                                        <data.icon className="size-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">{data.title}</h3>
                                        <p className="text-xs text-white/40 font-medium">Utility Tool</p>
                                    </div>
                                </div>
                                {activeTab === key && (
                                    <motion.div layoutId="active" className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent pointer-none" />
                                )}
                            </button>
                        ))}

                        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-[2rem] mt-12 shadow-2xl relative overflow-hidden group">
                           <Rocket className="absolute -bottom-6 -right-6 size-32 text-white/10 group-hover:rotate-12 transition-transform" />
                           <h4 className="font-black text-xl mb-2 italic">BondBeyond Plus</h4>
                           <p className="text-sm font-bold text-white/70 mb-6">Unlock 10+ AI Career Tools and unlimited Mock Interviews.</p>
                           <button className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black shadow-lg">UPGRADE NOW</button>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 bg-white/5 border border-white/5 rounded-[3rem] p-10 relative overflow-hidden">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-10"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tight">{features[activeTab].title}</h2>
                                        <p className="text-white/40 font-medium">{features[activeTab].desc}</p>
                                    </div>
                                    <Sparkles className="size-8 text-indigo-500" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {features[activeTab].items.map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <CheckCircle2 className="size-5 text-green-500" />
                                            <span className="font-bold text-sm">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-10 border-2 border-dashed border-white/10 rounded-[2.5rem] text-center space-y-6">
                                    <div className="size-20 bg-white/5 rounded-full mx-auto flex items-center justify-center">
                                       <FileText className="size-10 text-white/20" />
                                    </div>
                                    <p className="font-bold text-white/40 uppercase tracking-widest text-sm">Drag and drop files to begin analysis</p>
                                    <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black hover:bg-white/10 transition-all">
                                        Browse Documents
                                    </button>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CareerAssistant;
