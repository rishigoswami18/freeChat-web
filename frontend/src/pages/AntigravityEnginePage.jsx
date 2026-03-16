import React from 'react';
import AntigravityPrediction from '../components/AntigravityPrediction';
import { motion } from 'framer-motion';
import { Box, Globe, Shield, Sparkles } from 'lucide-react';

const AntigravityEnginePage = () => {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 lg:p-20 font-outfit overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
                
                {/* Visual Section */}
                <div className="lg:col-span-12 text-center space-y-6 mb-20">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-black text-xs uppercase tracking-[0.4em]"
                    >
                        <Globe className="size-4 animate-spin-slow" /> System Status: Weightless
                    </motion.div>
                    <h1 className="text-8xl font-black tracking-tighter leading-[0.85] bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                        Antigravity<br/>Engine
                    </h1>
                </div>

                <div className="lg:col-span-7 space-y-12">
                     <div className="space-y-4">
                        <h2 className="text-4xl font-black tracking-tight flex items-center gap-4">
                            Smart Defaulting <Sparkles className="size-8 text-indigo-500" />
                        </h2>
                        <p className="text-xl text-white/40 font-medium leading-relaxed">
                            Our Gemini-driven predictive layer calculates your next intent before your thumb moves. 
                            Favorite team: <span className="text-white">CSK</span>. Current context: <span className="text-white">Death Overs</span>. 
                            Result: Immediate access to high-stakes predictions.
                        </p>
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="p-8 bg-white/5 rounded-[3rem] border border-white/5 space-y-4">
                            <Box className="size-8 text-indigo-500" />
                            <h4 className="font-black text-2xl tracking-tighter">100ms API</h4>
                            <p className="text-sm font-bold text-white/30">Redis Pub/Sub architecture ensures score updates faster than the broadcast.</p>
                        </div>
                        <div className="p-8 bg-white/5 rounded-[3rem] border border-white/5 space-y-4">
                            <Shield className="size-8 text-green-500" />
                            <h4 className="font-black text-2xl tracking-tighter">Ghost Mode</h4>
                            <p className="text-sm font-bold text-white/30">Predictions are anchored to the blockchain in the background, zero lag.</p>
                        </div>
                     </div>
                </div>

                <div className="lg:col-span-5 relative">
                    <div className="absolute -inset-10 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
                    <AntigravityPrediction />
                </div>

            </div>
        </div>
    );
};

export default AntigravityEnginePage;
