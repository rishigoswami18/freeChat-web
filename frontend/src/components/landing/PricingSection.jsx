import { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";

const PricingSection = memo(() => {
    return (
        <section className="py-20 bg-base-100">
            <div className="container mx-auto px-4 text-center">
                <motion.div
                    className="max-w-xl mx-auto"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-3xl font-bold mb-4">Simple & Fair Pricing</h2>
                    <p className="opacity-60 mb-12">BondBeyond is free to use, with optional premium enhancements.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-6 rounded-3xl bg-base-200 border border-base-content/5">
                            <h3 className="font-bold text-lg mb-2">Free Plan</h3>
                            <p className="text-sm opacity-60">Unlimited messages, calls, and basic AI interactions.</p>
                            <div className="text-2xl font-black mt-4">$0</div>
                        </div>
                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 relative overflow-hidden">
                            <h3 className="font-bold text-lg mb-2 text-primary">Premium</h3>
                            <p className="text-sm opacity-60">Verified badge, priority support, and enhanced AI memory.</p>
                            <div className="text-2xl font-black mt-4">$4.99<span className="text-xs opacity-50 font-normal">/month</span></div>
                        </div>
                    </div>
                    <p className="text-[10px] mt-8 opacity-40">All payments are secure and protected by international standards. 15-day refund guarantee applies.</p>
                </motion.div>
            </div>
        </section>
    );
});

PricingSection.displayName = "PricingSection";
export default PricingSection;
