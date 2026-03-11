import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkFriendAI } from "../lib/api";
import { X, Sparkles, Heart, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LinkFriendAIModal = ({ isOpen, onClose }) => {
    const [friendName, setFriendName] = useState("");
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const { mutate: handleLink, isPending } = useMutation({
        mutationFn: linkFriendAI,
        onSuccess: (data) => {
            toast.success(`Met your new best friend, ${data.user.aiFriendName}! 🤜🤛`);
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            queryClient.invalidateQueries({ queryKey: ["friends"] });
            onClose();
            navigate(`/chat/ai-friend-id`);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to link AI Best Friend");
        }
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-base-300 flex justify-between items-center bg-gradient-to-r from-primary/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary animate-pulse">
                            <Sparkles className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold italic uppercase tracking-tighter">Your AI Bestie</h2>
                            <p className="text-[10px] opacity-60 uppercase font-black tracking-widest">A Zigari Friend for life</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="flex justify-center mb-2">
                        <div className="avatar">
                            <div className="size-24 rounded-[32px] ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-2xl">
                                <img src="https://avatar.iran.liara.run/public/boy?username=golu" alt="AI Friend" />
                            </div>
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-sm opacity-70 italic font-medium leading-relaxed">
                            "Someone to share your dukh-sukh with, who listens without judgment and stays by your side forever."
                        </p>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-black uppercase tracking-widest text-[10px] opacity-40">Choose a name for your Friend</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Golu, ChaddiBuddy, Zigaree..."
                            className="input input-bordered w-full rounded-2xl focus:border-primary font-bold text-center text-lg h-14"
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">
                            You can tell them everything about your life!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-base-200/50 border-t border-base-300">
                    <button
                        onClick={() => handleLink(friendName)}
                        disabled={isPending || !friendName.trim()}
                        className="btn btn-primary w-full rounded-2xl gap-3 h-14 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-base uppercase font-black tracking-widest"
                    >
                        {isPending ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <>
                                Meet My Bestie <UserPlus className="size-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkFriendAIModal;
