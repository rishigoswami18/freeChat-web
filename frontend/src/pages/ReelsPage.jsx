import { useState, useEffect, useRef, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getVideoPosts } from "../lib/api";
import ReelPost from "../components/ReelPost";
import ReelAd from "../components/ReelAd";
import { Loader2, Film } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const ReelsPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const { authUser } = useAuthUser();
    const [displayReels, setDisplayReels] = useState([]);

    const { data: rawReels = [], isLoading } = useQuery({
        queryKey: ["reels"],
        queryFn: getVideoPosts,
    });

    // Inject ads for everyone
    const reelsWithAds = useMemo(() => {
        if (!rawReels.length) return [];

        const result = [];
        const AD_INTERVAL = 3; // Show an ad every 3 reels

        rawReels.forEach((reel, index) => {
            result.push(reel);
            if ((index + 1) % AD_INTERVAL === 0) {
                result.push({ _id: `ad-${index}-${Math.random()}`, isAd: true });
            }
        });

        return result;
    }, [rawReels]);

    // Initialize displayReels
    useEffect(() => {
        if (reelsWithAds.length > 0 && displayReels.length === 0) {
            setDisplayReels(reelsWithAds);
        }
    }, [reelsWithAds, displayReels.length]);

    // Handle Infinite Scroll by Repeating
    useEffect(() => {
        if (displayReels.length > 0 && activeIndex >= displayReels.length - 2) {
            const suffix = `repeat-${displayReels.length}`;
            const repeated = reelsWithAds.map(r => ({
                ...r,
                _id: `${r._id}-${suffix}`
            }));
            setDisplayReels(prev => [...prev, ...repeated]);
        }
    }, [activeIndex, displayReels.length, reelsWithAds]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const observerOptions = {
            root: container,
            threshold: 0.6,
        };

        const observerCallback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute("data-index"));
                    setActiveIndex(index);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        const reelElements = container.querySelectorAll(".reel-wrapper");
        reelElements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [displayReels]);

    if (isLoading && displayReels.length === 0) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4">
                <Loader2 className="size-12 animate-spin text-primary" />
                <p className="font-medium animate-pulse">Loading Reels...</p>
            </div>
        );
    }

    if (rawReels.length === 0 && !isLoading) {
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
            {displayReels.map((item, index) => (
                <div key={item._id} className="h-screen w-full snap-start reel-wrapper flex justify-center bg-black" data-index={index}>
                    {item.isAd ? (
                        <ReelAd isActive={index === activeIndex} />
                    ) : (
                        <ReelPost
                            post={item}
                            isActive={index === activeIndex}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export default ReelsPage;
