import React from "react";

export const ChatSkeleton = () => {
    return (
        <div className="flex flex-col animate-pulse px-4 py-5 gap-4">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-base-300 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <div className="h-4 bg-base-300 rounded w-1/3" />
                            <div className="h-2 bg-base-300 rounded w-1/12" />
                        </div>
                        <div className="h-3 bg-base-300 rounded w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const PostSkeleton = () => {
    return (
        <div className="animate-pulse space-y-6 max-w-2xl mx-auto w-full py-8 px-4">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-base-200/50 rounded-3xl p-5 border border-base-content/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-base-300 rounded-full" />
                        <div className="space-y-2">
                            <div className="h-4 bg-base-300 rounded w-32" />
                            <div className="h-3 bg-base-300 rounded w-20" />
                        </div>
                    </div>
                    <div className="h-48 bg-base-300 rounded-2xl w-full" />
                    <div className="space-y-2">
                        <div className="h-4 bg-base-300 rounded w-full" />
                        <div className="h-4 bg-base-300 rounded w-4/5" />
                    </div>
                    <div className="flex gap-4 pt-2">
                        <div className="h-8 bg-base-300 rounded-full w-20" />
                        <div className="h-8 bg-base-300 rounded-full w-20" />
                    </div>
                </div>
            ))}
        </div>
    );
};

export const GameSkeleton = () => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
                <div className="h-6 w-32 bg-base-300 animate-pulse rounded-lg" />
                <div className="h-10 w-64 bg-base-300 animate-pulse rounded-xl" />
                <div className="h-4 w-48 bg-base-300 animate-pulse rounded-lg" />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="card bg-base-300/50 h-52 animate-pulse rounded-2xl" />
                ))}
            </div>
        </div>
    );
};

export const MessageSkeleton = () => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {[...Array(6)].map((_, i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                        <div className="w-8 h-8 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
                        <div className="space-y-2">
                            <div className={`h-10 w-32 sm:w-48 bg-base-300 animate-pulse rounded-2xl ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"}`} />
                            <div className="h-2 w-12 bg-base-300 animate-pulse rounded mx-1" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const StorySkeleton = () => {
    return (
        <div className="flex gap-4 overflow-hidden">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 min-w-[72px]">
                    <div className="size-[66px] rounded-full bg-base-300 animate-pulse border-2 border-base-200" />
                    <div className="h-2.5 w-12 bg-base-300 animate-pulse rounded" />
                </div>
            ))}
        </div>
    );
};
