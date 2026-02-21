import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideoPosts } from "../lib/api";
import ReelPost from "../components/ReelPost";
import { Loader2, Film } from "lucide-react";

const ReelsPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);

    const { data: reels = [], isLoading } = useQuery({
        queryKey: ["reels"],
        queryFn: getVideoPosts,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / container.clientHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [activeIndex]);

    if (isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
                <Loader2 className="size-12 animate-spin text-primary" />
                <p className="font-medium animate-pulse">Loading Reels...</p>
            </div>
        );
    }

    if (reels.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center gap-6">
                <div className="size-24 bg-white/10 rounded-full flex items-center justify-center">
                    <Film className="size-12 text-white/40" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">No Reels Yet</h2>
                    <p className="text-white/40 max-w-xs">Existing videos will appear here. Be the first to post a video!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {reels.map((reel, index) => (
                <div key={reel._id} className="h-screen w-full snap-start">
                    <ReelPost
                        post={reel}
                        isActive={index === activeIndex}
                    />
                </div>
            ))}
        </div>
    );
};

export default ReelsPage;
