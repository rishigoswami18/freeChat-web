import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowLeft, Loader2, Sparkles, X, Circle } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { tttAction } from "../lib/api";
import toast from "react-hot-toast";

const TicTacToeGame = ({ session }) => {
    const { authUser } = useAuthUser();
    const [isMoving, setIsMoving] = useState(false);

    const myId = authUser?._id?.toString();
    const partner = session?.participants?.find(p => p._id?.toString() !== myId);
    const state = session?.state || {};
    const isMyTurn = state.currentPlayer === myId;
    const isCompleted = session?.status === "completed";
    const mySymbol = state.symbols?.[myId];
    const partnerSymbol = state.symbols?.[partner?._id?.toString()];

    const handleMove = async (index) => {
        if (!isMyTurn || isCompleted || state.board[index] || isMoving) return;

        setIsMoving(true);
        if (window.AndroidBridge) window.AndroidBridge.vibrate(50);

        try {
            await tttAction(session._id, index);
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
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {isDraw ? (
                            <Gamepad2 className="size-24 text-primary drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                        ) : (
                            <Trophy className="size-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                        )}
                    </motion.div>
                    <Sparkles className="absolute -top-4 -right-4 size-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">
                        {isWinner ? "You Won!" : isPartnerWinner ? "Partner Won!" : "It's a Draw!"}
                    </h1>
                    <p className="opacity-60 font-bold uppercase tracking-widest text-xs">
                        {isDraw ? "Neither gave in. A perfect match!" : "Game Over - Strategic Victory!"}
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className={`p-4 rounded-3xl border transition-all ${isWinner ? "bg-primary/20 border-primary shadow-glow" : "bg-white/5 border-white/10"}`}>
                        <img src={authUser?.profilePic} className="size-12 rounded-full mx-auto border-2 border-primary mb-2" />
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-[10px] font-black uppercase">{mySymbol}</span>
                        </div>
                    </div>
                    <div className={`p-4 rounded-3xl border transition-all ${isPartnerWinner ? "bg-pink-500/20 border-pink-500 shadow-glow" : "bg-white/5 border-white/10"}`}>
                        <img src={partner?.profilePic} className="size-12 rounded-full mx-auto border-2 border-pink-500 mb-2" />
                        <div className="flex items-center justify-center gap-1">
                            <span className="text-[10px] font-black uppercase">{partnerSymbol}</span>
                        </div>
                    </div>
                </div>
                <Link to="/games" className="btn btn-primary btn-wide rounded-2xl h-14 font-black uppercase tracking-widest">
                    Play Again
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white p-4 relative overflow-hidden font-outfit select-none flex flex-col items-center">
            {/* Cyber Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_70%)]" />
            </div>

            <div className="relative z-10 w-full max-w-lg flex flex-col items-center h-full space-y-8 py-6">
                <header className="w-full flex items-center justify-between">
                    <Link to="/games" className="p-2 bg-white/5 rounded-full border border-white/10">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Tic Tac Toe</h1>
                        <span className="text-[10px] font-bold opacity-30 uppercase tracking-[0.1em]">Round {state.turnCount || 0}</span>
                    </div>
                    <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-amber-400" />
                    </div>
                </header>

                {/* Player Indicators */}
                <div className="flex items-center justify-between w-full px-4">
                    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${isMyTurn ? "bg-primary/20 border-primary scale-110 shadow-glow" : "opacity-30 border-transparent"}`}>
                        <img src={authUser?.profilePic} className="size-12 rounded-full border-2 border-primary" />
                        <div className="flex items-center gap-2">
                            <X className="size-4 text-primary" />
                            <span className="text-[10px] font-black uppercase">YOU</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[10px] font-black uppercase opacity-20 tracking-widest italic">VS</div>
                        <div className="h-0.5 w-12 bg-gradient-to-r from-primary to-pink-500 rounded-full" />
                    </div>

                    <div className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-300 ${!isMyTurn ? "bg-pink-500/20 border-pink-500 scale-110 shadow-glow" : "opacity-30 border-transparent"}`}>
                        <img src={partner?.profilePic} className="size-12 rounded-full border-2 border-pink-500" />
                        <div className="flex items-center gap-2">
                            <Circle className="size-4 text-pink-500" />
                            <span className="text-[10px] font-black uppercase">{partner?.fullName?.split(" ")[0]}</span>
                        </div>
                    </div>
                </div>

                {/* Game Board */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 shadow-2xl relative w-full aspect-square max-w-[400px]">
                    {state.board.map((cell, idx) => {
                        const isWinningCell = winningLine?.includes(idx);
                        return (
                            <motion.button
                                key={idx}
                                whileHover={isMyTurn && !cell ? { scale: 1.05 } : {}}
                                whileTap={isMyTurn && !cell ? { scale: 0.95 } : {}}
                                onClick={() => handleMove(idx)}
                                disabled={!isMyTurn || cell || isMoving}
                                className={`aspect-square rounded-2xl flex items-center justify-center relative transition-all overflow-hidden ${cell
                                        ? "bg-white/5"
                                        : isMyTurn
                                            ? "bg-white/[0.03] hover:bg-white/[0.08]"
                                            : "bg-white/[0.01]"
                                    } border border-white/5`}
                            >
                                <AnimatePresence mode="wait">
                                    {cell === "X" && (
                                        <motion.div
                                            initial={{ scale: 0, rotate: -45 }}
                                            animate={{ scale: 1, rotate: 0 }}
                                            className="text-primary"
                                        >
                                            <X size={48} className={`sm:size-64 drop-shadow-[0_0_10px_rgba(139,92,246,0.6)] ${isWinningCell ? "animate-pulse" : ""}`} />
                                        </motion.div>
                                    )}
                                    {cell === "O" && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="text-pink-500"
                                        >
                                            <Circle size={40} className={`sm:size-56 drop-shadow-[0_0_10px_rgba(236,72,153,0.6)] ${isWinningCell ? "animate-pulse" : ""}`} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {isWinningCell && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="absolute inset-0 bg-white/10"
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Status Bar */}
                <div className="w-full flex flex-col items-center gap-4">
                    <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 flex items-center gap-3">
                        <div className={`size-2 rounded-full animate-pulse ${isMyTurn ? "bg-primary" : "bg-pink-500"}`} />
                        <span className="text-xs font-black uppercase tracking-widest italic">
                            {isMyTurn ? "Your Turn Strategy" : `Awaiting ${partner?.fullName?.split(" ")[0]}`}
                        </span>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .shadow-glow { box-shadow: 0 0 20px -5px currentColor; }
            `}} />
        </div>
    );
};

export default TicTacToeGame;
