import { memo } from "react";

const FeedEndIndicator = memo(({ isFetchingNextPage, hasNextPage, hasPosts }) => {
  if (isFetchingNextPage) {
    return (
      <div className="py-12 flex justify-center w-full" aria-live="polite">
        <div className="flex flex-col items-center gap-3 opacity-70">
          <span className="loading loading-spinner text-primary loading-lg"></span>
          <p className="text-xs font-black uppercase tracking-[0.2em]">Synching Data...</p>
        </div>
      </div>
    );
  }

  if (!hasNextPage && hasPosts) {
    return (
      <div className="py-12 flex justify-center w-full">
        <div className="flex items-center gap-4 w-full max-w-xs opacity-30">
          <div className="h-[1px] flex-1 bg-base-content" aria-hidden="true"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] whitespace-nowrap">End of Feed</span>
          <div className="h-[1px] flex-1 bg-base-content" aria-hidden="true"></div>
        </div>
      </div>
    );
  }

  return <div className="h-10 invisible" />;
});

FeedEndIndicator.displayName = "FeedEndIndicator";

export default FeedEndIndicator;
