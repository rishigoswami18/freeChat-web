import { memo } from "react";
import { Loader2, X, Grid, Flame, List } from "lucide-react";
import PostsFeed from "../PostsFeed"; // Path adjusting since it's nested down

/**
 * PostGridItem
 * Isolated scalable piece allowing future virtualizer support
 */
export const PostGridItem = memo(({ post, onSelectFeedMode }) => {
    return (
        <div
            className="aspect-square relative group cursor-pointer overflow-hidden bg-base-300"
            onClick={onSelectFeedMode}
        >
            {post.mediaUrl ? (
                <div className="w-full h-full">
                    {post.mediaType === "video" ? (
                        <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                    ) : (
                        <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                    )}
                </div>
            ) : (
                <div className="w-full h-full p-2 flex items-center justify-center text-[10px] sm:text-xs text-center font-medium opacity-60 italic bg-gradient-to-br from-base-200 to-base-300">
                    {post.content?.substring(0, 50)}...
                </div>
            )}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                <div className="flex items-center gap-1"><Flame className="size-4 fill-current" /> {post.likes?.length || 0}</div>
            </div>
        </div>
    );
});
PostGridItem.displayName = "PostGridItem";

/**
 * ProfilePosts
 * Renders the users visual content matrix separately
 */
const ProfilePosts = memo(({ userPosts, viewMode, setViewMode, isLoading, isError, onRetry, queryClient }) => {
    
    // Fallbacks
    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary opacity-20" />
            </div>
        );
    }
    
    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <X className="size-12 text-error opacity-40" />
                <p className="text-sm font-semibold opacity-50">Failed to load posts</p>
                <button onClick={onRetry} className="btn btn-ghost btn-xs rounded-lg">Retry</button>
            </div>
        );
    }

    if (!userPosts || userPosts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
                <Grid className="size-12 mb-4" />
                <p>No posts yet</p>
            </div>
        );
    }

    return (
        <div className="min-h-[300px]">
            {viewMode === "grid" ? (
                <div className="grid grid-cols-3 gap-0.5 sm:gap-4">
                    {userPosts.map((post) => (
                        <PostGridItem 
                            key={post._id} 
                            post={post} 
                            onSelectFeedMode={() => setViewMode("feed")} 
                        />
                    ))}
                </div>
            ) : (
                <div className="max-w-xl mx-auto space-y-6 pb-20">
                    {/* PostsFeed handles its own mutation via server normally, but if it expects setPosts, we can proxy it via queryClient directly instead of React State */}
                    <PostsFeed posts={userPosts} />
                </div>
            )}
        </div>
    );
});

ProfilePosts.displayName = "ProfilePosts";

export default ProfilePosts;
