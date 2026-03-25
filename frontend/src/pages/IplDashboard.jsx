import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, Calendar, Trophy, Award, Users, Search, Bell, Menu, X, ArrowLeft, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import IplHome from '../components/ipl/IplHome';
import IplSchedule from '../components/ipl/IplSchedule';
import IplPointsTable from '../components/ipl/IplPointsTable';
import IplPlayerStats from '../components/ipl/IplPlayerStats';
import IplVenues from '../components/ipl/IplVenues';
import IplSquads from '../components/ipl/IplSquads';
import useAuthUser from '../hooks/useAuthUser';

const IplDashboard = () => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'home', label: 'Home', icon: LayoutGrid },
        { id: 'schedule', label: 'Schedule', icon: Calendar },
        { id: 'table', label: 'Points Table', icon: Trophy },
        { id: 'stats', label: 'Player Stats', icon: Award },
        { id: 'squads', label: 'Squads', icon: Users },
        { id: 'venues', label: 'Venues', icon: MapPin },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'home': return <IplHome />;
            case 'schedule': return <IplSchedule />;
            case 'table': return <IplPointsTable />;
            case 'stats': return <IplPlayerStats />;
            case 'squads': return <IplSquads />;
            case 'venues': return <IplVenues />;
            default: return <IplHome />;
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit">
            {/* Top Navigation Bar */}
            <nav className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 px-4 md:px-6 py-3 md:py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-6">
                        <button
                            onClick={() => navigate('/')}
                            className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-inner group"
                        >
                            <ArrowLeft className="size-4 md:size-5 text-white/60 group-hover:text-white transition-colors" />
                        </button>
                        <div>
                            <h1 className="text-lg md:text-2xl font-black italic tracking-tighter flex items-center gap-2">
                                IPL 2026 <span className="text-indigo-500 font-black px-1.5 py-0.5 bg-indigo-500/10 rounded-md md:rounded-lg text-[8px] md:text-[10px] not-italic tracking-widest uppercase ml-1 md:ml-2 animate-pulse">Hub</span>
                            </h1>
                            <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] md:tracking-[0.3em]">Exclusive Partnership Arena</p>
                        </div>
                    </div>

                    {/* Desktop Tabs */}
                    <div className="hidden lg:flex items-center bg-white/5 p-1.5 rounded-3xl border border-white/5">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id
                                        ? 'bg-white text-black shadow-2xl scale-105'
                                        : 'text-white/40 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="size-3.5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 p-2 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl px-4">
                            <img
                                src={authUser?.profilePic || 'https://via.placeholder.com/150'}
                                className="size-6 rounded-full border border-white/20"
                                alt="User"
                            />
                            <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">
                                {authUser?.fullName?.split(' ')[0]}
                            </span>
                        </div>
                        <button
                            className="lg:hidden p-2 text-white/60"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white/5 border-b border-white/5 overflow-hidden"
                    >
                        <div className="p-4 space-y-2">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-white/40 hover:bg-white/5'
                                        }`}
                                >
                                    <tab.icon className="size-5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Global Sticky Footer for Live Status */}
            <div className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] md:w-auto">
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="bg-white/10 backdrop-blur-3xl border border-white/20 p-3 md:p-4 px-5 md:px-8 rounded-2xl md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-4 md:gap-8 justify-between"
                >
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-2 md:size-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_red]" />
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">Next Big Event</span>
                            <span className="text-xs md:text-sm font-black italic tracking-tighter">IPL OPENER • MARCH 28</span>
                        </div>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <button className="bg-indigo-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all">
                        SET REMINDER
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default IplDashboard;
