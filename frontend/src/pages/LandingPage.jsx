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
} from "lucide-react";
import Logo from "../components/Logo";

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
};

const features = [
    {
        icon: MessageCircle,
        title: "Free Real-Time Messaging",
        description:
            "Send unlimited messages instantly. freeChat delivers fast, reliable, and secure messaging — always free.",
        color: "text-blue-400",
    },
    {
        icon: Video,
        title: "HD Video Calls",
        description:
            "Crystal-clear video calls with friends, groups, or new connections. No limits, no fees.",
        color: "text-green-400",
    },
    {
        icon: Image,
        title: "Photo Sharing & Posts",
        description:
            "Share your moments through beautiful posts with your community. Express yourself freely.",
        color: "text-pink-400",
    },
    {
        icon: Film,
        title: "Reels & Stories",
        description:
            "Create and watch short-form reels and stories. Entertainment and self-expression at your fingertips.",
        color: "text-purple-400",
    },
    {
        icon: Shield,
        title: "Stealth Mode & Privacy",
        description:
            "Activate Stealth Mode to instantly hide your activity. Your privacy is always in your hands.",
        color: "text-yellow-400",
    },
    {
        icon: Languages,
        title: "Language Exchange",
        description:
            "Connect with native speakers worldwide. Learn languages naturally through real conversation.",
        color: "text-cyan-400",
    },
    {
        icon: Gamepad2,
        title: "Fun Games",
        description:
            "Play compatibility quizzes and interactive games with friends. Make connections fun!",
        color: "text-orange-400",
    },
    {
        icon: Heart,
        title: "Couple Profiles",
        description:
            "Create shared couple profiles and celebrate your connection with a dedicated space.",
        color: "text-red-400",
    },
    {
        icon: Sparkles,
        title: "AI Emotion Detection",
        description:
            "Our AI understands the emotion behind your messages, making conversations more meaningful.",
        color: "text-indigo-400",
    },
];

const stats = [
    { value: "1K+", label: "Active Users" },
    { value: "Free", label: "Forever" },
    { value: "HD", label: "Video Calls" },
    { value: "24/7", label: "Available" },
];

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-base-100" data-theme="forest">
            {/* ===== NAVIGATION ===== */}
            <nav className="navbar bg-base-100/80 backdrop-blur-lg border-b border-base-300 sticky top-0 z-50">
                <div className="container mx-auto flex items-center justify-between px-4">
                    <Logo className="size-8" fontSize="text-2xl" />
                    <div className="flex items-center gap-3">
                        <Link to="/login" className="btn btn-ghost btn-sm">
                            Login
                        </Link>
                        <Link to="/signup" className="btn btn-primary btn-sm">
                            Sign Up Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ===== HERO SECTION ===== */}
            <header className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32 relative">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={0}
                        >
                            <span className="badge badge-primary badge-outline badge-lg mb-6 gap-2">
                                <Sparkles className="size-4" />
                                100% Free — No Hidden Charges
                            </span>
                        </motion.div>

                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={1}
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                                freeChat
                            </span>
                            <br />
                            <span className="text-base-content text-3xl sm:text-4xl lg:text-5xl">
                                Free Chat App for Real Connection
                            </span>
                        </motion.h1>

                        <motion.p
                            className="text-lg sm:text-xl opacity-80 mb-8 max-w-2xl mx-auto leading-relaxed"
                            initial="hidden"
                            animate="visible"
                            variants={fadeUp}
                            custom={2}
                        >
                            freeChat is the <strong>free chat app</strong> that gives you
                            everything — <strong>secure messaging</strong>,{" "}
                            <strong>HD video calls</strong>, <strong>reels</strong>,{" "}
                            <strong>stories</strong>, and a vibrant community. No ads
                            cluttering your feed, no selling your data. Just real people, real
                            conversations.
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
                                className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25"
                            >
                                Start Chatting Free
                                <ArrowRight className="size-5" />
                            </Link>
                            <Link to="/login" className="btn btn-outline btn-lg gap-2">
                                <Users className="size-5" />
                                I Already Have an Account
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* ===== STATS ROW ===== */}
            <section className="py-12 border-y border-base-300 bg-base-200/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, i) => (
                            <motion.div
                                key={i}
                                className="text-center"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                            >
                                <div className="text-3xl sm:text-4xl font-extrabold text-primary">
                                    {stat.value}
                                </div>
                                <div className="text-sm opacity-70 mt-1">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHAT IS FREECHAT ===== */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            What is <span className="text-primary">freeChat</span>?
                        </h2>
                        <p className="text-lg opacity-80 leading-relaxed">
                            freeChat is a <strong>free chat and social networking app</strong>{" "}
                            designed for people who value{" "}
                            <strong>real human connection</strong>. Unlike traditional social
                            media platforms filled with noise and algorithms, freeChat puts{" "}
                            <strong>you</strong> in control. Chat with friends, make video
                            calls, share stories and reels, exchange languages, play games,
                            and build meaningful relationships — all completely{" "}
                            <strong>free</strong>.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ===== FEATURES GRID ===== */}
            <section className="py-16 sm:py-24 bg-base-200/30">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything You Need,{" "}
                            <span className="text-primary">Totally Free</span>
                        </h2>
                        <p className="text-lg opacity-70 max-w-2xl mx-auto">
                            freeChat is packed with features that other apps charge for. Here,
                            it's all free, forever.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                className="card bg-base-100 shadow-md hover:shadow-xl border border-base-300 transition-all duration-300 hover:-translate-y-1"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                            >
                                <div className="card-body">
                                    <feature.icon
                                        className={`size-10 ${feature.color} mb-2`}
                                    />
                                    <h3 className="card-title text-lg">{feature.title}</h3>
                                    <p className="opacity-70 text-sm">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== WHY FREECHAT ===== */}
            <section className="py-16 sm:py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        className="text-center max-w-3xl mx-auto mb-12"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Why Choose <span className="text-primary">freeChat</span>?
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                icon: Eye,
                                title: "No Algorithmic Feed",
                                desc: "See what your friends actually post. No hidden algorithms deciding what you see.",
                            },
                            {
                                icon: Shield,
                                title: "Your Data Stays Yours",
                                desc: "We don't sell your data. freeChat is built on trust and user privacy.",
                            },
                            {
                                icon: Globe,
                                title: "Connect Globally",
                                desc: "Meet people from around the world. Break language barriers with built-in translation.",
                            },
                            {
                                icon: Star,
                                title: "Premium Features, Zero Cost",
                                desc: "What other apps lock behind paywalls, freeChat gives you for free. Always.",
                            },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex gap-4 items-start"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                            >
                                <div className="bg-primary/10 p-3 rounded-xl flex-shrink-0">
                                    <item.icon className="size-6 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                                    <p className="opacity-70 text-sm">{item.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA SECTION ===== */}
            <section className="py-16 sm:py-24 bg-gradient-to-r from-primary/10 via-accent/5 to-secondary/10">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={fadeUp}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Ready to Try <span className="text-primary">freeChat</span>?
                        </h2>
                        <p className="text-lg opacity-80 mb-8 max-w-xl mx-auto">
                            Join thousands of people who've switched to freeChat for real,
                            meaningful connections. It's free. It's fast. It's you.
                        </p>
                        <Link
                            to="/signup"
                            className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25"
                        >
                            Create Your Free Account
                            <ArrowRight className="size-5" />
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="py-12 border-t border-base-300 bg-base-200/50">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="mb-3">
                                <Logo className="size-6" fontSize="text-xl" />
                            </div>
                            <p className="text-sm opacity-70 max-w-xs">
                                freeChat is a free chat app and social networking platform for
                                real human connection. Messaging, video calls, reels, and more.
                            </p>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Quick Links</h4>
                            <ul className="space-y-2 text-sm opacity-70">
                                <li>
                                    <Link to="/signup" className="hover:text-primary transition">
                                        Sign Up
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/login" className="hover:text-primary transition">
                                        Login
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/contact" className="hover:text-primary transition">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold mb-3">Legal</h4>
                            <ul className="space-y-2 text-sm opacity-70">
                                <li>
                                    <Link
                                        to="/privacy-policy"
                                        className="hover:text-primary transition"
                                    >
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/terms" className="hover:text-primary transition">
                                        Terms of Service
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/refund-policy"
                                        className="hover:text-primary transition"
                                    >
                                        Refund Policy
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="divider my-8" />
                    <div className="text-center text-sm opacity-60">
                        <p>
                            © {new Date().getFullYear()} freeChat — freechatweb.in | Free Chat
                            App for Messaging, Video Calls & Social Networking
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
