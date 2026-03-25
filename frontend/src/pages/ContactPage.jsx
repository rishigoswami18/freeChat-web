import React from "react";
import { Mail, MessageCircle, MapPin, Send, Globe } from "lucide-react";

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-[#050508] text-white py-20 px-6 sm:px-12 font-outfit">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                    
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div>
                            <h1 className="text-5xl font-black italic tracking-tighter mb-4">Connect with Zyro</h1>
                            <p className="text-white/40 text-lg leading-relaxed max-w-md">
                                Whether you're a financial institution seeking secure infrastructure or a brand looking for enterprise solutions, our team is standing by.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <ContactItem 
                                icon={Mail} 
                                title="Enterprise Support & Billing" 
                                value="freechatweb00@gmail.com | +91-9905755603" 
                                desc="For 24/7 dedicated technical support and SLA tracking."
                            />
                            <ContactItem 
                                icon={Globe} 
                                title="Corporate Inquiries" 
                                value="freechatweb00@gmail.com" 
                                desc="For banking partnerships, compliance, and media."
                            />
                            <ContactItem 
                                icon={MapPin} 
                                title="Registered Office Address" 
                                value="LPU University, Phagwara, Punjab, India" 
                                desc="Zyro Technologies Pvt. Ltd."
                            />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white/5 border border-white/10 rounded-[40px] p-10 md:p-12 relative overflow-hidden backdrop-blur-3xl">
                        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
                            <MessageCircle className="size-48" />
                        </div>

                        <form className="space-y-6 relative z-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Identity</label>
                                <input 
                                    type="text" 
                                    placeholder="Full Name" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Email Address</label>
                                <input 
                                    type="email" 
                                    placeholder="name@example.com" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/30">Your Message</label>
                                <textarea 
                                    rows="4"
                                    placeholder="How can we elevate your financial workflows?" 
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                                />
                            </div>

                            <button className="w-full bg-white text-black h-16 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
                                Send Message <Send className="size-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactItem = ({ icon: Icon, title, value, desc }) => (
    <div className="flex gap-6 group">
        <div className="size-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-indigo-600 group-hover:border-indigo-600 transition-all">
            <Icon className="size-6" />
        </div>
        <div>
            <h4 className="font-black italic text-xl mb-1">{title}</h4>
            <p className="text-indigo-400 font-bold mb-1">{value}</p>
            <p className="text-xs text-white/30 font-medium">{desc}</p>
        </div>
    </div>
);

export default ContactPage;
