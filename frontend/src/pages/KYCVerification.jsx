import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Fingerprint, Camera, FileCheck, CheckCircle2, ArrowRight, Lock } from 'lucide-react';
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
                toast.success("Identity Verified! 🔒", {
                    style: { borderRadius: '20px', background: '#333', color: '#fff' }
                });
            }, 3000);
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-outfit">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="size-24 bg-green-500 rounded-full mx-auto flex items-center justify-center">
                        <CheckCircle2 className="size-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-black tracking-tight">Trust Verified</h1>
                    <p className="text-white/40 font-bold leading-relaxed">
                        You have successfully completed the Zyro Trust Check. Your account is now fully compliant with international payment standards.
                    </p>
                    <button className="w-full py-5 bg-indigo-600 rounded-3xl font-black text-lg">Continue to Dashboard</button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 text-white font-outfit">
            <div className="max-w-lg w-full bg-white/5 border border-white/10 p-12 rounded-[3.5rem] backdrop-blur-3xl space-y-12 relative overflow-hidden">
                
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-12 opacity-10">
                    <Lock className="size-32" />
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 text-indigo-500 font-black text-xs uppercase tracking-[0.3em]">
                        <Fingerprint className="size-4" /> USER VERIFICATION
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter">Identity & Safety</h2>
                    <p className="text-white/40 font-bold text-sm">Step {step} of 3: {step === 1 ? 'Government ID' : step === 2 ? 'Liveness Check' : 'Final Review'}</p>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                    <motion.div 
                        initial={{ width: '33%' }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-indigo-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.5)]" 
                    />
                </div>

                <div className="relative z-10 min-h-[250px] flex flex-col justify-center text-center space-y-8">
                    {status === 'processing' ? (
                        <div className="space-y-6">
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="size-20 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"
                            />
                            <p className="font-black text-xl italic animate-pulse tracking-tight">Hashing Trust Vectors...</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 gap-4">
                                        <button className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                                            <span className="font-bold">Aadhaar Card (India)</span>
                                            <FileCheck className="size-5 text-indigo-400" />
                                        </button>
                                        <button className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl opacity-50 cursor-not-allowed">
                                            <span className="font-bold">Passport</span>
                                            <Lock className="size-4" />
                                        </button>
                                    </div>
                                    <p className="text-xs text-white/30 font-bold leading-relaxed px-10">
                                        *Encoded data is handled by our PCI-compliant processing layer. Zyro does not store plain-text identity documents.
                                    </p>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-8">
                                    <div className="size-40 rounded-full bg-white/5 mx-auto border-2 border-dashed border-indigo-500/50 flex items-center justify-center overflow-hidden">
                                        <Camera className="size-16 text-indigo-500" />
                                    </div>
                                    <p className="font-bold text-lg">Align your face in the frame</p>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/5">
                                    <ShieldAlert className="size-10 text-orange-400 mx-auto" />
                                    <h4 className="font-bold text-xl">Confirm Details</h4>
                                    <p className="text-sm text-white/40">By proceeding, you agree to our Content Moderation Policy and verify that you are above 18 years of age.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {status !== 'processing' && (
                    <button 
                        onClick={handleNext}
                        className="w-full py-5 bg-white text-black rounded-3xl font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl relative z-10"
                    >
                        {step === 3 ? 'COMPLETE VERIFICATION' : 'NEXT STEP'} <ArrowRight className="size-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default KYCVerification;
