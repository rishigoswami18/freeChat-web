import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    Trophy, Zap, Users, TrendingUp, ChevronRight, 
    Award, Star, LayoutGrid, ListOrdered, Shield
} from "lucide-react";
import { axiosInstance } from "../lib/axios";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const Header = ({ authUser }) => (
    <div className="relative z-10 px-8 py-10 border-b border-white/5 bg-white/2[backdrop-blur-xl]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-5xl font-black italic tracking-tighter">PREMIUM ARENA</h1>
                <p className="text-[10px] font-black text-orange-500 uppercase tracking-[0.5em] mt-1">Special Edition: IPL Tracker</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-[10px] font-bold text-white/30 uppercase">Pro Player</p>
                    <p className="font-black italic">{authUser?.fullName}</p>
                </div>
                <div className="size-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
                    <Trophy className="size-6 text-white" />
                </div>
            </div>
        </div>
    </div>
);

const MatchList = ({ matches }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {matches.map((match) => (
            <div key={match.id} className="bg-white/5 border border-white/5 rounded-[40px] p-8 hover:border-white/20 transition-all group">
                <div className="flex justify-between items-center mb-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        match.status === "live" ? "bg-red-500 text-white animate-pulse" : "bg-white/10 text-white/40"
                    }`}>
                        {match.status}
                    </span>
                </div>
                <h3 className="text-2xl font-black italic mb-2">{match.name}</h3>
                <p className="text-3xl font-black text-indigo-400 mb-6">{match.score}</p>
                <button className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                    {match.status === "live" ? "Predict Now" : "View Details"}
                </button>
            </div>
        ))}
    </div>
);

const PointsTable = ({ data = [] }) => (
    <div className="bg-white/5 rounded-[40px] border border-white/5 overflow-hidden">
        <table className="w-full text-left">
            <thead>
                <tr className="border-b border-white/5 bg-white/5 font-black text-[10px] uppercase tracking-widest text-white/30">
                    <th className="px-8 py-6">Team</th>
                    <th className="px-8 py-6">P</th>
                    <th className="px-8 py-6">W</th>
                    <th className="px-8 py-6">L</th>
                    <th className="px-8 py-6">Pts</th>
                    <th className="px-8 py-6">NRR</th>
                </tr>
            </thead>
            <tbody className="font-bold text-sm">
                {data.map((item, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-8 py-6 flex items-center gap-4">
                            <span className="text-white/20 text-xs">0{idx+1}</span>
                            <span className="font-black italic">{item.team}</span>
                        </td>
                        <td className="px-8 py-6">{item.played}</td>
                        <td className="px-8 py-6 text-emerald-400">{item.won}</td>
                        <td className="px-8 py-6 text-red-500">{item.lost}</td>
                        <td className="px-8 py-6 font-black text-xl">{item.points}</td>
                        <td className="px-8 py-6 text-white/40">{item.nrr}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const Leaderboard = ({ data = [] }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
                <Award className="size-8 text-orange-500" />
                <h3 className="text-2xl font-black italic">ORANGE CAP</h3>
            </div>
            <div className="space-y-4">
                {data.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                        <span className="font-bold">{p.name} ({p.team})</span>
                        <span className="font-black text-xl italic">{p.runs} Runs</span>
                    </div>
                ))}
            </div>
        </div>
        <div className="bg-white/5 rounded-[40px] p-8 border border-white/5">
            <div className="flex items-center gap-4 mb-8">
                <Star className="size-8 text-purple-500" />
                <h3 className="text-2xl font-black italic">PURPLE CAP</h3>
            </div>
            <div className="space-y-4">
                {data.map((p, idx) => p.wickets > 0 && (
                    <div key={idx} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl">
                        <span className="font-bold">{p.name} ({p.team})</span>
                        <span className="font-black text-xl italic">{p.wickets} Wickets</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const Squads = ({ squads = {} }) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {Object.entries(squads).map(([team, players]) => (
            <div key={team} className="bg-white/5 rounded-[40px] p-8 border border-white/5">
                <div className="flex items-center gap-4 mb-6">
                    <Shield className="size-6 text-white/30" />
                    <h3 className="text-2xl font-black italic">{team} SQUAD</h3>
                </div>
                <div className="space-y-3">
                    {players.map(p => (
                        <div key={p} className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2">
                             <div className="size-1.5 rounded-full bg-orange-500" />
                             {p}
                        </div>
                    ))}
                </div>
            </div>
        ))}
    </div>
);

const IplHomeDashboard = () => {
    const { authUser } = useAuthUser();
    const [activeTab, setActiveTab] = useState("matches");
    const [matches, setMatches] = useState([]);
    const [iplDetails, setIplDetails] = useState({ pointsTable: [], leaderboard: [] });
    const [squads, setSquads] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [tickerRes, detailsRes, squadsRes] = await Promise.all([
                axiosInstance.get("/ipl/ticker"),
                axiosInstance.get("/ipl/details"),
                axiosInstance.get("/ipl/squads")
            ]);
            setMatches(tickerRes.data);
            setIplDetails(detailsRes.data);
            setSquads(squadsRes.data);
            setIsLoading(false);
        } catch (error) {
            console.error("Failed to fetch IPL data", error);
            toast.error("Network slowdown. Retrying...");
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Pulse every 30s for tab data
        return () => clearInterval(interval);
    }, []);

    const TabButton = ({ id, icon: Icon, label }) => (
        <button 
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${
                activeTab === id ? "bg-white text-black shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
        >
            <Icon className="size-4" />
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-[#050505] font-outfit text-white relative flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 via-transparent to-indigo-600/10 pointer-events-none" />
            
            <Header authUser={authUser} />

            <div className="relative z-10 px-8 py-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
                {/* Tab Navigation */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                    <TabButton id="matches" icon={Zap} label="Matches" />
                    <TabButton id="table" icon={ListOrdered} label="Points Table" />
                    <TabButton id="leaderboard" icon={TrendingUp} label="Leaderboard" />
                    <TabButton id="squads" icon={Users} label="Squads" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex-1"
                    >
                        {activeTab === "matches" && <MatchList matches={matches} />}
                        {activeTab === "table" && <PointsTable data={iplDetails.pointsTable} />}
                        {activeTab === "leaderboard" && <Leaderboard data={iplDetails.leaderboard} />}
                        {activeTab === "squads" && <Squads squads={squads} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default IplHomeDashboard;
