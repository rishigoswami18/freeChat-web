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
                            <h2 className="text-2xl font-black italic">1. Nature of Service: A Game of Skill</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            <strong>BondBeyond</strong> is strictly a <strong>"Game of Skill"</strong> platform. All predictions, engagement activities, and community challenges hosted on the platform require users to possess a deep understanding of player statistics, pitch conditions, historical performance data, and real-time match dynamics. 
                        </p>
                        <p className="text-white/70 leading-relaxed">
                            Success on the platform is directly proportional to the user's analytical ability and research. We do not host or facilitate any activities based on luck, chance, or random probability.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500">
                                <ShieldAlert className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">2. No Gambling Policy</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed mb-6">
                            BondBeyond strictly prohibits real-money wagering, betting, or any form of gambling. Our platform is designed for social engagement and merit-based recognition.
                        </p>
                        <div className="p-6 bg-red-500/10 rounded-3xl border border-red-500/20">
                            <p className="text-sm font-bold text-red-400">
                                Virtual Currency Usage: Our 'Bond Coins' are virtual loyalty rewards used exclusively for in-app customization, social recognition, and unlocking high-level analytical tools. They have no real-world monetary value and cannot be withdrawn as cash.
                            </p>
                        </div>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500">
                                <Users className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">3. Eligibility</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            Users must be <strong>18 years of age or older</strong> to access the platform. Furthermore, users must reside in states or territories where skill-based gaming is legally permitted and recognized. It is the user's responsibility to comply with local laws before using our premium analytical features.
                        </p>
                    </section>

                    <section className="bg-white/5 border border-white/10 rounded-[40px] p-8 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <Info className="size-6" />
                            </div>
                            <h2 className="text-2xl font-black italic">4. Limitation of Liability</h2>
                        </div>
                        <p className="text-white/70 leading-relaxed">
                            BondBeyond provides analytical data and match visualizations on an "as-is" basis. While we strive for 100% accuracy via our Antigravity Engine, we are not responsible for any decisions made by users based on the platform's insights.
                        </p>
                    </section>
                </div>

                <div className="mt-20 p-10 bg-gradient-to-br from-indigo-900/40 to-black border border-white/10 rounded-[40px] text-center">
                    <h3 className="text-xl font-bold mb-4">Questions about our Terms?</h3>
                    <p className="text-white/40 mb-8 max-w-md mx-auto">Our compliance team is here to help ensure you have a professional experience.</p>
                    <a href="mailto:support@freechatweb.in" className="text-indigo-400 font-bold hover:underline">support@freechatweb.in</a>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
