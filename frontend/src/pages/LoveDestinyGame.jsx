import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, Zap, Flame, Trophy, Play, ArrowLeft, Loader2, Send, Gamepad2, Users } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameSession, submitGameAnswers } from "../lib/api";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const LoveDestinyGame = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);

    const { data: session, isLoading } = useQuery({
        queryKey: ["gameSession", sessionId],
        queryFn: () => getGameSession(sessionId),
        refetchInterval: (data) => (data?.status === "completed" ? false : 3000),
    });

    const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: () => submitGameAnswers(sessionId, answers),
        onSuccess: () => {
            toast.success("Destiny Sealed! ✨");
            queryClient.invalidateQueries({ queryKey: ["gameSession", sessionId] });
        },
    });

    const myId = authUser?._id?.toString();
    const partner = session?.participants?.find(p => p._id?.toString() !== myId);
    const hasAnswered = session?.answers && myId && session.answers[myId];
    const isCompleted = session?.status === "completed";

    const handleSpin = () => {
        if (isSpinning || showResult || selectedOption) return;

        setIsSpinning(true);
        if (window.AndroidBridge) window.AndroidBridge.vibrate(100);

        // Smooth high-speed spin
        const extraRots = 1440 + Math.random() * 720;
        setRotation(prev => prev + extraRots);

        setTimeout(() => {
            setIsSpinning(false);
            setShowResult(true);
            if (window.AndroidBridge) window.AndroidBridge.vibrate(50);
        }, 2500);
    };

    const handleNext = () => {
        if (!selectedOption) return;

        const newAnswer = { questionIndex: currentQuestionIndex, answer: selectedOption };
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        setSelectedOption(null);
        setShowResult(false);

        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Auto submit handled by useEffect
        }
    };

    useEffect(() => {
        if (session && answers.length === session.questions.length && !isSubmitting) {
            handleSubmit();
        }
    }, [answers, session, isSubmitting, handleSubmit]);

    if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="size-10 animate-spin text-primary" /></div>;
    if (!session) return <div className="p-10 text-center">Session not found.</div>;

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-900/20 via-black to-purple-900/20 pointer-events-none" />

                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="relative z-10 text-center space-y-8 max-w-lg w-full"
                >
                    <div className="relative inline-block">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="absolute -inset-8 bg-gradient-to-r from-pink-500 via-purple-500 to-primary rounded-full blur-2xl opacity-30"
                        />
                        <Trophy className="size-24 text-yellow-400 mx-auto relative drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-black italic tracking-tighter uppercase">Destiny Synced</h1>
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-primary">
                            {session.score}%
                        </div>
                        <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Mutual Connection Accuracy</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                            <img src={authUser?.profilePic} className="size-16 rounded-full mx-auto border-2 border-primary mb-2" />
                            <span className="text-xs font-bold truncate block">{authUser?.fullName}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
                            <img src={partner?.profilePic} className="size-16 rounded-full mx-auto border-2 border-pink-500 mb-2" />
                            <span className="text-xs font-bold truncate block">{partner?.fullName}</span>
                        </div>
                    </div>

                    <Link to="/games" className="btn btn-primary btn-block rounded-2xl h-14 font-black uppercase tracking-widest">
                        Play Another Game
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (hasAnswered) {
        return (
            <div className="min-h-screen bg-black text-white p-6 flex flex-col items-center justify-center text-center space-y-8">
                <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 animate-pulse">
                    <Loader2 className="size-12 text-primary animate-spin" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black italic uppercase">Waiting for Partner</h2>
                    <p className="text-white/50 text-sm max-w-xs mx-auto">
                        Your destiny is being processed. Waiting for {partner?.fullName} to finish their scan.
                    </p>
                </div>
                <Link to="/games" className="btn btn-ghost btn-sm">Exit Game</Link>
            </div>
        )
    }

    const currentQuestion = session.questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[#050505] text-white p-4 relative overflow-hidden font-outfit">
            {/* Animated Cyber Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1),transparent_70%)]" />
                <div className="absolute top-1/4 -left-20 size-80 bg-pink-600/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 size-80 bg-primary/10 blur-[100px] rounded-full animate-pulse" />
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-between max-w-lg mx-auto py-8 lg:py-12">
                <header className="w-full flex items-center justify-between px-2">
                    <Link to="/games" className="p-2 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div className="flex flex-col items-center">
                        <h1 className="text-xs font-black uppercase tracking-[0.3em] text-primary">Heart of Destiny</h1>
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest">Scanning {currentQuestionIndex + 1}/{session.questions.length}</span>
                    </div>
                    <div className="size-9 bg-white/5 rounded-full border border-white/10 flex items-center justify-center">
                        <Zap className="size-4 text-amber-400" />
                    </div>
                </header>

                {/* 3D Heart Container */}
                <div className="flex-1 flex flex-col items-center justify-center w-full perspective-3d">
                    <AnimatePresence mode="wait">
                        {!showResult ? (
                            <motion.div
                                key="spinning-heart"
                                className="relative cursor-pointer select-none group"
                                onClick={handleSpin}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                            >
                                {/* Glow Behind */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-primary/40 blur-[60px] rounded-full"
                                />

                                {/* 3D Visual Heart Shape (CSS Layers) */}
                                <motion.div
                                    animate={{ rotateY: rotation }}
                                    transition={{ duration: isSpinning ? 2.5 : 4, ease: isSpinning ? "circOut" : "linear", repeat: isSpinning ? 0 : Infinity }}
                                    className="relative preserve-3d transform-gpu"
                                >
                                    <div className="relative size-48 sm:size-64 active:scale-95 transition-transform duration-100">
                                        <Heart className="size-full text-primary fill-primary/20 drop-shadow-[0_0_20px_rgba(139,92,246,0.6)]" />
                                        {/* Overlay sparkles */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="size-1/2 text-white/20 animate-pulse" />
                                        </div>
                                    </div>
                                </motion.div>

                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <motion.p
                                        animate={{ opacity: isSpinning ? 0 : 1 }}
                                        className="text-[10px] font-black uppercase tracking-[0.4em] drop-shadow-md"
                                    >
                                        {isSpinning ? "Syncing..." : "Tap to Spin"}
                                    </motion.p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="result-card"
                                initial={{ scale: 0.8, opacity: 0, rotateX: 90 }}
                                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                                className="w-full px-4"
                            >
                                <div className="bg-gradient-to-br from-[#121212] to-[#1a1a1a] rounded-[32px] p-6 lg:p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                                    {/* Decorative elements */}
                                    <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                                        <Heart className="size-32" />
                                    </div>

                                    <div className="relative z-10 flex flex-col items-center text-center gap-6">
                                        <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <Sparkles className="size-8 text-primary shadow-glow" />
                                        </div>

                                        <div className="space-y-2">
                                            <h3 className="text-sm font-black text-primary uppercase tracking-[0.2em] italic">Spark Detected</h3>
                                            <p className="text-xl sm:text-2xl font-black leading-tight italic tracking-tight">{currentQuestion.question}</p>
                                        </div>

                                        <div className="grid grid-cols-1 gap-3 w-full">
                                            {currentQuestion.options.map((opt) => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setSelectedOption(opt)}
                                                    className={`py-4 px-6 rounded-2xl border-2 transition-all font-bold text-sm ${selectedOption === opt
                                                            ? "bg-primary border-primary text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                                                            : "bg-white/5 border-white/5 text-white/70 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleNext}
                                            disabled={!selectedOption}
                                            className="btn btn-primary btn-block rounded-2xl h-14 font-black uppercase tracking-widest mt-4 group"
                                        >
                                            Confirm Destiny
                                            <Zap className="size-4 group-hover:fill-current" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <footer className="w-full flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="avatar">
                            <div className="size-10 rounded-full border-2 border-primary">
                                <img src={authUser?.profilePic} />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase opacity-40">Scanning</span>
                            <span className="text-xs font-black truncate max-w-20">You</span>
                        </div>
                    </div>

                    <Heart className="size-5 text-primary/40 animate-pulse" />

                    <div className="flex items-center gap-3 text-right">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase opacity-40">Awaiting</span>
                            <span className="text-xs font-black truncate max-w-20">{partner?.fullName?.split(" ")[0]}</span>
                        </div>
                        <div className="avatar">
                            <div className="size-10 rounded-full border-2 border-pink-500 overflow-hidden bg-white/5 border-dashed">
                                {partner ? <img src={partner.profilePic} /> : <Users className="size-full p-2" />}
                            </div>
                        </div>
                    </div>
                </footer>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .perspective-3d { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .shadow-glow { filter: drop-shadow(0 0 8px rgba(139,92,246,0.8)); }
      `}} />
        </div>
    );
};

export default LoveDestinyGame;
