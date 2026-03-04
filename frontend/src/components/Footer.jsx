import { Link } from "react-router-dom";
import { Heart, Mail, Shield, Scale, RefreshCcw, Info } from "lucide-react";
import Logo from "./Logo";

const Footer = () => {
    return (
        <footer className="bg-base-200/80 border-t border-base-300/50 py-10 px-4 mt-auto">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                    {/* Brand */}
                    <div className="space-y-4">
                        <Logo className="size-8" fontSize="text-xl" />
                        <p className="text-sm opacity-50 max-w-xs leading-relaxed">
                            An immersive social platform for connecting with friends and partners. Unleash your creativity with Reels and Stories.
                        </p>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-xs tracking-widest opacity-40">Support</h3>
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
                        <h3 className="font-bold uppercase text-xs tracking-widest opacity-40">Legal</h3>
                        <div className="flex flex-col gap-2.5">
                            <Link to="/privacy-policy" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Shield className="size-4 opacity-50" /> Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-sm hover:text-primary flex items-center gap-2 transition-colors link-hover-underline w-fit">
                                <Scale className="size-4 opacity-50" /> Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="section-divider" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-2">
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
