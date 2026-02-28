import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Play, Pause, Music, Send, X, Loader2, FastForward, Rewind, Settings, Maximize, Minimize, Gift, CheckCircle, ExternalLink } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, commentOnPost, sharePost, sendGift } from "../lib/api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const ReelPost = ({ post, isActive }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isTheaterMode, setIsTheaterMode] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showGifts, setShowGifts] = useState(false);
    const [seekFeedback, setSeekFeedback] = useState(null); // 'forward' | 'backward' | null
    const [liked, setLiked] = useState(post.likes.includes(post.userId));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const queryClient = useQueryClient();

    const lastTap = useRef(0);

    const gifts = [
        { id: 'rose', name: 'Rose', cost: 10, icon: '🌹' },
        { id: 'icecream', name: 'Ice Cream', cost: 50, icon: '🍦' },
        { id: 'diamond', name: 'Diamond', cost: 500, icon: '💎' },
        { id: 'rocket', name: 'Rocket', cost: 1000, icon: '🚀' },
    ];

    const { mutate: toggleLike } = useMutation({
        mutationFn: () => likePost(post._id),
        onSuccess: (data) => {
            setLiked(data.liked);
            setLikesCount(data.likes.length);
        }
    });

    const handleComment = async () => {
        if (!commentText.trim() || isCommenting) return;
        setIsCommenting(true);
        try {
            const newComment = await commentOnPost(post._id, commentText.trim());
            post.comments.push(newComment);
            setCommentText("");
            toast.success("Comment added!");
        } catch {
            toast.error("Failed to add comment");
        } finally {
            setIsCommenting(false);
        }
    };

    const handleShare = async () => {
        try {
            const url = `${window.location.origin}/reels?id=${post._id}`;
            await navigator.clipboard.writeText(url);
            await sharePost(post._id);
            post.shareCount = (post.shareCount || 0) + 1;
            toast.success("Link copied to clipboard!");
        } catch {
            toast.error("Failed to share");
        }
    };

    const handleSendGift = async (gift) => {
        try {
            await sendGift(post.userId, gift.cost, gift.name);
            toast.success(`Sent a ${gift.name}! 🎁`);
            setShowGifts(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send gift. Check gems.");
        }
    };

    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video) return;

        if (isActive) {
            video.playbackRate = playbackRate;
            video.play().catch(() => { });
            if (audio) {
                audio.currentTime = video.currentTime;
                audio.playbackRate = playbackRate;
                audio.play().catch(() => { });
                video.muted = true;
            } else {
                video.muted = false;
            }
            setIsPlaying(true);
        } else {
            video.pause();
            if (audio) audio.pause();
            video.currentTime = 0;
            setIsPlaying(false);
        }

        return () => {
            video.pause();
            if (audio) audio.pause();
        };
    }, [isActive, playbackRate]);

    const togglePlay = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            if (x < rect.width / 2) {
                handleSeek(-10);
            } else {
                handleSeek(10);
            }
            return;
        }
        lastTap.current = now;

        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    const handleSeek = (amount) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += amount;
        if (audioRef.current) audioRef.current.currentTime = videoRef.current.currentTime;

        setSeekFeedback(amount > 0 ? "forward" : "backward");
        setTimeout(() => setSeekFeedback(null), 500);
    };

    const handleProgressBarClick = (e) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickedPos = (x / rect.width);
        const newTime = clickedPos * videoRef.current.duration;
        videoRef.current.currentTime = newTime;
        if (audioRef.current) audioRef.current.currentTime = newTime;
    };

    return (
        <div className={`relative h-full w-full bg-black flex items-center justify-center overflow-hidden transition-all duration-500 ${isTheaterMode ? 'sm:max-w-none' : 'sm:max-w-[450px] sm:aspect-[9/16]'}`}>
            <video
                ref={videoRef}
                src={post.mediaUrl}
                className={`h-full w-full transition-all duration-500 ${isTheaterMode ? 'object-contain' : 'object-cover'}`}
                loop
                playsInline
                onClick={togglePlay}
                muted={!!post.audioUrl}
                onTimeUpdate={(e) => setProgress((e.target.currentTime / e.target.duration) * 100)}
            />

            {post.audioUrl && (
                <audio ref={audioRef} src={post.audioUrl} loop />
            )}

            {/* Seek Feedback */}
            <AnimatePresence>
                {seekFeedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className={`absolute top-1/2 ${seekFeedback === 'forward' ? 'right-1/4' : 'left-1/4'} -translate-y-1/2 z-50 pointer-events-none bg-black/40 p-6 rounded-full`}
                    >
                        {seekFeedback === 'forward' ? <FastForward className="size-12 text-white" /> : <Rewind className="size-12 text-white" />}
                        <p className="text-white text-xs font-bold mt-2 text-center">{seekFeedback === 'forward' ? '+10s' : '-10s'}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/20 z-40 cursor-pointer group/progress" onClick={handleProgressBarClick}>
                <div className="h-full bg-primary transition-all duration-100 relative" style={{ width: `${progress}%` }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 size-3 bg-primary rounded-full scale-0 group-hover/progress:scale-100 transition-transform" />
                </div>
            </div>

            {/* YouTube Controls */}
            <div className="absolute top-4 right-4 z-30 flex gap-2">
                <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="btn btn-circle btn-sm bg-black/40 border-none text-white hover:bg-black/60">
                    <Settings className="size-4" />
                </button>
                {showSpeedMenu && (
                    <div className="absolute top-10 right-0 bg-base-100 rounded-xl shadow-xl p-2 z-50 min-w-[100px] text-base-content">
                        {[0.5, 1, 1.5, 2].map(speed => (
                            <button key={speed} onClick={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-base-200 ${playbackRate === speed ? 'text-primary' : ''}`}>
                                {speed}x
                            </button>
                        ))}
                    </div>
                )}
                <button onClick={() => setIsTheaterMode(!isTheaterMode)} className="btn btn-circle btn-sm bg-black/40 border-none text-white hover:bg-black/60">
                    {isTheaterMode ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                </button>
            </div>

            {/* Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-30">
                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => toggleLike()} className={`btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 ${liked ? 'text-red-500' : 'text-white'}`}>
                        <motion.div animate={{ scale: liked ? [1, 1.4, 1] : 1 }} transition={{ duration: 0.3 }}>
                            <Heart className={`size-7 ${liked ? 'fill-current' : ''}`} />
                        </motion.div>
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button onClick={() => setShowComments(true)} className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white">
                        <MessageCircle className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">{post.comments.length}</span>
                </div>

                {!post.isAd && (
                    <div className="flex flex-col items-center gap-1">
                        <button onClick={() => setShowGifts(!showGifts)} className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-yellow-400">
                            <Gift className="size-7" />
                        </button>
                    </div>
                )}
            </div>

            {/* Gift Selection Overlay */}
            <AnimatePresence>
                {showGifts && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-40 right-16 bg-base-100 rounded-2xl p-3 shadow-2xl z-50 grid grid-cols-2 gap-2 text-base-content border border-base-300">
                        {gifts.map(gift => (
                            <button key={gift.id} onClick={() => handleSendGift(gift)} className="flex flex-col items-center p-2 hover:bg-base-200 rounded-xl transition-all h-20 w-20">
                                <span className="text-3xl">{gift.icon}</span>
                                <span className="text-[10px] font-bold mt-1">{gift.cost} Gems</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* INFO SECTION */}
            <div className="absolute left-4 bottom-8 right-16 z-30 text-white flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <div className="avatar size-10 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-black">
                        <img src={post.profilePic || "/avatar.png"} alt="" className="rounded-full" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1">
                            <h3 className="font-bold text-base drop-shadow-md">@{post.fullName.replace(/\s+/g, '').toLowerCase()}</h3>
                            {(post.isVerified || post.isAd) && <CheckCircle className="size-4 text-primary fill-white" />}
                        </div>
                        {post.isAd && <span className="text-[10px] text-primary font-black uppercase tracking-widest pl-0.5">Sponsored</span>}
                    </div>
                </div>

                {post.isAd && post.adLink && (
                    <a href={post.adLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm rounded-lg flex items-center gap-2 w-fit">
                        {post.adCta || "Visit Now"} <ExternalLink className="size-3" />
                    </a>
                )}

                <p className="text-sm line-clamp-2 drop-shadow-md font-medium">{post.content}</p>

                <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md py-1 px-3 rounded-full w-fit">
                    <Music className="size-3 text-primary animate-pulse" />
                    <p className="text-[11px] font-bold truncate max-w-[150px]">{post.songName || "Original Audio"}</p>
                </div>
            </div>

            {/* Record Icon */}
            <div className={`absolute right-4 bottom-8 z-30 size-11 rounded-full p-2 bg-gradient-to-tr from-gray-900 via-gray-700 to-gray-900 border-2 border-white/20 animate-[spin_6s_linear_infinite] shadow-xl ${post.isAd ? 'opacity-30' : ''}`}>
                <div className="size-full rounded-full border border-white/20 flex items-center justify-center">
                    <Music className="size-4 text-white/60" />
                </div>
            </div>

            {/* Comment Drawer - simplified here for brevity, check original for full list */}
            {showComments && (
                <div className="absolute inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col">
                    <div className="mt-auto bg-base-100 rounded-t-3xl h-[60%] flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden text-base-content">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="font-bold">Comments</h3>
                            <button onClick={() => setShowComments(false)} className="btn btn-ghost btn-circle btn-sm"><X /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {post.comments.map((c, i) => (
                                <div key={i} className="flex gap-2">
                                    <div className="size-8 rounded-full bg-base-200 shrink-0 overflow-hidden"><img src={c.profilePic || "/avatar.png"} alt="" /></div>
                                    <div className="bg-base-200 rounded-2xl p-2 px-3 flex-1">
                                        <p className="font-bold text-[10px]">{c.fullName}</p>
                                        <p className="text-xs">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t flex gap-2">
                            <input value={commentText} onChange={e => setCommentText(e.target.value)} type="text" placeholder="Add a comment..." className="input input-bordered input-sm flex-1 rounded-full" />
                            <button onClick={handleComment} className="btn btn-primary btn-sm btn-circle"><Send className="size-4" /></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReelPost;
