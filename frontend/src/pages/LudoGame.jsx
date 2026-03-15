import { useState, useEffect, useMemo, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, Trophy, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { ludoAction, startGame, triggerAiTurn } from "../lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// === BOARD CONSTANTS EXTRICATED FROM RENDER PIPELINE ===
// Moved out of component memory block preventing 225 nodes from recalculating variables
const GRID_SIZE = 15;
const VIEWBOX_WIDTH = 600;
const CELL_SIZE = VIEWBOX_WIDTH / GRID_SIZE;
const SAFE_SPOTS = [[6, 2], [8, 12], [2, 8], [12, 6], [1, 6], [13, 8], [6, 13], [8, 1]];

// === EXACT 52-STEP COORDINATE MAPPING ===
const COMMON_PATH = (() => {
    const path = [];
    for (let y = 5; y >= 0; y--) path.push({ x: 6, y }); // Up
    path.push({ x: 7, y: 0 }); // Mid
    for (let y = 0; y <= 5; y++) path.push({ x: 8, y }); // Down
    for (let x = 9; x <= 14; x++) path.push({ x, y: 6 }); // Right
    path.push({ x: 14, y: 7 }); // Mid
    for (let x = 14; x >= 9; x--) path.push({ x, y: 8 }); // Left
    for (let y = 9; y <= 14; y++) path.push({ x: 8, y }); // Down
    path.push({ x: 7, y: 14 }); // Mid
    for (let y = 14; y >= 9; y--) path.push({ x: 6, y }); // Up
    for (let x = 5; x >= 0; x--) path.push({ x, y: 8 }); // Left
    path.push({ x: 0, y: 7 }); // Mid
    for (let x = 0; x <= 5; x++) path.push({ x, y: 6 }); // Right
    return path;
})();

const RED_HOME = Array.from({ length: 6 }, (_, i) => ({ x: 7, y: i + 1 }));
const BLUE_HOME = Array.from({ length: 6 }, (_, i) => ({ x: 7, y: 13 - i }));

const getCoords = (isPlayer1, piecePos, pieceIndex) => {
    if (piecePos === -1) {
        const startX = isPlayer1 ? 0 : 9;
        const startY = isPlayer1 ? 0 : 9;
        return { x: (startX + [1.5, 4.5, 1.5, 4.5][pieceIndex]) * CELL_SIZE, y: (startY + [1.5, 1.5, 4.5, 4.5][pieceIndex]) * CELL_SIZE };
    }
    if (piecePos >= 56) return { x: 7.5 * CELL_SIZE, y: 7.5 * CELL_SIZE };
    if (isPlayer1) {
        if (piecePos < 51) {
            const step = COMMON_PATH[(piecePos + 4) % 52];
            return { x: (step.x + 0.5) * CELL_SIZE, y: (step.y + 0.5) * CELL_SIZE };
        }
        const step = RED_HOME[piecePos - 51];
        return { x: (step.x + 0.5) * CELL_SIZE, y: (step.y + 0.5) * CELL_SIZE };
    }
    if (piecePos < 51) {
        const step = COMMON_PATH[(piecePos + 30) % 52];
        return { x: (step.x + 0.5) * CELL_SIZE, y: (step.y + 0.5) * CELL_SIZE };
    }
    const step = BLUE_HOME[piecePos - 51];
    return { x: (step.x + 0.5) * CELL_SIZE, y: (step.y + 0.5) * CELL_SIZE };
};


// === SUBCOMPONENT: STATIC BOARD ===
// Heavily memoized SVG background containing 225 grid cells that never change
const StaticLudoBoard = memo(() => (
    <>
        <defs>
            <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#ff416c" /><stop offset="100%" stopColor="#ff4b2b" /></linearGradient>
            <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#0072ff" /><stop offset="100%" stopColor="#00c6ff" /></linearGradient>
            <filter id="pieceGlow"><feGaussianBlur stdDeviation="3" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
        </defs>
        {Array.from({ length: 15 }).map((_, r) =>
            Array.from({ length: 15 }).map((_, c) => {
                // Skip Bases & Home Center mathematically
                if ((r < 6 && c < 6) || (r < 6 && c > 8) || (r > 8 && c < 6) || (r > 8 && c > 8) || (r >= 6 && r <= 8 && c >= 6 && c <= 8)) return null;

                let fill = "rgba(255,255,255,0.02)";
                if (r === 7 && c >= 1 && c <= 5) fill = "rgba(255,65,108,0.2)"; // Red Stretch
                if (r === 6 && c === 1) fill = "rgba(255,65,108,0.4)"; // Red Start
                if (r === 7 && c >= 9 && c <= 13) fill = "rgba(0,198,255,0.2)"; // Blue Stretch
                if (r === 8 && c === 13) fill = "rgba(0,198,255,0.4)"; // Blue Start

                const isSafe = SAFE_SPOTS.some(s => s[0] === r && s[1] === c);

                return (
                    <g key={`c-${r}-${c}`}>
                        <rect x={c * CELL_SIZE} y={r * CELL_SIZE} width={CELL_SIZE} height={CELL_SIZE} fill={fill} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
                        {isSafe && <path d={`M ${(c + 0.5) * CELL_SIZE} ${(r + 0.2) * CELL_SIZE} L ${(c + 0.6) * CELL_SIZE} ${(r + 0.4) * CELL_SIZE} L ${(c + 0.8) * CELL_SIZE} ${(r + 0.45) * CELL_SIZE} L ${(c + 0.65) * CELL_SIZE} ${(r + 0.6) * CELL_SIZE} L ${(c + 0.7) * CELL_SIZE} ${(r + 0.8) * CELL_SIZE} L ${(c + 0.5) * CELL_SIZE} ${(r + 0.7) * CELL_SIZE} L ${(c + 0.3) * CELL_SIZE} ${(r + 0.8) * CELL_SIZE} L ${(c + 0.35) * CELL_SIZE} ${(r + 0.6) * CELL_SIZE} L ${(c + 0.2) * CELL_SIZE} ${(r + 0.45) * CELL_SIZE} L ${(c + 0.4) * CELL_SIZE} ${(r + 0.4) * CELL_SIZE} Z`} fill="white" fillOpacity="0.4" />}
                    </g>
                );
            })
        )}
        {/* Core Bases and Finishing Triangle Zones */}
        <rect x="2" y="2" width={6 * CELL_SIZE - 4} height={6 * CELL_SIZE - 4} fill="url(#redGrad)" fillOpacity="0.15" rx="30" stroke="#ff416c" strokeWidth="2" strokeOpacity="0.3" />
        <rect x={9 * CELL_SIZE + 2} y={9 * CELL_SIZE + 2} width={6 * CELL_SIZE - 4} height={6 * CELL_SIZE - 4} fill="url(#blueGrad)" fillOpacity="0.15" rx="30" stroke="#00c6ff" strokeWidth="2" strokeOpacity="0.3" />
        {[1.5, 3.5, 1.5, 3.5].map((x, i) => <circle key={`red-p-${i}`} cx={x * CELL_SIZE} cy={[1.5, 1.5, 3.5, 3.5][i] * CELL_SIZE} r={CELL_SIZE * 0.6} fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1" strokeOpacity="0.1" />)}
        {[10.5, 12.5, 10.5, 12.5].map((x, i) => <circle key={`blue-p-${i}`} cx={x * CELL_SIZE} cy={[10.5, 10.5, 12.5, 12.5][i] * CELL_SIZE} r={CELL_SIZE * 0.6} fill="white" fillOpacity="0.05" stroke="white" strokeWidth="1" strokeOpacity="0.1" />)}
        <path d={`M ${6 * CELL_SIZE} ${6 * CELL_SIZE} L ${9 * CELL_SIZE} ${7.5 * CELL_SIZE} L ${6 * CELL_SIZE} ${9 * CELL_SIZE} Z`} fill="#ff416c" fillOpacity="0.4" />
        <path d={`M ${9 * CELL_SIZE} ${6 * CELL_SIZE} L ${6 * CELL_SIZE} ${7.5 * CELL_SIZE} L ${9 * CELL_SIZE} ${9 * CELL_SIZE} Z`} fill="#00c6ff" fillOpacity="0.4" />
        <path d={`M ${6 * CELL_SIZE} ${6 * CELL_SIZE} L ${9 * CELL_SIZE} ${6 * CELL_SIZE} L ${7.5 * CELL_SIZE} ${7.5 * CELL_SIZE} Z`} fill="rgba(255,255,255,0.05)" />
        <path d={`M ${6 * CELL_SIZE} ${9 * CELL_SIZE} L ${9 * CELL_SIZE} ${9 * CELL_SIZE} L ${7.5 * CELL_SIZE} ${7.5 * CELL_SIZE} Z`} fill="rgba(255,255,255,0.05)" />
    </>
));
StaticLudoBoard.displayName = "StaticLudoBoard";


// === SUBCOMPONENT: GAME PIECE ===
// Isolates Framer Motion ticks so the outer board doesn't repaint
const GamePiece = memo(({ pId, idx, pos, color, isActive, isPlayer1, isMovable, onMove }) => {
    const coords = useMemo(() => getCoords(isPlayer1, pos, idx), [isPlayer1, pos, idx]);

    return (
        <motion.g
            key={`${pId}-${idx}`}
            initial={coords}
            animate={coords}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            onClick={() => isMovable && onMove(idx)}
            className={isMovable ? "cursor-pointer" : ""}
        >
            {isMovable && <motion.circle r={CELL_SIZE * 0.75} fill={color} fillOpacity="0.2" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2 }} />}
            <motion.circle r={CELL_SIZE * 0.45} fill={color} stroke="white" strokeWidth="2.5" filter="url(#pieceGlow)" animate={isActive ? { y: [0, -10, 0] } : {}} transition={{ repeat: Infinity, duration: 1.5, delay: idx * 0.1 }} />
            <circle r={CELL_SIZE * 0.15} fill="white" fillOpacity="0.5" cx="-2.5" cy="-2.5" />
            {isMovable && <motion.circle r={CELL_SIZE * 0.65} stroke={color} strokeWidth="2" fill="none" strokeDasharray="4 4" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }} />}
        </motion.g>
    );
});
GamePiece.displayName = "GamePiece";


// === SUBCOMPONENT: GAME OVER SCREEN ===
const MatchOverScreen = memo(({ onRestart }) => (
    <div className="min-h-screen bg-[#080808] flex flex-col items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="relative mb-8">
            <Trophy className="size-32 text-yellow-400 drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
            <Sparkles className="absolute -top-4 -right-4 size-10 text-primary animate-pulse" />
        </motion.div>
        <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-4 bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">Match Over!</h1>
        <button onClick={onRestart} className="btn btn-primary btn-wide rounded-2xl h-16 font-black uppercase tracking-widest gap-3 shadow-glow">
            Start New Royale
        </button>
    </div>
));
MatchOverScreen.displayName = "MatchOverScreen";


// === MAIN LUDO ENGINE ===
const LudoGame = ({ session }) => {
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Game Local States
    const [isRolling, setIsRolling] = useState(false);
    
    // Derived Configuration
    const myId = authUser?._id?.toString();
    const partner = useMemo(() => session?.participants?.find(p => p._id?.toString() !== myId), [session?.participants, myId]);
    const state = session?.state || {};
    const isMyTurn = state.currentPlayer === myId;
    const isCompleted = session?.status === "completed";
    
    const lastActionRef = useRef(state.lastAction);
    const aiTimeoutRef = useRef(null);

    // === OPTIMIZED MUTATIONS ===
    const { mutate: handleStartGame, isPending: isStartingNew } = useMutation({
        mutationFn: () => startGame(session.gameType),
        onSuccess: (data) => {
            navigate(`/game/${data.session._id}`);
            queryClient.invalidateQueries({ queryKey: ["gameSession", data.session._id], exact: true });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to start new game"),
    });

    const triggerRestart = useCallback(() => handleStartGame(), [handleStartGame]);

    // === AI TURN OVERSIGHT ALGORITHM ===
    // Completely separated out protecting the DOM from redundant renders
    useEffect(() => {
        if (!isMyTurn && !isCompleted && state.currentPlayer === "ai-user-id") {
            // Guard against stack overlapping
            if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
            
            aiTimeoutRef.current = setTimeout(async () => {
                try {
                    setIsRolling(true);
                    await triggerAiTurn(session._id);
                    queryClient.invalidateQueries({ queryKey: ["gameSession", session._id], exact: true });
                } catch (err) {
                    console.error("AI turn failed", err);
                } finally {
                    setTimeout(() => setIsRolling(false), 800);
                }
            }, 3000);
        }
        
        return () => {
            if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
        };
    }, [isMyTurn, state.currentPlayer, session._id, isCompleted, queryClient]);


    // === ACTION HANDLERS ===
    const handleRoll = useCallback(async () => {
        if (!isMyTurn || state.rolled || isRolling) return;
        setIsRolling(true);
        if (typeof window !== "undefined" && window.AndroidBridge) {
            try { window.AndroidBridge.vibrate(80); } catch (e) { /* ignore */ }
        }
        try {
            await ludoAction(session._id, "roll");
            queryClient.invalidateQueries({ queryKey: ["gameSession", session._id], exact: true });
        } catch (err) {
            toast.error("Dice jammed!");
        } finally {
            setTimeout(() => setIsRolling(false), 600);
        }
    }, [isMyTurn, state.rolled, isRolling, session._id, queryClient]);

    const handleMove = useCallback(async (pieceIndex) => {
        if (!isMyTurn || !state.rolled || isRolling) return;
        try {
            await ludoAction(session._id, "move", pieceIndex);
            queryClient.invalidateQueries({ queryKey: ["gameSession", session._id], exact: true });
        } catch (err) {
            toast.error("Illegal move!");
        }
    }, [isMyTurn, state.rolled, isRolling, session._id, queryClient]);


    // Notification System Effect
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

    
    // === RENDER PIPELINE ===
    if (isCompleted) {
        return <MatchOverScreen onRestart={triggerRestart} />;
    }

    return (
        <div className="min-h-screen bg-[#060606] text-white p-2 relative overflow-hidden font-outfit select-none flex flex-col items-center">
            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />

            <header className="w-full max-w-lg flex items-center justify-between px-4 py-4 z-20">
                <Link to="/games" className="p-2.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all">
                    <ArrowLeft className="size-5" />
                </Link>
                <div className="text-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1">Royale Arena</h2>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold opacity-60 uppercase">Turn {state.turnCount || 0}</div>
                </div>
                <button
                    onClick={() => window.confirm("Quit and start fresh Royale?") && handleStartGame()}
                    disabled={isStartingNew}
                    className="p-2.5 bg-white/5 rounded-2xl border border-white/10 text-amber-400 hover:scale-110 active:scale-95 transition-all"
                >
                    {isStartingNew ? <Loader2 className="size-5 animate-spin" /> : <Sparkles className="size-5" />}
                </button>
            </header>

            {/* Perfect 15x15 Ludo Board */}
            <div className="relative w-full aspect-square max-w-[500px] bg-black/40 backdrop-blur-3xl rounded-[40px] border-[6px] border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden mb-6 transform-gpu">
                <svg viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_WIDTH}`} className="w-full h-full drop-shadow-2xl">
                    <StaticLudoBoard />

                    {/* PIECES RENDERING */}
                    {session.participants && session.participants.map((player, pIdx) => {
                        const pId = String(player._id);
                        const pieces = state.pieces?.[pId] || [];
                        const color = pIdx === 0 ? "#ff416c" : "#00c6ff";
                        const isActive = state.currentPlayer === pId;
                        const isPlayer1 = pIdx === 0;

                        return pieces.map((pos, idx) => {
                            const isMovable = isActive && pId === myId && state.rolled && ((pos === -1 && state.dice === 6) || (pos !== -1 && pos + state.dice <= 56));
                            return (
                                <GamePiece
                                    key={`${pId}-${idx}`}
                                    pId={pId}
                                    idx={idx}
                                    pos={pos}
                                    color={color}
                                    isActive={isActive}
                                    isPlayer1={isPlayer1}
                                    isMovable={isMovable}
                                    onMove={handleMove}
                                />
                            );
                        });
                    })}
                </svg>
            </div>

            {/* FOOTER PLAYER STATS */}
            <footer className="w-full max-w-lg mt-auto pb-8 px-6 flex items-center justify-between z-20">
                <div className={`p-1.5 rounded-[28px] border-2 transition-all duration-500 relative ${state.currentPlayer === myId ? "scale-110 border-primary bg-primary/20 shadow-glow" : "scale-90 border-white/10 bg-white/5 opacity-40 blur-[0.2px]"}`}>
                    <img src={authUser?.profilePic} className="size-16 rounded-[22px] object-cover" alt="User" />
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-primary">YOU</div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <motion.button
                        onClick={handleRoll}
                        whileTap={{ scale: 0.9 }}
                        disabled={!isMyTurn || state.rolled || isRolling}
                        className={`size-28 rounded-[36px] flex items-center justify-center relative transition-all duration-500 overflow-hidden ${isMyTurn && !state.rolled ? "bg-primary shadow-[0_0_50px_rgba(139,92,246,0.6)]" : "bg-white/5 border border-white/10"}`}
                    >
                        {isMyTurn && !state.rolled && <motion.div className="absolute inset-0 bg-white/10" animate={{ opacity: [0, 0.2, 0] }} transition={{ repeat: Infinity, duration: 1 }} />}
                        <AnimatePresence mode="wait">
                            <motion.div key={state.dice} initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} exit={{ rotateX: -90, opacity: 0 }} className="text-6xl font-black italic drop-shadow-lg">
                                {isRolling ? <Dices className="size-16 animate-spin text-white/30" /> : <span>{state.dice || 1}</span>}
                            </motion.div>
                        </AnimatePresence>
                        {isMyTurn && !state.rolled && !isRolling && (
                            <motion.div animate={{ scale: [1, 1.4, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="absolute -top-1 -right-1 size-6 bg-white text-primary rounded-full flex items-center justify-center text-[12px] font-black shadow-lg">!</motion.div>
                        )}
                    </motion.button>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-50">{isMyTurn ? (state.rolled ? "CHOOSE MOVE" : "TAP TO ROLL") : `WAITING FOR ${partner?.fullName?.split(" ")[0] || "OPPONENT"}`}</span>
                </div>

                <div className={`p-1.5 rounded-[28px] border-2 transition-all duration-500 relative ${state.currentPlayer !== myId ? "scale-110 border-pink-500 bg-pink-500/20 shadow-glow" : "scale-90 border-white/10 bg-white/5 opacity-40 blur-[0.2px]"}`}>
                    <img src={partner?.profilePic || "/default-avatar.png"} className="size-16 rounded-[22px] object-cover" alt="Opponent" />
                    {!isMyTurn && state.dice && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-4 -right-4 size-10 bg-pink-500 rounded-2xl flex items-center justify-center text-white font-black italic shadow-[0_0_20px_rgba(236,72,153,0.6)] border border-white/20"
                        >
                            {state.dice}
                        </motion.div>
                    )}
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest text-pink-500">
                        {partner?.fullName?.split(" ")[0] || "AI"}
                    </div>
                </div>
            </footer>
            
            <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
        </div>
    );
};

export default LudoGame;
