import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Fingerprint, Camera, FileCheck, CheckCircle2, ArrowRight, Lock, ShieldAlert, Zap, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const KYCVerification = () => {
    const [step, setStep] = useState(1);
    const [status, setStatus] = useState('pending'); // pending, processing, success

    const handleNext = () => {
        if(step < 3) setStep(step + 1);
        else {
            setStatus('processing');
            setTimeout(() => {
                setStatus('success');
                toast.success("Verified! 🔒");
            }, 3000);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-medium">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-8 bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12"
                >
                    <div className="size-24 bg-indigo-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 rotate-3">
                        <CheckCircle2 className="size-12 text-white" />
                    </div>
                    <div className="space-y-3">
                        <h1 className="text-4xl font-bold tracking-tight">Trust Verified</h1>
                        <p className="text-white/40 leading-relaxed font-semibold">
                            You have completed the FreeChat Trust Verification. Your account is now fully verified and eligible for creator rewards.
                        </p>
                    </div>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => window.location.href = '/'}
                        className="w-full h-14 bg-indigo-500 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-500/20"
                    >
                        Return to Feed
                    </motion.button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white font-medium">
            <div className="max-w-lg w-full bg-white/[0.02] border border-white/5 p-10 md:p-14 rounded-[3.5rem] backdrop-blur-3xl space-y-12 relative overflow-hidden shadow-2xl">
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                    <ShieldCheck className="size-48" />
                </div>

                <div className="space-y-4 relative z-10 text-center md:text-left">
                    <div className="flex items-center gap-3 text-indigo-500 font-bold text-[10px] uppercase tracking-widest justify-center md:justify-start">
                        <Fingerprint className="size-4" /> IDENTITY VERIFICATION
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight">Safety & Trust</h2>
                    <p className="text-white/30 font-semibold text-sm">Step {step} of 3: {step === 1 ? 'Government Credentials' : step === 2 ? 'Liveness Check' : 'Final Review'}</p>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                    <motion.div 
                        initial={{ width: '33%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]" 
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
                    />
                </div>

                <div className="relative z-10 min-h-[220px] flex flex-col justify-center text-center">
                    <AnimatePresence mode="wait">
                        {status === 'processing' ? (
                            <motion.div 
                                key="processing"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-8"
                            >
                                <div className="relative">
                                    <motion.div 
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                                        className="size-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full mx-auto"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Lock size={20} className="text-indigo-400" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="font-bold text-2xl tracking-tight text-indigo-400">Verifying Identity</p>
                                    <p className="text-xs text-white/30 font-semibold uppercase tracking-widest">Applying trust protocols</p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key={`step-${step}`}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {step === 1 && (
                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 gap-4">
                                            <button className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] hover:bg-white/[0.06] hover:border-white/10 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                                                        <Globe size={20} />
                                                    </div>
                                                    <span className="font-bold text-lg">Aadhaar Card</span>
                                                </div>
                                                <FileCheck className="size-5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                            <button className="flex items-center justify-between p-6 bg-white/[0.03] border border-white/5 rounded-[1.5rem] opacity-30 cursor-not-allowed">
                                                <div className="flex items-center gap-4">
                                                    <div className="size-10 bg-white/5 rounded-xl flex items-center justify-center text-white/40">
                                                        <Zap size={20} />
                                                    </div>
                                                    <span className="font-bold text-lg text-white/40">Passport</span>
                                                </div>
                                                <Lock className="size-4 text-white/20" />
                                            </button>
                                        </div>
                                        <p className="text-[10px] text-white/20 font-bold leading-relaxed px-10 uppercase tracking-widest">
                                            *Data is processed securely through encrypted channels. FreeChat does NOT store raw identity documents.
                                        </p>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div className="space-y-8">
                                        <div className="size-44 rounded-full bg-white/[0.03] mx-auto border-2 border-dashed border-indigo-500/30 flex items-center justify-center overflow-hidden group shadow-inner">
                                            <Camera className="size-16 text-indigo-500 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="font-bold text-xl tracking-tight">Face Recognition</p>
                                            <p className="text-sm text-white/30 font-medium">Please align your face within the frame for a live scan.</p>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="space-y-8 bg-indigo-500/5 p-10 rounded-[2.5rem] border border-indigo-500/10">
                                        <div className="size-16 bg-amber-500/10 rounded-2xl mx-auto flex items-center justify-center text-amber-500">
                                            <ShieldAlert className="size-8" />
                                        </div>
                                        <div className="space-y-4 text-center">
                                            <h4 className="font-bold text-xl tracking-tight">Final Terms</h4>
                                            <p className="text-sm text-white/40 font-medium leading-relaxed">
                                                By completing this process, you confirm that you are over 18 years of age and agree to our Content Monetization & Professional Connection standards.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {status !== 'processing' && (
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full h-16 bg-white text-[#020617] rounded-3xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-3 relative z-10"
                    >
                        {step === 3 ? 'COMPLETE ACCOUNT VERIFICATION' : 'CONTINUE TO NEXT STEP'} <ArrowRight className="size-5" />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default KYCVerification;
