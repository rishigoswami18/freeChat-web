import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Trash2, ChevronLeft, ChevronRight, Eye, MoreVertical } from "lucide-react";
import toast from "react-hot-toast";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import { viewStory } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";

const StoryViewer = ({ group, onClose, onDelete }) => {
    const { authUser } = useAuthUser();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showViewers, setShowViewers] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [viewingDP, setViewingDP] = useState(null);

    const story = group.stories[currentIndex];
    const isOwner = authUser?._id === group.userId;
    const audioRef = useRef(null);

    const handleNext = useCallback(() => {
        setIsPaused(false);
        if (currentIndex < group.stories.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setProgress(0);
        } else {
            onClose();
        }
    }, [currentIndex, group.stories.length, onClose]);

    const handlePrev = useCallback(() => {
        setIsPaused(false);
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setProgress(0);
        }
    }, [currentIndex]);

    useEffect(() => {
        if (isPaused || viewingDP) return;

        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + 1;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [handleNext, isPaused, viewingDP]);

    useEffect(() => {
        if (audioRef.current) {
            if (isPaused || viewingDP) {
                audioRef.current.pause();
            } else {
                audioRef.current.currentTime = 0;
                audioRef.current.play().catch(() => { });
            }
        }

        if (!isOwner && story?._id) {
            viewStory(story._id).catch(err => console.error("Error recording view", err));
        }
    }, [currentIndex, isOwner, story?._id, isPaused, viewingDP]);

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

    return (
        <div className="fixed inset-0 z-[100] bg-black/98 flex flex-col items-center justify-center sm:p-4 backdrop-blur-xl overflow-hidden">
            {story.audioUrl && (
                <audio ref={audioRef} src={story.audioUrl} loop />
            )}

            {/* Top Bar Controls */}
            <div className="absolute top-0 inset-x-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/80 to-transparent">
                <div className="max-w-md mx-auto">
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
                            <div
                                className="size-10 rounded-full p-[1.5px] bg-gradient-to-tr from-orange-400 to-rose-600 cursor-pointer active:scale-95 transition-transform"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsPaused(true);
                                    setViewingDP({ url: group.profilePic || "/avatar.png", name: group.fullName });
                                }}
                            >
                                <img src={group.profilePic || "/avatar.png"} alt="" className="size-full rounded-full object-cover border-2 border-black" />
                            </div>
                            <div>
                                <p className="font-bold text-sm tracking-tight">{group.fullName}</p>
                                <p className="text-[10px] font-medium opacity-60">
                                    {new Date(story.createdAt).toLocaleTimeString("en-US", { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' })}
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
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                            >
                                <X className="size-6 text-white" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Story Content */}
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

                {/* Interaction Overlay */}
                <div className="absolute inset-0 z-30 flex">
                    <div className="flex-1 cursor-pointer" onClick={handlePrev} />
                    <div className="flex-1 cursor-pointer" onClick={handleNext} />
                </div>
            </div>

            {/* Owner Actions */}
            {isOwner && (
                <div className="absolute bottom-10 inset-x-0 flex justify-center z-50">
                    <button
                        onClick={handleDeleteStory}
                        className="btn btn-error btn-sm rounded-full gap-2 px-5 shadow-lg shadow-error/20"
                    >
                        <Trash2 className="size-4" />
                        Delete Story
                    </button>
                </div>
            )}

            {/* Viewer List Modal */}
            <AnimatePresence>
                {showViewers && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                        onClick={() => setShowViewers(false)}
                    >
                        <div
                            className="bg-base-100 w-full max-w-sm rounded-t-3xl sm:rounded-3xl overflow-hidden border border-base-300 flex flex-col max-h-[60vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-4 border-b flex justify-between items-center bg-base-200/50">
                                <h3 className="font-bold uppercase tracking-widest text-xs opacity-50">Viewed by</h3>
                                <button onClick={() => setShowViewers(false)}><X className="size-4" /></button>
                            </div>
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {story.views?.length > 0 ? (
                                    story.views.map((viewer, idx) => (
                                        <div key={idx} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-xl transition-colors">
                                            <div className="size-8 rounded-full overflow-hidden bg-base-300">
                                                <img src={viewer.profilePic} alt="" className="size-full object-cover" />
                                            </div>
                                            <p className="font-bold text-sm">{viewer.fullName}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center opacity-30 italic text-sm">No views yet</div>
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
