import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { getUpcomingMatches } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";

const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [liveMatch, setLiveMatch] = useState(null);
    const [matchStats, setMatchStats] = useState({
        teamA: 50,
        teamB: 50,
        trendingEmotion: "Neural"
    });
    const socketRef = useRef(null);

    const { data: upcomingMatches, isLoading: isUpcomingLoading } = useQuery({
        queryKey: ["upcomingMatches"],
        queryFn: getUpcomingMatches,
        refetchInterval: 60000
    });

    // Helper: Determine current active match (Live or Next Upcoming)
    const activeMatch = liveMatch?.status === "live" ? liveMatch : (upcomingMatches?.[0] || null);
    const isLive = liveMatch?.status === "live";

    const fetchInitialLiveStats = async () => {
        try {
            const { data } = await axiosInstance.get("/ipl/live-stats");
            if (data.match && data.match.status === "live") {
                setLiveMatch(data.match);
            }
        } catch (error) {
            console.warn("REST Sync unavailable, waiting for Socket Pulse...");
        }
    };

    useEffect(() => {
        fetchInitialLiveStats();

        const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        const socket = io(SOCKET_URL, {
            transports: ["websocket"],
            reconnectionAttempts: 5
        });
        socketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("join_match", "ipl_arena_global");
        });

        socket.on("match_update", (data) => {
            setLiveMatch(prev => ({ ...prev, ...data }));
        });

        socket.on("fan_pulse_update", (stats) => {
            setMatchStats(stats);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, []);

    // Dynamic Join Effect
    useEffect(() => {
        const id = activeMatch?._id || activeMatch?.matchId;
        if (socketRef.current && id) {
            console.log(`🔌 [Socket] Joining Room: match_${id}`);
            socketRef.current.emit("join_match", id);
        }
    }, [activeMatch?._id, activeMatch?.matchId]);

    const submitVote = (userId, matchId, team) => {
        if (socketRef.current) {
            socketRef.current.emit("submit_vote", { userId, matchId, team });
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

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error("useMatch must be used within a MatchProvider");
    }
    return context;
};
