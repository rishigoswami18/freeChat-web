import { useState, useEffect, useCallback, memo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { linkFriendAI } from "../lib/api";
import { X, Sparkles, Loader2, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

// === MAIN MODAL COMPONENT ===
const LinkFriendAIModal = memo(({ isOpen, onClose }) => {
    // === STATE MANAGEMENT ===
    const [friendName, setFriendName] = useState("");
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    // === MODAL BEHAVIOR LOGIC ===
    // Reset state and attach keyboard interactions when opened
    useEffect(() => {
        if (!isOpen) {
            setFriendName(""); // Clear stale state when modal hides
            return;
        }

        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Allows closing by clicking the dark overlay natively
    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    }, [onClose]);

    // === MUTATION LOGIC ===
    const { mutate: linkFriend, isPending } = useMutation({
        mutationFn: linkFriendAI,
        onSuccess: (data) => {
            toast.success(`Met your new best friend, ${data.user.aiFriendName}! 🤜🤛`);
            
            // Targeted query invalidation preventing cascade refresh overhead
            queryClient.invalidateQueries({ queryKey: ["authUser"], exact: true });
            queryClient.invalidateQueries({ queryKey: ["friends"], exact: true });
            
            onClose();
            
            // Strict sequential navigation ensuring state settles before unmounting
            navigate(`/chat/ai-friend-id`);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to link AI Best Friend");
        }
    });

    // === EVENT HANDLERS ===
    const handleSubmit = useCallback((e) => {
        if (e && e.preventDefault) e.preventDefault();
        
        // Input sanitization guard
        const sanitizedName = friendName.trim();
        if (!sanitizedName || isPending) return;

        linkFriend(sanitizedName);
    }, [friendName, isPending, linkFriend]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit(e);
        }
    }, [handleSubmit]);

    // === RENDER PIPELINE GUARD ===
    if (!isOpen) return null;

    // === MODAL UI ===
    return (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleBackdropClick}
        >
            {/* Modal Container: Stops clicks from bleeding to the backdrop */}
            <div 
                className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col will-change-transform" 
                onClick={(e) => e.stopPropagation()}
            >
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
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle" aria-label="Close modal">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    <div className="flex justify-center mb-2 pointer-events-none">
                        <div className="avatar">
                            <div className="size-24 rounded-[32px] ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-2xl">
                                <img src="/ai-bestfriend.png" alt="AI Friend" loading="lazy" decoding="async" />
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
                            className="input input-bordered w-full rounded-2xl focus:border-primary font-bold text-center text-lg h-14 transition-colors"
                            value={friendName}
                            onChange={(e) => setFriendName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                        />
                    </div>

                    <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 pointer-events-none">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest text-center">
                            You can tell them everything about your life!
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-base-200/50 border-t border-base-300">
                    <button
                        onClick={handleSubmit}
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
});
LinkFriendAIModal.displayName = "LinkFriendAIModal";

export default LinkFriendAIModal;
