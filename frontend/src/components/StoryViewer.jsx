import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

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
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center sm:p-4">
            {/* Header / Info */}
            <div className="absolute top-0 inset-x-0 p-4 z-10 bg-gradient-to-b from-black/60 to-transparent">
                {/* Progress Bars */}
                <div className="flex gap-1 mb-4">
                    {group.stories.map((_, idx) => (
                        <div key={idx} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
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
                        <div className="size-10 rounded-full overflow-hidden border border-white/20">
                            <img src={group.profilePic || "/avatar.png"} alt="" className="size-full object-cover" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{group.fullName}</p>
                            <p className="text-[10px] opacity-70">
                                {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="size-6" />
                    </button>
                </div>
            </div>

            {/* Story Image */}
            <div className="relative w-full max-w-md aspect-[9/16] bg-neutral-900 rounded-lg overflow-hidden flex items-center justify-center">
                <img
                    src={story.imageUrl}
                    alt=""
                    className="w-full h-full object-contain"
                />

                {/* Interaction Areas */}
                <div className="absolute inset-y-0 left-0 w-1/3 cursor-pointer" onClick={handlePrev} />
                <div className="absolute inset-y-0 right-0 w-1/3 cursor-pointer" onClick={handleNext} />

                {/* Caption */}
                {story.caption && (
                    <div className="absolute bottom-10 inset-x-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-center">
                        <p className="text-white text-sm font-medium">{story.caption}</p>
                    </div>
                )}
            </div>

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
