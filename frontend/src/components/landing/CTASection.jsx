import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";
import { ArrowRight } from "lucide-react";

const CTASection = memo(() => {
    const { t } = useTranslation();

    return (
        <section className="py-20 sm:py-28 relative overflow-hidden">
            <div className="absolute inset-0 animated-gradient-bg" />
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-4 text-center relative">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        {t('get_started')}
                    </h2>
                    <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto leading-relaxed">
                        Join thousands of people who've switched to Zyro for real,
                        meaningful connections. It's free. It's fast. It's yours.
                    </p>
                    <Link
                        to="/signup"
                        className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25 rounded-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                    >
                        {t('create_account')}
                        <ArrowRight className="size-5" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
});

CTASection.displayName = "CTASection";
export default CTASection;
