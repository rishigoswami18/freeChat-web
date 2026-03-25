import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, MessageSquare, ExternalLink, Copyright, Zap, Instagram, Twitter, Linkedin } from 'lucide-react';

const GlobalFooter = () => {
    return (
        <footer className="bg-[#0c0c14] border-t border-white/5 pt-20 pb-12 px-6 relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-80 bg-indigo-600/5 blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 relative z-10">
                {/* Brand Section */}
                <div className="space-y-6 lg:col-span-2">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-orange-500 flex items-center justify-center text-black font-black italic shadow-lg shadow-orange-500/20">
                            B
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tighter uppercase">Zyro</h2>
                            <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] -mt-1">India's #1 Fan Engagement Hub</p>
                        </div>
                    </div>
                    <p className="text-sm font-bold text-white/40 leading-relaxed max-w-sm">
                        Zyro is a cutting-edge Sports-Tech platform redefining the fan experience through the Antigravity Engine. We transform passive viewing into an active, data-driven analytical journey.
                    </p>
                    <div className="flex items-center gap-4">
                        <button className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Instagram className="size-5" />
                        </button>
                        <button className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Twitter className="size-5" />
                        </button>
                        <button className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all">
                            <Linkedin className="size-5" />
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Network</h3>
                    <ul className="space-y-4">
                        <li><a href="/dashboard" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Dashboard</a></li>
                        <li><a href="/ipl-arena" className="text-sm font-bold text-white/40 hover:text-white transition-colors">IPL Arena</a></li>
                        <li><a href="/feed" className="text-sm font-bold text-white/40 hover:text-white transition-colors">FanPulse Feed</a></li>
                        <li><a href="/wallet" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Earnings Vault</a></li>
                        <li><a href="/about" className="text-sm font-bold text-white/40 hover:text-white transition-colors">About Story</a></li>
                    </ul>
                </div>

                {/* Platform */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Platform</h3>
                    <ul className="space-y-4">
                        <li><a href="/terms" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Terms of Service</a></li>
                        <li><a href="/privacy-policy" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="/refund-policy" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Cancellation & Refund</a></li>
                        <li><a href="/shipping-policy" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Shipping & Delivery</a></li>
                        <li><a href="/contact" className="text-sm font-bold text-white/40 hover:text-white transition-colors">Contact Us</a></li>
                    </ul>
                </div>

                {/* Reach Out */}
                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em]">Reach Out</h3>
                    <div className="space-y-4">
                        <a href="/contact" className="block p-4 bg-white/5 border border-white/5 rounded-2xl group hover:border-indigo-500/50 transition-all">
                            <div className="flex items-center gap-4">
                                <Mail className="size-5 text-indigo-400" />
                                <div>
                                    <p className="text-[9px] font-black uppercase text-white/20">Email Support</p>
                                    <p className="text-xs font-bold text-white/60 group-hover:text-white">help@Zyro.in</p>
                                </div>
                            </div>
                        </a>
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                            <MessageSquare className="size-5 text-emerald-400" />
                            <div>
                                <p className="text-[9px] font-black uppercase text-white/20">Live Concierge</p>
                                <p className="text-xs font-bold text-white/60">In-App Chat 24/7</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance & Address Section */}
            <div className="max-w-7xl mx-auto mt-20 grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12 border-t border-white/5">
                <div className="space-y-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-white/20">Registered Office</p>
                    <p className="text-xs font-bold text-white/40 leading-relaxed italic">
                        Zyro Tech Solutions,<br />
                        3rd Floor, Silicon Valley Wing,<br />
                        Lovely Professional University, Phagwara,<br />
                        Punjab, India - 144411
                    </p>
                </div>
                <div className="lg:col-span-2 p-6 bg-white/5 border border-white/5 rounded-[2rem]">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-3 flex items-center gap-2">
                        <ShieldCheck className="size-3" /> Responsible Gaming Awareness
                    </h4>
                    <p className="text-[11px] font-bold text-white/30 leading-relaxed">
                        Zyro is a "Game of Skill" where winning depends on your analytical prowess and sports knowledge. 
                        Fantasy sports involve an element of financial risk and may be addictive. Please play responsibly and at your own risk. 
                        Participation is prohibited for users under 18 years of age or residents of restricted Indian states.
                    </p>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2 text-white/20 font-black text-[10px] uppercase tracking-widest">
                    <Copyright className="size-3" /> 2026 Zyro Network • Founded by Hrishikesh Giri
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <ShieldCheck className="size-3 text-emerald-500" />
                        <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">PCI-DSS Compliant</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                        <ExternalLink className="size-3 text-indigo-400" />
                        <span className="text-[8px] font-black uppercase text-white/40 tracking-widest">Powered by Razorpay</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
