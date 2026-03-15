import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (fetchNextPage, hasNextPage, isFetchingNextPage) => {
    const observerTarget = useRef(null);

    const handleObserver = useCallback(
        (entries) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [fetchNextPage, hasNextPage, isFetchingNextPage]
    );

    useEffect(() => {
        const element = observerTarget.current;
        if (!element) return;

        const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
        observer.observe(element);

        return () => observer.disconnect();
    }, [handleObserver]);

    return { observerTarget };
};
