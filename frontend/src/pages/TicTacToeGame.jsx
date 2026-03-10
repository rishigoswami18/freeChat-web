import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, Sparkles, X, Circle, Gamepad2 } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { tttAction, startGame, triggerAiTurn } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const TicTacToeGame = ({ session }) => {
    const { authUser } = useAuthUser();
    const [isMoving, setIsMoving] = useState(false);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { mutate: handleStartGame, isPending: isStartingNew } = useMutation({
        mutationFn: () => startGame(session.gameType),
        onSuccess: (data) => {
            navigate(`/game/${data.session._id}`);
            queryClient.invalidateQueries({ queryKey: ["gameSession", data.session._id] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to start new game"),
    });

    const myId = authUser?._id?.toString();
    const partner = session?.participants?.find(p => p._id?.toString() !== myId);
    const state = session?.state || {};
    const isMyTurn = state.currentPlayer === myId;
    const isCompleted = session?.status === "completed";
    const mySymbol = state.symbols?.[myId];
    const partnerSymbol = state.symbols?.[partner?._id?.toString()];
    const lastActionRef = useRef(state.lastAction);

    // AI Turn Auto-Trigger
    useEffect(() => {
        if (!isMyTurn && !isCompleted && state.currentPlayer === "ai-user-id") {
            const timer = setTimeout(async () => {
                try {
                    await triggerAiTurn(session._id);
                    queryClient.invalidateQueries({ queryKey: ["gameSession", session._id] });
                } catch (err) {
                    console.error("AI turn failed", err);
                    setTimeout(() => queryClient.invalidateQueries({ queryKey: ["gameSession", session._id] }), 3000);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isMyTurn, state.currentPlayer, session._id]);

    // AI Action Watcher
    useEffect(() => {
        if (state.lastAction && state.lastAction !== lastActionRef.current) {
            toast.success(state.lastAction, {
                icon: '🤖',
                duration: 4000,
                position: 'top-center',
                style: {
                    background: '#1a1a1a',
                    color: '#fff',
                    border: '1px solid rgba(139, 92, 246, 0.5)',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }
            });
            lastActionRef.current = state.lastAction;
        }
    }, [state.lastAction]);

    const handleMove = async (index) => {
        if (!isMyTurn || isCompleted || state.board[index] || isMoving) return;

        setIsMoving(true);
        if (window.AndroidBridge) window.AndroidBridge.vibrate(50);

        try {
            await tttAction(session._id, index);
            queryClient.invalidateQueries({ queryKey: ["gameSession", session._id] });
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid move");
        } finally {
            setIsMoving(false);
        }
    };

    const winningCombos = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    const winningLine = useMemo(() => {
        for (const combo of winningCombos) {
            const [a, b, c] = combo;
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                return combo;
            }
        }
        return null;
    }, [state.board]);

    if (isCompleted) {
        const isWinner = session.score === 100 && winningLine && state.board[winningLine[0]] === mySymbol;
        const isPartnerWinner = session.score === 100 && winningLine && state.board[winningLine[0]] === partnerSymbol;
        const isDraw = session.score === 50;

        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-6 text-center space-y-12">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} className="relative">
                    <div className="absolute inset-0 blur-3xl opacity-40 bg-gradient-to-tr from-primary to-pink-500 rounded-full" />
                    {isDraw ? (
                        <Gamepad2 className="size-32 text-primary drop-shadow-[0_0_20px_rgba(139,92,246,0.6)] relative z-10" />
                    ) : (
                        <Trophy className="size-32 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.6)] relative z-10" />
                    )}
                    <Sparkles className="absolute -top-6 -right-6 size-12 text-primary animate-pulse" />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-6xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
                        {isWinner ? "Victory!" : isPartnerWinner ? "Defeat!" : "Draw Match!"}
                    </h1>
                    <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">
                        {isWinner ? "You outplayed the AI with strategy." : isPartnerWinner ? "Golu was one step ahead this time." : "A masterfully balanced tie."}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                    <div className={`p-6 rounded-[32px] border-2 transition-all ${isWinner ? "bg-primary/20 border-primary shadow-glow" : "bg-white/5 border-white/10 opacity-40"}`}>
                        <img src={authUser?.profilePic} className="size-16 rounded-2xl mx-auto border-2 border-primary mb-3 object-cover" />
                        <span className="text-[10px] font-black uppercase text-primary">YOU</span>
                    </div>
                    <div className={`p-6 rounded-[32px] border-2 transition-all ${isPartnerWinner ? "bg-pink-500/20 border-pink-500 shadow-glow" : "bg-white/5 border-white/10 opacity-40"}`}>
                        <img src={partner?.profilePic} className="size-16 rounded-2xl mx-auto border-2 border-pink-500 mb-3 object-cover" />
                        <span className="text-[10px] font-black uppercase text-pink-500">{partner?.fullName?.split(" ")[0]}</span>
                    </div>
                </div>

                <button onClick={() => handleStartGame()} className="btn btn-primary btn-wide rounded-3xl h-16 font-black uppercase tracking-widest gap-3 shadow-glow mt-8">
                    Rematch Arena
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white p-2 relative overflow-hidden font-outfit select-none flex flex-col items-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_10%,rgba(139,92,246,0.15),transparent_70%)]" />

            <header className="w-full max-w-md flex items-center justify-between px-4 py-8 z-20">
                <Link to="/games" className="p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <ArrowLeft className="size-5" />
                </Link>
                <div className="text-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 italic">Mind Royale</h2>
                    <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold opacity-60 uppercase">Turn {state.turnCount || 0}</div>
                </div>
                <button onClick={() => window.confirm("Reset this match?") && handleStartGame()} className="p-3 bg-white/5 rounded-2xl border border-white/10 text-amber-400 hover:scale-110 active:scale-95 transition-all">
                    <Sparkles className="size-5" />
                </button>
            </header>

            {/* PLAYER STATUS BAR */}
            <div className="flex items-center justify-between w-full max-w-sm px-6 mb-12 z-20">
                <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${isMyTurn ? "scale-110" : "opacity-30 blur-[0.5px] grayscale"}`}>
                    <div className={`p-1.5 rounded-[22px] border-2 ${isMyTurn ? "border-primary bg-primary/20 shadow-glow" : "border-white/10 bg-white/5"}`}>
                        <img src={authUser?.profilePic} className="size-14 rounded-[16px] object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-primary">{mySymbol} <span className="text-white/40">YOU</span></span>
                </div>

                <div className="h-0.5 w-12 bg-white/5 relative">
                    <div className="absolute inset-0 bg-primary opacity-20 blur-sm" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black text-white/20 italic">VS</div>
                </div>

                <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${!isMyTurn ? "scale-110" : "opacity-30 blur-[0.5px] grayscale"}`}>
                    <div className={`p-1.5 rounded-[22px] border-2 ${!isMyTurn ? "border-pink-500 bg-pink-500/20 shadow-glow" : "border-white/10 bg-white/5"}`}>
                        <img src={partner?.profilePic} className="size-14 rounded-[16px] object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-pink-500">{partnerSymbol} <span className="text-white/40">{partner?.fullName?.split(" ")[0]}</span></span>
                </div>
            </div>

            {/* TIC TAC TOE BOARD */}
            <div className="relative w-full aspect-square max-w-[420px] p-6 z-20">
                <div className="grid grid-cols-3 gap-4 h-full">
                    {state.board?.map((cell, i) => {
                        const isWinningCell = winningLine?.includes(i);
                        return (
                            <motion.button
                                key={i}
                                onClick={() => handleMove(i)}
                                disabled={!isMyTurn || isCompleted || cell || isMoving}
                                whileTap={{ scale: 0.95 }}
                                className={`relative aspect-square flex items-center justify-center rounded-[32px] border-2 transition-all duration-300 overflow-hidden
                                    ${cell ? "bg-white/[0.03] border-white/10" : "bg-white/[0.03] border-white/[0.05] hover:border-white/20 hover:bg-white/[0.05]"}
                                    ${isWinningCell ? (cell === mySymbol ? "bg-primary/20 border-primary shadow-glow" : "bg-pink-500/20 border-pink-500 shadow-glow") : ""}
                                `}
                            >
                                <AnimatePresence mode="wait">
                                    {cell === "X" && (
                                        <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="text-primary drop-shadow-[0_0_15px_currentColor]">
                                            <X className="size-16 sm:size-20" />
                                        </motion.div>
                                    )}
                                    {cell === "O" && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-pink-500 drop-shadow-[0_0_15px_currentColor]">
                                            <Circle className="size-14 sm:size-18" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {!cell && isMyTurn && !isMoving && (
                                    <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 transition-colors" />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Winning Line Overlay (SVG) */}
                {winningLine && (
                    <svg className="absolute inset-0 pointer-events-none w-full h-full p-6 z-10 overflow-visible">
                        <defs>
                            <filter id="winGlow"><feGaussianBlur stdDeviation="6" /><feComposite in="SourceGraphic" operator="over" /></filter>
                        </defs>
                        <motion.line
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            x1={`${(winningLine[0] % 3) * 33.33 + 16.66}%`}
                            y1={`${Math.floor(winningLine[0] / 3) * 33.33 + 16.66}%`}
                            x2={`${(winningLine[2] % 3) * 33.33 + 16.66}%`}
                            y2={`${Math.floor(winningLine[2] / 3) * 33.33 + 16.66}%`}
                            stroke={state.board[winningLine[0]] === mySymbol ? "#8b5cf6" : "#ec4899"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            filter="url(#winGlow)"
                            opacity="0.8"
                        />
                    </svg>
                )}
            </div>

            {/* STRATEGY STATUS */}
            <div className="mt-12 flex flex-col items-center gap-3 py-6 z-20">
                {!isCompleted && (
                    <>
                        <div className="flex items-center gap-2">
                            <div className={`size-1.5 rounded-full animate-pulse ${isMyTurn ? "bg-primary shadow-[0_0_8px_#8b5cf6]" : "bg-pink-500 shadow-[0_0_8px_#ec4899]"}`} />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">
                                {isMyTurn ? "YOUR TURN STRATEGY" : `${partner?.fullName?.split(" ")[0]} IS THINKING...`}
                            </span>
                        </div>
                        {isMoving && <Loader2 className="size-6 text-primary animate-spin opacity-40 mt-2" />}
                    </>
                )}
            </div>

            <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
        </div>
    );
};

export default TicTacToeGame;
