import { useEffect, useRef, useMemo, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getVideoPosts } from "../lib/api";

// Hooks
import useAuthUser from "../hooks/useAuthUser";
import { useActiveViewport } from "../hooks/useActiveViewport";

// Components
import ReelsContainer from "../components/reels/ReelsContainer";
import ReelsViewport from "../components/reels/ReelsViewport";
import ReelsLoader from "../components/reels/ReelsLoader";
import ReelsEndScreen from "../components/reels/ReelsEndScreen";

// Utils
import { injectAds } from "../lib/feed/injectAds";

const ReelsPage = () => {
    const containerRef = useRef(null);
    const { authUser } = useAuthUser();

    // 1. Scalable Infinite Query
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        // Stable key for specific feed type
        queryKey: ["reels", authUser?._id],
        queryFn: ({ pageParam }) => getVideoPosts(pageParam, 10),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        staleTime: 1000 * 60 * 5, // 5 min cache
        cacheTime: 1000 * 60 * 15,
    });

    // 2. Specialized Ad Injection & Transformation
    const displayReels = useMemo(() => {
        const rawReels = data?.pages.flatMap(p => p.posts) || [];
        const isPremium = authUser?.role === "admin" || authUser?.isPremium;
        
        return injectAds(rawReels, { 
            interval: 4, 
            isPremium 
        });
    }, [data, authUser]);

    // 3. High Performance Viewport Tracking
    // Detects active reel even during high-velocity snapping
    const { activeIndex, setActiveIndex, reObserve } = useActiveViewport(containerRef);

    // Re-observe when new data chunks arrive
    useEffect(() => {
        reObserve();
    }, [displayReels.length, reObserve]);

    // 4. PREDICTIVE PRE-FETCHING (Threshold based)
    useEffect(() => {
        const FETCH_THRESHOLD = 4; // Fetch 4 reels before hitting bottom
        if (
            displayReels.length > 0 && 
            activeIndex >= displayReels.length - FETCH_THRESHOLD && 
            hasNextPage && 
            !isFetchingNextPage
        ) {
            fetchNextPage();
        }
    }, [activeIndex, displayReels.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // Handlers
    const handleRestart = useCallback(() => {
        containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        setActiveIndex(0);
    }, [setActiveIndex]);

    // Render Pipeline
    if (isLoading && displayReels.length === 0) {
        return <ReelsLoader />;
    }

    if (displayReels.length === 0 && !isLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-6 text-center gap-6">
                <div className="size-24 bg-white/10 rounded-full flex items-center justify-center luxe-shadow-pink">
                    <span className="text-4xl text-white/20">🎬</span>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold italic uppercase tracking-tighter">No Reels Found</h2>
                    <p className="text-white/40 max-w-xs text-sm">Follow more creators to fill your feed with magic!</p>
                </div>
            </div>
        );
    }

    return (
        <ReelsContainer ref={containerRef}>
            <ReelsViewport 
                reels={displayReels} 
                activeIndex={activeIndex} 
            />

            {/* Pagination & Feedback Layer */}
            {isFetchingNextPage ? (
                <div className="h-screen w-full flex flex-col items-center justify-center bg-black gap-4 snap-start">
                    <div className="size-12 border-4 border-primary/10 border-t-primary rounded-full animate-spin luxe-shadow-pink" />
                    <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.3em]">Synching with Universe...</p>
                </div>
            ) : !hasNextPage && displayReels.length > 0 && (
                <ReelsEndScreen onRestart={handleRestart} />
            )}
        </ReelsContainer>
    );
};

export default ReelsPage;
