import { useRef, useEffect, memo } from "react";

/**
 * Optimized Video Player for Reels.
 * Handles auto-play/pause based on active state to save memory and battery.
 */
const ReelPlayer = memo(({ url, isActive, poster }) => {
    const videoRef = useRef(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            // Use play promise to handle browser autoplay restrictions gracefully
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {
                    // Autoplay likely blocked or interrupted
                    console.log("Autoplay prevented");
                });
            }
        } else {
            video.pause();
            // Reset time slightly to ensure clean frame when coming back
            // video.currentTime = 0; 
        }
    }, [isActive]);

    return (
        <video
            ref={videoRef}
            src={url}
            poster={poster}
            className="h-full w-full object-cover"
            loop
            playsInline
            preload="metadata" // High performance boost, only load small metadata first
            style={{ contain: "paint" }} // CSS containment for rendering boost
        />
    );
});

ReelPlayer.displayName = "ReelPlayer";

export default ReelPlayer;
