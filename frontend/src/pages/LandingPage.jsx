import { Link } from "react-router-dom";
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
];

const stats = [
    { value: "1K+", label: "Active Users", icon: Users },
    { value: "Free", label: "Forever", icon: Zap },
    { value: "HD", label: "Video Calls", icon: Video },
    { value: "24/7", label: "Available", icon: Globe },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-base-100" data-theme="forest">
            {/* ===== NAVIGATION ===== */}
            <nav className="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-300/50 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <Logo className="size-8" fontSize="text-2xl" />
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn btn-ghost btn-sm rounded-xl hover:bg-base-200 transition-all">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Sign Up Free
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
                                100% Free — No Hidden Charges
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
                                Powered by freechatweb.in
                            </div>
                            <span className="text-base-content text-3xl sm:text-4xl lg:text-5xl block mt-2">
                                Your Relationship, <br className="hidden sm:block" />Stronger Every Day.
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl opacity-70 mb-10 max-w-2xl mx-auto leading-relaxed"
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={2}
                        >
                            The ultimate social app for couples and friends. Chat freely,
                            make video calls, share reels, play games, and build deeper
                            connections — all in one beautiful platform.
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
                                Start Chatting Today
                                <ArrowRight className="size-5" />
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-lg gap-2 rounded-2xl hover:scale-[1.02] transition-all duration-300">
                                <Users className="size-5" />
                                I Already Have an Account
                            </Link>
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
                            What is <span className="text-primary">BondBeyond</span>?
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
                            Everything You Need,{" "}
                            <span className="text-primary">Totally Free</span>
                        </h2>
                        <p className="text-lg opacity-60 max-w-2xl mx-auto mt-6">
                            Packed with features that other apps charge for.
                            Here, it's all free — forever.
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

            {/* Ad Break Removed */}

            {/* ===== WHY FREECHAT ===== */}
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

            {/* ===== CTA SECTION ===== */}
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
                            Ready to Try <span className="text-primary">BondBeyond</span>?
                        </h2>
                        <p className="text-lg opacity-70 mb-10 max-w-xl mx-auto leading-relaxed">
                            Join thousands of people who've switched to BondBeyond for real,
                            meaningful connections. It's free. It's fast. It's yours.
                        </p>
                        <Link
                            to="/signup"
                            className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25 rounded-2xl hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
                        >
                            Create Your Free Account
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
                                        href="https://drive.google.com/uc?export=download&id=1hQDoYN1n0cc9lWl7wmTJs2UloVlauOp2"
                                        target="_blank"
                                        rel="noopener noreferrer"
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
                            © {new Date().getFullYear()} BondBeyond — freechatweb.in | Free Chat
                            App for Messaging, Video Calls & Social Networking
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
