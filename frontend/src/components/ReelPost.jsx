import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, User, Play, Pause, Music, Send, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost, commentOnPost, sharePost } from "../lib/api";
import toast from "react-hot-toast";

const ReelPost = ({ post, isActive }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(post.likes.includes(post.userId));
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [isCommenting, setIsCommenting] = useState(false);
    const queryClient = useQueryClient();

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
            // local update for immediate feedback
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

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            video.play().catch(() => { });
            setIsPlaying(true);
        } else {
            video.pause();
            video.currentTime = 0; // Reset to start when scrolled away if desired, or just pause
            setIsPlaying(false);
        }

        return () => {
            video.pause();
        };
    }, [isActive]);

    const togglePlay = () => {
        if (videoRef.current?.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden scroll-snap-align-start">
            <video
                ref={videoRef}
                src={post.mediaUrl}
                className="h-full w-full object-contain"
                loop
                playsInline
                onClick={togglePlay}
            />

            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Play className="size-20 text-white/50" />
                </div>
            )}

            {/* OVERLAYS */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />

            {/* Right Side Actions */}
            <div className="absolute right-4 bottom-32 flex flex-col gap-6 items-center z-10">
                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => toggleLike()}
                        className={`btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 ${liked ? 'text-red-500' : 'text-white'}`}
                    >
                        <Heart className={`size-7 ${liked ? 'fill-current' : ''}`} />
                    </button>
                    <span className="text-white text-xs font-bold">{likesCount}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={() => setShowComments(true)}
                        className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white"
                    >
                        <MessageCircle className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold">{post.comments.length}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button
                        onClick={handleShare}
                        className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white"
                    >
                        <Share2 className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold">{post.shareCount}</span>
                </div>
            </div>

            {/* COMMENTS DRAWER */}
            {showComments && (
                <div className="absolute inset-0 z-[100] bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="absolute bottom-0 inset-x-0 bg-base-100 rounded-t-3xl h-[60%] flex flex-col animate-in slide-in-from-bottom duration-300">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-bold">Comments ({post.comments.length})</h3>
                            <button onClick={() => setShowComments(false)} className="btn btn-ghost btn-circle btn-sm">
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {post.comments.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <MessageCircle className="size-12 mb-2" />
                                    <p>No comments yet</p>
                                </div>
                            ) : (
                                post.comments.map((comment, i) => (
                                    <div key={i} className="flex gap-3">
                                        <div className="avatar size-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
                                            <img src={comment.profilePic || "/avatar.png"} alt="" />
                                        </div>
                                        <div className="bg-base-200 rounded-2xl p-3 flex-1">
                                            <p className="font-bold text-xs">{comment.fullName}</p>
                                            <p className="text-sm">{comment.text}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t bg-base-200/50">
                            <div className="flex items-center gap-2 bg-base-100 rounded-full px-4 py-1 border focus-within:border-primary transition-colors">
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="input input-ghost input-sm flex-1 bg-transparent focus:outline-none"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                                />
                                <button
                                    onClick={handleComment}
                                    disabled={!commentText.trim() || isCommenting}
                                    className="btn btn-ghost btn-circle btn-sm text-primary"
                                >
                                    {isCommenting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Info */}
            <div className="absolute left-4 bottom-8 right-16 z-10 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <div className="avatar">
                        <div className="size-10 rounded-full ring-2 ring-primary">
                            <img src={post.profilePic || "/avatar.png"} alt={post.fullName} />
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-base">@{post.fullName.replace(/\s+/g, '').toLowerCase()}</h3>
                        <p className="text-xs opacity-80">{post.fullName}</p>
                    </div>
                </div>
                <p className="text-sm line-clamp-2 mb-2">{post.content}</p>

                {/* SONG INFO */}
                <div className="flex items-center gap-2 mb-2">
                    <Music className="size-4 animate-pulse" />
                    <div className="flex overflow-hidden relative w-48 h-5">
                        <p className="absolute whitespace-nowrap text-xs font-medium animate-marquee">
                            {post.songName || "Original Audio"} — {post.fullName}
                        </p>
                    </div>
                </div>

                {post.caption && (
                    <span className="badge badge-primary badge-sm gap-1 font-bold">
                        Feeling {post.caption}
                    </span>
                )}
            </div>

            {/* Spinning Record Icon */}
            <div className="absolute right-4 bottom-8 z-10">
                <div className="size-11 rounded-full bg-gradient-to-tr from-gray-900 to-gray-600 p-2 animate-[spin_3s_linear_infinite] border-2 border-white/20">
                    <div className="size-full rounded-full border-2 border-white/10 flex items-center justify-center">
                        <Music className="size-4 text-white/40" />
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee {
                    animation: marquee 10s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default ReelPost;
