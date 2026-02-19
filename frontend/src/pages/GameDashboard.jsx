import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getGameTemplates, getActiveGameSessions, startGame } from "../lib/api";
import { Gamepad2, Play, Users, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const GameDashboard = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: templates, isLoading: templatesLoading } = useQuery({
        queryKey: ["gameTemplates"],
        queryFn: getGameTemplates,
    });

    const { data: activeSessions, isLoading: activeLoading } = useQuery({
        queryKey: ["activeGameSessions"],
        queryFn: getActiveGameSessions,
    });

    const { mutate: handleStartGame, isPending: isStarting } = useMutation({
        mutationFn: startGame,
        onSuccess: (data) => {
            toast.success("Game started!");
            navigate(`/game/${data.session._id}`);
            queryClient.invalidateQueries({ queryKey: ["activeGameSessions"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to start game"),
    });

    if (templatesLoading || activeLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <Link to="/couple" className="btn btn-ghost btn-sm gap-2 mb-4">
                    <ArrowLeft className="size-4" />
                    Back to Couple Profile
                </Link>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <Gamepad2 className="size-8 text-primary" />
                    Couple Games
                </h1>
                <p className="text-sm opacity-60 mt-1">Play together and strengthen your bond!</p>
            </header>

            {/* Active Games */}
            {activeSessions?.length > 0 && (
                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Users className="size-5 text-amber-500" />
                        Continue Playing
                    </h2>
                    <div className="grid gap-4">
                        {activeSessions.map((session) => (
                            <div key={session._id} className="card bg-base-200 border border-amber-500/20 shadow-sm">
                                <div className="card-body p-4 flex-row items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <Gamepad2 className="size-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Compatibility Quiz</h3>
                                            <p className="text-xs opacity-60">Session started {new Date(session.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <Link to={`/game/${session._id}`} className="btn btn-primary btn-sm gap-2">
                                        <Play className="size-4 fill-current" />
                                        Resume
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Available Games */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Available Games</h2>
                <div className="grid gap-6 md:grid-cols-2">
                    {templates && Object.entries(templates).map(([key, template]) => (
                        <div key={key} className="card bg-base-200 shadow-xl border border-base-300">
                            <div className="card-body">
                                <h3 className="card-title">{template.title}</h3>
                                <p className="text-sm opacity-70">{template.description}</p>
                                <div className="card-actions justify-end mt-4">
                                    <button
                                        onClick={() => handleStartGame(key)}
                                        disabled={isStarting}
                                        className="btn btn-primary gap-2"
                                    >
                                        {isStarting ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4 fill-current" />}
                                        Start New Game
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Placeholder for future games */}
                    <div className="card bg-base-200 shadow-xl border border-dashed border-base-300 opacity-60">
                        <div className="card-body items-center justify-center text-center py-10">
                            <div className="size-10 rounded-full bg-base-300 flex items-center justify-center mb-2">
                                <Users className="size-5" />
                            </div>
                            <h3 className="font-bold">More Games Coming Soon</h3>
                            <p className="text-xs">Relationship challenges, shared drawing, and more!</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default GameDashboard;
