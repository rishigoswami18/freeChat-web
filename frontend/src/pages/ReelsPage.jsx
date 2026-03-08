import { useState, useEffect, useRef, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getVideoPosts } from "../lib/api";
import ReelPost from "../components/ReelPost";
import ReelAd from "../components/ReelAd";
import { Loader2, Film } from "lucide-react";
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

    // Flatten and inject ads
    const displayReels = useMemo(() => {
        const reels = data?.pages.flatMap(p => p.posts) || [];
        if (!reels.length) return [];

        const isPremium = authUser?.role === "admin" || authUser?.isPremium; // Check premium status
        const AD_INTERVAL = 4;
        const result = [];

        reels.forEach((reel, index) => {
            result.push({ ...reel, dataIndex: result.length }); // Real video
            if (!isPremium && (index + 1) % AD_INTERVAL === 0) {
                result.push({ _id: `ad-${index}-${Math.random()}`, isAd: true, dataIndex: result.length });
            }
        });

        return result;
    }, [data, authUser]);

    // Handle Infinite Scroll triggers based on current index
    useEffect(() => {
        if (displayReels.length > 0 && activeIndex >= displayReels.length - 2 && hasNextPage && !isFetchingNextPage) {
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
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide no-scrollbar"
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

            {isFetchingNextPage && (
                <div className="h-20 flex items-center justify-center bg-black pb-10">
                    <span className="loading loading-spinner text-primary"></span>
                </div>
            )}
        </div>
    );
};

export default ReelsPage;
