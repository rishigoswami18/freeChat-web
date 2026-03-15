import React, { memo } from "react";

/**
 * BackgroundEffects
 * Provides a premium, low-overhead ambient background.
 * Optimized with memo to prevent unnecessary re-renders when parent state changes.
 */
const BackgroundEffects = memo(() => {
    return (
        <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none select-none">
            {/* Subtle primary glow (Top Left) */}
            <div className="absolute top-[-15%] left-[-15%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] animate-pulse max-w-[800px]" />
            
            {/* Subtle secondary glow (Bottom Right) */}
            <div className="absolute bottom-[-15%] right-[-15%] w-[60%] h-[60%] bg-secondary/10 rounded-full blur-[120px] animate-pulse max-w-[800px] delay-1000" />
            
            {/* Optional: Add a very subtle noise texture or grid if requested later */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
    );
});

export default BackgroundEffects;
