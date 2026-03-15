import {
    Mail,
    Shield,
    Scale,
    RefreshCcw,
    Info,
    LayoutDashboard,
    Users,
    Gem
} from "lucide-react";

export const FOOTER_SECTIONS = [
    {
        title: "Support",
        links: [
            { label: "About Us", path: "/about", icon: Info },
            { label: "Contact Us", path: "/contact", icon: Mail },
            { label: "Refund Policy", path: "/refund-policy", icon: RefreshCcw },
        ]
    },
    {
        title: "Legal",
        links: [
            { label: "Privacy Policy", path: "/privacy-policy", icon: Shield },
            { label: "Terms of Service", path: "/terms", icon: Scale },
        ]
    },
    {
        title: "Platform",
        links: [
            { label: "Communities", path: "/communities", icon: Users },
            { label: "Membership", path: "/membership", icon: Gem },
            { label: "Games", path: "/games", icon: LayoutDashboard },
        ]
    }
];
