import { memo, useMemo } from "react";

/**
 * HeartParticles
 * Floating hearts background isolated so it never triggers layout reflows on parent 
 */
export const HeartParticles = memo(() => {
    // Math.random calls are memoized so they don't stutter during unrelated page typing
    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 20}s`,
            duration: `${15 + Math.random() * 20}s`,
            size: `${10 + Math.random() * 20}px`
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="heart-particle opacity-0"
                    style={{
                        left: p.left,
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        fontSize: p.size
                    }}
                >
                    ❤️
                </div>
            ))}
        </div>
    );
});

HeartParticles.displayName = "HeartParticles";

export default HeartParticles;
