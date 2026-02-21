import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, User, Play, Pause, Music } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { likePost } from "../lib/api";
import toast from "react-hot-toast";

const ReelPost = ({ post, isActive }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [liked, setLiked] = useState(post.likes.includes(post.userId)); // Simplified
    const [likesCount, setLikesCount] = useState(post.likes.length);
    const queryClient = useQueryClient();

    const { mutate: toggleLike } = useMutation({
        mutationFn: () => likePost(post._id),
        onSuccess: (data) => {
            setLiked(data.liked);
            setLikesCount(data.likes.length);
        }
    });

    useEffect(() => {
        if (isActive) {
            videoRef.current?.play().catch(() => { });
            setIsPlaying(true);
        } else {
            videoRef.current?.pause();
            setIsPlaying(false);
        }
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
                    <button className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white">
                        <MessageCircle className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold">{post.comments.length}</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="btn btn-circle btn-ghost bg-black/20 hover:bg-black/40 text-white">
                        <Share2 className="size-7" />
                    </button>
                    <span className="text-white text-xs font-bold">{post.shareCount}</span>
                </div>
            </div>

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
