import { useState, useMemo, useEffect, useRef } from "react";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";
import StoryTray from "../components/StoryTray";
import { PostSkeleton } from "../components/Skeletons";
import { useIntersection } from "../hooks/useIntersection";

const PostsPage = () => {
  const { authUser } = useAuthUser();
  const loadMoreRef = useRef(null);

  // Fetch friend list with caching
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 5,
  });

  const friendIds = useMemo(() => friends.map((f) => f._id), [friends]);

  // Professional Infinite Scroll Query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ["posts", authUser?._id, friendIds],
    queryFn: ({ pageParam }) => getPosts(authUser._id, friendIds, pageParam, 10),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authUser?._id,
    staleTime: 1000 * 60 * 2, // 2 mins cache
  });

  // Flatten pages into one array
  const allPosts = useMemo(() => data?.pages.flatMap((page) => page.posts) || [], [data]);

  // Local state for optimistic updates
  const [localPosts, setLocalPosts] = useState([]);

  useEffect(() => {
    if (allPosts.length > 0) {
      setLocalPosts(allPosts);
    }
  }, [allPosts]);

  // Setup Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const addPost = (post) => setLocalPosts((prev) => [post, ...prev]);

  return (
    <div className="px-2 py-4 sm:p-6 lg:p-10 max-w-4xl mx-auto w-full min-h-[120vh]">
      <div className="mb-6 lg:mb-10 w-full overflow-hidden">
        <StoryTray />
      </div>
      
      <div className="flex items-center justify-between mb-8 px-2">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-base-content relative inline-block">
          Feed
          <span className="absolute -bottom-2 left-0 w-1/3 h-1.5 bg-gradient-to-r from-primary to-transparent rounded-full"></span>
        </h1>
      </div>
      
      <div className="glass-panel-flat p-4 sm:p-6 rounded-[28px] mb-8 shadow-sm border border-base-content/5">
        <CreatePost onPost={addPost} authUser={authUser} />
      </div>

      <div className="space-y-6">
        {isLoading && localPosts.length === 0 ? (
          <>
            <PostSkeleton />
            <PostSkeleton />
          </>
        ) : (
          <>
            <PostsFeed posts={localPosts} setPosts={setLocalPosts} />

            {/* Infinite Scroll Trigger */}
            <div ref={loadMoreRef} className="py-12 flex justify-center">
              {isFetchingNextPage ? (
                <div className="flex flex-col items-center gap-3 opacity-70">
                  <span className="loading loading-spinner text-primary loading-lg"></span>
                  <p className="text-xs font-bold uppercase tracking-[0.2em]">Loading More...</p>
                </div>
              ) : hasNextPage ? (
                <div className="h-10" />
              ) : allPosts.length > 0 ? (
                <div className="flex items-center gap-4 w-full max-w-xs opacity-30 mt-8">
                  <div className="h-[1px] flex-1 bg-base-content"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Caught Up</span>
                  <div className="h-[1px] flex-1 bg-base-content"></div>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostsPage;
