import { useState, useMemo, useEffect, useRef } from "react";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";
import StoryTray from "../components/StoryTray";
import { PostSkeleton } from "../components/Skeletons";
import { useIntersection } from "../hooks/useIntersection"; // I'll create this or use vanilla

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
    <div className="px-2 py-3 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full min-h-[120vh]">
      <div className="mt-2 sm:mt-0">
        <StoryTray />
      </div>
      <div className="mt-5 mb-4 sm:mt-8 sm:mb-6 px-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content/90">Feed</h1>
      </div>
      <CreatePost onPost={addPost} authUser={authUser} />

      {isLoading && localPosts.length === 0 ? (
        <PostSkeleton />
      ) : (
        <>
          <PostsFeed posts={localPosts} setPosts={setLocalPosts} />

          {/* Infinite Scroll Trigger */}
          <div ref={loadMoreRef} className="py-10 flex justify-center">
            {isFetchingNextPage ? (
              <div className="flex flex-col items-center gap-2 opacity-60">
                <span className="loading loading-dots loading-md text-primary"></span>
                <p className="text-[10px] font-black uppercase tracking-widest">Gathering Moments...</p>
              </div>
            ) : hasNextPage ? (
              <div className="h-10" />
            ) : allPosts.length > 0 ? (
              <div className="divider opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">You're all caught up</div>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
};

export default PostsPage;
