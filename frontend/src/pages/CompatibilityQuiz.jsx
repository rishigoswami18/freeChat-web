import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameSession, submitGameAnswers, startGame } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { Loader2, ArrowLeft, Send, CheckCircle2, Trophy, Users, Heart, Gamepad2, Sparkles, Zap, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import LoveDestinyGame from "./LoveDestinyGame";
import LudoGame from "./LudoGame";
import TicTacToeGame from "./TicTacToeGame";

const CompatibilityQuiz = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [answers, setAnswers] = useState([]);
    const [selectedOption, setSelectedOption] = useState(null);
    const { authUser } = useAuthUser();

    const { data: session, isLoading, isError } = useQuery({
        queryKey: ["gameSession", sessionId],
        queryFn: () => getGameSession(sessionId),
        refetchInterval: (data) => data?.status === "completed" ? false : 3000,
    });

    const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: (answersToSubmit) => submitGameAnswers(sessionId, answersToSubmit),
        onSuccess: () => {
            toast.success("Sync complete!");
            queryClient.invalidateQueries({ queryKey: ["gameSession", sessionId] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to submit answers"),
    });

    const { mutate: handleStartNew, isPending: isStartingNew } = useMutation({
        mutationFn: () => startGame(session.gameType),
        onSuccess: (data) => {
            navigate(`/game/${data.session._id}`);
            queryClient.invalidateQueries({ queryKey: ["gameSession", data.session._id] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to start new game"),
    });

    const handleAnswer = useCallback((newAnswer) => {
        const updatedAnswers = [...answers, newAnswer];
        setAnswers(updatedAnswers);
        if (session && updatedAnswers.length === session.questions.length) {
            handleSubmit(updatedAnswers);
        }
    }, [answers, session, handleSubmit]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#060606] flex items-center justify-center">
                <div className="relative">
                    <Loader2 className="size-12 animate-spin text-primary" />
                    <div className="absolute inset-0 blur-2xl opacity-20 bg-primary rounded-full animate-pulse" />
                </div>
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-8 text-center">
                <Gamepad2 className="size-16 text-white/20 mb-4" />
                <p className="text-white/60 font-bold mb-6 italic">This game session has expired or is invalid.</p>
                <Link to="/games" className="btn btn-primary rounded-2xl h-14 btn-wide uppercase tracking-widest font-black">
                    Return to Arena
                </Link>
            </div>
        );
    }

    if (session?.gameType === "heart_destiny") return <LoveDestinyGame session={session} onAnswer={handleAnswer} />;
    if (session?.gameType === "ludo") return <LudoGame session={session} />;
    if (session?.gameType === "tic_tac_toe") return <TicTacToeGame session={session} />;

    const myId = authUser?._id?.toString();
    const hasAnswered = session.answers && myId && session.answers[myId];
    const partner = session.participants?.find(p => p._id?.toString() !== myId);
    const isCompleted = session.status === "completed";

    // COMPLETED RESULTS VIEW
    if (isCompleted) {
        return (
            <div className="min-h-screen bg-[#060606] text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10 space-y-8 w-full max-w-md">
                    <div className="relative inline-block">
                        <Trophy className="size-32 text-yellow-400 drop-shadow-[0_0_40px_rgba(250,204,21,0.6)]" />
                        <Sparkles className="absolute -top-4 -right-4 size-10 text-primary animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-5xl font-black italic tracking-tighter uppercase text-white shadow-sm">Sync Status</h1>
                        <div className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-pink-500 drop-shadow-2xl">
                            {session.score}%
                        </div>
                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px]">Soulmate Compatibility Score</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 bg-white/5 p-6 rounded-[40px] border border-white/10 backdrop-blur-xl">
                        <div className="text-center space-y-2">
                            <img src={authUser?.profilePic} className="size-16 rounded-[22px] mx-auto border-2 border-primary object-cover" />
                            <p className="text-[10px] font-black uppercase opacity-60">You</p>
                        </div>
                        <div className="text-center space-y-2">
                            <img src={partner?.profilePic} className="size-16 rounded-[22px] mx-auto border-2 border-pink-500 object-cover" />
                            <p className="text-[10px] font-black uppercase opacity-60">{partner?.fullName?.split(" ")[0]}</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <button onClick={() => handleStartNew()} disabled={isStartingNew} className="btn btn-primary h-16 rounded-3xl font-black uppercase tracking-widest text-sm shadow-glow">
                            {isStartingNew ? <Loader2 className="animate-spin size-5" /> : "Rethink Your Bond"}
                        </button>
                        <Link to="/games" className="text-xs font-black uppercase tracking-widest text-white/30 hover:text-white transition-colors">
                            Leave Arena
                        </Link>
                    </div>
                </motion.div>
                <style dangerouslySetInnerHTML={{ __html: `.shadow-glow { box-shadow: 0 0 30px -5px currentColor; }` }} />
            </div>
        );
    }

    // WAITING VIEW
    if (hasAnswered && !isCompleted) {
        return (
            <div className="min-h-screen bg-[#060606] flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="size-48 rounded-full border-2 border-dashed border-primary/20 flex items-center justify-center">
                        <Zap className="size-12 text-primary animate-pulse" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Heart className="size-8 text-pink-500 fill-pink-500 animate-ping opacity-20" />
                    </div>
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-black italic uppercase tracking-tighter">Awaiting Sync</h2>
                    <p className="text-white/40 font-bold text-xs uppercase tracking-widest max-w-[250px]">Waiting for {partner?.fullName?.split(" ")[0]} to finish their answers...</p>
                </div>
                <div className="p-4 bg-white/5 rounded-3xl border border-white/10 animate-pulse inline-flex items-center gap-3">
                    <div className="size-10 rounded-full border-2 border-primary overflow-hidden">
                        <img src={partner?.profilePic} className="size-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80 italic">Analyzing connection...</span>
                </div>
            </div>
        );
    }

    // QUIZ IN PROGRESS
    const currentIdx = answers.length;
    const currentQuestion = session.questions[currentIdx];
    const progress = ((currentIdx + 1) / session.questions.length) * 100;

    return (
        <div className="min-h-screen bg-[#080808] text-white p-6 relative overflow-hidden font-outfit">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.1),transparent_70%)]" />

            <div className="relative z-10 max-w-lg mx-auto flex flex-col min-h-[90vh]">
                <header className="flex items-center justify-between mb-12">
                    <Link to="/games" className="p-3 bg-white/5 rounded-2xl border border-white/10">
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div className="text-center">
                        <h1 className="text-[10px] font-black uppercase tracking-[0.5em] text-primary italic">Soul Sync</h1>
                        <p className="text-[10px] font-bold opacity-30">LEVEL {currentIdx + 1} / {session.questions.length}</p>
                    </div>
                    <div className="size-11" />
                </header>

                {/* Progress Bar */}
                <div className="w-full h-1 bg-white/5 rounded-full mb-16 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-primary to-pink-500 shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentIdx} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="flex-1 flex flex-col justify-center">
                        <div className="space-y-8 mb-12">
                            <div className="flex items-center gap-3 opacity-40">
                                <Flame className="size-4 text-orange-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Question {currentIdx + 1}</span>
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter leading-tight uppercase">{currentQuestion?.text}</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {currentQuestion?.options?.map((option, i) => (
                                <motion.button
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleAnswer({ questionIndex: currentIdx, answer: option })}
                                    className="group relative p-6 text-left rounded-[32px] border-2 border-white/5 bg-white/[0.03] hover:bg-white/[0.08] hover:border-primary/50 transition-all duration-300"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-lg group-hover:text-primary transition-colors">{option}</span>
                                        <div className="size-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                                            <Send className="size-3 -rotate-45 group-hover:text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 bg-primary/0 hover:bg-primary/5 rounded-[32px] transition-all blur-xl opacity-0 hover:opacity-100 group-hover:opacity-20" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <footer className="mt-auto pt-10 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-20">Analysing Connection Patterns...</p>
                </footer>
            </div>
        </div>
    );
};

export default CompatibilityQuiz;
