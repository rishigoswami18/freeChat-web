import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Coins, TrendingUp, X, ShieldCheck } from "lucide-react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useMatch } from "../context/MatchContext";

// Stable socket connection for high-frequency events
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
let socket;

const IplPredictionPopup = ({ userId }) => {
    const { liveMatch, isLive } = useMatch();
    const [isVisible, setIsVisible] = useState(false);
    const [predictionValue, setPredictionValue] = useState(null);
    const [wagerAmount, setWagerAmount] = useState(10);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isLockActive, setIsLockActive] = useState(false);

    const matchId = liveMatch?._id || "match-01";

    useEffect(() => {
        if (!isLive) {
            setIsVisible(false);
            return;
        }

        const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
        socket = io(SOCKET_URL);

        socket.on("connect", () => {
            socket.emit("join_match", matchId);
        });

        // Anti-Cheat: Listen for Global Lock
        socket.on("match_update", (data) => {
            if (data.isLockActive !== undefined) {
                setIsLockActive(data.isLockActive);
            }
        });

        socket.on("lock_prediction_ui", (data) => {
            setIsLockActive(true);
            toast.error(data.message, { id: "lock-toast" });
        });

        // Listen for results from the engine
        socket.on("prediction_result", (data) => {
            setIsProcessing(false);
            setIsVisible(false);
            if (data.status === "WIN") {
                toast.success(data.message, { 
                    duration: 5000, 
                    icon: "🔥",
                    style: { background: "#10b981", color: "#fff", fontWeight: "bold" }
                });
            } else {
                toast.error(data.message);
            }
        });

        socket.on("prediction_error", (data) => {
            setIsProcessing(false);
            toast.error(data.message);
        });

        // Trigger popup every 15 seconds for engagement
        const timer = setInterval(() => {
            if (!isProcessing && !isLockActive && isLive) setIsVisible(true);
        }, 15000);

        return () => {
            socket.disconnect();
            clearInterval(timer);
        };
    }, [matchId, isProcessing, isLockActive, isLive]);

    const handlePredict = useCallback(() => {
        if (!predictionValue) return toast.error("Quick! Pick an outcome!");
        
        setIsProcessing(true);
        // Simulate Haptic Vibration (Web View)
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        socket.emit("submit_instant_prediction", {
            userId,
            matchId,
            predictionValue,
            wagerAmount
        });
    }, [userId, matchId, predictionValue, wagerAmount]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 500, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 500, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-96"
                >
                    <div className="bg-gradient-to-br from-[#1a1c2c] to-[#4a192c] border-2 border-primary/50 rounded-[32px] p-6 shadow-2xl overflow-hidden relative group">
                        {/* Ambient Glow */}
                        <div className="absolute -top-10 -right-10 size-40 bg-primary/20 blur-3xl rounded-full" />
                        
                        <button 
                            onClick={() => setIsVisible(false)}
                            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"
                        >
                            <X className="size-5" />
                        </button>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-amber-500 rounded-2xl shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                                <Zap className="size-6 text-white animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-2">
                                    Instant Strike <span className="bg-red-500 text-[10px] px-2 py-0.5 rounded-md animate-bounce">LIVE</span>
                                </h3>
                                <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest">Next Ball Outcome?</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-6">
                            {[0, 1, 4, 6, "Out", "Wde"].map((choice) => (
                                <button
                                    key={choice}
                                    onClick={() => !isLockActive && setPredictionValue(choice)}
                                    disabled={isLockActive}
                                    className={`py-3 rounded-2xl font-black italic transition-all active:scale-95 ${
                                        predictionValue === choice 
                                        ? "bg-primary text-white shadow-glow ring-2 ring-white/20" 
                                        : "bg-white/5 text-white/60 hover:bg-white/10"
                                    } ${isLockActive ? "opacity-30 cursor-not-allowed" : ""}`}
                                >
                                    {choice}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center justify-between mb-6 bg-black/30 p-4 rounded-3xl border border-white/5">
                            <div className="flex items-center gap-2">
                                <Coins className="size-4 text-amber-400" />
                                <span className="text-sm font-bold text-white">{wagerAmount} BC</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={() => setWagerAmount(Math.max(10, wagerAmount - 10))}
                                    className="px-3 py-1 bg-white/5 rounded-lg text-white font-black"
                                >-</button>
                                <button 
                                    onClick={() => setWagerAmount(wagerAmount + 10)}
                                    className="px-3 py-1 bg-white/5 rounded-lg text-white font-black"
                                >+</button>
                            </div>
                        </div>

                        <button
                            onClick={handlePredict}
                            disabled={isProcessing || isLockActive}
                            className={`w-full h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl text-white font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${isLockActive ? "grayscale" : ""}`}
                        >
                            {isProcessing ? (
                                <span className="loading loading-spinner" />
                            ) : isLockActive ? (
                                <>
                                    <ShieldCheck className="size-5" />
                                    Inputs Locked
                                </>
                            ) : (
                                <>
                                    <TrendingUp className="size-5" />
                                    Strike Prediction
                                </>
                            )}
                        </button>

                        <div className="mt-4 text-center">
                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/20">Potential Win: {wagerAmount * 2} BC</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IplPredictionPopup;
