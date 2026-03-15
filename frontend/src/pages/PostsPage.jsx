import { useMemo, useCallback } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";

// Hooks
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

// Components
import FeedLayout from "../components/feed/FeedLayout";
import FeedStories from "../components/feed/FeedStories";
import FeedCreatePost from "../components/feed/FeedCreatePost";
import FeedPostsList from "../components/feed/FeedPostsList";
import FeedEndIndicator from "../components/feed/FeedEndIndicator";
import { PostSkeleton } from "../components/Skeletons";

const PostsPage = () => {
  const { authUser } = useAuthUser();
  const authUserId = authUser?._id;

  // 1. Fetch friend list for feed filtering (Safe cache bounds)
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 10, // 10 mins cache for social graph
    enabled: !!authUserId,
  });

  // Stable IDs array to prevent unnecessary query key shifts
  const friendIds = useMemo(() => friends.map((f) => f._id).sort(), [friends]);

  // 2. Optimized Infinite Feed Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    // Stable query key ensures we don't drop feed position on small friend list updates
    queryKey: ["posts", authUserId], 
    queryFn: ({ pageParam }) => getPosts(authUserId, friendIds, pageParam, 10),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authUserId,
    staleTime: 1000 * 60 * 3, // 3 mins staletime for main feed
    cacheTime: 1000 * 60 * 15,
  });

  // Flattened posts for rendering
  const allPosts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) || [],
    [data]
  );

  // 3. Attach Professional Observer
  const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  return (
    <FeedLayout authUser={authUser}>
      <FeedStories />
      
      <FeedCreatePost authUser={authUser} />

      <section className="space-y-6" aria-live="polite">
        {isLoading && allPosts.length === 0 ? (
          <div className="space-y-6">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : (
          <>
            <FeedPostsList posts={allPosts} />

            {/* Pagination Sentinel */}
            <div ref={observerTarget} className="w-full">
              <FeedEndIndicator 
                isFetchingNextPage={isFetchingNextPage} 
                hasNextPage={hasNextPage} 
                hasPosts={allPosts.length > 0} 
              />
            </div>
          </>
        )}
      </section>
    </FeedLayout>
  );
};

export default PostsPage;
