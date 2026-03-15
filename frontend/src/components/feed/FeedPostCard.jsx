import { useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  User,
  BadgeCheck,
  MoreHorizontal,
  Bookmark
} from "lucide-react";
import { likePost, commentOnPost, sharePost, deletePost } from "../../lib/api";
import useAuthUser from "../../hooks/useAuthUser";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

// === STATIC ASSETS ===
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

const timeAgoShort = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
};

const PostHeader = memo(({ post, authUser, onViewingDP, onDeletePost, isDeleting }) => {
  const isOwnPost = post?.userId === authUser?._id;

  return (
    <div className="flex items-center justify-between px-0 mb-3 select-none">
      <div className="flex items-center gap-3">
        <div 
          className="rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[2px] cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => onViewingDP({ url: post.profilePic || "/avatar.png", name: post.fullName, isVerified: post.isVerified || post.role === "admin" })}
          role="button"
          tabIndex={0}
        >
          <div className="avatar w-8 h-8 rounded-full border-[1.5px] border-base-100 overflow-hidden bg-base-300">
            {post.profilePic ? (
              <img src={post.profilePic} alt={post.fullName} className="object-cover w-full h-full" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-200">
                <User className="size-4 opacity-40" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            <Link to={`/user/${post.userId}`} className="font-bold text-[14px] text-base-content hover:opacity-70 truncate max-w-[150px]">
              {post.fullName || "user"}
            </Link>
            {(post.role === "admin" || post.isVerified) && (
              <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
            )}
            <span className="mx-1 text-base-content/40 text-[10px]">•</span>
            <span className="text-base-content/40 text-[13px]">{timeAgoShort(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={isOwnPost ? onDeletePost : undefined}
        className="btn btn-ghost btn-xs btn-circle text-base-content hover:bg-transparent"
        disabled={isDeleting}
        aria-label="More options"
      >
        {isDeleting ? <span className="loading loading-spinner size-3.5" /> : <MoreHorizontal className="size-5" />}
      </button>
    </div>
  );
});

const PostMedia = memo(({ post, onDoubleTap, showHeartOverlay }) => {
  return (
    <div
      className="relative w-full sm:rounded-xl overflow-hidden bg-base-300/30 flex justify-center items-center cursor-pointer mb-3 border border-base-content/10 shadow-sm"
      onClick={onDoubleTap}
      role="button"
      aria-label="Double tap to like"
    >
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <Heart className="size-32 text-white fill-white drop-shadow-lg" />
          </motion.div>
        )}
      </AnimatePresence>

      {post.mediaUrl ? (
        post.mediaType === "video" ? (
          <video src={post.mediaUrl} controls className="w-full max-h-[585px] object-cover bg-black" playsInline preload="metadata" />
        ) : (
          <img src={post.mediaUrl} alt="Post" className="w-full h-auto max-h-[585px] object-cover" loading="lazy" />
        )
      ) : (
        <div className="p-10 w-full text-center py-20 min-h-[300px] flex items-center justify-center bg-base-200">
          <span className="text-xl font-medium px-4">{post.content}</span>
        </div>
      )}
    </div>
  );
});

const PostCard = memo(({ post, setLikedByPostId, setViewingDP }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const lastTap = useRef(0);
  
  const isLiked = post?.likes?.includes(authUser?._id);
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;

  // Helper to update cache
  const updatePostInCache = useCallback((updatedPost) => {
    queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
      if (!old) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          posts: page.posts.map((p) => (p._id === post._id ? updatedPost : p))
        }))
      };
    });
  }, [queryClient, post._id]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Delete this post?")) return;
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      // Remove from cache
      queryClient.setQueriesData({ queryKey: ["posts"] }, (old) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((p) => p._id !== post._id)
          }))
        };
      });
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  }, [post._id, queryClient]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    const newLikes = wasLiked 
      ? post.likes.filter(id => id !== authUser?._id)
      : [...(post.likes || []), authUser?._id];

    // Optimistic UI
    updatePostInCache({ ...post, likes: newLikes });

    try {
      const data = await likePost(post._id);
      updatePostInCache({ ...post, likes: data.likes });
    } catch {
      updatePostInCache(post); // Revert
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isLiked, post, authUser?._id, updatePostInCache]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
    }
    lastTap.current = now;
  }, [isLiked, handleLike]);

  const handleComment = useCallback(async (text) => {
    if (!text.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const newComment = await commentOnPost(post._id, text);
      const updatedPost = { ...post, comments: [...(post.comments || []), newComment] };
      updatePostInCache(updatedPost);
      setShowComments(true);
    } catch {
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  }, [post, isCommenting, updatePostInCache]);

  const handleShare = useCallback(async () => {
    try {
      const url = `${window.location.origin}/posts?highlight=${post._id}`;
      await navigator.clipboard.writeText(url);
      await sharePost(post._id);
      updatePostInCache({ ...post, shareCount: (post.shareCount || 0) + 1 });
      toast.success("Link copied!");
    } catch {
      toast.error("Failed to share");
    }
  }, [post, updatePostInCache]);

  return (
    <article className="w-full sm:max-w-[470px] mx-auto mb-10 pb-6 border-b border-base-content/10 animate-in fade-in duration-500">
      <PostHeader 
        post={post}
        authUser={authUser}
        onViewingDP={setViewingDP}
        onDeletePost={handleDelete}
        isDeleting={isDeleting}
      />
      <PostMedia post={post} onDoubleTap={handleDoubleTap} showHeartOverlay={showHeartOverlay} />
      
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} aria-label="Like" className="hover:opacity-60 transition-opacity">
            <Heart className={`size-[26px] ${isLiked ? "fill-red-500 text-red-500" : "text-base-content"}`} strokeWidth={2.5} />
          </button>
          <button onClick={() => setShowComments(!showComments)} aria-label="Comment" className="hover:opacity-60 transition-opacity">
            <MessageCircle className="size-[26px]" strokeWidth={2.5} style={{ transform: 'scaleX(-1)' }} />
          </button>
          <button onClick={handleShare} aria-label="Share" className="hover:opacity-60 transition-opacity">
            <Send className="size-[26px]" strokeWidth={2.5} />
          </button>
        </div>
        <button onClick={() => setIsSaved(!isSaved)} aria-label="Save" className="hover:opacity-60 transition-opacity">
          <Bookmark className={`size-[26px] ${isSaved ? "fill-base-content" : ""}`} strokeWidth={2.5} />
        </button>
      </div>

      {likeCount > 0 && (
          <button 
            className="text-[14px] font-semibold mb-2 hover:opacity-60"
            onClick={() => setLikedByPostId(post._id)}
          >
            {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
          </button>
      )}

      {(post.content || post.caption) && (
        <div className="text-[14px] leading-[18px] mb-2">
          <Link to={`/user/${post.userId}`} className="font-semibold mr-2">{post.fullName}</Link>
          <span className="whitespace-pre-wrap">{post.content}</span>
        </div>
      )}

      {commentCount > 0 && (
        <button onClick={() => setShowComments(!showComments)} className="text-[14px] text-base-content/50 block mb-2">
          {showComments ? "Hide comments" : `View all ${commentCount} comments`}
        </button>
      )}

      <AnimatePresence>
        {showComments && post.comments?.map((comment) => (
          <motion.div 
            key={comment._id} 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 mb-3 text-[14px]"
          >
            <span className="font-semibold">{comment.fullName}</span>
            <span>{comment.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex items-center border-t border-transparent focus-within:border-base-content/10 pt-2 px-1">
        <input 
          className="flex-1 bg-transparent border-none outline-none text-[14px] h-8" 
          placeholder="Add a comment..."
          onKeyDown={(e) => {
            if (e.key === "Enter") handleComment(e.target.value);
          }}
        />
      </div>
    </article>
  );
});

PostCard.displayName = "PostCard";

export default PostCard;
