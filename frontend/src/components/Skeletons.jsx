import React from "react";

export const HeroSkeleton = () => (
  <div className="relative w-full h-64 md:h-80 rounded-[40px] bg-white/5 border border-white/10 animate-pulse overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
    <div className="p-10 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <div className="space-y-3">
          <div className="w-24 h-6 bg-white/10 rounded-full" />
          <div className="w-48 h-4 bg-white/5 rounded-full" />
        </div>
        <div className="w-20 h-4 bg-white/5 rounded-full" />
      </div>
      <div className="space-y-4">
        <div className="w-3/4 h-16 bg-white/10 rounded-2xl" />
        <div className="w-1/2 h-6 bg-white/5 rounded-full" />
      </div>
    </div>
  </div>
);

export const PulseSkeleton = () => (
  <div className="bg-white/5 border border-white/10 p-8 rounded-[3rem] h-full animate-pulse">
    <div className="flex justify-between items-center mb-10">
      <div className="w-32 h-6 bg-white/10 rounded-full" />
      <div className="w-24 h-6 bg-white/5 rounded-full" />
    </div>
    <div className="space-y-12">
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-white/10" />
        <div className="flex-1 h-3 bg-white/5 rounded-full" />
        <div className="w-8 h-4 bg-white/10" />
      </div>
      <div className="flex items-center gap-4">
        <div className="size-10 rounded-xl bg-white/10" />
        <div className="flex-1 h-3 bg-white/5 rounded-full" />
        <div className="w-8 h-4 bg-white/10" />
      </div>
    </div>
  </div>
);

export const MatchListSkeleton = () => (
  <div className="space-y-4">
    <div className="w-40 h-6 bg-white/10 rounded-full mb-6" />
    {[1, 2, 3].map((i) => (
      <div key={i} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="size-12 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <div className="w-32 h-4 bg-white/10 rounded-full" />
            <div className="w-24 h-3 bg-white/5 rounded-full" />
          </div>
        </div>
        <div className="size-5 bg-white/5 rounded-full" />
      </div>
    ))}
  </div>
);

export const PostSkeleton = () => (
  <div className="bg-white/5 border border-white/5 rounded-[32px] p-6 animate-pulse space-y-6">
    <div className="flex items-center gap-4">
      <div className="size-12 rounded-2xl bg-white/10" />
      <div className="space-y-2 flex-1">
        <div className="w-32 h-4 bg-white/10 rounded-full" />
        <div className="w-24 h-3 bg-white/5 rounded-full" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="w-full h-40 bg-white/5 rounded-[24px]" />
      <div className="w-3/4 h-4 bg-white/5 rounded-full" />
    </div>
  </div>
);

export const ChatSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-center gap-4 px-4 py-3 animate-pulse">
        <div className="size-14 rounded-full bg-white/10" />
        <div className="flex-1 space-y-3">
          <div className="w-32 h-4 bg-white/10 rounded-full" />
          <div className="w-3/4 h-3 bg-white/5 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const StorySkeleton = () => (
    <div className="flex gap-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
                <div className="size-[66px] rounded-full bg-white/10 p-[3px]">
                    <div className="size-full rounded-full bg-white/5 border-[2.5px] border-black/20" />
                </div>
                <div className="w-12 h-3 bg-white/5 rounded-full" />
            </div>
        ))}
    </div>
);

export const GameSkeleton = () => (
  <div className="min-h-screen bg-[#060606] p-10 space-y-12 animate-pulse">
    <div className="space-y-4">
      <div className="w-32 h-8 bg-white/5 rounded-2xl" />
      <div className="w-64 h-12 bg-white/10 rounded-3xl" />
      <div className="w-48 h-4 bg-white/5 rounded-full" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="h-64 bg-white/5 rounded-[40px]" />
      <div className="h-64 bg-white/5 rounded-[40px]" />
    </div>
  </div>
);
