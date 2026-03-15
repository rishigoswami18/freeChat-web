import React, { useEffect, useState, useCallback, Suspense } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLatestRelease, getAppStats } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import Logo from "../components/Logo";
import AdSense from "../components/AdSense";

// Immediate loading for initial painting
import HeroSection from "../components/landing/HeroSection";
import StatsSection from "../components/landing/StatsSection";
import FooterSection from "../components/landing/FooterSection";

// Lazy loaded below the fold
const FeaturesSection = React.lazy(() => import("../components/landing/FeaturesSection"));
const WhySection = React.lazy(() => import("../components/landing/WhySection"));
const InsightsSection = React.lazy(() => import("../components/landing/InsightsSection"));
const DownloadSection = React.lazy(() => import("../components/landing/DownloadSection"));
const PricingSection = React.lazy(() => import("../components/landing/PricingSection"));
const CTASection = React.lazy(() => import("../components/landing/CTASection"));

const LandingPage = () => {
    const { t } = useTranslation();
    const [latestApk, setLatestApk] = useState(null);
    const [totalDownloads, setTotalDownloads] = useState("1K+");

    // Memoize the download handler to stabilize children components
    const handleDownload = useCallback((e) => {
        e.preventDefault();
        const filename = latestApk?.versionName
            ? `BondBeyond_v${latestApk.versionName.replace(/\./g, "_")}.apk`
            : "BondBeyond_app.apk";
        downloadFile(`${APK_DOWNLOAD_URL}/latest`, filename);
    }, [latestApk]);

    useEffect(() => {
        let isMounted = true;
        const fetchApk = async () => {
            try {
                const [apkData, statsData] = await Promise.all([
                    getLatestRelease(),
                    getAppStats()
                ]);
                if (isMounted) {
                    setLatestApk(apkData);
                    if (statsData.totalDownloads > 0) {
                        setTotalDownloads(`${statsData.totalDownloads}+`);
                    }
                }
            } catch (err) {
                console.error("Failed to fetch apk stats:", err);
            }
        };
        fetchApk();

        return () => {
            isMounted = false;
        };
    }, []);

    return (
        <div className="min-h-screen bg-base-100" data-theme="bondbeyond">
            {/* SEO & Meta Tags for Global Reach */}
            <title>BondBeyond | Free Chat App, Video Calls & AI Companions</title>
            <meta name="description" content="Join BondBeyond, the all-in-one free chat platform. Enjoy high-quality video calls, share reels, play games, and connect with your personalized AI best friend. Bonding redefined." />
            <meta name="keywords" content="free chat, video call app, AI girlfriend, AI best friend, social media app, ludo online, bondbeyond" />
            <meta property="og:title" content="BondBeyond | Join the Best Free Social Platform" />
            <meta property="og:description" content="High-quality video calls, secure messaging, games, and AI companions—always free." />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />

            {/* Structured Schema Definition for Rich Snippets */}
            <script type="application/ld+json">
                {JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "SoftwareApplication",
                    "name": "BondBeyond",
                    "operatingSystem": "Android",
                    "applicationCategory": "ChatApplication",
                    "offers": {
                        "@type": "Offer",
                        "price": "0",
                        "priceCurrency": "USD"
                    }
                })}
            </script>

            {/* ===== NAVIGATION ===== */}
            <nav className="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-300/50 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <Logo className="size-8" fontSize="text-2xl" />
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn btn-ghost btn-sm rounded-xl hover:bg-base-200 transition-all font-semibold">
                            {t('login')}
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            {t('signup_free')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== CORE AT-THE-FOLD PAINTING ===== */}
            <HeroSection handleDownload={handleDownload} />
            <StatsSection totalDownloads={totalDownloads} />

            {/* ===== LAZY LOADED BLOCKS TO BOOST CRITICAL FRAME RENDER ===== */}
            <Suspense fallback={<div className="min-h-[200px] flex items-center justify-center bg-base-100 opacity-50 animated-pulse" />}>
                <section className="py-20 sm:py-28 text-center max-w-3xl mx-auto container px-4">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">{t('what_is')}</h2>
                    <p className="text-lg opacity-70 leading-relaxed mt-6">
                        BondBeyond is a free social platform built for real human connection.
                        Whether you're chatting with friends, playing couple games,
                        sharing stories, or learning a new language — BondBeyond makes
                        every interaction meaningful.
                    </p>
                </section>
            
                <FeaturesSection />

                {/* AD SENSE BLOCK */}
                <section className="py-12 border-y border-base-300/30">
                    <div className="container mx-auto px-4 max-w-4xl text-center">
                        <div className="flex justify-between items-center mb-4 opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-widest text-center w-full">Sponsored Information</span>
                        </div>
                        <div className="min-h-[100px] bg-base-200/50 rounded-3xl border border-dashed border-base-content/10 flex items-center justify-center overflow-hidden">
                             <AdSense slot="5614946399" format="horizontal" responsive="true" />
                        </div>
                    </div>
                </section>

                <InsightsSection />
                <WhySection />
                <DownloadSection latestApk={latestApk} handleDownload={handleDownload} />
                <PricingSection />
                <CTASection />
            </Suspense>

            {/* ===== FOOTER ===== */}
            <FooterSection handleDownload={handleDownload} />
        </div>
    );
};

export default LandingPage;
