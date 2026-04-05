import React from "react";
import { motion } from "framer-motion";

const Shimmer = () => (
    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
);

export const PostSkeleton = () => (
    <div className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden mb-8 p-6 space-y-6 relative">
        <Shimmer />
        <div className="flex items-center gap-4">
            <div className="size-12 rounded-2xl bg-white/5" />
            <div className="space-y-2 flex-1">
                <div className="w-32 h-4 bg-white/10 rounded-full" />
                <div className="w-24 h-2 bg-white/5 rounded-full" />
            </div>
        </div>
        <div className="aspect-square w-full bg-white/5 rounded-[2rem]" />
        <div className="flex justify-between items-center px-2">
            <div className="flex gap-4">
                <div className="w-16 h-8 bg-white/5 rounded-xl" />
                <div className="w-16 h-8 bg-white/5 rounded-xl" />
            </div>
            <div className="w-8 h-8 bg-white/5 rounded-xl" />
        </div>
    </div>
);

export const ProfileSkeleton = () => (
    <div className="space-y-8 animate-pulse p-8">
        <div className="relative h-[300px] w-full rounded-[3rem] bg-white/5 overflow-hidden">
            <Shimmer />
        </div>
        <div className="flex flex-col items-center -mt-20 relative z-10 space-y-4">
            <div className="size-32 rounded-[2.5rem] bg-white/10 border-4 border-[#020617]" />
            <div className="w-48 h-6 bg-white/10 rounded-full" />
            <div className="w-32 h-4 bg-white/5 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-40 bg-white/5 rounded-[2rem]" />
            <div className="h-40 bg-white/5 rounded-[2rem]" />
        </div>
    </div>
);

export const StorySkeleton = () => (
    <div className="flex gap-5 px-2 overflow-hidden">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                <div className="size-[72px] rounded-full bg-white/5 border border-white/10 p-1">
                    <div className="size-full rounded-full bg-white/5" />
                </div>
                <div className="w-12 h-2 bg-white/5 rounded-full" />
            </div>
        ))}
    </div>
);

export const BusinessCardSkeleton = () => (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between relative overflow-hidden">
        <Shimmer />
        <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl bg-white/5" />
            <div className="space-y-2">
                <div className="w-24 h-3 bg-white/10 rounded-full" />
                <div className="w-16 h-2 bg-white/5 rounded-full" />
            </div>
        </div>
        <div className="size-8 rounded-lg bg-white/5" />
    </div>
);

export const WidgetSkeleton = () => (
    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 relative overflow-hidden">
        <Shimmer />
        <div className="space-y-2">
            <div className="w-20 h-2 bg-white/5 rounded-full" />
            <div className="w-32 h-8 bg-white/10 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
            <div className="h-14 bg-white/5 rounded-2xl" />
            <div className="h-14 bg-white/5 rounded-2xl" />
        </div>
        <div className="h-12 w-full bg-white/10 rounded-2xl" />
    </div>
);

export const ChatSkeleton = () => (
    <div className="flex flex-col gap-4 p-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="flex items-center gap-4 relative overflow-hidden p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <Shimmer />
                <div className="size-14 rounded-2xl bg-white/5" />
                <div className="flex-1 space-y-3">
                    <div className="flex justify-between items-center">
                        <div className="w-32 h-4 bg-white/10 rounded-full" />
                        <div className="w-12 h-2 bg-white/5 rounded-full" />
                    </div>
                    <div className="w-48 h-2 bg-white/5 rounded-full" />
                </div>
            </div>
        ))}
        ))}
    </div>
);

export const GameSkeleton = () => (
    <div className="space-y-6 p-4">
        <div className="h-48 bg-white/[0.02] border border-white/5 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shimmer_2s_infinite]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
             <div className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl" />
             <div className="h-24 bg-white/[0.02] border border-white/5 rounded-2xl" />
        </div>
    </div>
);
