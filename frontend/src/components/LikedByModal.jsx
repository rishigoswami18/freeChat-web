import { useQuery } from "@tanstack/react-query";
import { getPostLikes } from "../lib/api";
import { X, Heart, Loader2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const LikedByModal = ({ isOpen, onClose, postId }) => {
    const { data: users, isLoading } = useQuery({
        queryKey: ["postLikes", postId],
        queryFn: () => getPostLikes(postId),
        enabled: isOpen && !!postId,
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col max-h-[80vh] sm:max-h-[70vh]">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                            <Heart className="size-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold italic tracking-tight uppercase">Likes</h2>
                            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{users?.length || 0} People</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 no-scrollbar overscroll-contain">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-10 animate-spin text-primary opacity-20" />
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest animate-pulse">Loading list...</p>
                        </div>
                    ) : users?.length > 0 ? (
                        <div className="space-y-1">
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-base-200 active:scale-[0.98] group"
                                >
                                    <div className="avatar">
                                        <div className="size-12 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all overflow-hidden bg-base-300">
                                            <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="object-cover w-full h-full" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm block truncate">
                                            {user.fullName}
                                        </p>
                                        <div className="flex items-center gap-1.5 overflow-hidden">
                                            <span className="text-[10px] opacity-40 truncate">@{user.username || 'user'}</span>
                                            {user.learningLanguage && (
                                                <span className="badge badge-xs badge-outline opacity-40 shrink-0 text-[9px]">{user.learningLanguage}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link
                                            to={`/chat/${user._id}`}
                                            onClick={onClose}
                                            className="btn btn-ghost btn-sm btn-circle text-primary opacity-40 hover:opacity-100 active:scale-90 transition-all"
                                        >
                                            <MessageSquare className="size-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                            <Heart className="size-16" />
                            <p className="text-sm font-bold uppercase tracking-widest italic">No likes yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LikedByModal;
