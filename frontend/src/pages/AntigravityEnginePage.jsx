import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Globe, Shield, Sparkles, TrendingUp, Users, DollarSign, PieChart } from 'lucide-react';

const BusinessInsightsPage = () => {
    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 lg:p-20 overflow-hidden font-medium">
            <div className="max-w-7xl mx-auto space-y-24">
                
                {/* Header Section */}
                <div className="text-center space-y-8 relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 font-bold text-[10px] uppercase tracking-[0.4em] relative z-10"
                    >
                        <BarChart3 className="size-4" /> Professional Analytics Suite
                    </motion.div>
                    <div className="space-y-4 relative z-10">
                        <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none">
                            Business <br/><span className="text-indigo-500">Insights</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-white/40 text-lg font-medium leading-relaxed">
                            Unlock the data behind your digital brand. Track engagement, optimize reach, and manage your business revenue with precision.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                        <StatCard icon={Users} label="Daily Reach" value="1.2K+" color="text-indigo-400" />
                        <StatCard icon={TrendingUp} label="Growth Rate" value="+14.5%" color="text-emerald-400" />
                        <StatCard icon={DollarSign} label="Total Earnings" value="₹12,450" color="text-amber-400" />
                        <StatCard icon={PieChart} label="Conversion" value="4.2%" color="text-violet-400" />
                    </div>

                    <div className="lg:col-span-8 space-y-8">
                         <div className="bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-10 md:p-14 space-y-10 relative overflow-hidden backdrop-blur-xl">
                            <div className="flex justify-between items-start">
                                <div className="space-y-3">
                                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-4">
                                        Audience Intelligence <Sparkles className="size-6 text-indigo-500" />
                                    </h2>
                                    <p className="text-white/40 font-medium leading-relaxed max-w-lg">
                                        Our AI-driven analytics layer identifies peak activity times for your specific audience hubs. 
                                        Most active location: <span className="text-white font-bold">Bangalore</span>. Peak Engagement: <span className="text-white font-bold">8 PM - 10 PM</span>.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="h-64 flex items-end gap-3 px-4">
                                {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85, 60, 40].map((h, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: i * 0.05, duration: 0.8, ease: 'easeOut' }}
                                        className="flex-1 bg-gradient-to-t from-indigo-600/20 to-indigo-500/80 rounded-t-xl"
                                    />
                                ))}
                            </div>
                         </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="p-10 bg-white/[0.02] rounded-[3.5rem] border border-white/5 space-y-6 flex flex-col items-center text-center">
                            <div className="size-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
                                <Shield className="size-8" />
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-bold text-2xl tracking-tight">Verified Trust</h4>
                                <p className="text-xs font-bold text-white/30 uppercase tracking-widest leading-relaxed">Identity anchored to secure professional protocols.</p>
                            </div>
                            <button className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-500/20 transition-all">
                                UPDATE BADGE
                            </button>
                        </div>

                        <div className="p-10 bg-gradient-to-br from-[#0c1020] to-[#050505] rounded-[3.5rem] border border-white/5 space-y-10 relative overflow-hidden group">
                           <Globe className="absolute -bottom-10 -right-10 size-40 text-white/5 group-hover:rotate-12 transition-transform duration-1000" />
                           <div className="space-y-4">
                               <h4 className="text-xl font-bold tracking-tight">Expand Your Reach</h4>
                               <p className="text-sm text-white/40 leading-relaxed">Unlock hyperlocal discovery tools to connect with businesses across India.</p>
                           </div>
                           <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex h-12 items-center px-10 border border-white/10 rounded-2xl font-bold text-xs tracking-widest uppercase hover:bg-white/5 transition-all"
                           >
                            UPGRADE NOW
                           </motion.button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] group hover:bg-white/[0.04] transition-all">
        <div className={`size-12 rounded-xl mb-6 bg-white/5 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="size-5" />
        </div>
        <div className="space-y-1">
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{label}</p>
            <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
        </div>
    </div>
);

export default BusinessInsightsPage;
