import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getLatestRelease, getAppStats } from "../lib/api";
import { motion } from "framer-motion";
import {
    MessageCircle,
    Video,
    Image,
    Shield,
    Users,
    Gamepad2,
    Globe,
    Heart,
    Sparkles,
    ArrowRight,
    Star,
    Eye,
    Languages,
    Film,
    Smartphone,
    Crown,
    Zap,
    ChevronRight,
} from "lucide-react";
import Logo from "../components/Logo";
import AdSense from "../components/AdSense";
import { BASE_URL, APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
    {
        icon: MessageCircle,
        title: "Real-Time Messaging",
        description:
            "Send unlimited messages instantly with fast, reliable, and secure delivery — always free.",
        gradient: "from-blue-500/20 to-cyan-500/20",
        iconColor: "text-blue-400",
    },
    {
        icon: Video,
        title: "HD Video Calls",
        description:
            "Crystal-clear video calls with friends or groups. No limits, no fees, just connection.",
        gradient: "from-green-500/20 to-emerald-500/20",
        iconColor: "text-green-400",
    },
    {
        icon: Image,
        title: "Photo Sharing & Posts",
        description:
            "Share moments through beautiful posts with your community. Express yourself freely.",
        gradient: "from-pink-500/20 to-rose-500/20",
        iconColor: "text-pink-400",
    },
    {
        icon: Film,
        title: "Reels & Stories",
        description:
            "Create and watch short-form reels and stories. Entertainment and self-expression combined.",
        gradient: "from-purple-500/20 to-violet-500/20",
        iconColor: "text-purple-400",
    },
    {
        icon: Shield,
        title: "Stealth Mode",
        description:
            "Activate Stealth Mode to instantly hide your screen — the ultimate privacy companion for your relationship.",
        gradient: "from-yellow-500/20 to-amber-500/20",
        iconColor: "text-yellow-400",
    },
    {
        icon: Languages,
        title: "Language Exchange",
        description:
            "Connect with native speakers worldwide. Learn languages naturally through real conversation.",
        gradient: "from-cyan-500/20 to-teal-500/20",
        iconColor: "text-cyan-400",
    },
    {
        icon: Gamepad2,
        title: "Fun Games",
        description:
            "Play compatibility quizzes and interactive games with friends. Make connections fun!",
        gradient: "from-orange-500/20 to-red-500/20",
        iconColor: "text-orange-400",
    },
    {
        icon: Heart,
        title: "Couple Profiles & Notes",
        description:
            "Create shared couple profiles, play relationship games, and celebrate your connection together.",
        gradient: "from-red-500/20 to-pink-500/20",
        iconColor: "text-red-400",
    },
    {
        icon: Sparkles,
        title: "AI Emotion Detection",
        description:
            "Our AI understands the emotion behind your messages, making every conversation more meaningful.",
        gradient: "from-indigo-500/20 to-blue-500/20",
        iconColor: "text-indigo-400",
    },
    {
        icon: Heart,
        title: "AI Companion",
        description:
            "Experience a new level of productivity and companionship with Aria. Your proactive AI assistant who helps you stay organized and keeps your day bright.",
        gradient: "from-rose-500/20 to-orange-500/20",
        iconColor: "text-rose-400",
    },
];

const LandingPage = () => {
    const { t } = useTranslation();
    const [latestApk, setLatestApk] = useState(null);
    const [totalDownloads, setTotalDownloads] = useState("1K+");

    const handleDownload = (e) => {
        e.preventDefault();
        const filename = latestApk?.versionName
            ? `BondBeyond_v${latestApk.versionName.replace(/\./g, "_")}.apk`
            : "BondBeyond_app.apk";
        downloadFile(`${APK_DOWNLOAD_URL}/latest`, filename);
    };

    useEffect(() => {
        const fetchApk = async () => {
            try {
                const [apkData, statsData] = await Promise.all([
                    getLatestRelease(),
                    getAppStats()
                ]);
                setLatestApk(apkData);
                if (statsData.totalDownloads > 0) {
                    setTotalDownloads(`${statsData.totalDownloads}+`);
                }
            } catch (err) {
                console.error("Failed to fetch apk stats:", err);
            }
        };
        fetchApk();
    }, []);

    const stats = [
        { value: totalDownloads, label: "Active Users", icon: Users },
        { value: "Free", label: "Forever", icon: Zap },
        { value: "HD", label: "Video Calls", icon: Video },
        { value: "24/7", label: "Available", icon: Globe },
    ];

    const apkUrl = latestApk?.apkUrl || null;
    return (
        <div className="min-h-screen bg-base-100" data-theme="bondbeyond">
            {/* SEO & Meta Tags */}
            <title>BondBeyond | Free Chat App, Video Calls & AI Companions</title>
            <meta name="description" content="Join BondBeyond, the all-in-one free chat platform. Enjoy high-quality video calls, share reels, play games, and connect with your personalized AI best friend. Bonding redefined." />
            <meta name="keywords" content="free chat, video call app, AI girlfriend, AI best friend, social media app, ludo online, bondbeyond" />

            {/* ===== NAVIGATION ===== */}
            <nav className="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-300/50 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <Logo className="size-8" fontSize="text-2xl" />
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn btn-ghost btn-sm rounded-xl hover:bg-base-200 transition-all">
                            {t('login')}
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            {t('signup_free')}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <header className="relative overflow-hidden">
                {/* Animated gradient background */}
                <div className="absolute inset-0 animated-gradient-bg" />
                {/* Decorative blobs */}
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
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary italic">
                                BondBeyond
                            </span>
                            <div className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 -mt-1 mb-4 flex justify-center">
                                Premium Relationship Experience
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

            {/* ===== STATS ROW ===== */}
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

            {/* ===== WHAT IS FREECHAT ===== */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 section-heading section-heading-center">
                            {t('what_is')}
                        </h2>
                        <p className="text-lg opacity-70 leading-relaxed mt-6">
                            BondBeyond is a free social platform built for real human connection.
                            Whether you're chatting with friends, playing couple games,
                            sharing stories, or learning a new language — BondBeyond makes
                            every interaction meaningful.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
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
                                {/* Hover accent line */}
                                <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-primary to-secondary transition-all duration-500" />
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ===== AD SENSE SECTION ===== */}
            <section className="py-12 border-y border-base-300/30">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-4 opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-widest">Sponsored Information</span>
                        </div>
                        <div className="min-h-[100px] bg-base-200/50 rounded-3xl flex items-center justify-center border border-dashed border-base-content/10">
                             <AdSense slot="5614946399" format="horizontal" responsive="true" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== LATEST INSIGHTS (AD SENSE BOOSTER) ===== */}
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
                        {[
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
                        ].map((post, i) => (
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

            {/* ===== WHY BOND BEYOND ===== */}
            <section className="py-20 sm:py-28">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-14"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4 section-heading section-heading-center">
                            Why Choose <span className="text-primary">BondBeyond</span>?
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                        {[
                            {
                                icon: Eye,
                                title: "No Algorithmic Feed",
                                desc: "See what your friends actually post. No hidden algorithms deciding what you see.",
                            },
                            {
                                icon: Shield,
                                title: "Your Data Stays Yours",
                                desc: "We don't sell your data. BondBeyond is built on trust and user privacy.",
                            },
                            {
                                icon: Globe,
                                title: "Connect Globally",
                                desc: "Meet people from around the world. Break language barriers with built-in translation.",
                            },
                            {
                                icon: Star,
                                title: "Premium Features, Zero Cost",
                                desc: "What other apps lock behind paywalls, BondBeyond gives you for free. Always.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex gap-4 items-start p-5 rounded-2xl bg-base-200/40 border border-base-300/40 hover:border-primary/20 hover:bg-base-200/70 transition-all duration-300 group"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                            >
                                <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                                    <item.icon className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="opacity-60 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DOWNLOAD SECTION ===== */}
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
                                    {/* Small floating elements */}
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

            {/* ===== PRICING TRANSPARENCY (FOR AUDIT) ===== */}
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
                            <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20">
                                <h3 className="font-bold text-lg mb-2 text-primary">Premium</h3>
                                <p className="text-sm opacity-60">Verified badge, priority support, and enhanced AI memory.</p>
                                <div className="text-2xl font-black mt-4">$4.99<span className="text-xs opacity-50 font-normal">/month</span></div>
                            </div>
                        </div>
                        <p className="text-[10px] mt-8 opacity-40">All payments are secure and protected by international standards. 15-day refund guarantee applies.</p>
                    </motion.div>
                </div>
            </section>
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
                            Join thousands of people who've switched to BondBeyond for real,
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

            {/* ===== FOOTER ===== */}
            <footer className="py-14 border-t border-base-300/50 bg-base-200/30">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div>
                            <div className="mb-4">
                                <Logo className="size-6" fontSize="text-xl" />
                            </div>
                            <p className="text-sm opacity-60 max-w-xs mb-5 leading-relaxed">
                                BondBeyond is a free social platform for
                                real human connection — messaging, video calls, reels, and more.
                            </p>
                            <div className="flex flex-col gap-1">
                                <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Founded & Owned by</p>
                                <p className="text-sm font-bold italic text-primary">Hrishikesh Giri</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-50">Quick Links</h4>
                            <ul className="space-y-3 text-sm opacity-70">
                                <li>
                                    <Link to="/about" className="hover:text-primary transition-colors link-hover-underline">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/signup" className="hover:text-primary transition-colors link-hover-underline">
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-primary transition-colors link-hover-underline">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-primary transition-colors link-hover-underline">
                                        Contact Us
                                    </Link>
                                </li>
                                <li>
                                    <a
                                        href={`${APK_DOWNLOAD_URL}/latest`}
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 hover:text-primary transition font-bold text-accent"
                                    >
                                        <Smartphone className="size-4" />
                                        Download Android App
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-4 text-sm uppercase tracking-wider opacity-50">Legal</h4>
                            <ul className="space-y-3 text-sm opacity-70">
                                <li>
                                    <Link
                                        to="/privacy-policy"
                                        className="hover:text-primary transition-colors link-hover-underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:text-primary transition-colors link-hover-underline">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/refund-policy"
                                        className="hover:text-primary transition-colors link-hover-underline"
                                    >
                                        Refund Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="section-divider" />
                    <div className="text-center text-sm opacity-50">
                        <p>
                            © {new Date().getFullYear()} BondBeyond | Premium Relationship Platform
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
