import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Zap, Flame, Trophy, Play, ArrowLeft, Loader2, Send, Gamepad2, Users, Star } from "lucide-react";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";

const LoveDestinyGame = ({ session, onAnswer }) => {
    const { authUser } = useAuthUser();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentQuestionIndex = Math.min(
        (session?.answers && session.answers[authUser._id]?.length) || 0,
        (session?.questions?.length - 1) || 0
    );

    const [selectedOption, setSelectedOption] = useState(null);

    const myId = authUser?._id?.toString();
    const partner = session?.participants?.find(p => p._id?.toString() !== myId);
    const hasAnswered = session?.answers && myId && session.answers[myId];
    const isCompleted = session?.status === "completed";

    const handleSpin = () => {
        if (isSpinning || showResult || selectedOption) return;

        setIsSpinning(true);
        if (window.AndroidBridge) window.AndroidBridge.vibrate(120);

        const extraRots = 1800 + Math.random() * 720;
        setRotation(prev => prev + extraRots);

        setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);
            if (window.AndroidBridge) window.AndroidBridge.vibrate(60);
        }, 3000);
    };

    const handleNext = () => {
        if (!selectedOption) return;
        const newAnswer = { questionIndex: currentQuestionIndex, answer: selectedOption };
        onAnswer(newAnswer);
        setSelectedOption(null);
        setShowResult(false);
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[#060606] text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,0.15),transparent_70%)]" />

                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10 text-center space-y-10 max-w-lg w-full">
                    <div className="relative inline-block">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute -inset-12 bg-gradient-to-r from-pink-500 via-purple-500 to-primary rounded-full blur-3xl opacity-20" />
                        <Trophy className="size-32 text-yellow-400 mx-auto relative drop-shadow-[0_0_30px_rgba(250,204,21,0.6)]" />
                        <Sparkles className="absolute -top-4 -right-4 size-10 text-primary animate-pulse" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase">Destiny Synced</h1>
                        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-primary drop-shadow-2xl">
                            {session.score}%
                        </div>
                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Soulmate Compatibility Match</p>
                    </div>

                    <div className="grid grid-cols-2 gap-6 bg-white/[0.03] p-8 rounded-[40px] border border-white/5 backdrop-blur-3xl">
                        <div className="space-y-3">
                            <img src={authUser?.profilePic} className="size-16 rounded-[22px] mx-auto border-2 border-primary object-cover" />
                            <p className="text-[10px] font-black uppercase opacity-60">You</p>
                        </div>
                        <div className="space-y-3">
                            <img src={partner?.profilePic} className="size-16 rounded-[22px] mx-auto border-2 border-pink-500 object-cover" />
                            <p className="text-[10px] font-black uppercase opacity-60">{partner?.fullName?.split(" ")[0]}</p>
                        </div>
                    </div>

                    <Link to="/games" className="btn btn-primary btn-block rounded-3xl h-16 font-black uppercase tracking-widest text-sm shadow-glow">
                        Play Another Royale
                    </Link>
                </motion.div>
                <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
            </div>
        );
    }

    const currentQuestion = session?.questions?.[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[#080808] text-white p-6 relative overflow-hidden font-outfit flex flex-col items-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.1),transparent_70%)]" />

            <header className="w-full max-w-lg flex items-center justify-between px-4 py-6 z-20">
                <Link to="/games" className="p-3 bg-white/5 rounded-2xl border border-white/10">
                    <ArrowLeft className="size-5" />
                </Link>
                <div className="text-center">
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-1">Destiny Wheel</h2>
                    <div className="px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-bold opacity-60">PHASE {currentQuestionIndex + 1}</div>
                </div>
                <div className="size-11" />
            </header>

            <main className="flex-1 flex flex-col items-center justify-center w-full max-w-lg z-20 space-y-12">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-pink-500 opacity-60">
                        <Flame className="size-3" /> Question {currentQuestionIndex + 1}
                    </div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter leading-tight">{currentQuestion?.text}</h1>
                </div>

                {/* THE DESTINY WHEEL */}
                <div className="relative">
                    <motion.div
                        animate={{ rotate: rotation }}
                        transition={{ duration: 3, ease: [0.15, 0, 0.15, 1] }}
                        className="size-72 sm:size-80 rounded-full border-[8px] border-white/5 bg-gradient-to-br from-primary/20 via-black to-pink-500/20 relative shadow-[0_0_60px_rgba(0,0,0,0.5)] flex items-center justify-center"
                    >
                        <div className="absolute inset-4 rounded-full border border-white/10 border-dashed animate-[spin_20s_linear_infinite]" />
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            <Heart className={`size-16 ${isSpinning ? "animate-ping text-pink-500" : "text-white opacity-40"}`} fill={isSpinning ? "currentColor" : "none"} />
                            <span className="text-[10px] font-black tracking-widest opacity-20 uppercase">Core</span>
                        </div>

                        {/* Dial Marks */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <div key={i} className="absolute inset-0 flex justify-center py-2" style={{ transform: `rotate(${i * 30}deg)` }}>
                                <div className="h-4 w-1 bg-white/10 rounded-full" />
                            </div>
                        ))}
                    </motion.div>

                    {/* Pointer */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30">
                        <motion.div animate={isSpinning ? { y: [0, 5, 0] } : {}} transition={{ repeat: Infinity, duration: 0.15 }} className="w-6 h-8 bg-white rounded-b-full shadow-lg" />
                    </div>
                </div>

                {/* ACTION AREA */}
                <div className="w-full space-y-6">
                    {!showResult ? (
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning}
                            className={`w-full h-20 rounded-[32px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${isSpinning ? "bg-white/5 border border-white/10 opacity-50" : "bg-gradient-to-r from-primary to-pink-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 active:scale-95"}`}
                        >
                            {isSpinning ? <Loader2 className="animate-spin size-6" /> : <><Play className="size-6 fill-white" /> Spin Destiny</>}
                        </button>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="bg-white/5 border border-white/10 p-8 rounded-[40px] text-center space-y-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary italic">Result Revealed</p>
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">{currentQuestion?.options[rotation % currentQuestion.options.length]}</h3>
                                <div className="flex justify-center gap-2">
                                    {currentQuestion?.options.map((opt, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedOption(opt)}
                                            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all ${selectedOption === opt ? "bg-primary text-white shadow-glow" : "bg-white/5 border border-white/10 opacity-60 hover:opacity-100"}`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button onClick={handleNext} disabled={!selectedOption} className="btn btn-primary btn-block h-16 rounded-[32px] font-black uppercase tracking-widest shadow-glow">
                                Sync Choice
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <footer className="w-full max-w-lg mt-auto pb-6 text-center z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Analysing Souls...</p>
            </footer>
            <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
        </div>
    );
};

export default LoveDestinyGame;
