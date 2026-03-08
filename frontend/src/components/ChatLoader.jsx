import { MessageSkeleton } from "./Skeletons";

function ChatLoader() {
  return (
    <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
      {/* Spoof Header */}
      <div className="flex-shrink-0 p-4 border-b border-base-300 flex items-center gap-3 bg-base-100/50 backdrop-blur-md">
        <div className="w-10 h-10 rounded-full bg-base-300 animate-pulse" />
        <div className="space-y-1.5 flex-1">
          <div className="h-4 w-32 bg-base-300 animate-pulse rounded" />
          <div className="h-2 w-20 bg-base-300 animate-pulse rounded" />
        </div>
        <div className="flex gap-2">
          <div className="w-8 h-8 rounded-full bg-base-300 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-base-300 animate-pulse" />
        </div>
      </div>

      <MessageSkeleton />

      {/* Spoof Input Area */}
      <div className="flex-shrink-0 p-3 sm:p-4 border-t border-base-300 bg-base-100/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
          <div className="flex-1 h-12 bg-base-200 rounded-3xl animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-base-300 animate-pulse flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}

export default ChatLoader;