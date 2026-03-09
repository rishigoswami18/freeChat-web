import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  User,
  MessageSquare,
  Trash2,
  BadgeCheck,
  TrendingUp,
  Zap,
  Gem,
  Flame,
  Sparkles,
  Shield,
} from "lucide-react";
import { likePost, commentOnPost, sharePost, deletePost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import PostAd from "./PostAd";
import LikedByModal from "./LikedByModal";
import ProfilePhotoViewer from "./ProfilePhotoViewer";

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

const PostCard = ({ post, setPosts, setLikedByPostId, setViewingDP }) => {
  const { authUser } = useAuthUser();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [likeAnimationPulse, setLikeAnimationPulse] = useState(false);
  const [particles, setParticles] = useState([]); // State for particles
  const lastTap = useRef(0);

  const isLiked = post?.likes?.includes(authUser?._id) || false;
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      setPosts((prev) => prev.filter((p) => p && p._id !== post._id));
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
    setLikeAnimationPulse(true);
    setTimeout(() => setLikeAnimationPulse(false), 300);
    try {
      const data = await likePost(post._id);
      setPosts((prev) =>
        prev.map((p) =>
          p && p._id === post._id ? { ...p, likes: data.likes } : p
        )
      );
    } catch {
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  };

  const handleDoubleTap = (e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) handleLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
      return;
    }
    lastTap.current = now;
  };

  const handleComment = async () => {
    if (!commentText.trim() || isCommenting) return;
    setIsCommenting(true);
    try {
      const newComment = await commentOnPost(post._id, commentText.trim());
      setPosts((prev) =>
        prev.map((p) =>
          p && p._id === post._id
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
          p && p._id === post._id
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
    return new Date(date).toLocaleDateString("en-US", {
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
      <div className="card-body p-3 sm:p-5">
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3 mb-2.5">
          <div
            className="avatar w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden bg-base-300 flex-shrink-0 cursor-pointer hover:ring-4 ring-primary/20 transition-all active:scale-95"
            onClick={() =>
              setViewingDP({ url: post.profilePic, name: post.fullName })
            }
          >
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
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-[11px] text-success font-medium">Online</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast("Streak Protection is Premium!", { icon: "🛡️" });
                }}
                className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-md border border-blue-500/20 text-[9px] font-black text-blue-500 uppercase tracking-tighter transition-all hover:scale-105 active:scale-95"
              >
                <Shield className="size-2.5" />
                Protect
              </button>
            </div>
            <Link
              to={`/user/${post.userId}`}
              className="hover:text-primary transition-colors"
            >
              <h3 className="font-semibold text-sm truncate flex items-center gap-1">
                {post.fullName || "Unknown User"}
                {(post.role === "admin" || post.isVerified) && (
                  <BadgeCheck className="size-3.5 text-amber-500 fill-amber-500/10" />
                )}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-base-content/40 font-medium">
                {timeAgo(post.createdAt)}
              </span>
              {post.caption && (
                <span className="badge badge-xs badge-outline gap-0.5 capitalize">
                  {emotionEmoji[post.caption.toLowerCase()] || "💬"}{" "}
                  {post.caption}
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

        {/* Media with Double-Tap Support */}
        {post.mediaUrl && (
          <div
            className="relative rounded-xl overflow-hidden bg-base-300 mb-2.5 -mx-3 sm:-mx-5 cursor-pointer select-none group/media"
            onClick={handleDoubleTap}
          >
            {/* Double Tap Heart Animation */}
            <AnimatePresence>
              {showHeart && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
                >
                  <Heart className="size-24 text-white fill-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" />
                </motion.div>
              )}
            </AnimatePresence>

            {post.mediaType === "image" ? (
              <img
                src={post.mediaUrl}
                alt="Post media"
                className="w-full max-h-[500px] object-cover sm:object-contain transition-transform duration-700 group-hover/media:scale-[1.02]"
                loading="lazy"
              />
            ) : post.mediaType === "video" ? (
              <video
                src={post.mediaUrl}
                controls
                className="w-full max-h-[500px]"
                playsInline
                preload="metadata"
              />
            ) : null}
          </div>
        )}

        {/* Stats Row */}
        {(likeCount > 0 || commentCount > 0 || post.shareCount > 0) && (
          <div className="flex items-center justify-between text-[11px] text-base-content/40 px-0.5 mb-1.5 font-medium">
            <span
              className="cursor-pointer hover:underline hover:text-primary transition-colors active:scale-95"
              onClick={() => likeCount > 0 && setLikedByPostId(post._id)}
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

        {/* QUICK REACTION BAR (ADDICTIVE ENGAGEMENT) */}
        <div className="flex items-center justify-around bg-base-300/50 backdrop-blur-sm rounded-2xl py-2 mb-2 group/reactions opacity-0 group-hover:opacity-100 transition-opacity duration-300 relative overflow-hidden">
          {['❤️', '🔥', '🙌', '😍', '📈'].map((emoji, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: i === 4 ? 1.2 : 1.5, y: -5 }}
              whileTap={{ scale: 0.8 }}
              onClick={(e) => {
                if (!isLiked) handleLike();
                setShowHeart(true);
                setTimeout(() => setShowHeart(false), 800);

                // Particle Burst Logic
                const rect = e.currentTarget.getBoundingClientRect();
                const newParticles = Array.from({ length: 8 }).map((_, idx) => ({
                  id: Date.now() + idx + Math.random(), // Ensure unique ID
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                  offsetX: Math.random() * 40 - 20, // Random horizontal offset
                  offsetY: Math.random() * -60 - 20, // Random upward offset
                  rotation: Math.random() * 360,
                  emoji
                }));
                setParticles((prev) => [...prev, ...newParticles]);
                // Remove particles after animation
                setTimeout(() => {
                  setParticles((prev) => prev.filter(p => !newParticles.some(np => np.id === p.id)));
                }, 1000); // Match animation duration
              }}
              className="text-xl filter drop-shadow-sm hover:drop-shadow-md transition-all cursor-pointer relative z-10"
            >
              {emoji}
            </motion.button>
          ))}
          <AnimatePresence>
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.8, rotate: p.rotation }}
                animate={{
                  x: p.x + p.offsetX,
                  y: p.y + p.offsetY,
                  opacity: 0,
                  scale: 1.5,
                  rotate: p.rotation + (Math.random() * 180 - 90), // Add more rotation
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute text-xl pointer-events-none"
                style={{
                  left: 0, // Position relative to the viewport
                  top: 0,
                  transform: `translate(-50%, -50%)`, // Center the emoji
                }}
              >
                {p.emoji}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Action Buttons — optimized for mobile touch */}
        <div className="flex items-center border-t border-base-300/50 pt-1.5 -mx-1">
          <button
            onClick={handleLike}
            className={`btn btn-ghost btn-sm flex-1 gap-1.5 rounded-xl active:scale-95 transition-transform ${isLiked ? "text-red-500" : ""
              }`}
            disabled={isLiking}
          >
            <Heart
              className={`size-[18px] transition-transform ${isLiked ? "fill-red-500" : ""
                } ${likeAnimationPulse ? "scale-125" : ""}`}
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
                    <p className="font-semibold text-xs flex items-center gap-1">
                      {comment.fullName}
                      {(comment.role === "admin" || comment.isVerified) && (
                        <BadgeCheck className="size-3 text-amber-500 fill-amber-500/10" />
                      )}
                    </p>
                    {comment.caption && (
                      <span className="badge badge-xs badge-outline gap-0.5 capitalize">
                        {emotionEmoji[comment.caption.toLowerCase()] || "💬"}{" "}
                        {comment.caption}
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
      </div>
    </div>
  );
};

const PostsFeed = ({ posts, setPosts }) => {
  const { authUser } = useAuthUser();
  const [likedByPostId, setLikedByPostId] = useState(null);
  const [viewingDP, setViewingDP] = useState(null); // { url, name }

  const isPremium = authUser?.role === "admin" || authUser?.isPremium;

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-24 opacity-60">
        <div className="relative inline-block mb-6">
          <MessageSquare className="w-16 h-16 mx-auto opacity-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-1 -right-1 size-4 bg-primary rounded-full"
          />
        </div>
        <p className="text-xl font-black italic uppercase tracking-tighter">
          Your feed is silent
        </p>
        <p className="text-sm mt-1 opacity-40">
          Follow legends or share your own story!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {posts.map((post, index) => {
        if (!post) return null;
        return (
          <div key={post._id} className="stagger-item">
            <PostCard
              post={post}
              setPosts={setPosts}
              setLikedByPostId={setLikedByPostId}
              setViewingDP={setViewingDP}
            />
            {/* Professional Ad Injection (Non-Premium Only) */}
            {!isPremium && (index + 1) % 4 === 0 && (
              <div className="mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <PostAd index={Math.floor(index / 4)} />
              </div>
            )}
          </div>
        );
      })}

      {likedByPostId && (
        <LikedByModal
          postId={likedByPostId}
          isOpen={true}
          onClose={() => setLikedByPostId(null)}
        />
      )}

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          onClose={() => setViewingDP(null)}
        />
      )}
    </div>
  );
};

export default PostsFeed;
