import { forwardRef } from "react";

/**
 * GPU-Accelerated snap-scroll container for Reels.
 * Uses will-change and containment for smooth 60fps scrolling.
 */
const ReelsContainer = forwardRef(({ children }, ref) => {
    return (
        <div
            ref={ref}
            className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide no-scrollbar relative"
            style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                willChange: "transform", // GPU acceleration boost
                contain: "strict" // Isolation for layout and paint
            }}
        >
            {children}
        </div>
    );
});

ReelsContainer.displayName = "ReelsContainer";

export default ReelsContainer;
