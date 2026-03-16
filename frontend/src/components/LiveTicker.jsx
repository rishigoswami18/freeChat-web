import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { axiosInstance } from "../lib/axios";

const LiveTicker = () => {
    const [matches, setMatches] = useState([]);

    const fetchTicker = async () => {
        try {
            const { data } = await axiosInstance.get("/ipl/ticker");
            setMatches(data);
        } catch (error) {
            console.error("Ticker fetch failed", error);
        }
    };

    useEffect(() => {
        fetchTicker();
        const interval = setInterval(fetchTicker, 10000); // 10s background fetch
        return () => clearInterval(interval);
    }, []);

    if (!matches.length) return null;

    return (
        <div className="w-full bg-[#1e1e2d] border-b border-white/5 py-3 overflow-hidden whitespace-nowrap">
            <motion.div 
                animate={{ x: ["0%", "-50%"] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="inline-flex gap-8 items-center"
            >
                {[...matches, ...matches].map((match, idx) => (
                    <div key={`${match.id}-${idx}`} className="flex items-center gap-4 px-6 border-r border-white/10 last:border-none group cursor-default">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-white/30 uppercase tracking-tighter">{match.series || "International"}</span>
                            <div className="flex items-center gap-2">
                                {match.isLive && <div className="size-1.5 rounded-full bg-red-500 animate-pulse" />}
                                <span className="text-xs font-bold text-white uppercase">{match.name}</span>
                            </div>
                        </div>
                        <span className={`text-xs font-black tabular-nums ${match.isLive ? "text-emerald-400" : "text-white/40"}`}>
                            {match.score}
                        </span>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default LiveTicker;
