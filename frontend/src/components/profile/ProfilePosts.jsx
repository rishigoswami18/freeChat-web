import React, { memo, useState, useCallback, useMemo } from "react";
import { Grid, List, Lock, Play, Image as ImageIcon, MessageSquare, Heart, AlertCircle, RefreshCcw, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useAuthUser from "../../hooks/useAuthUser";
import { unlockPost } from "../../lib/api";
import toast from "react-hot-toast";

/**
 * SkeletonLoader — Premium Hub Pre-sync state.
 * Prevents layout shifts and provides a high-fidelity visual placeholder while data synchronizes.
 */
const SkeletonLoader = () => (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-4 animate-in fade-in duration-500">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-white/5 rounded-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            </div>
        ))}
    </div>
);

export const PostGridItem = memo(({ post, onSelectFeedMode, onUnlockSuccess }) => {
    const { authUser } = useAuthUser();
    const isOwner = authUser?._id === post.userId;
    const isLocked = post.isPaid && !isOwner && !post.unlockedBy?.includes(authUser?._id);
    const [isUnlocking, setIsUnlocking] = useState(false);

    const handleUnlock = async (e) => {
        e.stopPropagation();
        if (isUnlocking) return;
        
        setIsUnlocking(true);
        try {
            const res = await unlockPost(post._id);
            toast.success(res.message || "Post unlocked! 💎");
            if (onUnlockSuccess) onUnlockSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || "Unlock failed");
        } finally {
            setIsUnlocking(false);
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={isLocked ? null : onSelectFeedMode}
            className={`aspect-square relative group overflow-hidden rounded-2xl cursor-pointer border border-white/5 bg-white/[0.02] ${isLocked ? 'cursor-default' : ''}`}
        >
            {isLocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10">
                    <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                        <Lock className="size-6 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white mb-2">Premium Content</span>
                    <button 
                        onClick={handleUnlock}
                        disabled={isUnlocking}
                        className="btn btn-primary btn-xs rounded-lg font-black uppercase tracking-widest h-8 px-4"
                    >
                        {isUnlocking ? "Sync..." : `₹${post.price || 0}`}
                    </button>
                    {/* Background Blur */}
                    <div className="absolute inset-0 bg-primary/5 backdrop-blur-2xl -z-10" />
                </div>
            ) : (
                <>
                    <img 
                        src={post.mediaUrl} 
                        alt="" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                        <div className="flex items-center gap-4 text-white">
                            <div className="flex items-center gap-1.5">
                                <Heart className="size-4 fill-primary text-primary" />
                                <span className="text-xs font-black">{post.likes?.length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <MessageSquare className="size-4 text-white" />
                                <span className="text-xs font-black">{post.comments?.length || 0}</span>
                            </div>
                        </div>
                    </div>
                    {post.mediaType === "video" && (
                        <div className="absolute top-3 right-3 text-white drop-shadow-lg scale-75 md:scale-100">
                             <Play size={18} fill="currentColor" />
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
});

PostGridItem.displayName = "PostGridItem";

const ProfilePosts = memo(({ userPosts = [], viewMode, setViewMode, isLoading, isError, onRetry, queryClient }) => {
    if (isLoading) return <SkeletonLoader />;

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <AlertCircle className="size-12 text-rose-500 opacity-20" />
                <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Synchronization Interrupted</p>
                <button onClick={onRetry} className="btn btn-ghost btn-sm rounded-xl gap-2 font-black uppercase tracking-widest text-[10px]">
                    <RefreshCcw size={14} /> Retry Sync
                </button>
            </div>
        );
    }

    if (userPosts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-32 text-center space-y-6">
                <div className="size-20 rounded-[32px] bg-white/5 border border-white/5 flex items-center justify-center opacity-20">
                    <ImageIcon className="size-8" />
                </div>
                <div className="space-y-1">
                    <p className="text-white font-black italic uppercase tracking-tighter text-xl">Nexus Archive Empty</p>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">No contributions found in this timeline.</p>
                </div>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
            >
                <div className="grid grid-cols-3 gap-0.5 sm:gap-4">
                    {userPosts.map((post) => (
                        <PostGridItem 
                            key={post._id} 
                            post={post} 
                            onUnlockSuccess={() => {
                                if (queryClient) {
                                    queryClient.invalidateQueries({ queryKey: ["userPosts"] });
                                    queryClient.invalidateQueries({ queryKey: ["walletBalance"] });
                                }
                                if (onRetry) onRetry();
                            }}
                            onSelectFeedMode={() => setViewMode("feed")}
                        />
                    ))}
                </div>
            </motion.div>
        </AnimatePresence>
    );
});

ProfilePosts.displayName = "ProfilePosts";

export default ProfilePosts;
