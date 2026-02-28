import { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, Music, Send, Heart, Eye, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { viewStory } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const StoryViewer = ({ group, onClose }) => {
    const { authUser } = useAuthUser();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [comment, setComment] = useState("");
    const [showViewers, setShowViewers] = useState(false);
    const story = group.stories[currentIndex];
    const audioRef = useRef(null);

    const isOwner = authUser?._id === group.userId;

    useEffect(() => {
        setProgress(0);
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1;
            });
        }, 50); // 5 seconds total

        return () => clearInterval(interval);
    }, [currentIndex]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => { });
        }

        // Record view if not owner
        if (authUser && authUser._id !== group.userId) {
            viewStory(story._id).catch(err => console.error("Error recording view", err));
        }
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < group.stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(0);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center sm:p-4 backdrop-blur-md overflow-hidden">
            {story.audioUrl && (
                <audio ref={audioRef} src={story.audioUrl} loop className="hidden" />
            )}

            {/* Header / Info */}
            <div className="absolute top-0 inset-x-0 p-4 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-10 sm:pt-6">
                {/* Progress Bars */}
                <div className="flex gap-1.5 mb-5 px-1">
                    {group.stories.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear"
                                style={{
                                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full p-[1.5px] bg-gradient-to-tr from-orange-400 to-rose-600">
                            <img src={group.profilePic || "/avatar.png"} alt="" className="size-full rounded-full object-cover border-2 border-black" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-tight">{group.fullName}</p>
                            <p className="text-[10px] font-medium opacity-60">
                                {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isOwner && (
                            <button
                                onClick={() => setShowViewers(true)}
                                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 transition-colors px-2 py-1 rounded-full text-[11px] font-bold"
                            >
                                <Eye className="size-3.5" />
                                {story.views?.length || 0}
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 active:scale-90 rounded-full transition-all"
                        >
                            <X className="size-6 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Story Container */}
            <div className="relative w-full h-full sm:h-auto sm:max-w-md sm:aspect-[9/16] bg-black sm:rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={story._id}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        {/* Background Blur */}
                        <div className="absolute inset-0 z-0">
                            <img src={story.imageUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-30 scale-150" />
                        </div>

                        <img
                            src={story.imageUrl}
                            alt=""
                            className="relative z-10 w-full h-full object-contain select-none shadow-2xl shadow-black/50"
                            onContextMenu={(e) => e.preventDefault()}
                        />
                    </motion.div>
                </AnimatePresence>

                {/* Interaction Areas */}
                <div className="absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer group/nav" onClick={handlePrev}>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity">
                        <ChevronLeft className="size-6 text-white" />
                    </div>
                </div>
                <div className="absolute inset-y-0 right-0 w-1/4 z-30 cursor-pointer group/nav" onClick={handleNext}>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover/nav:opacity-100 transition-opacity">
                        <ChevronRight className="size-6 text-white" />
                    </div>
                </div>

                {/* Overlays */}
                <div className="absolute bottom-40 inset-x-0 p-6 z-30 text-center pointer-events-none">
                    {story.caption && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-white text-lg font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                        >
                            {story.caption}
                        </motion.p>
                    )}
                </div>

                {/* Bottom Bar Interaction */}
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent z-40 flex items-center gap-4">
                    {!isOwner ? (
                        <>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Send message"
                                    className="w-full bg-transparent border border-white/40 rounded-full py-2.5 px-5 text-white text-sm outline-none focus:border-white transition-colors"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>
                            <button
                                onClick={() => setIsLiked(!isLiked)}
                                className={`transition-all active:scale-125 ${isLiked ? 'text-rose-500' : 'text-white'}`}
                            >
                                <Heart className={`size-7 ${isLiked ? 'fill-current' : ''}`} />
                            </button>
                            <button className="text-white active:scale-90 transition-transform">
                                <Send className="size-6" />
                            </button>
                        </>
                    ) : (
                        <div className="w-full flex justify-center pb-2">
                            <button
                                onClick={() => setShowViewers(true)}
                                className="flex flex-col items-center gap-1 group"
                            >
                                <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <Eye className="size-6 text-white" />
                                </div>
                                <span className="text-[10px] text-white font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100">See Viewers</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Song Sticker Layout */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute bottom-24 left-6 z-30 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20"
                >
                    <div className="size-6 rounded bg-primary flex items-center justify-center animate-spin-slow">
                        <Music className="size-3 text-white" />
                    </div>
                    <div className="overflow-hidden w-24 sm:w-32">
                        <p className="text-white text-[10px] font-bold whitespace-nowrap animate-marquee-story">
                            {story.songName || "Original Audio"}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Viewers List Drawer */}
            <AnimatePresence>
                {showViewers && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[150] h-[60%] sm:h-[400px] bg-base-100 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.5)] flex flex-col"
                    >
                        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-base-100 rounded-t-3xl z-10">
                            <div className="flex items-center gap-2">
                                <h3 className="font-black text-lg">Story Views</h3>
                                <span className="badge badge-primary badge-sm font-bold">{story.views?.length || 0}</span>
                            </div>
                            <button onClick={() => setShowViewers(false)} className="btn btn-ghost btn-circle btn-sm">
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            {(!story.views || story.views.length === 0) ? (
                                <div className="h-48 flex flex-col items-center justify-center gap-2 opacity-30">
                                    <Eye className="size-12" />
                                    <p className="font-bold">No views yet</p>
                                    <p className="text-xs">Views will appear here once friends see your story.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {story.views.map((viewer, i) => (
                                        <div key={i} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="avatar">
                                                    <div className="size-11 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                                                        <img src={viewer.profilePic || "/avatar.png"} alt={viewer.fullName} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm tracking-tight">{viewer.fullName}</p>
                                                    <p className="text-[10px] opacity-60">Viewed {new Date(viewer.viewedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary btn-sm btn-ghost group-hover:bg-primary group-hover:text-primary-content transition-all rounded-xl text-xs font-bold">Profile</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                @keyframes marquee-story {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
                .animate-marquee-story {
                    animation: marquee-story 8s linear infinite;
                }
                .animate-spin-slow {
                    animation: spin 4s linear infinite;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--p), 0.2);
                    border-radius: 10px;
                }
            `}</style>

            {/* Desktop Controls */}
            <button
                onClick={handlePrev}
                className="hidden lg:flex absolute left-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
            >
                <ChevronLeft className="size-8" />
            </button>
            <button
                onClick={handleNext}
                className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all backdrop-blur-md"
            >
                <ChevronRight className="size-8" />
            </button>
        </div>
    );
};

export default StoryViewer;
