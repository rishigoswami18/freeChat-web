import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  User,
  MessageSquare,
} from "lucide-react";
import { likePost, commentOnPost, sharePost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

const PostsFeed = ({ posts, setPosts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 opacity-60">
        <MessageSquare className="w-16 h-16 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {posts.map((post) => (
        <PostCard key={post._id} post={post} setPosts={setPosts} />
      ))}
    </div>
  );
};

const PostCard = ({ post, setPosts }) => {
  const { authUser } = useAuthUser();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes?.includes(authUser?._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const data = await likePost(post._id);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id ? { ...p, likes: data.likes } : p
        )
      );
    } catch {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const newComment = await commentOnPost(post._id, commentText.trim());
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, comments: [...(p.comments || []), newComment] }
            : p
        )
      );
      setCommentText("");
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    try {
      // Copy post link
      const url = `${window.location.origin}/posts?highlight=${post._id}`;
      await navigator.clipboard.writeText(url);
      await sharePost(post._id);
      setPosts((prev) =>
        prev.map((p) =>
          p._id === post._id
            ? { ...p, shareCount: (p.shareCount || 0) + 1 }
            : p
        )
      );
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to share");
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition-shadow">
      <div className="card-body p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar w-11 h-11 rounded-full overflow-hidden bg-base-300">
            {post.profilePic ? (
              <img
                src={post.profilePic}
                alt={post.fullName}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <User className="w-5 h-5 opacity-40" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">
              {post.fullName || "Unknown User"}
            </h3>
            <span className="text-xs text-base-content/50">
              {timeAgo(post.createdAt)}
            </span>
          </div>
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm sm:text-base whitespace-pre-wrap mb-3">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.mediaUrl && (
          <div className="rounded-xl overflow-hidden bg-base-300 mb-3">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-[500px] object-contain"
                loading="lazy"
              />
            ) : post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[500px]"
              />
            ) : null}
          </div>
        )}

        {/* Stats Row */}
        {(likeCount > 0 || commentCount > 0 || post.shareCount > 0) && (
          <div className="flex items-center justify-between text-xs text-base-content/50 px-1 mb-2">
            <span>
              {likeCount > 0 && `${likeCount} like${likeCount !== 1 ? "s" : ""}`}
            </span>
            <div className="flex gap-3">
              {commentCount > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="hover:underline"
                >
                  {commentCount} comment{commentCount !== 1 ? "s" : ""}
                </button>
              )}
              {post.shareCount > 0 && (
                <span>
                  {post.shareCount} share{post.shareCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center border-t border-b border-base-300 py-1">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-sm flex-1 gap-2 ${isLiked ? "text-red-500" : ""
              }`}
            disabled={isLiking}
          >
            <Heart
              className={`size-4 ${isLiked ? "fill-red-500" : ""}`}
            />
            <span className="text-xs">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="btn btn-ghost btn-sm flex-1 gap-2"
          >
            <MessageCircle className="size-4" />
            <span className="text-xs">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="btn btn-ghost btn-sm flex-1 gap-2"
          >
            <Share2 className="size-4" />
            <span className="text-xs">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 space-y-3">
            {/* Existing Comments */}
            {post.comments?.map((comment, index) => (
              <div key={comment._id || index} className="flex gap-2">
                <div className="avatar w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
                  {comment.profilePic ? (
                    <img
                      src={comment.profilePic}
                      alt={comment.fullName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-3 h-3 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="bg-base-300 rounded-2xl px-3 py-2 flex-1">
                  <p className="font-semibold text-xs">{comment.fullName}</p>
                  <p className="text-sm">{comment.text}</p>
                </div>
              </div>
            ))}

            {/* Add Comment Input */}
            <div className="flex items-center gap-2">
              <div className="avatar w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="You"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 flex items-center gap-1 bg-base-300 rounded-full px-3 py-1">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  className="input input-ghost input-sm flex-1 bg-transparent focus:outline-none h-8 text-sm"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || isCommenting}
                  className="btn btn-ghost btn-xs btn-circle text-primary"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostsFeed;
