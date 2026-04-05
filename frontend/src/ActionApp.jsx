import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Target, CheckCircle, ShieldCheck, Wallet } from "lucide-react";
import axios from "axios";
import Dashboard from "./pages/Dashboard";
import CreateGoal from "./pages/CreateGoal";
import ProgressUpdate from "./pages/ProgressUpdate";
import ValidationQueue from "./pages/ValidationQueue";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
    const [wallet, setWallet] = useState({ balance: 0, staked: 0 });
    const [goals, setGoals] = useState([]);
    const [validationQueue, setValidationQueue] = useState([]);

    const fetchData = async () => {
        try {
            const [walletRes, goalsRes, queueRes] = await Promise.all([
                axios.get("/api/wallet/balance"),
                axios.get("/api/goals"),
                axios.get("/api/progress/validate-queue")
            ]);
            setWallet(walletRes.data);
            setGoals(goalsRes.data);
            setValidationQueue(queueRes.data);
        } catch (err) {
            console.error("Data fetch failed", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center">
            <div className="w-full max-w-[480px] min-h-screen bg-[#020617] border-x border-white/5 flex flex-col relative pb-24">
                
                <header className="p-6 border-b border-white/5 sticky top-0 bg-[#020617]/80 backdrop-blur-xl z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-xl bg-primary flex items-center justify-center">
                                <Target size={18} className="text-white" />
                            </div>
                            <h1 className="text-xl font-black italic uppercase tracking-tighter">Nexus Action</h1>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full">
                            <Wallet size={14} className="text-primary" />
                            <span className="text-xs font-black">₹{wallet.balance / 100}</span>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard wallet={wallet} goals={goals} queueLength={validationQueue.length} />} />
                        <Route path="/new" element={<CreateGoal wallet={wallet} onCreated={fetchData} />} />
                        <Route path="/check-in" element={<ProgressUpdate goals={goals} onSubmitted={fetchData} />} />
                        <Route path="/validate" element={<ValidationQueue queue={validationQueue} onValidated={fetchData} />} />
                    </Routes>
                </main>

                <nav className="fixed bottom-0 w-full max-w-[480px] bg-[#020617]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-4 z-40">
                    <div className="flex items-center justify-between">
                        <NavLink to="/" icon={LayoutDashboard} label="Pulse" />
                        <NavLink to="/new" icon={PlusIcon} label="Forge" />
                        <NavLink to="/check-in" icon={CheckCircle} label="Check-in" />
                        <NavLink to="/validate" icon={ShieldCheck} label="Audit" badge={validationQueue.length} />
                    </div>
                </nav>
            </div>
            <Toaster position="top-center" />
        </div>
    );
};

const PlusIcon = ({ size, className }) => (
    <div className={`p-1 bg-primary text-white rounded-lg ${className}`}>
        <Target size={size} />
    </div>
);

const NavLink = ({ to, icon: Icon, label, badge }) => {
    const { pathname } = useLocation();
    const active = pathname === to;
    return (
        <Link to={to} className="flex flex-col items-center gap-1 group relative">
            <div className={`transition-all duration-300 ${active ? 'text-primary scale-110' : 'text-white/40 group-hover:text-white/60'}`}>
                <Icon size={22} strokeWidth={active ? 3 : 2} />
                {badge > 0 && (
                    <span className="absolute -top-1 -right-1 size-4 bg-primary text-[8px] font-black flex items-center justify-center rounded-full animate-pulse border-2 border-[#020617]">
                        {badge}
                    </span>
                )}
            </div>
            <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-white' : 'text-white/20'}`}>{label}</span>
        </Link>
    );
};

export default App;
