import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  User,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { likePost, commentOnPost, sharePost, deletePost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import PostAd from "./PostAd";
import LikedByModal from "./LikedByModal";

const PostsFeed = ({ posts, setPosts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-16 opacity-60">
        <MessageSquare className="w-14 h-14 mx-auto mb-3 opacity-30" />
        <p className="text-lg font-medium">No posts yet</p>
        <p className="text-sm mt-1">Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {posts.map((post, index) => (
        <div key={post._id}>
          <PostCard post={post} setPosts={setPosts} />
          {/* Show an ad after every 3 posts */}
          {(index + 1) % 3 === 0 && (
            <div className="mt-4 sm:mt-5">
              <PostAd index={Math.floor(index / 3)} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const emotionEmoji = {
  happy: "😊",
  joy: "😄",
  love: "❤️",
  sad: "😢",
  sadness: "😢",
  angry: "😠",
  anger: "😠",
  fear: "😨",
  surprise: "😲",
  neutral: "😐",
};

const PostCard = ({ post, setPosts }) => {
  const { authUser } = useAuthUser();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const isLiked = post.likes?.includes(authUser?._id);
  const likeCount = post.likes?.length || 0;
  const commentCount = post.comments?.length || 0;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      setPosts((prev) => prev.filter((p) => p._id !== post._id));
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    setLikeAnim(true);
    setTimeout(() => setLikeAnim(false), 300);
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
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
      <div className="card-body p-3 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5">
          <div className="avatar w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
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
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {post.fullName || "Unknown User"}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-base-content/40 font-medium">
                {timeAgo(post.createdAt)}
              </span>
              {post.caption && (
                <span className="badge badge-xs badge-outline gap-0.5 capitalize">
                  {emotionEmoji[post.caption.toLowerCase()] || "💬"} {post.caption}
                </span>
              )}
            </div>
          </div>

          {/* Delete Button */}
          {post.userId === authUser?._id && (
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs btn-circle text-error active:scale-90 transition-transform"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          )}
        </div>

        {/* Content */}
        {post.content && (
          <p className="text-sm sm:text-base whitespace-pre-wrap mb-2.5 leading-relaxed">
            {post.content}
          </p>
        )}

        {/* Media */}
        {post.mediaUrl && (
          <div className="rounded-xl overflow-hidden bg-base-300 mb-2.5 -mx-3 sm:-mx-5">
            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-[420px] object-cover sm:object-contain"
                loading="lazy"
              />
            ) : post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[420px]"
                playsInline
              />
            ) : null}
          </div>
        )}

        {/* Stats Row */}
        {(likeCount > 0 || commentCount > 0 || post.shareCount > 0) && (
          <div className="flex items-center justify-between text-[11px] text-base-content/40 px-0.5 mb-1.5 font-medium">
            <span
              className="cursor-pointer hover:underline hover:text-primary transition-colors active:scale-95"
              onClick={() => likeCount > 0 && setShowLikesModal(true)}
            >
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

        {/* Action Buttons — optimized for mobile touch */}
        <div className="flex items-center border-t border-base-300/50 pt-1.5 -mx-1">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-sm flex-1 gap-1.5 rounded-xl active:scale-95 transition-transform ${isLiked ? "text-red-500" : ""
              }`}
            disabled={isLiking}
          >
            <Heart
              className={`size-[18px] transition-transform ${isLiked ? "fill-red-500" : ""} ${likeAnim ? "scale-125" : ""}`}
            />
            <span className="text-xs font-medium">Like</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="btn btn-ghost btn-sm flex-1 gap-1.5 rounded-xl active:scale-95 transition-transform"
          >
            <MessageCircle className="size-[18px]" />
            <span className="text-xs font-medium">Comment</span>
          </button>

          <button
            onClick={handleShare}
            className="btn btn-ghost btn-sm flex-1 gap-1.5 rounded-xl active:scale-95 transition-transform"
          >
            <Share2 className="size-[18px]" />
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-2.5 space-y-2.5 animate-slide-in">
            {/* Existing Comments */}
            {post.comments?.map((comment, index) => (
              <div key={comment._id || index} className="flex gap-2">
                <div className="avatar w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
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
                <div className="bg-base-300 rounded-2xl px-3 py-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="font-semibold text-xs">{comment.fullName}</p>
                    {comment.caption && (
                      <span className="badge badge-xs badge-outline gap-0.5 capitalize">
                        {emotionEmoji[comment.caption.toLowerCase()] || "💬"} {comment.caption}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] break-words">{comment.text}</p>
                </div>
              </div>
            ))}

            {/* Add Comment Input */}
            <div className="flex items-center gap-2">
              <div className="avatar w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0">
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
                  className="input input-ghost input-sm flex-1 bg-transparent focus:outline-none h-8 text-sm min-w-0"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                />
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || isCommenting}
                  className="btn btn-ghost btn-xs btn-circle text-primary active:scale-90 transition-transform flex-shrink-0"
                >
                  <Send className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        <LikedByModal
          isOpen={showLikesModal}
          onClose={() => setShowLikesModal(false)}
          postId={post._id}
        />
      </div>
    </div>
  );
};

export default PostsFeed;
