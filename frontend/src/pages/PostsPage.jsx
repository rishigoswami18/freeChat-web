import { useMemo, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";
import { motion } from "framer-motion";
import { Loader2, Sparkles, Inbox } from "lucide-react";

// Hooks
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

// Components
import FeedStories from "../components/feed/FeedStories";
import FeedCreatePost from "../components/feed/FeedCreatePost";
import FeedPostsList from "../components/feed/FeedPostsList";
import { PostSkeleton } from "../components/Skeletons";

const PostsPage = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id;

  // 1. Fetch friend list for feed filtering
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(),
    staleTime: 1000 * 60 * 10,
    enabled: !!authUserId,
  });

  const friendIdsString = useMemo(() => friends.map((f) => f._id).join(","), [friends]);

  // 2. Optimized Infinite Feed Query (Corrected Object Parameters)
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError
  } = useInfiniteQuery({
    queryKey: ["posts", authUserId], 
    queryFn: ({ pageParam }) => getPosts({
        userId: authUserId,
        friends: friendIdsString,
        lastId: pageParam,
        limit: 10
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authUserId,
    staleTime: 1000 * 60 * 3,
  });

  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) || [],
    [data]
  );

  const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  return (
    <div className="space-y-10">
      {/* Stories Node */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-6 shadow-2xl">
        <div className="flex items-center gap-3 mb-6 px-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Live Streams</span>
            <div className="h-px flex-1 bg-white/5" />
        </div>
        <FeedStories />
      </section>
      
      {/* Compose Node */}
      <section className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
        <FeedCreatePost authUser={authUser} />
      </section>

      {/* Primary Content Loop */}
      <section className="space-y-8" aria-live="polite">
        <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black italic tracking-tighter uppercase flex items-center gap-3">
                Nexus Feed <Sparkles size={18} className="text-primary animate-pulse" />
            </h2>
        </div>

        {isLoading && allPosts.length === 0 ? (
          <div className="space-y-8">
            {[1, 2].map(i => (
                <div key={i} className="h-80 bg-white/5 animate-pulse rounded-[3rem] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                </div>
            ))}
          </div>
        ) : isError ? (
            <div className="bg-rose-500/5 border border-rose-500/10 rounded-[3rem] p-12 text-center space-y-4">
                <p className="text-xs font-black uppercase tracking-widest text-rose-500/60">Feed Handshake Failed</p>
                <p className="text-[10px] text-white/20 uppercase tracking-widest">The Nexus content stream is currently unreachable.</p>
            </div>
        ) : allPosts.length > 0 ? (
          <>
            <FeedPostsList posts={allPosts} />

            {/* Pagination Sentinel */}
            <div ref={observerTarget} className="flex flex-col items-center justify-center py-12 gap-6">
                {isFetchingNextPage ? (
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary animate-pulse">
                        <Loader2 className="size-4 animate-spin" />
                        Downloading More Signal...
                    </div>
                ) : hasNextPage ? (
                    <div className="h-16" />
                ) : (
                    <div className="flex flex-col items-center gap-4">
                        <div className="h-px w-24 bg-white/10" />
                        <div className="px-6 py-3 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 italic">
                            Core Node Reached
                        </div>
                    </div>
                )}
            </div>
          </>
        ) : (
            <div className="py-32 text-center space-y-6 opacity-30">
                <div className="size-20 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto">
                    <Inbox size={32} strokeWidth={1} />
                </div>
                <div className="space-y-2">
                    <p className="font-black italic text-xl uppercase tracking-tighter">Zero Connection</p>
                    <p className="text-[10px] font-black uppercase tracking-widest">Broadcasting silence... Connect with more users.</p>
                </div>
            </div>
        )}
      </section>
    </div>
  );
};

export default PostsPage;
