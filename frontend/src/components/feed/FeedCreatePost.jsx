import { memo } from "react";
import CreatePost from "../CreatePost";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Wrapper for CreatePost that interacts directly with React Query cache
 * for instant optimistic updates without local state duplication.
 */
const FeedCreatePost = memo(({ authUser }) => {
  const queryClient = useQueryClient();

  const handlePostCreated = (newPost) => {
    // Optimistically update the feed cache
    queryClient.setQueryData(["posts", authUser?._id], (old) => {
      if (!old) return old;
      
      return {
        ...old,
        pages: [
          { 
            ...old.pages[0], 
            posts: [newPost, ...old.pages[0].posts] 
          },
          ...old.pages.slice(1)
        ]
      };
    });
  };

  return (
    <div className="w-full sm:max-w-[470px] mx-auto mb-6">
      <CreatePost onPost={handlePostCreated} authUser={authUser} />
    </div>
  );
});

FeedCreatePost.displayName = "FeedCreatePost";

export default FeedCreatePost;
