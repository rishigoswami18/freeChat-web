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
            { label: "Service Level Agreement", path: "/refund-policy", icon: RefreshCcw },
        ]
    },
    {
        title: "Trust & Legal",
        links: [
            { label: "Privacy & Compliance", path: "/privacy-policy", icon: Shield },
            { label: "Terms of Service", path: "/terms", icon: Scale },
        ]
    },
    {
        title: "Developers & Enterprise",
        links: [
            { label: "Developer Hub", path: "/communities", icon: Users },
            { label: "Enterprise Pricing", path: "/membership", icon: Gem },
            { label: "API Sandbox", path: "/games", icon: LayoutDashboard },
        ]
    }
];
