import { memo } from "react";
import { List, Heart, MessageCircle } from "lucide-react";

/**
 * High performance mapped grid rendering minimal post summaries. Note using `memo` prevents it
 * from rendering entirely each time a profile level action updates.
 */
const UserPostsGrid = memo(({ posts, setViewMode }) => {
    return (
        <div className="grid grid-cols-3 gap-1 sm:gap-4 animate-in fade-in duration-300" role="list" aria-label="User posts grid">
            {posts.map((post) => (
                <div
                    key={post._id}
                    className="aspect-square relative group cursor-pointer overflow-hidden bg-base-300 rounded-sm sm:rounded-xl focus-within:ring-2 focus-within:ring-primary/40 focus:outline-none"
                    onClick={() => setViewMode("feed")}
                    role="listitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setViewMode("feed");
                        }
                    }}
                    aria-label={`View post with ${post.likes?.length || 0} likes`}
                >
                    {post.mediaUrl ? (
                        <div className="w-full h-full">
                            {post.mediaType === "video" ? (
                                <video src={post.mediaUrl} className="w-full h-full object-cover" muted preload="metadata" />
                            ) : (
                                <img src={post.mediaUrl} alt="Post media" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                            )}
                        </div>
                    ) : (
                        <div className="w-full h-full p-3 flex flex-col items-center justify-center text-[10px] sm:text-sm text-center font-medium opacity-60 bg-gradient-to-br from-base-200 to-base-300">
                            <List className="size-4 mb-2 opacity-20" aria-hidden="true" />
                            <span className="line-clamp-3 overflow-hidden text-ellipsis">{post.content}</span>
                        </div>
                    )}
                    
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 text-white font-bold">
                        <div className="flex items-center gap-1" aria-label={`${post.likes?.length || 0} likes`}>
                            <Heart className="size-4 fill-current" aria-hidden="true" /> {post.likes?.length || 0}
                        </div>
                        <div className="flex items-center gap-1" aria-label={`${post.comments?.length || 0} comments`}>
                            <MessageCircle className="size-4 fill-current" aria-hidden="true" /> {post.comments?.length || 0}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
});

UserPostsGrid.displayName = "UserPostsGrid";

export default UserPostsGrid;
