import React from "react";
import { Mail, MessageCircle, MapPin, Send, Globe, MessageSquare, Headphones, ShieldCheck, Heart } from "lucide-react";
import { motion } from "framer-motion";

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white py-20 px-6 sm:px-12 font-medium">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                    
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-bold text-indigo-400 uppercase tracking-widest"
                            >
                                <Headphones size={12} /> Contact Us
                            </motion.div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight">Connect with <br/><span className="text-indigo-500">FreeChat</span></h1>
                            <p className="text-white/40 text-lg leading-relaxed max-w-md">
                                Have a question about creator tools, verification, or community management? Our support team is here to help you get the most out of FreeChat.
                            </p>
                        </div>

                        <div className="space-y-8">
                            <ContactItem 
                                icon={MessageSquare} 
                                title="Creator Support" 
                                value="freechatweb00@gmail.com" 
                                desc="Help with monetization, content tools, and verified status."
                            />
                            <ContactItem 
                                icon={ShieldCheck} 
                                title="Safety & Reporting" 
                                value="freechatweb00@gmail.com" 
                                desc="Report concerns about safety, privacy, or community standards."
                            />
                            <ContactItem 
                                icon={MapPin} 
                                title="Registered Office" 
                                value="LPU University, Phagwara, Punjab, India" 
                                desc="FreeChat Social Platforms Pvt. Ltd."
                            />
                        </div>
                    </div>

                    {/* Contact Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 md:p-12 relative overflow-hidden backdrop-blur-[100px] shadow-2xl"
                    >
                        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none">
                            <Heart className="size-64 text-white" />
                        </div>

                        <form className="space-y-6 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Display Name</label>
                                    <input 
                                        type="text" 
                                        placeholder="Rahul Sharma" 
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Email Address</label>
                                    <input 
                                        type="email" 
                                        placeholder="name@example.com" 
                                        className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">How can we help?</label>
                                <select 
                                    className="w-full h-14 bg-white/[0.03] border border-white/10 rounded-2xl px-6 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm appearance-none"
                                >
                                    <option className="bg-[#0f172a]">General Inquiry</option>
                                    <option className="bg-[#0f172a]">Creator Program</option>
                                    <option className="bg-[#0f172a]">Verification Request</option>
                                    <option className="bg-[#0f172a]">Report a Problem</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-2">Message Description</label>
                                <textarea 
                                    rows="5"
                                    placeholder="Tell us what you're thinking..." 
                                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 focus:outline-none focus:border-indigo-500/50 transition-all font-medium text-sm resize-none"
                                />
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full h-14 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Send Message <Send className="size-4" />
                            </motion.button>
                        </form>
                    </motion.div>
                </div>

                <div className="mt-32 pt-16 border-t border-white/5 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 mb-4">Connect on Socials</p>
                    <div className="flex justify-center gap-8">
                        <a href="https://www.instagram.com/rishigoswami18/" className="text-white/40 hover:text-indigo-400 transition-all">Instagram</a>
                        <a href="https://www.linkedin.com/in/hrishikesh-giri/" className="text-white/40 hover:text-indigo-400 transition-all">LinkedIn</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ContactItem = ({ icon: Icon, title, value, desc }) => (
    <div className="flex gap-6 group">
        <div className="size-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/60 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 group-hover:text-indigo-400 transition-all duration-500 shrink-0">
            <Icon className="size-6" />
        </div>
        <div className="space-y-1">
            <h4 className="font-bold text-xl tracking-tight mb-2">{title}</h4>
            <p className="text-indigo-400 font-bold text-sm tracking-wide">{value}</p>
            <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default ContactPage;
