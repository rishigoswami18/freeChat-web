import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Music } from "lucide-react";

const StoryViewer = ({ group, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const story = group.stories[currentIndex];

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
        }, 50); // 5 seconds total (50ms * 100)

        return () => clearInterval(interval);
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
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center sm:p-4 backdrop-blur-sm">
            {/* Header / Info */}
            <div className="absolute top-0 inset-x-0 p-4 z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-8 sm:pt-4">
                {/* Progress Bars */}
                <div className="flex gap-1.5 mb-4 px-1">
                    {group.stories.map((_, idx) => (
                        <div key={idx} className="h-0.5 flex-1 bg-white/20 rounded-full overflow-hidden shadow-sm">
                            <div
                                className="h-full bg-white transition-all duration-100 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                                style={{
                                    width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? "100%" : "0%",
                                }}
                            />
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="size-11 rounded-full p-0.5 bg-white/10 backdrop-blur-md overflow-hidden border border-white/20 shadow-lg">
                            <img src={group.profilePic || "/avatar.png"} alt="" className="size-full rounded-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-sm tracking-tight drop-shadow-md">{group.fullName}</p>
                            <p className="text-[10px] font-medium opacity-80 drop-shadow-sm flex items-center gap-1">
                                {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 hover:bg-white/10 active:scale-90 rounded-full transition-all bg-white/5 backdrop-blur-sm border border-white/10"
                    >
                        <X className="size-6 text-white" />
                    </button>
                </div>
            </div>

            {/* Story Image container */}
            <div className="relative w-full h-full sm:h-auto sm:max-w-md sm:aspect-[9/16] bg-black sm:rounded-2xl shadow-2xl overflow-hidden flex items-center justify-center transition-all duration-500 ease-in-out">
                {/* Background Blur for non-filling images */}
                <div className="absolute inset-0 z-0">
                    <img src={story.imageUrl} alt="" className="w-full h-full object-cover blur-3xl opacity-30 scale-150" />
                </div>

                <img
                    src={story.imageUrl}
                    alt=""
                    className="relative z-10 w-full h-full object-contain select-none"
                    onContextMenu={(e) => e.preventDefault()}
                />

                {/* Interaction Areas (Full screen touch) */}
                <div className="absolute inset-y-20 left-0 w-1/4 z-20" onClick={handlePrev} />
                <div className="absolute inset-y-20 right-0 w-1/4 z-20" onClick={handleNext} />

                {/* Song Info */}
                <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2 bg-black/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 group/song">
                    <Music className="size-3.5 text-white animate-pulse" />
                    <div className="overflow-hidden w-24 sm:w-32">
                        <p className="text-white text-[10px] font-bold whitespace-nowrap animate-marquee-story">
                            {story.songName || "Original Audio"}
                        </p>
                    </div>
                </div>

                {/* Caption */}
                {story.caption && (
                    <div className="absolute bottom-14 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center z-20">
                        <p className="text-white text-sm font-medium drop-shadow-md">{story.caption}</p>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes marquee-story {
                    0% { transform: translateX(120%); }
                    100% { transform: translateX(-120%); }
                }
                .animate-marquee-story {
                    animation: marquee-story 8s linear infinite;
                }
            `}</style>

            {/* Desktop Controls */}
            <button
                onClick={handlePrev}
                className="hidden sm:flex absolute left-10 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
                <ChevronLeft className="size-8" />
            </button>
            <button
                onClick={handleNext}
                className="hidden sm:flex absolute right-10 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
            >
                <ChevronRight className="size-8" />
            </button>
        </div>
    );
};

export default StoryViewer;
