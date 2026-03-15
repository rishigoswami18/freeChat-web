import { memo } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "../../animations/landingAnimations";
import { features } from "../../constants/features";

const FeaturesSection = memo(() => {
    const { t } = useTranslation();

    return (
        <section className="py-20 sm:py-28 bg-base-200/20">
            <div className="container mx-auto px-4">
                <motion.div
                    className="text-center mb-16"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 section-heading section-heading-center">
                        {t('everything_free')}
                    </h2>
                    <p className="text-lg opacity-60 max-w-2xl mx-auto mt-6">
                        {t('packed_features')}
                    </p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            className="card bg-base-100 shadow-md hover:shadow-xl border border-base-300/50 transition-all duration-300 hover:-translate-y-1 group overflow-hidden"
                            variants={fadeUp}
                        >
                            <div className="card-body">
                                <div className={`feature-icon-wrap bg-gradient-to-br ${feature.gradient} mb-3`}>
                                    <feature.icon
                                        className={`size-6 ${feature.iconColor}`}
                                    />
                                </div>
                                <h3 className="card-title text-lg">{feature.title}</h3>
                                <p className="opacity-60 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                            <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
});

FeaturesSection.displayName = "FeaturesSection";
export default FeaturesSection;
