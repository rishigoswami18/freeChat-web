import { Link } from "react-router-dom";
import { Heart, Mail, Shield, Scale, RefreshCcw } from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-base-200 border-t border-base-300 py-8 px-4 mt-auto">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-content font-bold">
                                fC
                            </div>
                            <span className="text-xl font-bold tracking-tight">freeChat</span>
                        </div>
                        <p className="text-sm opacity-60 max-w-xs">
                            An immersive social platform for connecting with friends and partners. Unleash your creativity with Reels and Stories.
                        </p>
                    </div>

                    {/* Support Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-xs tracking-widest opacity-40">Support</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="/contact" className="text-sm hover:text-primary flex items-center gap-2 transition-colors">
                                <Mail className="size-4" /> Contact Us
                            </Link>
                            <Link to="/refund-policy" className="text-sm hover:text-primary flex items-center gap-2 transition-colors">
                                <RefreshCcw className="size-4" /> Refund Policy
                            </Link>
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="space-y-4">
                        <h3 className="font-bold uppercase text-xs tracking-widest opacity-40">Legal</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="/privacy-policy" className="text-sm hover:text-primary flex items-center gap-2 transition-colors">
                                <Shield className="size-4" /> Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-sm hover:text-primary flex items-center gap-2 transition-colors">
                                <Scale className="size-4" /> Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-base-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs opacity-50 font-medium">
                        © {new Date().getFullYear()} freeChat. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs opacity-50">
                        Made with <Heart className="size-3 text-red-500 fill-current" /> for connections.
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
