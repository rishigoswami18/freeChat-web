import { memo } from "react";
import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";
import Logo from "../Logo";
import { APK_DOWNLOAD_URL } from "../../lib/axios";

const FooterSection = memo(({ handleDownload }) => {
    return (
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
                            <li><Link to="/about" className="hover:text-primary transition-colors link-hover-underline">About Us</Link></li>
                            <li><Link to="/signup" className="hover:text-primary transition-colors link-hover-underline">Sign Up</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors link-hover-underline">Login</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors link-hover-underline">Contact Us</Link></li>
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
                            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors link-hover-underline">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors link-hover-underline">Terms of Service</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-primary transition-colors link-hover-underline">Refund Policy</Link></li>
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
    );
});

FooterSection.displayName = "FooterSection";
export default FooterSection;
