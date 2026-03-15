import { memo } from "react";

// === REUSABLE SKELETON PRIMITIVES ===
// Extracted low-level structural blocks to standardize Tailwind metrics
// and reduce duplicate JSX bloating across the application.
const SkeletonAvatar = memo(({ className = "" }) => (
    <div className={`bg-base-300 rounded-full flex-shrink-0 ${className}`} />
));
SkeletonAvatar.displayName = "SkeletonAvatar";

const SkeletonBlock = memo(({ className = "" }) => (
    <div className={`bg-base-300 rounded ${className}`} />
));
SkeletonBlock.displayName = "SkeletonBlock";

// === STATIC ARRAY MEMORY OPTIMIZATION ===
// Defining loop arrays statically outside rendering closures halts
// instantaneous heap-reallocation arrays `[...Array(x)]` that burn CPU cycles
// continuously when skeleton components rapidly unmount/remount on feed network delays.
const ARRAY_3 = [1, 2, 3];
const ARRAY_4 = [1, 2, 3, 4];
const ARRAY_6 = [1, 2, 3, 4, 5, 6];
const ARRAY_8 = [1, 2, 3, 4, 5, 6, 7, 8];

// === CHAT LIST SKELETON ===
export const ChatSkeleton = memo(() => {
    return (
        // Optimization: apply `animate-pulse` strictly to the wrapper. 
        // This consolidates 24 individual CSS layer recalculations into 1 GPU composite layer.
        <div className="flex flex-col animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] px-4 py-5 gap-4 pointer-events-none select-none">
            {ARRAY_8.map((i) => (
                <div key={`chat-skel-${i}`} className="flex items-center gap-4">
                    <SkeletonAvatar className="w-14 h-14" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <SkeletonBlock className="h-4 w-1/3" />
                            <SkeletonBlock className="h-2 w-1/12" />
                        </div>
                        <SkeletonBlock className="h-3 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
});
ChatSkeleton.displayName = "ChatSkeleton";

// === POST FEED SKELETON ===
export const PostSkeleton = memo(() => {
    return (
        <div className="animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite] space-y-6 max-w-2xl mx-auto w-full py-8 px-4 pointer-events-none select-none">
            {ARRAY_3.map((i) => (
                <div key={`post-skel-${i}`} className="bg-base-200/50 rounded-3xl p-5 border border-base-content/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <SkeletonAvatar className="w-12 h-12" />
                        <div className="space-y-2">
                            <SkeletonBlock className="h-4 w-32" />
                            <SkeletonBlock className="h-3 w-20" />
                        </div>
                    </div>
                    {/* Image/Media block layout matching */}
                    <SkeletonBlock className="h-48 rounded-2xl w-full" />
                    <div className="space-y-2">
                        <SkeletonBlock className="h-4 w-full" />
                        <SkeletonBlock className="h-4 w-4/5" />
                    </div>
                    {/* Action buttons matching */}
                    <div className="flex gap-4 pt-2">
                        <SkeletonBlock className="h-8 rounded-full w-20" />
                        <SkeletonBlock className="h-8 rounded-full w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
});
PostSkeleton.displayName = "PostSkeleton";

// === GAMES SKELETON ===
export const GameSkeleton = memo(() => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 pointer-events-none select-none animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            <div className="space-y-4">
                <SkeletonBlock className="h-6 w-32 rounded-lg" />
                <SkeletonBlock className="h-10 w-64 rounded-xl" />
                <SkeletonBlock className="h-4 w-48 rounded-lg" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {ARRAY_4.map((i) => (
                    <div key={`game-skel-${i}`} className="card bg-base-300/50 h-52 rounded-2xl" />
                ))}
            </div>
        </div>
    );
});
GameSkeleton.displayName = "GameSkeleton";

// === CHAT MESSAGE BUBBLE SKELETON ===
export const MessageSkeleton = memo(() => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6 pointer-events-none select-none animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            {ARRAY_6.map((i) => {
                const isLeft = i % 2 !== 0;
                return (
                    <div key={`msg-skel-${i}`} className={`flex ${isLeft ? "justify-start" : "justify-end"}`}>
                        <div className={`flex gap-3 max-w-[70%] ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                            <SkeletonAvatar className="w-8 h-8" />
                            <div className="space-y-2 flex flex-col items-stretch">
                                {/* Bubble shape matching dynamic layout */}
                                <SkeletonBlock 
                                    className={`h-10 w-32 sm:w-48 rounded-2xl ${isLeft ? "rounded-tl-none" : "rounded-tr-none"}`} 
                                />
                                <SkeletonBlock 
                                    className={`h-2 w-12 rounded ${isLeft ? "self-start ml-1" : "self-end mr-1"}`} 
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
});
MessageSkeleton.displayName = "MessageSkeleton";

// === IM INSTAGRAM STORY CAROUSEL SKELETON ===
export const StorySkeleton = memo(() => {
    return (
        <div className="flex gap-4 overflow-hidden pointer-events-none select-none animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            {ARRAY_6.map((i) => (
                <div key={`story-skel-${i}`} className="flex flex-col items-center gap-2 min-w-[72px]">
                    <div className="size-[66px] rounded-full bg-base-300 border-2 border-base-200" />
                    <SkeletonBlock className="h-2.5 w-12" />
                </div>
            ))}
        </div>
    );
});
StorySkeleton.displayName = "StorySkeleton";
