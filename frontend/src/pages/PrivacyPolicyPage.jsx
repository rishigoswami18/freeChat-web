import React from "react";
import { ShieldCheck, Eye, Lock, FileText } from "lucide-react";

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4">Privacy Policy</h1>
                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs">Data Protection Shield | Effective: March 16, 2026</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5">
                            <ShieldCheck className="size-48" />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">1. Our Commitment</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed relative z-10">
                            At <strong>BondBeyond</strong>, we recognize that privacy is a cornerstone of trust. We collect minimal user data—such as your Favorite Team and Location—solely to personalize the <strong>'Antigravity'</strong> visualizations and ensure you get relevant regional updates. 
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <Eye className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">2. Data Non-Disclosure</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            We have a strict non-disclosure policy. We **do not sell, rent, or trade** user data to third parties or advertising conglomerates. Your fan journey and analytical history remain strictly between you and the BondBeyond platform.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <Lock className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">3. Transactional Security</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            All financial transactions for 'Bond Coins' are processed through industry-standard, **PCI-DSS compliant gateways (Razorpay)**. 
                        </p>
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/10">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Encryption Standards</p>
                            <p className="text-sm text-white/70 leading-relaxed">
                                We utilize 256-bit SSL encryption to protect your identity and payment information. BondBeyond never stores sensitive card details on its servers.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <FileText className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">4. Your Rights</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            You have the right to request access to your data or its deletion at any time. Simply contact our support team to clear your vault and personal profile from our analytical engine.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center">
                    <p className="text-white/30 text-center mb-6">For detailed data inquiries, reach out to our DPO at:</p>
                    <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-indigo-400">
                        privacy@freechatweb.in
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
