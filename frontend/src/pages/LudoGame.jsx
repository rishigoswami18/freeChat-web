import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Trophy, ArrowLeft, Loader2, Sparkles, User, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { ludoAction } from "../lib/api";
import toast from "react-hot-toast";

const LudoGame = ({ session }) => {
    const { authUser } = useAuthUser();
    const [isRolling, setIsRolling] = useState(false);
    const [localDice, setLocalDice] = useState(session?.state?.dice || 1);
    const [movingPiece, setMovingPiece] = useState(null);

    const myId = authUser?._id?.toString();
    const partner = session?.participants?.find(p => p._id?.toString() !== myId);
    const state = session?.state || {};
    const isMyTurn = state.currentPlayer === myId;
    const isCompleted = session?.status === "completed";

    // SVG Board Configuration
    const GRID_SIZE = 15;
    const VIEWBOX_WIDTH = 600;
    const CELL_SIZE = VIEWBOX_WIDTH / GRID_SIZE;

    // Helper to get coordinates for a logical position
    const getCoords = (userId, piecePos, pieceIndex) => {
        const isPlayer1 = userId === session.participants[0]._id.toString();

        // Base / Home positions
        if (piecePos === -1) {
            if (isPlayer1) {
                // Top Left Base
                const baseX = pieceIndex % 2 === 0 ? 2 : 3.5;
                const baseY = pieceIndex < 2 ? 2 : 3.5;
                return { x: baseX * CELL_SIZE, y: baseY * CELL_SIZE };
            } else {
                // Bottom Right Base
                const baseX = pieceIndex % 2 === 0 ? 11 : 12.5;
                const baseY = pieceIndex < 2 ? 11 : 12.5;
                return { x: baseX * CELL_SIZE, y: baseY * CELL_SIZE };
            }
        }

        // Winning / Goal positions
        if (piecePos >= 57) {
            return { x: 7.5 * CELL_SIZE, y: 7.5 * CELL_SIZE };
        }

        // Path Mapping (Simplified 2-player Path)
        // Red start: (6, 1), Blue start: (8, 13)
        // This is a complex mapping, but I'll define a standard Ludo path array
        const commonPath = [
            { x: 6, y: 1 }, { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }, // L1
            { x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }, { x: 2, y: 6 }, { x: 1, y: 6 }, { x: 0, y: 6 }, // L2
            { x: 0, y: 7 }, { x: 0, y: 8 }, // Mid Left
            { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, // L3
            { x: 6, y: 9 }, { x: 6, y: 10 }, { x: 6, y: 11 }, { x: 6, y: 12 }, { x: 6, y: 13 }, { x: 6, y: 14 }, // L4
            { x: 7, y: 14 }, { x: 8, y: 14 }, // Mid Bottom
            { x: 8, y: 13 }, { x: 8, y: 12 }, { x: 8, y: 11 }, { x: 8, y: 10 }, { x: 8, y: 9 }, // R1
            { x: 9, y: 8 }, { x: 10, y: 8 }, { x: 11, y: 8 }, { x: 12, y: 8 }, { x: 13, y: 8 }, { x: 14, y: 8 }, // R2
            { x: 14, y: 7 }, { x: 14, y: 6 }, // Mid Right
            { x: 13, y: 6 }, { x: 12, y: 6 }, { x: 11, y: 6 }, { x: 10, y: 6 }, { x: 9, y: 6 }, // R3
            { x: 8, y: 5 }, { x: 8, y: 4 }, { x: 8, y: 3 }, { x: 8, y: 2 }, { x: 8, y: 1 }, { x: 8, y: 0 }, // R4
            { x: 7, y: 0 }, { x: 6, y: 0 } // Mid Top
        ];

        // Home stretch paths
        const homeStretchRed = [
            { x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }
        ];
        const homeStretchBlue = [
            { x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }
        ];

        if (isPlayer1) {
            if (piecePos < 51) return { x: commonPath[piecePos].x * CELL_SIZE, y: commonPath[piecePos].y * CELL_SIZE };
            return { x: homeStretchRed[piecePos - 51].x * CELL_SIZE, y: homeStretchRed[piecePos - 51].y * CELL_SIZE };
        } else {
            // Player 2 starts 26 steps later
            const adjustedPos = (piecePos + 26) % 52;
            if (piecePos < 51) return { x: commonPath[adjustedPos].x * CELL_SIZE, y: commonPath[adjustedPos].y * CELL_SIZE };
            return { x: homeStretchBlue[piecePos - 51].x * CELL_SIZE, y: homeStretchBlue[piecePos - 51].y * CELL_SIZE };
        }
    };

    const handleRoll = async () => {
        if (!isMyTurn || state.rolled || isRolling) return;
        setIsRolling(true);
        if (window.AndroidBridge) window.AndroidBridge.vibrate(100);

        try {
            await ludoAction(session._id, "roll");
            // Animation handled by useEffect watching state.dice
        } catch (err) {
            toast.error("Roll failed");
        } finally {
            setTimeout(() => setIsRolling(false), 800);
        }
    };

    const handleMove = async (pieceIndex) => {
        if (!isMyTurn || !state.rolled || isRolling) return;
        setMovingPiece(pieceIndex);

        try {
            await ludoAction(session._id, "move", pieceIndex);
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid move");
        } finally {
            setTimeout(() => setMovingPiece(null), 500);
        }
    };

    useEffect(() => {
        if (state.dice) setLocalDice(state.dice);
    }, [state.dice]);

    if (isCompleted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
                <div className="relative">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Trophy className="size-24 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
                    </motion.div>
                    <Sparkles className="absolute -top-4 -right-4 size-8 text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-4xl font-black italic uppercase italic tracking-tighter">Victory!</h1>
                    <p className="opacity-60 font-bold uppercase tracking-widest text-xs">A true legend has conquered the board</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <img src={authUser?.profilePic} className="size-12 rounded-full mx-auto border-2 border-primary mb-2" />
                        <span className="text-[10px] font-black uppercase text-primary">Master</span>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                        <img src={partner?.profilePic} className="size-12 rounded-full mx-auto border-2 border-pink-500 mb-2" />
                        <span className="text-[10px] font-black uppercase text-pink-500">Legend</span>
                    </div>
                </div>
                <Link to="/games" className="btn btn-primary btn-wide rounded-2xl h-14 font-black uppercase tracking-widest">
                    Play Again
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080808] text-white p-2 relative overflow-hidden font-outfit select-none">
            {/* Cyber Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.05),transparent_70%)]" />
                <div className="grid-bg opacity-10 absolute inset-0" />
            </div>

            <div className="relative z-10 flex flex-col items-center max-w-2xl mx-auto h-full space-y-4">
                <header className="w-full flex items-center justify-between px-4 py-2">
                    <Link to="/games" className="p-2 bg-white/5 rounded-full border border-white/10">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Ludo Royale</h1>
                        <span className="text-[10px] font-bold opacity-30 uppercase">Turn {state.turnCount || 0}</span>
                    </div>
                    <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <Sparkles className="size-4 text-amber-400" />
                    </div>
                </header>

                {/* Main Game Area */}
                <div className="relative w-full aspect-square max-w-[500px] border-4 border-white/5 rounded-3xl overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl">
                    <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_WIDTH}`} className="w-full h-full">
                        {/* Define Gradients */}
                        <defs>
                            <radialGradient id="redGrad">
                                <stop offset="0%" stopColor="#ff4b2b" />
                                <stop offset="100%" stopColor="#ff416c" />
                            </radialGradient>
                            <radialGradient id="blueGrad">
                                <stop offset="0%" stopColor="#00c6ff" />
                                <stop offset="100%" stopColor="#0072ff" />
                            </radialGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Bases */}
                        <rect x="0" y="0" width={6 * CELL_SIZE} height={6 * CELL_SIZE} fill="url(#redGrad)" fillOpacity="0.1" />
                        <rect x={9 * CELL_SIZE} y={9 * CELL_SIZE} width={6 * CELL_SIZE} height={6 * CELL_SIZE} fill="url(#blueGrad)" fillOpacity="0.1" />

                        {/* Cells Rendering */}
                        {/* This is a visual-only grid representation for beauty */}
                        <path d={`M 0 ${6 * CELL_SIZE} L ${VIEWBOX_WIDTH} ${6 * CELL_SIZE}`} stroke="white" strokeWidth="1" strokeOpacity="0.05" />
                        <path d={`M 0 ${9 * CELL_SIZE} L ${VIEWBOX_WIDTH} ${9 * CELL_SIZE}`} stroke="white" strokeWidth="1" strokeOpacity="0.05" />
                        <path d={`M ${6 * CELL_SIZE} 0 L ${6 * CELL_SIZE} ${VIEWBOX_WIDTH}`} stroke="white" strokeWidth="1" strokeOpacity="0.05" />
                        <path d={`M ${9 * CELL_SIZE} 0 L ${9 * CELL_SIZE} ${VIEWBOX_WIDTH}`} stroke="white" strokeWidth="1" strokeOpacity="0.05" />

                        {/* Center Home */}
                        <rect x={6 * CELL_SIZE} y={6 * CELL_SIZE} width={3 * CELL_SIZE} height={3 * CELL_SIZE} fill="white" fillOpacity="0.05" rx="8" />

                        {/* Piece Rendering */}
                        {session.participants.map((player, pIdx) => {
                            const pId = player._id.toString();
                            const pPieces = state.pieces[pId] || [-1, -1, -1, -1];
                            const color = pIdx === 0 ? "#ff416c" : "#00c6ff";
                            const isMyPlayer = pId === myId;
                            const isActivePlayer = state.currentPlayer === pId;

                            return pPieces.map((pos, idx) => {
                                const coords = getCoords(pId, pos, idx);
                                const isMovable = isMyPlayer && isActivePlayer && state.rolled && (
                                    (pos === -1 && state.dice === 6) || (pos !== -1 && pos + state.dice <= 57)
                                );

                                return (
                                    <motion.g
                                        key={`${pId}-${idx}`}
                                        initial={coords}
                                        animate={coords}
                                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                        onClick={() => isMovable && handleMove(idx)}
                                        className={isMovable ? "cursor-pointer" : ""}
                                    >
                                        <motion.circle
                                            r={CELL_SIZE * 0.4}
                                            fill={color}
                                            filter="url(#glow)"
                                            animate={isMovable ? { scale: [1, 1.2, 1], shadow: "0 0 10px " + color } : {}}
                                            transition={{ repeat: Infinity, duration: 1.5 }}
                                        />
                                        <motion.circle
                                            r={CELL_SIZE * 0.25}
                                            fill="white"
                                            fillOpacity="0.3"
                                        />
                                        {isActivePlayer && isMovable && (
                                            <motion.circle
                                                r={CELL_SIZE * 0.5}
                                                stroke={color}
                                                strokeWidth="2"
                                                fill="transparent"
                                                animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                                transition={{ repeat: Infinity, duration: 1 }}
                                            />
                                        )}
                                    </motion.g>
                                );
                            });
                        })}
                    </svg>
                </div>

                {/* Controls Area */}
                <div className="w-full max-w-[500px] flex flex-col items-center space-y-6 pt-4">
                    <div className="flex items-center justify-between w-full px-8">
                        <div className={`p-4 rounded-3xl border-2 transition-all duration-500 scale-90 ${state.currentPlayer === myId ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(139,92,246,0.3)] scale-110" : "bg-white/5 border-white/10 opacity-40"}`}>
                            <div className="size-12 rounded-2xl overflow-hidden mb-2">
                                <img src={authUser?.profilePic} className="size-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{authUser?.fullName?.split(" ")[0]}</span>
                        </div>

                        {/* Dice Container */}
                        <div className="flex flex-col items-center space-y-4">
                            <motion.div
                                onClick={handleRoll}
                                whileTap={{ scale: 0.9 }}
                                className={`size-24 rounded-3xl flex items-center justify-center relative cursor-pointer group ${isMyTurn && !state.rolled ? "bg-primary shadow-[0_0_30px_rgba(139,92,246,0.6)]" : "bg-white/5 border border-white/10"}`}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={localDice}
                                        initial={{ rotate: -45, scale: 0.5, opacity: 0 }}
                                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                        exit={{ rotate: 45, scale: 0.5, opacity: 0 }}
                                        className="text-4xl font-black italic flex items-center justify-center"
                                    >
                                        {isRolling ? (
                                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.5 }}>
                                                <Dices className="size-12" />
                                            </motion.div>
                                        ) : (
                                            <span>{state.dice || 1}</span>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                {isMyTurn && !state.rolled && !isRolling && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-1 -right-1 size-4 bg-white rounded-full flex items-center justify-center text-[10px] text-primary font-black animate-bounce"
                                    >
                                        !
                                    </motion.div>
                                )}
                            </motion.div>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
                                {isMyTurn ? (state.rolled ? "Choose a piece" : "Your Turn - Roll!") : "Partner's Turn"}
                            </span>
                        </div>

                        <div className={`p-4 rounded-3xl border-2 transition-all duration-500 scale-90 ${state.currentPlayer !== myId ? "bg-pink-500/20 border-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)] scale-110" : "bg-white/5 border-white/10 opacity-40"}`}>
                            <div className="size-12 rounded-2xl overflow-hidden mb-2">
                                <img src={partner?.profilePic} className="size-full object-cover" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{partner?.fullName?.split(" ")[0]}</span>
                        </div>
                    </div>

                    {isMyTurn && state.rolled && !isRolling && (
                        <div className="animate-pulse flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <Sparkles className="size-3" />
                            Tap a piece on the board to move
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .grid-bg {
                    background-image: 
                        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: ${CELL_SIZE}px ${CELL_SIZE}px;
                }
            `}} />
        </div>
    );
};

export default LudoGame;
