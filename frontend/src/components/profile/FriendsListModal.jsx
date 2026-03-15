import { memo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getOtherUserFriends } from "../../lib/api";
import { Users, X, Loader2, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 10 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15, ease: "easeIn" } }
};

const FriendsListModal = memo(({ userId, isOpen, onClose }) => {
    const { data: friends, isLoading } = useQuery({
        queryKey: ["userFriends", userId],
        queryFn: () => getOtherUserFriends(userId),
        enabled: isOpen,
        staleTime: 1000 * 60 * 5, // 5 min cache
    });

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" 
                role="dialog" 
                aria-modal="true" 
                aria-labelledby="friends-modal-title"
                onKeyDown={(e) => e.key === "Escape" && onClose()}
            >
                <motion.div
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0" aria-hidden="true">
                                <Users className="size-6" />
                            </div>
                            <div className="min-w-0">
                                <h2 id="friends-modal-title" className="text-xl font-bold italic tracking-tight uppercase truncate">Friends</h2>
                                <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{friends?.length || 0} Connected</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform focus:ring-2 focus:ring-primary/40 shrink-0" 
                            aria-label="Close modal"
                            tabIndex={0}
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-2 sm:p-4 no-scrollbar">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4" role="status" aria-label="Loading friends">
                                <Loader2 className="size-10 animate-spin text-primary opacity-20" aria-hidden="true" />
                                <p className="text-xs font-bold opacity-40 uppercase tracking-widest animate-pulse">Loading list...</p>
                            </div>
                        ) : friends?.length > 0 ? (
                            <div className="space-y-1" role="list">
                                {friends.map((friend) => (
                                    <div key={friend._id} className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-base-200 active:scale-[0.98] group" role="listitem">
                                        <Link 
                                            to={`/user/${friend._id}`} 
                                            onClick={onClose} 
                                            className="avatar shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded-full"
                                            aria-label={`View ${friend.fullName}'s profile`}
                                        >
                                            <div className="size-12 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all overflow-hidden bg-base-300">
                                                <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} className="object-cover w-full h-full" loading="lazy" />
                                            </div>
                                        </Link>
                                        <div className="flex-1 min-w-0">
                                            <Link 
                                                to={`/user/${friend._id}`} 
                                                onClick={onClose} 
                                                className="font-bold text-sm block truncate hover:text-primary transition-colors flex items-center gap-1 focus:outline-none"
                                            >
                                                <span className="truncate">{friend.fullName}</span>
                                                {(friend.role === "admin" || friend.isVerified) && (
                                                    <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                                        <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                                    </div>
                                                )}
                                            </Link>
                                            <p className="text-[10px] opacity-40 truncate">@{friend.username || 'user'}</p>
                                        </div>
                                        <Link 
                                            to={`/chat/${friend._id}`} 
                                            className="btn btn-primary btn-xs rounded-lg shrink-0"
                                            aria-label={`Chat with ${friend.fullName}`}
                                        >
                                            Chat
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4" role="status" aria-label="No friends to show">
                                <Users className="size-16" aria-hidden="true" />
                                <p className="text-sm font-bold uppercase tracking-widest italic text-center px-4">No friends found</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
});

FriendsListModal.displayName = "FriendsListModal";

export default FriendsListModal;
