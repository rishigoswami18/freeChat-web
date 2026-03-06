import { Link } from "react-router-dom";
import {
    Heart,
    Mail,
    Shield,
    Scale,
    RefreshCcw,
    Info,
    Instagram,
    Linkedin,
    Twitter,
    Facebook
} from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
    const socialLinks = [
        { icon: Instagram, href: "https://instagram.com", label: "Instagram", color: "hover:text-pink-500" },
        { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-sky-400" },
        { icon: Facebook, href: "https://facebook.com", label: "Facebook", color: "hover:text-blue-600" },
        { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-700" },
    ];

    return (
        <footer className="bg-base-200/80 border-t border-base-300/50 py-10 px-4 mt-auto font-outfit">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">
                    {/* Brand */}
                    <div className="space-y-4 col-span-1 md:col-span-1">
                        <Logo className="size-8" fontSize="text-xl" />
                        <p className="text-sm opacity-50 max-w-xs leading-relaxed">
                            An immersive social platform for connecting with friends and partners. Unleash your creativity with Reels and Stories.
                        </p>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Support</h3>
                        <div className="flex flex-col gap-2.5">
                            <Link to="/about" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Info className="size-4 opacity-50" /> About Us
                            </Link>
                            <Link to="/contact" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Mail className="size-4 opacity-50" /> Contact Us
                            </Link>
                            <Link to="/refund-policy" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <RefreshCcw className="size-4 opacity-50" /> Refund Policy
                            </Link>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Legal</h3>
                        <div className="flex flex-col gap-2.5">
                            <Link to="/privacy-policy" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Shield className="size-4 opacity-50" /> Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Scale className="size-4 opacity-50" /> Terms of Service
                            </Link>
                        </div>
                    </div>

                    {/* Social Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-[10px] tracking-widest opacity-40">Follow Us</h3>
                        <div className="flex items-center gap-3">
                            {socialLinks.map((social, idx) => (
                                <a
                                    key={idx}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`size-9 rounded-xl bg-base-300/50 flex items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:bg-base-300 ${social.color}`}
                                    aria-label={social.label}
                                >
                                    <social.icon className="size-4.5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-base-300/30 mb-6" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs opacity-40 font-medium">
                        © {new Date().getFullYear()} BondBeyond. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs opacity-40">
                        Made with <Heart className="size-3 text-red-500 fill-current mx-0.5" /> for connections.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
