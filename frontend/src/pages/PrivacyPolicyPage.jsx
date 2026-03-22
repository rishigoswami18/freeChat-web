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
                            <h2 className="text-2xl font-black italic">1. Enterprise Data Collection</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed relative z-10">
                            At <strong>Zyro Technologies Pvt. Ltd.</strong>, we strongly believe in protecting your privacy. We only collect basic information—like your profile details and standard usage logs—just to help personalize your experience, secure your account, and keep the app running smoothly.
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
                            We have a strict privacy policy. We **do not sell, rent, or trade** your personal data or chats to anyone. Your messages and personal information always stay strictly between you and Zyro.
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
                            Whenever you buy something on our app, the payment is processed directly through our secure, industry-standard partner **Razorpay**. 
                        </p>
                        <div className="p-6 bg-white/[0.03] rounded-3xl border border-white/10">
                            <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Encryption Standards</p>
                            <p className="text-sm text-white/70 leading-relaxed">
                                We use modern SSL encryption to protect your data. Zyro never stores your credit card details or bank passwords on our servers.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <FileText className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">4. Your Rights & Data Deletion</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            You totally own your data. You have the right to request a copy of it or ask us to delete your account entirely at any time. Just drop us an email, and we'll take care of it for you.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-white/5 border border-white/10 rounded-[40px] flex flex-col items-center">
                    <p className="text-white/30 text-center mb-6">For detailed data inquiries, reach out to our DPO at:</p>
                    <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl font-black italic text-indigo-400">
                        freechatweb00@gmail.com
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
