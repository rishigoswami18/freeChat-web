import { memo } from "react";
import { motion } from "framer-motion";
import { fadeUp } from "../../animations/landingAnimations";
import { Smartphone, MessageCircle, Heart } from "lucide-react";
import Logo from "../Logo";
import { APK_DOWNLOAD_URL } from "../../lib/axios";

const DownloadSection = memo(({ latestApk, handleDownload }) => {
    return (
        <section className="py-20 sm:py-28 bg-gradient-to-b from-base-100 to-base-200">
            <div className="container mx-auto px-4">
                <div className="max-w-5xl mx-auto bg-base-300/50 rounded-[3rem] p-8 md:p-16 border border-base-content/5 relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                        <Smartphone className="size-64" />
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                        <div className="flex-1 text-center md:text-left">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                            >
                                <span className="badge badge-accent badge-sm mb-4 font-bold p-3">MOBILE EXPERIENCE</span>
                                <h2 className="text-3xl sm:text-5xl font-black mb-6 leading-tight">
                                    Take <span className="text-primary italic">BondBeyond</span> <br /> Anywhere You Go
                                </h2>
                                <p className="text-lg opacity-70 mb-8 leading-relaxed">
                                    Experience the full power of BondBeyond on your Android device.
                                    Stay connected with instant notifications, faster loading,
                                    and a premium mobile interface optimized for your relationship.
                                </p>
                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <a
                                        href={`${APK_DOWNLOAD_URL}/latest`}
                                        onClick={handleDownload}
                                        className="btn btn-primary btn-lg gap-3 shadow-xl shadow-primary/20 rounded-2xl hover:scale-105 transition-all duration-300"
                                    >
                                        <Smartphone className="size-6" />
                                        Download APK Now
                                    </a>
                                    <div className="flex flex-col justify-center text-xs opacity-50 font-medium">
                                        <span>Version {latestApk?.versionName || "1.0.0"}</span>
                                        <span>Requires Android 8.0+</span>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                        <div className="w-full md:w-1/3 flex justify-center">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: -5 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8 }}
                                className="relative"
                            >
                                <div className="w-56 h-[450px] bg-neutral rounded-[3rem] border-[8px] border-neutral-focus shadow-2xl relative overflow-hidden">
                                    <div className="absolute top-0 w-full h-6 bg-neutral-focus flex justify-center pt-1">
                                        <div className="w-16 h-1 bg-neutral rounded-full" />
                                    </div>
                                    <div className="w-full h-full bg-base-100 flex flex-col items-center justify-center p-6 text-center">
                                        <Logo className="size-12 mb-4" />
                                        <div className="space-y-2 w-full">
                                            <div className="h-2 w-full bg-base-200 rounded-full animate-pulse" />
                                            <div className="h-2 w-3/4 bg-base-200 rounded-full animate-pulse mx-auto" />
                                            <div className="h-2 w-1/2 bg-base-200 rounded-full animate-pulse mx-auto" />
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -top-4 -right-4 bg-primary text-primary-content p-3 rounded-2xl shadow-lg animate-bounce">
                                    <MessageCircle className="size-5" />
                                </div>
                                <div className="absolute top-1/2 -left-8 bg-secondary text-secondary-content p-3 rounded-2xl shadow-lg animate-pulse">
                                    <Heart className="size-5" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
});

DownloadSection.displayName = "DownloadSection";
export default DownloadSection;
