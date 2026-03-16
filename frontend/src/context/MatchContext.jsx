import React, { createContext, useContext, useState, useEffect } from "react";
import io from "socket.io-client";
import { getUpcomingMatches } from "../lib/api";
import { useQuery } from "@tanstack/react-query";

const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [liveMatch, setLiveMatch] = useState(null);
    const [matchStats, setMatchStats] = useState({
        teamA: 50,
        teamB: 50,
        trendingEmotion: "Neural"
    });

    const { data: upcomingMatches, isLoading: isUpcomingLoading } = useQuery({
        queryKey: ["upcomingMatches"],
        queryFn: getUpcomingMatches,
        refetchInterval: 60000
    });

    // Helper: Determine current active match (Live or Next Upcoming)
    const activeMatch = liveMatch?.status === "live" ? liveMatch : (upcomingMatches?.[0] || null);
    const isLive = liveMatch?.status === "live";

    useEffect(() => {
        const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const socket = io(SOCKET_URL);
        thisSocket = socket;

        socket.on("connect", () => {
            socket.emit("join_match", "ipl_arena_global");
        });

        socket.on("match_update", (data) => {
            setLiveMatch(data);
        });

        // Dynamic Fan Pulse Updates
        socket.on("fan_pulse_update", (stats) => {
            setMatchStats(stats);
        });

        return () => socket.disconnect();
    }, []);

    // Dynamic Join Effect
    useEffect(() => {
        if (thisSocket && activeMatch?._id) {
            thisSocket.emit("join_match", activeMatch._id);
        }
    }, [activeMatch?._id]);

    const submitVote = (userId, matchId, team) => {
        if (thisSocket) {
            thisSocket.emit("submit_vote", { userId, matchId, team });
        }
    };

    return (
        <MatchContext.Provider value={{ 
            liveMatch, 
            upcomingMatches, 
            isUpcomingLoading,
            activeMatch,
            isLive,
            matchStats,
            submitVote
        }}>
            {children}
        </MatchContext.Provider>
    );
};

let thisSocket;

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error("useMatch must be used within a MatchProvider");
    }
    return context;
};
