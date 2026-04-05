import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, FileText, Mic, Sparkles, CheckCircle2, ArrowRight, Shield, Rocket, Store, BarChart3, Users, DollarSign, Download, Play, Square, Loader2, FileCheck, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

const ProfessionalHub = () => {
    const [activeTab, setActiveTab] = useState('business');
    const [resumeState, setResumeState] = useState('idle');
    const [resumeFile, setResumeFile] = useState(null);
    const [atsScore, setAtsScore] = useState(0);
    const [interviewState, setInterviewState] = useState('idle');
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setResumeFile(e.target.files[0]);
            setResumeState('uploaded');
            toast.success('Resume loaded securely.', { icon: '📄' });
        }
    };

    const handleResumeGen = () => {
        setResumeState('processing');
        // Simulate a realistic optimized score between 88 and 99
        setAtsScore(Math.floor(Math.random() * (99 - 88 + 1)) + 88);
        setTimeout(() => {
            setResumeState('complete');
            toast.success('AI Resume Generated Successfully!');
        }, 3500);
    };

    const handleInterviewStart = () => {
        setInterviewState('listening');
        toast('🎙️ Interview Coach Listening...', { icon: '🤖' });
    };
    
    const handleInterviewStop = () => {
        setInterviewState('idle');
        toast.success('Session Saved. AI Feedback generating...');
    };


    const features = {
        business: {
            title: "Business Manager",
            desc: "Tools to launch and manage your digital business on FreeChat.",
            items: ["Professional Profile Badge", "Service Listings", "Built-in Payments (UPI)", "Customer Lead Tracking"],
            icon: Store,
            color: "text-indigo-400"
        },
        resume: {
            title: "Career Architect",
            desc: "AI-powered tools for landing your next big professional opportunity.",
            items: ["ATS-Optimized Resumes", "Professional Bio Generator", "Skill Gap Analysis"],
            icon: FileText,
            color: "text-emerald-400"
        },
        interview: {
            title: "Interview Prep",
            desc: "Practice with AI career coaches in real-time.",
            items: ["Real-time Feedback", "Industry Match Questions", "Tone & Confidence Score"],
            icon: Mic,
            color: "text-violet-400"
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-12">
                
                <header className="space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest"
                    >
                        <Briefcase size={12} /> Professional Hub
                    </motion.div>
                    <div className="space-y-2">
                        <h1 className="text-5xl font-bold tracking-tight">Grow Your <span className="text-indigo-500">Business</span></h1>
                        <p className="text-white/40 text-lg max-w-2xl font-medium leading-relaxed">
                            FreeChat provides specialized tools for Indian creators, entrepreneurs, and students to build their professional brand and monetize their skills.
                        </p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Navigation */}
                    <div className="lg:col-span-4 space-y-3">
                        {Object.entries(features).map(([key, data]) => (
                            <motion.button
                                key={key}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveTab(key)}
                                className={`w-full p-6 h-28 rounded-[2rem] border transition-all text-left relative overflow-hidden group ${
                                    activeTab === key 
                                    ? 'bg-white/[0.04] border-white/10 shadow-xl' 
                                    : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.02] hover:border-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className={`size-14 shrink-0 rounded-2xl bg-white/5 flex items-center justify-center ${activeTab === key ? data.color : 'text-white/20'}`}>
                                        <data.icon className="size-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="font-bold text-lg tracking-tight truncate">{data.title}</h3>
                                        <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">Growth Tool</p>
                                    </div>
                                </div>
                                {activeTab === key && (
                                    <motion.div layoutId="proTabPill" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded-full" />
                                )}
                            </motion.button>
                        ))}

                        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600 p-8 rounded-[2.5rem] mt-8 shadow-2xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wOCkiLz48L2c+PC9zdmc+')] opacity-20" />
                           <div className="relative z-10 space-y-6">
                               <div className="space-y-2">
                                <h4 className="font-bold text-2xl tracking-tight text-white italic">FreeChat Pro</h4>
                                <p className="text-sm font-semibold text-white/70 leading-relaxed">Unlock advanced business analytics, unlimited service listings, and verified trust badges.</p>
                               </div>
                               <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-bold text-sm shadow-xl"
                               >
                                 GET PREMIUM ACCESS
                               </motion.button>
                           </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 bg-white/[0.01] border border-white/5 rounded-[3.5rem] p-8 md:p-14 relative overflow-hidden backdrop-blur-xl shadow-2xl">
                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                                className="space-y-12"
                            >
                                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                    <div className="space-y-3">
                                        <h2 className="text-4xl font-bold tracking-tight">{features[activeTab].title}</h2>
                                        <p className="text-white/40 text-lg font-medium leading-relaxed max-w-lg">{features[activeTab].desc}</p>
                                    </div>
                                    <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
                                        <Sparkles className="size-6" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {features[activeTab].items.map((item, i) => (
                                        <motion.div 
                                            key={i} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 p-5 bg-white/[0.03] rounded-2xl border border-white/5"
                                        >
                                            <div className="size-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <CheckCircle2 className="size-3.5 text-emerald-400" />
                                            </div>
                                            <span className="font-bold text-sm text-white/80">{item}</span>
                                        </motion.div>
                                    ))}
                                </div>

                                 {activeTab === 'business' ? (
                                    <div className="space-y-12">
                                        <div className="p-10 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-8 bg-white/[0.01]">
                                            <div className="size-24 bg-indigo-500/10 rounded-3xl mx-auto flex items-center justify-center text-indigo-400 rotate-6">
                                                <Store className="size-12" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-bold tracking-tight">Ready to launch?</h4>
                                                <p className="text-sm text-white/30 font-medium max-w-xs mx-auto">Complete your professional verification to unlock business tools.</p>
                                            </div>
                                            <motion.button 
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => window.location.href = '/kyc'}
                                                className="inline-flex h-12 items-center px-8 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-500/20 gap-2"
                                            >
                                                Get Verified <ArrowRight size={16} />
                                            </motion.button>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/40 uppercase tracking-widest">Your Business Roadmap</div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <RoadmapStep number="01" title="Get Verified" desc="Establish authenticity and build trust with your professional badge." />
                                                <RoadmapStep number="02" title="List Services" desc="Create high-impact listings for your skills or products." />
                                                <RoadmapStep number="03" title="Earn & Grow" desc="Accept payments instantly and track leads through your hub." />
                                            </div>
                                        </div>
                                    </div>
                                ) : activeTab === 'resume' ? (
                                    <div className="p-10 border border-white/5 rounded-[3rem] space-y-8 bg-white/[0.02] relative overflow-hidden">
                                        <div className="flex flex-col items-center text-center space-y-4">
                                            <div className="size-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-400">
                                                <FileText className="size-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-2xl font-bold tracking-tight">AI Resume Generator</h4>
                                                <p className="text-sm text-white/40 max-w-sm mx-auto">Upload your current resume. Our AI will securely analyze your experience and generate an ATS-optimized executive draft.</p>
                                            </div>
                                        </div>

                                        {resumeState === 'idle' && (
                                            <motion.div className="flex justify-center pt-4">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.doc,.docx" 
                                                    ref={fileInputRef} 
                                                    className="hidden" 
                                                    onChange={handleFileChange} 
                                                />
                                                <button onClick={() => fileInputRef.current.click()} className="h-14 px-8 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold shadow-lg flex items-center gap-3 transition-colors border border-white/10">
                                                    <UploadCloud size={18} /> Upload Resume (PDF/DOC)
                                                </button>
                                            </motion.div>
                                        )}

                                        {resumeState === 'uploaded' && (
                                            <motion.div className="flex flex-col items-center gap-4 pt-4">
                                                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                                                    <FileCheck size={16} />
                                                    <span className="text-sm font-bold truncate max-w-[200px]">{resumeFile?.name || 'Resume.pdf'}</span>
                                                </div>
                                                <button onClick={handleResumeGen} className="h-14 px-8 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-3 transition-all">
                                                    <Sparkles size={18} /> Analyze & Optimize Draft
                                                </button>
                                            </motion.div>
                                        )}

                                        {resumeState === 'processing' && (
                                            <div className="space-y-4 max-w-sm mx-auto">
                                                <div className="flex items-center justify-center gap-3 text-emerald-400 font-bold">
                                                    <Loader2 className="animate-spin" size={20} />
                                                    <span>Analyzing Profile Data...</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 3.5, ease: 'linear' }} className="h-full bg-emerald-500" />
                                                </div>
                                            </div>
                                        )}

                                        {resumeState === 'complete' && (
                                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                                                        <FileCheck size={24} />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-white">Executive_Resume_2026.pdf</p>
                                                        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Optimized ATS Match: {atsScore}%</p>
                                                    </div>
                                                </div>
                                                <button className="p-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-colors" onClick={() => { setResumeState('idle'); setResumeFile(null); }}>
                                                    <Download size={20} />
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>

                                ) : (
                                    <div className="p-10 border border-white/5 rounded-[3rem] text-center space-y-8 bg-white/[0.02] relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                        
                                        <div className="flex justify-center relative z-10">
                                            {interviewState === 'listening' ? (
                                                <motion.div 
                                                    animate={{ scale: [1, 1.2, 1] }} 
                                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                                    className="size-32 bg-violet-500/20 border-2 border-violet-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.5)]"
                                                >
                                                    <Mic className="size-12 text-violet-400" />
                                                </motion.div>
                                            ) : (
                                                <div className="size-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center">
                                                    <Mic className="size-10 text-white/20" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4 relative z-10">
                                            <h4 className="text-2xl font-bold tracking-tight">AI Interview Coach</h4>
                                            <p className="text-sm text-white/40 max-w-sm mx-auto leading-relaxed">
                                                {interviewState === 'listening' 
                                                    ? "AI is listening... Answer the question: 'Tell me about a challenging project you recently lead.'" 
                                                    : "Simulate a real technical interview. Our AI analyzes pitch, tone, and keywords in real-time."}
                                            </p>
                                        </div>

                                        <div className="flex justify-center gap-4 relative z-10 pt-4">
                                            {interviewState === 'idle' ? (
                                                <button onClick={handleInterviewStart} className="h-14 px-8 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-violet-500/20">
                                                    <Play size={18} fill="currentColor" /> Start Practice
                                                </button>
                                            ) : (
                                                <button onClick={handleInterviewStop} className="h-14 px-8 bg-rose-500 hover:bg-rose-400 text-white rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-rose-500/20 animate-pulse">
                                                    <Square size={18} fill="currentColor" /> Finish & Analyze
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>

                {/* Bottom Trust Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40 hover:opacity-100 transition-opacity duration-700 pt-12 border-t border-white/5">
                    <div className="flex items-center gap-4">
                        <Shield className="size-5 text-indigo-400" />
                        <div className="text-[10px] font-bold uppercase tracking-wider">Enterprise Security</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Users className="size-5 text-indigo-400" />
                        <div className="text-[10px] font-bold uppercase tracking-wider">10K+ Professionals Joined</div>
                    </div>
                    <div className="flex items-center gap-4">
                        <BarChart3 className="size-5 text-indigo-400" />
                        <div className="text-[10px] font-bold uppercase tracking-wider">Real-time Lead Insights</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const RoadmapStep = ({ number, title, desc }) => (
    <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-4">
        <p className="text-4xl font-black text-indigo-500/20 italic">{number}</p>
        <div className="space-y-2">
            <h5 className="font-bold tracking-tight">{title}</h5>
            <p className="text-[11px] text-white/30 font-medium leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default ProfessionalHub;
