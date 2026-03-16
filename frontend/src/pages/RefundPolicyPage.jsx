import React from "react";
import { RefreshCcw, ShieldCheck, HelpCircle } from "lucide-react";

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4">Refund Policy</h1>
                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs">Customer Assurance | Effective: March 16, 2026</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <RefreshCcw className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">1. Virtual Assets (Bond Coins)</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            Since BondBeyond provides immediate access to digital tools, analytics, and social recognition upon the purchase of 'Bond Coins', all virtual currency transactions are **non-refundable**. Once a pack is credited to your vault, it is considered consumed.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">2. Exceptional Circumstances</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            We value our fans. In the rare event of a technical failure where your account is charged but coins are not credited (and verification fails), our team will manually credit the coins or initiate a reversal within **5-7 business days**.
                        </p>
                        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-xs text-white/40 italic">
                            Note: Transaction IDs from Razorpay are required for all investigation requests.
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <HelpCircle className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">3. Support Assistance</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            If you face any issues with your 'Elite Match Pass' or 'Vault Recharge', please reach out immediately. We are committed to resolving all valid payment discrepancies to maintain the integrity of the Antigravity ecosystem.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-white/5 border border-white/10 rounded-[40px] text-center">
                    <p className="text-white/40 mb-4">Payment disputes? Email our support hub:</p>
                    <a href="mailto:support@freechatweb.in" className="text-xl font-bold text-white hover:text-amber-500 transition-colors">support@freechatweb.in</a>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
