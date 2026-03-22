import React from "react";
import { Scale, ShieldAlert, Users, Info } from "lucide-react";

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4">Terms & Conditions</h1>
                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs">Compliance Guard | Effective: March 16, 2026</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <Scale className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">1. Enterprise Software License</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            Welcome to Zyro, operated by <strong>Zyro Technologies Pvt. Ltd.</strong> ("we," "us," or "our"). We provide a high-status social platform for strategic connections and AI-driven growth. By using our app and website, you agree to these simple terms.
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Whether you are subscribing via Razorpay or just syncing with your Zyro Bestie, these rules help keep our community elite and secure.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                                <ShieldAlert className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">2. Acceptable Use Policy</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            We want Zyro to be a high-status, secure place for elite networking. Please do not use our platform for anything illegal, spamming, or harming others.
                        </p>
                        <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20">
                            <p className="text-sm font-bold text-red-400">
                                Zero-Tolerance: © 2026 Zyro. Zero-tolerance for inappropriate content, fraudulent activities, scams, or NSFW material. We will immediately suspend accounts that violate our professionalism standards.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <Users className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">3. Billing & Payments</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            Whenever you purchase a premium feature or subscription, your payment is processed safely through our trusted partner, <strong>Razorpay</strong>. Subscriptions renew automatically unless you cancel them. Standard taxes (like 18% GST) apply as per Indian laws.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <Info className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">4. Limitation of Liability & Jurisdiction</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            We work hard to keep our app running 24/7 without issues, but we provide our services "as-is" without any guaranteed warranties. If things go wrong due to third-party services, we won't be held liable. These Terms are governed by the laws of India, with jurisdiction in Phagwara, Punjab.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 rounded-[40px] text-center">
                    <h3 className="text-xl font-bold mb-4">Questions about our Terms?</h3>
                    <p className="text-white/40 mb-8 max-w-md mx-auto">Got any questions? Just shoot us an email and our team will be quickly in touch.</p>
                    <a href="mailto:freechatweb00@gmail.com" className="text-indigo-400 font-bold hover:underline">freechatweb00@gmail.com</a>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
