import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Music, Send, X, BadgeCheck, ExternalLink, Gift, Settings, Maximize, Minimize } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, commentOnPost, sharePost, sendGift } from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import LikedByModal from "./LikedByModal";
import useAuthUser from "../hooks/useAuthUser";
import ReelPlayer from "./reels/ReelPlayer";

/**
 * Standardized Social Reel Card.
 * Heavily optimized with React.memo and decoupled video logic.
 */
const ReelPost = memo(({ post, isActive }) => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const youtubeRef = useRef(null);
    
    // UI State
    const [isPlaying, setIsPlaying] = useState(isActive);
    const [liked, setLiked] = useState(post.likes.includes(authUser?._id));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);
    const [showLikes, setShowLikes] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showGifts, setShowGifts] = useState(false);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showHeart, setShowHeart] = useState(false);

    const lastTap = useRef(0);

    // Synchronize play state with active viewport change
    useEffect(() => {
        setIsPlaying(isActive);
    }, [isActive]);

    // Mutation: Like Logic
    const { mutate: toggleLike } = useMutation({
        mutationFn: () => likePost(post._id),
        onSuccess: (data) => {
            setLiked(data.liked);
            setLikesCount(data.likes.length);
            // Invalidate query to keep global state in sync eventually
            queryClient.invalidateQueries({ queryKey: ["reels"] });
        }
    });

    // Handlers
    const handleDoubleTap = useCallback(() => {
        const now = Date.now();
        if (now - lastTap.current < 300) {
            if (!liked) toggleLike();
            setShowHeart(true);
            setTimeout(() => setShowHeart(false), 800);
            return true;
        }
        lastTap.current = now;
        return false;
    }, [liked, toggleLike]);

    const handleTogglePlay = useCallback(() => {
        if (handleDoubleTap()) return;
        setIsPlaying(prev => !prev);
    }, [handleDoubleTap]);

    const handleShare = useCallback(async () => {
        try {
            const url = `${window.location.origin}/reels?id=${post._id}`;
            await navigator.clipboard.writeText(url);
            await sharePost(post._id);
            toast.success("Link copied!");
        } catch {
            toast.error("Failed to share");
        }
    }, [post._id]);

    const handleComment = useCallback(async () => {
        if (!commentText.trim() || isCommenting) return;
        setIsCommenting(true);
        try {
            const newComment = await commentOnPost(post._id, commentText.trim());
            post.comments.push(newComment); // Local update
            setCommentText("");
            toast.success("Comment added!");
        } catch {
            toast.error("Failed to add comment");
        } finally {
            setIsCommenting(false);
        }
    }, [post._id, post.comments, commentText, isCommenting]);

    const handleSendGift = useCallback(async (gift) => {
        try {
            await sendGift(post.userId, gift.cost, gift.name);
            toast.success(`Sent a ${gift.name}! 🎁`);
            setShowGifts(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send gift");
        }
    }, [post.userId]);

    // YouTube Stability Logic
    const getYouTubeUrl = useMemo(() => {
        let baseUrl = post.mediaUrl.split('?')[0];
        const videoId = baseUrl.split('/').pop();
        const origin = window.location.origin;
        return `${baseUrl}?enablejsapi=1&origin=${encodeURIComponent(origin)}&autoplay=0&mute=0&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&iv_load_policy=3`;
    }, [post.mediaUrl]);

    useEffect(() => {
        if (post.mediaType !== "youtube" || !youtubeRef.current) return;
        
        const command = (isActive && isPlaying) ? 'playVideo' : 'pauseVideo';
        youtubeRef.current.contentWindow?.postMessage(JSON.stringify({
            event: 'command',
            func: command,
            args: ''
        }), 'https://www.youtube.com');
    }, [isActive, isPlaying, post.mediaType]);

    return (
        <div 
            className={`relative h-full w-full bg-black flex items-center justify-center overflow-hidden transition-all duration-500 ${isTheaterMode ? 'sm:max-w-none' : 'sm:max-w-[450px] sm:aspect-[9/16]'}`}
            onClick={handleTogglePlay}
        >
            {/* Media Layer */}
            {post.mediaType === "youtube" ? (
                <div className={`h-full w-full relative transition-all duration-500 bg-black ${isTheaterMode ? 'aspect-video' : 'aspect-[9/16]'}`}>
                    <iframe
                        ref={youtubeRef}
                        src={getYouTubeUrl}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        allow="autoplay; encrypted-media"
                        title={post.content}
                    />
                </div>
            ) : (
                <ReelPlayer 
                    url={post.mediaUrl} 
                    isActive={isActive && isPlaying} 
                    poster={post.thumbnail}
                />
            )}

            {/* Micro-Interaction Layers */}
            <AnimatePresence>
                {showHeart && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                        className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                    >
                        <Heart className="size-32 text-white fill-white drop-shadow-xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Sidebar Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-30" onClick={e => e.stopPropagation()}>
                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => toggleLike()} className={`btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 ${liked ? 'text-red-500' : 'text-white'}`}>
                        <Heart className={`size-7 ${liked ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => setShowComments(true)} className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white">
                        <MessageCircle className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{post.comments.length}</span>
                </div>

                <button onClick={() => setShowGifts(!showGifts)} className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-yellow-400">
                    <Gift className="size-7" />
                </button>

                <button onClick={handleShare} className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white">
                    <Send className="size-7" />
                </button>
            </div>

            {/* Info Section */}
            <div className="absolute left-4 bottom-8 right-16 z-30 text-white flex flex-col gap-3 pointer-events-none">
                 <div className="flex items-center gap-3 pointer-events-auto">
                    <Link to={`/user/${post.userId}`} className="flex items-center gap-3 active:scale-95 transition-transform group">
                        <div className="avatar size-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-black">
                            <img src={post.profilePic || "/avatar.png"} alt="" className="rounded-full" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1">
                                <h3 className="font-bold text-base drop-shadow-md">@{post.fullName?.replace(/\s+/g, '').toLowerCase()}</h3>
                                {post.isVerified && <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" />}
                            </div>
                            <p className="text-[10px] opacity-60 font-medium">View Profile</p>
                        </div>
                    </Link>
                </div>
                <p className="text-sm line-clamp-2 drop-shadow-md font-medium">{post.content}</p>
                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md py-1 px-3 rounded-full w-fit">
                    <Music className="size-3 text-primary animate-pulse" />
                    <p className="text-[11px] font-bold">{post.songName || "Original Audio"}</p>
                </div>
            </div>

            {/* Modals & Overlays (Hoisted) */}
            <AnimatePresence>
                {showComments && (
                    <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="mt-auto bg-base-100 rounded-t-3xl h-[60%] flex flex-col text-base-content overflow-hidden">
                             <div className="flex justify-between items-center p-4 border-b">
                                <h3 className="font-bold">Comments</h3>
                                <button onClick={() => setShowComments(false)} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {post.comments.map((c, i) => (
                                    <div key={i} className="flex gap-2">
                                        <div className="size-8 rounded-full bg-base-200 shrink-0 overflow-hidden">
                                            <img src={c.profilePic || "/avatar.png"} alt="" />
                                        </div>
                                        <div className="bg-base-200 rounded-2xl p-2 px-3 flex-1">
                                            <p className="font-bold text-[10px]">{c.fullName}</p>
                                            <p className="text-xs">{c.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 border-t flex gap-2">
                                <input 
                                    value={commentText} 
                                    onChange={e => setCommentText(e.target.value)} 
                                    type="text" 
                                    placeholder="Add a comment..." 
                                    className="input input-bordered input-sm flex-1 rounded-full" 
                                />
                                <button onClick={handleComment} className="btn btn-primary btn-sm btn-circle"><Send className="size-4" /></button>
                            </div>
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {showLikes && (
                <LikedByModal
                    postId={post._id}
                    isOpen={true}
                    onClose={() => setShowLikes(false)}
                />
            )}
        </div>
    );
});

ReelPost.displayName = "ReelPost";

export default ReelPost;
