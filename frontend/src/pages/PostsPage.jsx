import { useState, useMemo } from "react";
import CreatePost from "../components/CreatePost";
import PostsFeed from "../components/PostsFeed";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getFriends, getPosts } from "../lib/api";
import StoryTray from "../components/StoryTray";

const PostsPage = () => {
  const { authUser } = useAuthUser();
  const [posts, setPosts] = useState([]);

  // Fetch friend list
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  const friendIds = useMemo(() => friends.map((f) => f._id), [friends]);

  // Fetch posts
  const { isLoading } = useQuery({
    queryKey: ["posts", authUser?._id, friendIds],
    queryFn: async () => {
      if (!authUser?._id) return [];
      const data = await getPosts(authUser._id, friendIds);
      setPosts(data);
      return data;
    },
    enabled: !!authUser?._id,
  });

  // Add new post to top
  const addPost = (post) => setPosts((prev) => [post, ...prev]);

  return (
    <div className="px-2 py-3 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <StoryTray />
      <div className="mt-5 mb-4 sm:mt-8 sm:mb-6 px-1">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-base-content/90">Feed</h1>
      </div>
      <CreatePost onPost={addPost} authUser={authUser} />
      {isLoading ? (
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg" />
        </div>
      ) : (
        <PostsFeed posts={posts} setPosts={setPosts} />
      )}
    </div>
  );
};

export default PostsPage;
