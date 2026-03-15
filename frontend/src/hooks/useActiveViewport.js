import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Professional viewport hook for vertical snapping feeds.
 * Detects which child element is currently active based on intersection thresholds.
 */
export const useActiveViewport = (containerRef, itemSelector = ".reel-wrapper") => {
    const [activeIndex, setActiveIndex] = useState(0);
    const observerRef = useRef(null);

    const initObserver = useCallback(() => {
        if (!containerRef.current) return;

        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        const observerOptions = {
            root: containerRef.current,
            threshold: 0.6, // Active when 60% of the reel is visible
        };

        const callback = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = parseInt(entry.target.getAttribute("data-index"));
                    if (!isNaN(index)) {
                        setActiveIndex(index);
                    }
                }
            });
        };

        observerRef.current = new IntersectionObserver(callback, observerOptions);
        
        // Target all children matching the selector
        const elements = containerRef.current.querySelectorAll(itemSelector);
        elements.forEach((el) => observerRef.current.observe(el));
    }, [containerRef, itemSelector]);

    // Re-initialize when children count might have changed
    useEffect(() => {
        initObserver();
        return () => {
            if (observerRef.current) observerRef.current.disconnect();
        };
    }, [initObserver]);

    return { activeIndex, setActiveIndex, reObserve: initObserver };
};
