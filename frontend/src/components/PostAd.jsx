import { Link } from "react-router-dom";
import {
    Sparkles,
    MessageCircle,
    Video,
    Users,
    Heart,
    ArrowRight,
    Crown,
    Shield,
    Gamepad2,
} from "lucide-react";

// Different ad variants to keep it fresh
const adVariants = [
    {
        id: "invite",
        badge: "Spread the Word",
        badgeColor: "badge-primary",
        title: "Invite Friends to freeChat!",
        description:
            "Know someone who'd love freeChat? Share the app and grow your circle. The more friends, the more fun!",
        cta: "Share freeChat",
        ctaLink: null, // Will trigger share
        icon: Users,
        iconColor: "text-blue-400",
        gradient: "from-blue-500/10 via-transparent to-cyan-500/10",
    },
    {
        id: "premium",
        badge: "Premium",
        badgeColor: "badge-warning",
        title: "Go Premium — Unlock Everything!",
        description:
            "Couple profiles, ad-free reels, translation, and exclusive features. All for just ₹49/month.",
        cta: "Explore Premium",
        ctaLink: "/membership",
        icon: Crown,
        iconColor: "text-amber-400",
        gradient: "from-amber-500/10 via-transparent to-orange-500/10",
    },
    {
        id: "videocall",
        badge: "Feature Spotlight",
        badgeColor: "badge-success",
        title: "Crystal-Clear Video Calls",
        description:
            "Talk face-to-face with friends anywhere in the world. Free HD video calls, no time limits!",
        cta: "Start a Call",
        ctaLink: "/friends",
        icon: Video,
        iconColor: "text-green-400",
        gradient: "from-green-500/10 via-transparent to-emerald-500/10",
    },
    {
        id: "couple",
        badge: "New Feature",
        badgeColor: "badge-secondary",
        title: "Create Your Couple Profile ❤️",
        description:
            "Link your profile with your partner. Celebrate your connection with a shared space, games, and more.",
        cta: "Try Couple Profiles",
        ctaLink: "/couple",
        icon: Heart,
        iconColor: "text-pink-400",
        gradient: "from-pink-500/10 via-transparent to-rose-500/10",
    },
    {
        id: "games",
        badge: "Fun & Games",
        badgeColor: "badge-info",
        title: "Play Games with Friends!",
        description:
            "Compatibility quizzes, truth or dare, and more interactive games. Challenge your friends now!",
        cta: "Play Now",
        ctaLink: "/games",
        icon: Gamepad2,
        iconColor: "text-cyan-400",
        gradient: "from-cyan-500/10 via-transparent to-blue-500/10",
    },
    {
        id: "privacy",
        badge: "Your Privacy Matters",
        badgeColor: "badge-neutral",
        title: "Stealth Mode — Instant Privacy",
        description:
            "One tap to hide everything. freeChat's Stealth Mode gives you total control over your privacy.",
        cta: "Learn More",
        ctaLink: "/profile",
        icon: Shield,
        iconColor: "text-purple-400",
        gradient: "from-purple-500/10 via-transparent to-indigo-500/10",
    },
];

const PostAd = ({ index = 0 }) => {
    const ad = adVariants[index % adVariants.length];
    const Icon = ad.icon;

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: "freeChat — Free Chat App",
                    text: "Check out freeChat! Free messaging, video calls, reels, and more. Join me!",
                    url: "https://www.freechatweb.in",
                });
            } catch (err) {
                // User cancelled
            }
        } else {
            navigator.clipboard.writeText("https://www.freechatweb.in");
        }
    };

    return (
        <div className="card bg-base-200/80 border border-base-300/50 overflow-hidden card-hover">
            {/* Gradient Background */}
            <div className={`relative bg-gradient-to-br ${ad.gradient}`}>
                {/* Promo Banner Image */}
                <img
                    src="/promo-banner.png"
                    alt="freeChat promotion"
                    className="w-full h-48 sm:h-56 object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-base-200 via-base-200/50 to-transparent" />

                {/* Sponsored Badge */}
                <div className="absolute top-3 left-3">
                    <span className="badge badge-sm bg-black/50 text-white border-none backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                        Sponsored
                    </span>
                </div>
            </div>

            <div className="card-body p-4 sm:p-5 -mt-8 relative z-10">
                {/* Icon + Badge */}
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 rounded-xl bg-base-300/80 backdrop-blur-sm">
                        <Icon className={`size-6 ${ad.iconColor}`} />
                    </div>
                    <div>
                        <span className={`badge ${ad.badgeColor} badge-sm font-bold`}>
                            {ad.badge}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <h3 className="font-bold text-lg leading-tight">{ad.title}</h3>
                <p className="text-sm opacity-60 leading-relaxed">{ad.description}</p>

                {/* CTA */}
                <div className="flex items-center gap-3 mt-3">
                    {ad.ctaLink ? (
                        <Link
                            to={ad.ctaLink}
                            className="btn btn-primary btn-sm rounded-xl gap-2 shadow-sm shadow-primary/20 flex-1"
                        >
                            <Sparkles className="size-3.5" />
                            {ad.cta}
                        </Link>
                    ) : (
                        <button
                            onClick={handleShare}
                            className="btn btn-primary btn-sm rounded-xl gap-2 shadow-sm shadow-primary/20 flex-1"
                        >
                            <Sparkles className="size-3.5" />
                            {ad.cta}
                        </button>
                    )}
                    <Link
                        to="/"
                        className="btn btn-ghost btn-sm btn-circle opacity-40 hover:opacity-100"
                    >
                        <ArrowRight className="size-4" />
                    </Link>
                </div>

                {/* freeChat branding */}
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-base-300/50">
                    <MessageCircle className="size-3 text-primary" />
                    <span className="text-[10px] font-semibold opacity-40">
                        freeChat — freechatweb.in
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PostAd;
export { adVariants };
