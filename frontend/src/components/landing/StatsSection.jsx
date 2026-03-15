import { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";
import { Users, Zap, Video, Globe } from "lucide-react";

const StatsSection = memo(({ totalDownloads }) => {
    const stats = useMemo(() => [
        { value: totalDownloads, label: "Active Users", icon: Users },
        { value: "Free", label: "Forever", icon: Zap },
        { value: "HD", label: "Video Calls", icon: Video },
        { value: "24/7", label: "Available", icon: Globe },
    ], [totalDownloads]);

    return (
        <section className="py-14 border-y border-base-300/50 bg-base-200/30">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={i}
                            className="text-center group"
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                        >
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-3 group-hover:scale-110 transition-transform">
                                <stat.icon className="size-5 text-primary" />
                            </div>
                            <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                                {stat.value}
                            </div>
                            <div className="text-sm opacity-60 mt-1 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
});

StatsSection.displayName = "StatsSection";
export default StatsSection;
