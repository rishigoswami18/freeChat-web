import { memo } from "react";

// === PERFORMANCE OPTIMIZATION: Memoized Skeleton Boundaries ===
// Static structural trees are separated into memoized sub-components. 
// This prevents React from recursively parsing these dense DOM elements 
// if the parent container re-renders during routing transitions.

const HeaderSkeleton = memo(() => (
  <div className="flex-shrink-0 p-4 border-b border-white/5 flex items-center gap-3 bg-[#0a0a0a]/80 backdrop-blur-md">
    <div className="w-10 h-10 rounded-full bg-[#262626]" />
    <div className="space-y-2 flex-1">
      <div className="h-4 w-32 bg-[#262626] rounded-md" />
      <div className="h-2 w-20 bg-[#262626] rounded-md" />
    </div>
    <div className="flex gap-2">
      <div className="w-8 h-8 rounded-full bg-[#262626]" />
      <div className="w-8 h-8 rounded-full bg-[#262626]" />
    </div>
  </div>
));

HeaderSkeleton.displayName = "HeaderSkeleton";

const MessageListSkeleton = memo(() => (
  <div className="flex-1 overflow-y-auto p-4 space-y-6">
    {[...Array(6)].map((_, i) => {
      const isEven = i % 2 === 0;
      return (
        <div key={i} className={`flex ${isEven ? "justify-start" : "justify-end"}`}>
          <div className={`flex gap-3 max-w-[70%] ${isEven ? "flex-row" : "flex-row-reverse"}`}>
            <div className="w-8 h-8 rounded-full bg-[#262626] flex-shrink-0" />
            <div className={`space-y-2 flex flex-col ${isEven ? 'items-start' : 'items-end'}`}>
              <div className={`h-11 w-32 sm:w-48 bg-[#262626] rounded-2xl ${isEven ? "rounded-tl-none" : "rounded-tr-none"}`} />
              <div className="h-2 w-12 bg-[#262626] rounded mx-1" />
            </div>
          </div>
        </div>
      );
    })}
  </div>
));

MessageListSkeleton.displayName = "MessageListSkeleton";

const InputSkeleton = memo(() => (
  <div className="flex-shrink-0 p-3 sm:p-4 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
    <div className="max-w-4xl mx-auto flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-[#262626] flex-shrink-0" />
      <div className="flex-1 h-[44px] bg-[#262626] rounded-[26px]" />
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#262626] flex-shrink-0" />
        <div className="w-10 h-10 rounded-full bg-[#262626] flex-shrink-0" />
      </div>
    </div>
  </div>
));

InputSkeleton.displayName = "InputSkeleton";

// === MAIN LOADER COMPONENT ===
// Animation Optimization: By applying `animate-pulse` strictly to the top-level container,
// we prevent the browser GPU from having to track and animate 30+ independent DOM nodes. 
const ChatLoader = memo(() => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black overflow-hidden animate-pulse">
      <HeaderSkeleton />
      <MessageListSkeleton />
      <InputSkeleton />
    </div>
  );
});

ChatLoader.displayName = "ChatLoader";
export default ChatLoader;