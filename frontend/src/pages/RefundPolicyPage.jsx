import React from "react";
import { RefreshCcw, ShieldCheck, HelpCircle } from "lucide-react";

const RefundPolicyPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-4xl mx-auto">
                <div className="mb-16">
                    <h1 className="text-5xl font-black italic tracking-tighter mb-4">Refund Policy</h1>
                    <p className="text-amber-500 font-bold uppercase tracking-[0.3em] text-xs">Customer Assurance | © 2026 Zyro</p>
                </div>

                <div className="space-y-12">
                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <RefreshCcw className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">1. Enterprise Subscriptions & API Usage</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            Because we provide immediate access to our digital premium features and services as soon as you pay, all subscription fees are generally **non-refundable** once your billing cycle starts.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <ShieldCheck className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">2. Cancellation & Refund Timeline</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            You can cancel your subscription at any time. If you got charged by accident, or a technical glitch stopped you from accessing what you paid for, just reach out to us within 3 days! Once we approve your refund, Razorpay will process it and send the money back to your original payment method within **5-7 business days**.
                        </p>
                        <div className="p-4 bg-white/[0.03] rounded-2xl border border-white/5 text-xs text-white/40 italic">
                            Note: Having your Razorpay Transaction ID ready helps us solve your issue much faster.
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                                <HelpCircle className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">3. Discrepancy Support</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            If you ever face an issue like double billing or a payment not going through, please shoot us an email right away. We use Razorpay to make sure all transactions and disputes are handled securely and fairly.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-white/5 border border-white/10 rounded-[40px] text-center">
                    <p className="text-white/40 mb-4">Payment disputes? Email our support hub:</p>
                    <a href="mailto:official.zyro@gmail.com" className="text-xl font-bold text-white hover:text-amber-500 transition-colors">official.zyro@gmail.com</a>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
