import { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";

const insights = [
    {
        date: "March 12, 2026",
        title: "The Power of AI in Modern Relationships",
        excerpt: "Relationships thrive on communication. Discover how our AI Emotion Detection helps bridge the gap between text and real feelings, ensuring your messages are always understood truly.",
        tag: "Relationships"
    },
    {
        date: "March 10, 2026",
        title: "Why Privacy is the Future of Social Media",
        excerpt: "In an era of data tracking, BondBeyond puts your privacy first with Stealth Mode and end-to-end encryption for all calls and messages. Your data belongs to you, always.",
        tag: "Privacy"
    },
    {
        date: "March 08, 2026",
        title: "Gamifying Connection: Why We Play Together",
        excerpt: "From Compatibility Quizzes to real-time Ludo, learn how shared experiences and gaming are the secret ingredients to building long-lasting digital bonds in the modern age.",
        tag: "Fun & Games"
    }
];

const InsightsSection = memo(() => {
    return (
        <section className="py-20 sm:py-28 bg-base-200/40">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center max-w-3xl mx-auto mb-14"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 block">Developer Diary</span>
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">Latest Insights & Updates</h2>
                    <p className="opacity-60">Discover how BondBeyond is changing the way people connect, chat, and spend time together.</p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
                    {insights.map((post, i) => (
                        <motion.div
                            key={i}
                            className="bg-base-100 rounded-3xl p-8 border border-base-content/5 shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                        >
                            <div className="badge badge-primary badge-outline text-[9px] font-black uppercase mb-4">{post.tag}</div>
                            <h3 className="text-xl font-bold mb-3 leading-tight">{post.title}</h3>
                            <p className="text-sm opacity-60 leading-relaxed mb-6 flex-1">{post.excerpt}</p>
                            <div className="text-[10px] font-bold opacity-30 mt-auto">{post.date} — 4 min read</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

InsightsSection.displayName = "InsightsSection";
export default InsightsSection;
