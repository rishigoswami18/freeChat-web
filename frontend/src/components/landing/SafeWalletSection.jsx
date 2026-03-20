import { memo } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, CreditCard, RefreshCcw } from "lucide-react";
import { fadeUp } from "../../animations/landingAnimations";

const SafeWalletSection = memo(() => {
    return (
        <section className="py-24 bg-base-100 overflow-hidden relative">
            <div className="container mx-auto px-6 sm:px-12 lg:px-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div 
                        className="order-2 lg:order-1"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <div className="relative">
                            <div className="p-8 rounded-[3rem] bg-gradient-to-br from-primary/10 to-accent/10 border border-base-content/5 relative z-10 overflow-hidden shadow-2xl">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="size-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                                        <Lock className="text-primary size-6" />
                                    </div>
                                    <span className="text-[10px] font-black tracking-widest uppercase opacity-40">BondBeyond Secured</span>
                                </div>
                                <div className="space-y-6">
                                    <div className="p-5 rounded-2xl bg-base-100 border border-base-content/5 flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-success/10 flex items-center justify-center">
                                            <CreditCard className="text-success size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs opacity-50">Instant Deposit</p>
                                            <p className="font-bold">UPI / Cards / NetBanking</p>
                                        </div>
                                        <div className="text-success font-black">ACTIVE</div>
                                    </div>
                                    <div className="p-5 rounded-2xl bg-base-100 border border-base-content/5 flex items-center gap-4">
                                        <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <RefreshCcw className="text-primary size-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs opacity-50">Withdrawal Status</p>
                                            <p className="font-bold">Instant Bank Transfer</p>
                                        </div>
                                        <div className="text-primary animate-pulse font-black">PROCESSING</div>
                                    </div>
                                </div>
                                <div className="mt-8 pt-8 border-t border-base-content/5 text-center">
                                    <p className="text-xs opacity-40 leading-relaxed italic">
                                        "Verified by 256-bit AES Encryption. <br />
                                        Your transactions are 100% safe."
                                    </p>
                                </div>
                            </div>
                            {/* Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-80 bg-primary/20 rounded-full blur-[100px] -z-10" />
                        </div>
                    </motion.div>

                    <motion.div 
                        className="order-1 lg:order-2"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="text-primary font-black uppercase tracking-widest text-sm mb-4">Enterprise Grade Security</div>
                        <h2 className="text-4xl sm:text-5xl font-extrabold mb-8 leading-tight">
                            Safe, Secure & <br />
                            <span className="text-primary italic">Lightning Fast</span>
                        </h2>
                        <ul className="space-y-6">
                            {[
                                {
                                    title: "ISO 27001 Protocols",
                                    desc: "We follow world-class data protection standards to keep your financial information encrypted and private.",
                                    icon: <ShieldAlert className="size-5 text-primary" />
                                },
                                {
                                    title: "No Hidden Fees",
                                    desc: "Transparent economy with 0% deposit fees. What you deposit is what you play with.",
                                    icon: <ShieldAlert className="size-5 text-primary" />
                                },
                                {
                                    title: "Verified Withdrawals",
                                    desc: "Quick and automated settlements to your linked bank account or UPI ID with 24/7 monitoring.",
                                    icon: <ShieldAlert className="size-5 text-primary" />
                                }
                            ].map((feature, idx) => (
                                <li key={idx} className="flex gap-4">
                                    <div className="mt-1">{feature.icon}</div>
                                    <div>
                                        <h3 className="font-bold mb-1">{feature.title}</h3>
                                        <p className="text-sm opacity-60">{feature.desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
});

SafeWalletSection.displayName = "SafeWalletSection";
export default SafeWalletSection;
