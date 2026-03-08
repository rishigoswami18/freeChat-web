import { useEffect, useRef, useState } from "react";

/**
 * useIntersection - A professional hook for infinite scrolling and lazy loading.
 * @param {Object} options - IntersectionObserver options (root, rootMargin, threshold)
 * @returns {[RefObject, boolean]} - [the ref to observe, isIntersecting state]
 */
export const useIntersection = (options = { threshold: 0.1, rootMargin: "0px" }) => {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const elementRef = useRef(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);
        return () => observer.unobserve(element);
    }, [options.threshold, options.rootMargin, options.root]);

    return [elementRef, isIntersecting];
};
