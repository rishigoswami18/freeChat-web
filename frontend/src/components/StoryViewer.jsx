import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ChevronLeft, ChevronRight, Eye, Heart, MessageCircle, Send, BadgeCheck } from "lucide-react";
import toast from "react-hot-toast";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import { viewStory, likeStory, commentOnStory } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const StoryViewer = ({ group, onClose, onDelete }) => {
    const { authUser } = useAuthUser();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [viewingDP, setViewingDP] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [localLikes, setLocalLikes] = useState({});
    const [localComments, setLocalComments] = useState({});
    const [isStoryLikeAnimating, setIsStoryLikeAnimating] = useState(false);
    const [doubleTapHeart, setDoubleTapHeart] = useState(false);

    const story = group.stories[currentIndex];
    const isOwner = authUser?._id === group.userId;
    const audioRef = useRef(null);
    const commentInputRef = useRef(null);
    const lastTapTime = useRef(0);

    // Get current likes/comments (local state overrides server data)
    const currentLikes = localLikes[story?._id] || story?.likes || [];
    const currentComments = localComments[story?._id] || story?.comments || [];
    const isLiked = Array.isArray(currentLikes) && currentLikes.some(id => id?.toString() === authUser?._id);

    const handleNext = useCallback(() => {
        setIsPaused(false);
        setShowComments(false);
        if (currentIndex < group.stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, group.stories.length, onClose]);

    const handlePrev = useCallback(() => {
        setIsPaused(false);
        setShowComments(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (isPaused || viewingDP || showComments) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1;
            });
        }, 300); // 300ms * 100 steps = 30,000ms (30 seconds)

        return () => clearInterval(interval);
    }, [handleNext, isPaused, viewingDP, showComments]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPaused || viewingDP || showComments) {
                audioRef.current.pause();
            } else {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
            }
        }

        if (!isOwner && story?._id) {
            viewStory(story._id).catch(err => console.error("Error recording view", err));
        }
    }, [currentIndex, isOwner, story?._id, isPaused, viewingDP, showComments]);

    const handleDeleteStory = async () => {
        if (window.confirm("Are you sure you want to delete this story?")) {
            await onDelete(story._id);
            toast.success("Story deleted!");
            if (group.stories.length === 1) {
                onClose();
            } else {
                handleNext();
            }
        }
    };

    const handleLike = async () => {
        if (!story?._id) return;

        // Optimistic update
        const wasLiked = isLiked;
        const newLikes = wasLiked
            ? currentLikes.filter(id => id.toString() !== authUser._id)
            : [...currentLikes, authUser._id];

        setLocalLikes(prev => ({ ...prev, [story._id]: newLikes }));

        if (!wasLiked) {
            setIsStoryLikeAnimating(true);
            setTimeout(() => setIsStoryLikeAnimating(false), 600);
        }

        try {
            await likeStory(story._id);
        } catch (err) {
            // Revert on error
            setLocalLikes(prev => ({ ...prev, [story._id]: currentLikes }));
            toast.error("Failed to like story");
        }
    };

    const handleDoubleTap = (e) => {
        const now = Date.now();
        if (now - lastTapTime.current < 300) {
            // Double tap detected
            e.stopPropagation();
            if (!isLiked) {
                handleLike();
            }
            setDoubleTapHeart(true);
            setTimeout(() => setDoubleTapHeart(false), 1000);
        }
        lastTapTime.current = now;
    };

    const handleComment = async () => {
        if (!commentText.trim() || !story?._id) return;

        const tempComment = {
            userId: authUser._id,
            fullName: authUser.fullName,
            profilePic: authUser.profilePic || "",
            text: commentText.trim(),
            createdAt: new Date().toISOString(),
        };

        // Optimistic update
        setLocalComments(prev => ({
            ...prev,
            [story._id]: [...currentComments, tempComment]
        }));
        setCommentText("");

        try {
            const data = await commentOnStory(story._id, tempComment.text);
            setLocalComments(prev => ({ ...prev, [story._id]: data.comments }));
        } catch (err) {
            setLocalComments(prev => ({ ...prev, [story._id]: currentComments }));
            toast.error("Failed to add comment");
        }
    };

    const openComments = () => {
        setShowComments(true);
        setIsPaused(true);
        setTimeout(() => commentInputRef.current?.focus(), 200);
    };

    return (
        <div className="fixed inset-0 z-[999] bg-black/95 flex flex-col items-center justify-center sm:p-4 backdrop-blur-xl overflow-hidden font-outfit">
            {story.audioUrl && (
                <audio ref={audioRef} src={story.audioUrl} loop />
            )}

            {/* Premium Center Frame for Desktop */}
            <div className="relative w-full h-full sm:h-[90vh] sm:max-w-[420px] bg-black sm:rounded-[40px] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center sm:border sm:border-white/10 shrink-0">
                
                {/* Top Bar Controls */}
                <div className="absolute top-0 inset-x-0 z-50 p-4 sm:p-5 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
                    <div className="w-full h-full pointer-events-auto">
                        {/* Progress Bars */}
                        <div className="flex gap-1 mb-4 w-full">
                            {group.stories.map((_, idx) => (
                                <div key={idx} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div
                                        className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_10px_rgba(255,255,255,0.8)]"
                                        style={{
                                            width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between text-white w-full">
                            <div className="flex items-center gap-3 shrink-0 min-w-0">
                                <div
                                    className="size-9 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 via-pink-500 to-purple-500 cursor-pointer active:scale-95 transition-transform shrink-0"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsPaused(true);
                                        setViewingDP({ url: group.profilePic || "/avatar.png", name: group.fullName, isVerified: group.isVerified || group.role === "admin" });
                                    }}
                                >
                                    <img src={group.profilePic || "/avatar.png"} alt="" className="size-full rounded-full object-cover border-[1.5px] border-black" />
                                </div>
                                <div className="min-w-0 pr-2">
                                    <p className="font-semibold text-[13px] tracking-tight truncate drop-shadow-md text-white flex items-center gap-1">
                                        {group.fullName}
                                        {(group.role === "admin" || group.isVerified) && (
                                            <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                               <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </p>
                                    <p className="text-[10px] font-medium opacity-70 drop-shadow-md">
                                        {new Date(story.createdAt).toLocaleTimeString("en-US", { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Action Buttons (Top Right) */}
                            <div className="flex items-center gap-2 shrink-0">
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => setShowViewers(true)}
                                            className="flex items-center gap-1.5 bg-black/40 hover:bg-black/60 backdrop-blur-md transition-colors px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-sm"
                                        >
                                            <Eye className="size-3.5 opacity-80" />
                                            {story.views?.length || 0}
                                        </button>
                                        <button
                                            onClick={handleDeleteStory}
                                            className="p-1.5 hover:bg-red-500/20 rounded-full transition-colors active:scale-90 text-white"
                                            title="Delete Story"
                                        >
                                            <Trash2 className="size-[18px] text-white/90 hover:text-red-400" />
                                        </button>
                                    </>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-90 ml-1"
                                >
                                    <X className="size-6 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Animated Story Media Container */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={story._id}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute inset-0 flex items-center justify-center w-full h-full"
                    >
                        {/* Background Blur Fill */}
                        <div className="absolute inset-0 z-0">
                            {story.mediaType === 'video' ? (
                                <video src={story.imageUrl} className="w-full h-full object-cover blur-3xl opacity-40 scale-125 saturate-150" muted playsInline />
                            ) : (
                                <img src={story.imageUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-40 scale-125 saturate-150" />
                            )}
                        </div>

                        {/* Foreground Media */}
                        {story.mediaType === 'video' ? (
                            <video
                                src={story.imageUrl}
                                className="relative z-10 w-full h-full object-contain select-none"
                                autoPlay
                                muted
                                loop
                                playsInline
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        ) : (
                            <img
                                src={story.imageUrl}
                                alt=""
                                className="relative z-10 w-full h-full object-contain select-none"
                                onContextMenu={(e) => e.preventDefault()}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Double-tap heart animation */}
                <AnimatePresence>
                    {doubleTapHeart && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, rotate: -15 }}
                            animate={{ opacity: 1, scale: 1.2, rotate: 0 }}
                            exit={{ opacity: 0, scale: 1, y: -50 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                        >
                            <Heart className="size-28 text-[#ff3040] fill-[#ff3040] drop-shadow-[0_0_30px_rgba(255,48,64,0.6)]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Interaction Overlay (tap left/right) */}
                <div className="absolute inset-0 z-30 flex">
                    <div className="flex-1 cursor-pointer pointer-events-auto" onClick={(e) => { handleDoubleTap(e); handlePrev(); }} />
                    <div className="flex-1 cursor-pointer pointer-events-auto" onClick={(e) => { handleDoubleTap(e); handleNext(); }} />
                </div>

                {/* Caption */}
                {story.caption && (
                    <div className="absolute bottom-24 inset-x-0 z-30 px-6 text-center pointer-events-none">
                        <p className="text-white text-[14px] font-medium drop-shadow-xl bg-black/50 backdrop-blur-md rounded-2xl px-5 py-2.5 inline-block max-w-full">
                            {story.caption}
                        </p>
                    </div>
                )}

                {/* Bottom Action Bar */}
                <div className="absolute bottom-0 inset-x-0 z-50 bg-gradient-to-t from-black/80 via-black/40 to-transparent pb-4 sm:pb-6 pt-16 pointer-events-none">
                    <div className="w-full px-4 flex items-center justify-between gap-3 pointer-events-auto">
                        {/* Comment Input */}
                        <div className="flex-1 relative group">
                            <input
                                type="text"
                                placeholder="Send a message..."
                                className="w-full bg-black/40 backdrop-blur-md hover:bg-black/50 text-white placeholder-white/60 text-[14px] px-5 py-2.5 rounded-[24px] border border-white/20 focus:border-white/50 focus:bg-black/60 outline-none transition-all shadow-lg"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                onFocus={() => setIsPaused(true)}
                                onBlur={() => { if (!showComments && !commentText) setIsPaused(false); }}
                                onKeyDown={(e) => { if (e.key === "Enter") handleComment(); }}
                            />
                            <AnimatePresence>
                                {commentText.trim() && (
                                    <motion.button
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        onClick={handleComment}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 bg-white text-black rounded-full active:scale-90 transition-transform shadow-md"
                                    >
                                        <Send className="size-4" />
                                    </motion.button>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions Right Side */}
                        <div className="flex items-center gap-1 shrink-0">
                            {/* Like Button */}
                            <button
                                onClick={handleLike}
                                className={`p-2.5 rounded-full transition-all active:scale-90 group/like ${isLiked ? '' : 'hover:bg-white/10'}`}
                            >
                                <Heart 
                                    className={`size-[26px] transition-all duration-300 ${isLiked ? 'text-[#ff3040] fill-[#ff3040]' : 'text-white'} ${isStoryLikeAnimating ? 'scale-125' : ''} group-hover/like:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]`} 
                                    strokeWidth={isLiked ? 2 : 2.5}
                                />
                                {currentLikes.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {currentLikes.length}
                                    </span>
                                )}
                            </button>

                            {/* Comment Button */}
                            <button
                                onClick={openComments}
                                className="p-2.5 rounded-full hover:bg-white/10 transition-all active:scale-90 relative"
                            >
                                <MessageCircle className="size-[26px] text-white" strokeWidth={2.5} style={{ transform: 'scaleX(-1)' }} />
                                {currentComments.length > 0 && (
                                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-white text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {currentComments.length}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {/* Desktop Side Navigation Arrows */}
            <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 left-[calc(50%-260px)] z-40">
                <button 
                    onClick={handlePrev} 
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white shadow-xl transition-all active:scale-90"
                >
                    <ChevronLeft className="size-6" />
                </button>
            </div>
            <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 right-[calc(50%-260px)] z-40">
                <button 
                    onClick={handleNext} 
                    className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white shadow-xl transition-all active:scale-90"
                >
                    <ChevronRight className="size-6" />
                </button>
            </div>

            {/* Comments Modal */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] bg-black/40 sm:bg-black/60 backdrop-blur-sm"
                        onClick={() => { setShowComments(false); setIsPaused(false); }}
                    >
                        <div
                            className="bg-base-100 w-full sm:max-w-md rounded-t-[32px] sm:rounded-3xl overflow-hidden border border-base-300 flex flex-col h-[60vh] sm:h-auto sm:max-h-[60vh] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-base-content/10 flex justify-between items-center bg-base-200/50">
                                <h3 className="font-bold text-[15px] pl-2">
                                    Comments <span className="text-base-content/50 text-sm ml-1 font-medium">{currentComments.length}</span>
                                </h3>
                                <button onClick={() => { setShowComments(false); setIsPaused(false); }} className="p-1.5 hover:bg-base-300 rounded-full transition-colors">
                                    <X className="size-5 text-base-content/70" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                                {currentComments.length > 0 ? (
                                    currentComments.map((comment, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 hover:bg-base-200/50 rounded-2xl transition-colors">
                                            <div className="size-9 rounded-full overflow-hidden bg-base-300 flex-shrink-0 border border-base-content/5">
                                                <img src={comment.profilePic || "/avatar.png"} alt="" className="size-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <p className="text-[13px] leading-snug break-words flex items-center flex-wrap gap-x-1">
                                                    <span className="font-semibold">{comment.fullName}</span>
                                                    {(comment.isVerified || comment.role === "admin") && (
                                                       <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                                          <BadgeCheck className="size-3 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                                       </div>
                                                    )}
                                                    <span>{comment.text}</span>
                                                </p>
                                                <p className="font-medium opacity-50 mt-1 text-[11px]">
                                                    {new Date(comment.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                                                    <span className="ml-3 font-semibold cursor-pointer hover:opacity-100">Reply</span>
                                                </p>
                                            </div>
                                            <button className="pt-2">
                                                <Heart className="size-3 text-base-content/40 hover:text-base-content" />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-50">
                                        <MessageCircle className="size-12 mb-3 opacity-20" />
                                        <p className="font-medium text-[14px]">No comments yet.</p>
                                        <p className="text-sm mt-1">Start the conversation.</p>
                                    </div>
                                )}
                            </div>
                            {/* Comment input inside modal */}
                            <div className="p-3 border-t border-base-content/10 bg-base-100">
                                <div className="flex items-center gap-2 bg-base-200/70 p-1.5 rounded-full border border-base-content/5 focus-within:border-base-content/20 transition-colors">
                                    <div className="size-8 rounded-full overflow-hidden bg-base-300 shrink-0 ml-1">
                                         <img src={authUser?.profilePic || "/avatar.png"} className="size-full object-cover" />
                                    </div>
                                    <input
                                        ref={commentInputRef}
                                        type="text"
                                        placeholder={`Add a comment for ${group.fullName}...`}
                                        className="bg-transparent border-none w-full text-[14px] outline-none px-2"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") handleComment(); }}
                                    />
                                    <AnimatePresence>
                                        {commentText.trim() && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                onClick={handleComment}
                                                className="btn btn-primary btn-sm btn-circle shrink-0"
                                            >
                                                <Send className="size-3.5" />
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Viewer List Modal */}
            <AnimatePresence>
                {showViewers && (
                    <motion.div
                        initial={{ opacity: 0, y: "100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center z-[110] bg-black/40 sm:bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowViewers(false)}
                    >
                        <div
                            className="bg-base-100 w-full sm:max-w-sm rounded-t-[32px] sm:rounded-3xl overflow-hidden border border-base-300 flex flex-col h-[50vh] sm:h-auto sm:max-h-[60vh] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b border-base-content/10 flex justify-between items-center bg-base-200/50">
                                <h3 className="font-bold text-[15px] pl-2">
                                    Viewers <span className="text-base-content/50 text-sm ml-1 font-medium">{story.views?.length || 0}</span>
                                </h3>
                                <button onClick={() => setShowViewers(false)} className="p-1.5 hover:bg-base-300 rounded-full transition-colors">
                                    <X className="size-5 text-base-content/70" />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
                                {story.views?.length > 0 ? (
                                    story.views.map((viewer, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 hover:bg-base-200/50 rounded-2xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="size-11 rounded-full overflow-hidden bg-base-300 border border-base-content/5">
                                                    <img src={viewer.profilePic} alt="" className="size-full object-cover" />
                                                </div>
                                                <p className="font-semibold text-[14px] flex items-center gap-1">
                                                   {viewer.fullName}
                                                   {(viewer.isVerified || viewer.role === "admin") && (
                                                       <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                                          <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                                       </div>
                                                   )}
                                                </p>
                                            </div>
                                            <button className="text-[12px] font-bold text-blue-500 hover:text-white px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500 rounded-lg transition-colors">
                                                View
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center flex flex-col items-center justify-center opacity-50">
                                        <Eye className="size-12 mb-3 opacity-20" />
                                        <p className="font-medium text-[14px]">No views yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {viewingDP && (
                <ProfilePhotoViewer
                    imageUrl={viewingDP.url}
                    fullName={viewingDP.name}
                    isVerified={viewingDP.isVerified}
                    onClose={() => {
                        setViewingDP(null);
                        setIsPaused(false);
                    }}
                />
            )}
        </div>
    );
};

export default StoryViewer;
