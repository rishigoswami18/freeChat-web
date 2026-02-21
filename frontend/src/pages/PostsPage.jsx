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
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <StoryTray />
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">Feed</h1>
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
