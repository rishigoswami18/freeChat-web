import { useState, useMemo, useEffect } from "react";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";
import StoryTray from "../components/StoryTray";

const PostsPage = () => {
  const { authUser } = useAuthUser();

  // Fetch friend list with caching
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 5, // 5 mins cache
  });

  const friendIds = useMemo(() => friends.map((f) => f._id), [friends]);

  // Fetch posts with caching and snappy UI
  const { data: serverPosts, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["posts", authUser?._id, friendIds],
    queryFn: () => getPosts(authUser._id, friendIds),
    enabled: !!authUser?._id,
    staleTime: 1000 * 60 * 5, // 5 mins cache
    placeholderData: (previousData) => previousData, // Keep old data while fetching
  });

  // Local state for immediate UI response (likes/deletes)
  // We sync this with serverPosts when serverPosts changes
  const [localPosts, setLocalPosts] = useState([]);

  useEffect(() => {
    if (serverPosts) {
      setLocalPosts(serverPosts);
    }
  }, [serverPosts]);

  // Add new post to top
  const addPost = (post) => setLocalPosts((prev) => [post, ...prev]);


  return (
    <div className="px-2 py-3 sm:p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="mt-2 sm:mt-0">
        <StoryTray />
      </div>
      <div className="mt-5 mb-4 sm:mt-8 sm:mb-6 px-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content/90">Feed</h1>
      </div>
      <CreatePost onPost={addPost} authUser={authUser} />
      {isLoading && localPosts.length === 0 ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <PostsFeed posts={localPosts} setPosts={setLocalPosts} />
      )}
    </div>
  );
};

export default PostsPage;
