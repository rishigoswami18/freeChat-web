import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Smartphone, ChevronRight } from "lucide-react";
import { fadeUp } from "../../animations/landingAnimations";
import { APK_DOWNLOAD_URL } from "../../lib/axios";

const HeroSection = memo(({ handleDownload }) => {
    const { t } = useTranslation();

    return (
        <header className="relative overflow-hidden">
            <div className="absolute inset-0 animated-gradient-bg" />
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/8 rounded-full blur-[120px]" />

            <div className="container mx-auto px-4 py-20 sm:py-28 lg:py-36 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={0}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-semibold mb-8">
                            <Sparkles className="size-4" />
                            {t('free_forever')}
                            <ChevronRight className="size-3.5 opacity-60" />
                        </span>
                    </motion.div>

                    <motion.h1
                        className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={1}
                    >
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary italic uppercase tracking-tighter">
                            Zyro
|                      </span>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-2 mb-4 flex justify-center text-primary">
                            Master Your Mindset, Win the Game.
                        </div>
                        <span className="text-base-content text-3xl sm:text-4xl lg:text-5xl block mt-2">
                            {t('hero_title')}
                        </span>
                    </motion.h1>

                    <motion.p
                        className="text-lg sm:text-xl opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={2}
                    >
                        {t('hero_desc')}
                    </motion.p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-4 justify-center"
                        initial="hidden"
                        animate="visible"
                        variants={fadeUp}
                        custom={3}
                    >
                        <Link
                            to="/signup"
                            className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25 rounded-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                        >
                            {t('start_chatting')}
                            <ArrowRight className="size-5" />
                        </Link>
                        <a
                            href={`${APK_DOWNLOAD_URL}/latest`}
                            onClick={handleDownload}
                            className="btn btn-outline btn-lg gap-2 rounded-2xl hover:scale-[1.02] transition-all duration-300 border-accent text-accent hover:bg-accent hover:text-white"
                        >
                            <Smartphone className="size-5" />
                            {t('download_app')}
                        </a>
                    </motion.div>
                </div>
            </div>
        </header>
    );
});

HeroSection.displayName = "HeroSection";
export default HeroSection;
