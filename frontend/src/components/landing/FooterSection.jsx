import { memo } from "react";
import { Link } from "react-router-dom";
import { Smartphone, Instagram, Linkedin, Twitter } from "lucide-react";
import Logo from "../Logo";
import { APK_DOWNLOAD_URL } from "../../lib/axios";

const FooterSection = memo(({ handleDownload }) => {
    return (
        <footer className="py-16 border-t border-base-300/50 bg-base-200/30 font-outfit">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <Logo className="size-6" fontSize="text-xl" />
                        <p className="text-sm opacity-60 max-w-xs leading-relaxed">
                            Zyro is the high-status social platform for strategic connections and AI-driven growth.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="https://www.instagram.com/rishigoswami18/" target="_blank" rel="noreferrer" className="size-10 rounded-xl bg-base-content/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <Instagram className="size-5" />
                            </a>
                            <a href="https://www.linkedin.com/in/hrishikesh-giri/" target="_blank" rel="noreferrer" className="size-10 rounded-xl bg-base-content/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <Linkedin className="size-5" />
                            </a>
                            <a href="#" className="size-10 rounded-xl bg-base-content/5 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300">
                                <Twitter className="size-5" />
                            </a>
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Architected & Founded by</p>
                            <p className="text-sm font-bold italic text-primary">Hrishikesh Giri</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">Quick Access</h4>
                        <ul className="space-y-4 text-sm opacity-70">
                            <li><Link to="/signup" className="hover:text-primary transition-colors">Apply for Account</Link></li>
                            <li><Link to="/login" className="hover:text-primary transition-colors">Access Portal</Link></li>
                            <li>
                                <a
                                    href={`${APK_DOWNLOAD_URL}/latest`}
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 hover:text-primary transition font-black text-primary"
                                >
                                    <Smartphone className="size-4" />
                                    Download Zyro APK
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">High-Status Reach</h4>
                        <ul className="space-y-4 text-sm opacity-70">
                            <li><Link to="/future-of-social-media" className="hover:text-primary transition-colors">Social Edge Vision</Link></li>
                            <li><Link to="/blog" className="hover:text-primary transition-colors">Zyro Intelligence</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Acceptable Use Policy</Link></li>
                            <li><Link to="/founder" className="hover:text-primary transition-colors text-primary font-bold">Founder's Note</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-6 text-xs uppercase tracking-[0.2em] opacity-40">Legal Protection</h4>
                        <ul className="space-y-4 text-sm opacity-70">
                            <li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Shield</Link></li>
                            <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-primary transition-colors">Refund Assurance</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="h-[1px] w-full bg-base-content/5 my-12" />
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] font-bold uppercase tracking-[0.1em] opacity-30">
                    <p>© {new Date().getFullYear()} Zyro Technologies Pvt. Ltd. | The Social Edge</p>
                    <p>Designed for Elite Performers</p>
                </div>
            </div>
        </footer>
    );
});

FooterSection.displayName = "FooterSection";
export default FooterSection;
