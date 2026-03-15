import { memo } from "react";
import ReelPost from "../ReelPost";
import ReelAd from "../ReelAd";

/**
 * Viewport Virtualizer.
 * Only mounts components within a window of +/- 3 from active focus.
 * This prevents DOM bloat and ensures memory is released for distant videos.
 */
const ReelsViewport = memo(({ reels, activeIndex }) => {
    // Window size (how many reels to keep mounted around the active one)
    const WINDOW_SIZE = 3;

    return (
        <>
            {reels.map((item, index) => {
                // Virtualization Logic: Check if index is in the visible window
                const isWithinWindow = Math.abs(index - activeIndex) <= WINDOW_SIZE;

                return (
                    <div
                        key={item._id}
                        className="h-screen w-full snap-start reel-wrapper flex justify-center bg-black relative"
                        data-index={index}
                        style={{ contain: "layout size" }}
                    >
                        {isWithinWindow ? (
                            item.isAd ? (
                                <ReelAd isActive={index === activeIndex} />
                            ) : (
                                <ReelPost
                                    post={item}
                                    isActive={index === activeIndex}
                                />
                            )
                        ) : (
                            // Placeholder to maintain physical layout flow while unmounted
                            <div className="w-full h-full bg-black/20 animate-pulse flex items-center justify-center">
                                <span className="text-white/5 text-[10px] font-black uppercase tracking-widest">Optimizing...</span>
                            </div>
                        )}
                    </div>
                );
            })}
        </>
    );
});

ReelsViewport.displayName = "ReelsViewport";

export default ReelsViewport;
