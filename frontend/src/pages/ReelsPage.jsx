import { useState, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getVideoPosts } from "../lib/api";
import ReelPost from "../components/ReelPost";
import ReelAd from "../components/ReelAd";
import { Loader2, Film, RotateCcw } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const ReelsPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef(null);
    const { authUser } = useAuthUser();

    // Professional Infinite Scroll for Reels
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["reels"],
        queryFn: ({ pageParam }) => getVideoPosts(pageParam, 8),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        staleTime: 1000 * 60 * 5,
    });

    // Flatten reels and inject ads with STABLE keys
    const displayReels = useMemo(() => {
        const reels = data?.pages.flatMap(p => p.posts) || [];
        if (!reels.length) return [];

        const isPremium = authUser?.role === "admin" || authUser?.isPremium;
        const AD_INTERVAL = 4;
        const result = [];

        reels.forEach((reel, index) => {
            // Use real ID for video posts, stable synthetic ID for ads
            result.push({ ...reel, dataIndex: result.length });
            if (!isPremium && (index + 1) % AD_INTERVAL === 0) {
                result.push({
                    _id: `ad-after-${reel._id}`,
                    isAd: true,
                    dataIndex: result.length
                });
            }
        });

        return result;
    }, [data, authUser]);

    // PREDICTIVE PRE-FETCHING: Fetch even earlier for a seamless feel
    useEffect(() => {
        const threshold = displayReels.length - 3; // Trigger 3 reels before the end
        if (displayReels.length > 0 && activeIndex >= threshold && hasNextPage && !isFetchingNextPage) {
            console.log("🚀 Predictive pre-fetch triggered!");
            fetchNextPage();
        }
    }, [activeIndex, displayReels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
                <div className="relative">
                    <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <Film className="size-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="font-black text-xs uppercase tracking-[0.2em] animate-pulse">Initializing Feed...</p>
            </div>
        );
    }

    if (displayReels.length === 0 && !isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center gap-6">
                <div className="size-24 bg-white/10 rounded-full flex items-center justify-center">
                    <Film className="size-12 text-white/40" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold italic uppercase tracking-tighter">No Reels Yet</h2>
                    <p className="text-white/40 max-w-xs text-sm">Be the pioneer who starts the trend. Share your first video now!</p>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide no-scrollbar relative"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {displayReels.map((item, index) => (
                <div
                    key={item._id}
                    className="h-screen w-full snap-start reel-wrapper flex justify-center bg-black relative"
                    data-index={index}
                >
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

            {isFetchingNextPage ? (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4">
                    <div className="size-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Summoning More Magic...</p>
                </div>
            ) : !hasNextPage && displayReels.length > 0 && (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-10 text-center gap-6">
                    <div className="size-20 bg-white/5 rounded-full flex items-center justify-center luxe-shadow-pink">
                        <Film className="size-10 text-pink-500" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase tracking-tighter romantic-gradient-text">The End of the Feed</h3>
                        <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2">You've reached the horizon. Watch again or explore more!</p>
                    </div>
                    <button
                        onClick={() => {
                            containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                            setActiveIndex(0);
                        }}
                        className="btn btn-primary btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-3 border-none romantic-gradient-bg text-white font-black uppercase tracking-[0.2em]"
                    >
                        <RotateCcw className="size-5" />
                        Watch From Top
                    </button>
                </div>
            )}
        </div>
    );
};

export default ReelsPage;
