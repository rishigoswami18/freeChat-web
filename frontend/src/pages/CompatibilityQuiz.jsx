import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameSession, submitGameAnswers, getAuthUser } from "../lib/api";
import { Loader2, ArrowLeft, Send, CheckCircle2, Trophy, Users, Heart } from "lucide-react";
import toast from "react-hot-toast";

const CompatibilityQuiz = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState([]); // [{ questionIndex: 0, answer: "Red" }, ...]
    const [selectedOption, setSelectedOption] = useState(null);

    const { data: authUser } = useQuery({
        queryKey: ["authUser"],
        queryFn: getAuthUser,
    });

    const { data: session, isLoading, isError } = useQuery({
        queryKey: ["gameSession", sessionId],
        queryFn: () => getGameSession(sessionId),
        refetchInterval: (data) => data?.status === "completed" ? false : 3000, // Poll if still pending
    });

    const { mutate: handleSubmit, isPending: isSubmitting } = useMutation({
        mutationFn: () => submitGameAnswers(sessionId, answers),
        onSuccess: () => {
            toast.success("Answers submitted!");
            queryClient.invalidateQueries({ queryKey: ["gameSession", sessionId] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to submit answers"),
    });

    const handleNext = () => {
        if (!selectedOption) return;

        const newAnswer = { questionIndex: currentQuestionIndex, answer: selectedOption };
        setAnswers([...answers, newAnswer]);
        setSelectedOption(null);

        if (currentQuestionIndex < session.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            // Last question, trigger submit logic
        }
    };

    // Auto-trigger submit when all answers collected
    useEffect(() => {
        if (session && answers.length === session.questions.length && !isSubmitting) {
            handleSubmit();
        }
    }, [answers, session, isSubmitting, handleSubmit]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !session) {
        return (
            <div className="p-8 text-center">
                <p className="text-error mb-4">Error loading game session.</p>
                <Link to="/games" className="btn btn-primary">Back to Games</Link>
            </div>
        );
    }

    const myId = authUser?._id.toString();
    const hasAnswered = session.answers && session.answers[myId];
    const partner = session.participants.find(p => p._id.toString() !== myId);
    const isCompleted = session.status === "completed";

    // Quiz UI render
    if (!hasAnswered && !isCompleted) {
        const currentQuestion = session.questions[currentQuestionIndex];
        const progress = ((currentQuestionIndex + 1) / session.questions.length) * 100;

        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <Link to="/games" className="btn btn-ghost btn-sm gap-2 mb-6">
                    <ArrowLeft className="size-4" />
                    Exit Game
                </Link>

                <div className="card bg-base-200 shadow-xl overflow-hidden border border-base-300">
                    <div className="h-2 bg-base-300">
                        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="card-body">
                        <div className="flex justify-between items-center mb-4">
                            <span className="badge badge-primary font-bold">Question {currentQuestionIndex + 1} of {session.questions.length}</span>
                            <span className="text-xs opacity-60">Compatibility Quiz</span>
                        </div>

                        <h2 className="card-title text-xl mb-6">{currentQuestion.question}</h2>

                        <div className="grid gap-3">
                            {currentQuestion.options.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setSelectedOption(option)}
                                    className={`btn btn-lg justify-start h-auto py-4 px-6 normal-case font-normal border-2 ${selectedOption === option ? "btn-primary border-primary" : "btn-ghost border-base-300 hover:border-primary/50"
                                        }`}
                                >
                                    <div className={`size-4 rounded-full border-2 mr-3 flex items-center justify-center ${selectedOption === option ? "border-white bg-white" : "border-primary"}`}>
                                        {selectedOption === option && <div className="size-2 rounded-full bg-primary" />}
                                    </div>
                                    {option}
                                </button>
                            ))}
                        </div>

                        <div className="card-actions justify-end mt-8">
                            <button
                                onClick={handleNext}
                                disabled={!selectedOption || isSubmitting}
                                className="btn btn-primary min-w-[120px] gap-2"
                            >
                                {currentQuestionIndex === session.questions.length - 1 ? (
                                    <>
                                        Finish <Send className="size-4" />
                                    </>
                                ) : (
                                    "Next"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Waiting or Results UI
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto text-center">
            <Link to="/games" className="btn btn-ghost btn-sm gap-2 mb-6 mx-auto flex items-center w-fit">
                <ArrowLeft className="size-4" />
                Back to Dashboard
            </Link>

            {!isCompleted ? (
                <div className="card bg-base-200 border border-primary/20 shadow-xl py-10">
                    <div className="card-body items-center">
                        <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                            <Loader2 className="size-10 text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Waiting for {partner?.fullName}...</h2>
                        <p className="opacity-60 max-w-xs mb-6">
                            You've submitted your answers! Once {partner?.fullName} finishes the quiz, we'll reveal your compatibility score.
                        </p>
                        <div className="flex items-center gap-4 bg-base-300 p-4 rounded-2xl w-full max-w-xs">
                            <div className="flex -space-x-4">
                                <img src={authUser?.profilePic} className="size-10 rounded-full border-2 border-base-300" />
                                <div className="size-10 rounded-full bg-success flex items-center justify-center border-2 border-base-300 text-white">
                                    <CheckCircle2 className="size-6" />
                                </div>
                            </div>
                            <div className="divider divider-horizontal"></div>
                            <div className="flex -space-x-4">
                                <img src={partner?.profilePic} className="size-10 rounded-full border-2 border-base-300 grayscale opacity-50" />
                                <div className="size-10 rounded-full bg-base-300 flex items-center justify-center border-2 border-base-300">
                                    <Loader2 className="size-5 animate-spin opacity-40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card bg-base-200 border border-primary shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
                    <div className="bg-gradient-to-r from-primary to-pink-500 py-10 text-white relative">
                        <div className="absolute top-4 right-4 animate-bounce">
                            <Trophy className="size-10 text-yellow-300" />
                        </div>
                        <h2 className="text-3xl font-black mb-2 italic">QUIZ COMPLETED!</h2>
                        <div className="flex justify-center items-center gap-6 mt-6">
                            <div className="flex flex-col items-center">
                                <img src={authUser?.profilePic} className="size-16 rounded-full border-4 border-white shadow-lg" />
                                <span className="text-xs font-bold mt-2 truncate w-20">{authUser?.fullName.split(" ")[0]}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center">
                                <Heart className="size-8 fill-current text-white animate-pulse" />
                            </div>
                            <div className="flex flex-col items-center">
                                <img src={partner?.profilePic} className="size-16 rounded-full border-4 border-white shadow-lg" />
                                <span className="text-xs font-bold mt-2 truncate w-20">{partner?.fullName.split(" ")[0]}</span>
                            </div>
                        </div>
                    </div>

                    <div className="card-body items-center py-10">
                        <span className="text-sm uppercase tracking-widest opacity-60 font-black">Compatibility Score</span>
                        <div className="text-7xl sm:text-8xl font-black text-primary mb-2 flex items-baseline">
                            {session.score}<span className="text-2xl ml-1">%</span>
                        </div>

                        <div className="max-w-xs mx-auto text-center mb-8">
                            <p className="text-lg font-medium">
                                {session.score >= 80 ? "Wow! You're perfect for each other! ❤️" :
                                    session.score >= 50 ? "Doing great! A solid connection! 😊" :
                                        "Room to grow! Time for more dates! 🌱"}
                            </p>
                        </div>

                        <div className="divider">Details</div>

                        <div className="w-full space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {session.questions.map((q, idx) => {
                                const myAns = session.answers[myId]?.find(a => a.questionIndex === idx)?.answer;
                                const pAns = session.answers[partner?._id]?.find(a => a.questionIndex === idx)?.answer;
                                const isMatch = myAns === pAns;

                                return (
                                    <div key={idx} className={`p-4 rounded-xl border ${isMatch ? "bg-success/5 border-success/20" : "bg-base-300/50 border-base-100"}`}>
                                        <p className="text-xs font-bold opacity-60 mb-2 uppercase tracking-wide">Question {idx + 1}</p>
                                        <p className="text-sm font-semibold mb-3">{q.question}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="opacity-50">You chose</span>
                                                <span className={`font-bold ${isMatch ? "text-success" : ""}`}>{myAns}</span>
                                            </div>
                                            <div className="divider divider-horizontal"></div>
                                            <div className="flex flex-col items-center gap-1">
                                                <span className="opacity-50">{partner?.fullName.split(" ")[0]} chose</span>
                                                <span className={`font-bold ${isMatch ? "text-success" : ""}`}>{pAns}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="card-actions mt-8 w-full">
                            <Link to="/games" className="btn btn-primary btn-block gap-2">
                                <Gamepad2 className="size-4" />
                                Play More
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompatibilityQuiz;
