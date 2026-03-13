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
    <div className="glass-panel-flat p-5 sm:p-7 rounded-[28px] shadow-sm border border-base-content/5 hover:border-base-content/10 transition-colors animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3.5">
          <div
            className="avatar w-12 h-12 rounded-full overflow-hidden bg-base-300 flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-sm border border-base-content/10"
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
                <User className="size-5 opacity-40" />
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <Link
              to={`/user/${post.userId}`}
              className="hover:text-primary transition-colors inline-block"
            >
              <h3 className="font-bold text-base tracking-tight flex items-center gap-1.5 leading-none mb-1">
                {post.fullName || "Unknown User"}
                {(post.role === "admin" || post.isVerified) && (
                  <BadgeCheck className="size-4 text-primary fill-primary/10" />
                )}
              </h3>
            </Link>
            <div className="flex items-center gap-2 flex-wrap mt-[2px]">
              <div className="flex items-center gap-1 opacity-70">
                <span className="size-1.5 bg-success rounded-full animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider">{timeAgo(post.createdAt)}</span>
              </div>
              
              {post.caption && (
                <>
                  <span className="text-base-content/20 text-xs">•</span>
                  <span className="badge badge-sm badge-ghost border-none bg-base-content/5 gap-1 capitalize font-medium">
                    <span className="text-[10px]">{emotionEmoji[post.caption.toLowerCase()] || "💬"}</span>
                    {post.caption}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action/Menu Button */}
        <div className="flex items-center gap-2">
           <button
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               toast("Streak Protection is Premium!", { icon: "🛡️" });
             }}
             className="btn btn-ghost btn-xs btn-circle hover:bg-info/10 hover:text-info text-base-content/40 active:scale-90 transition-all border border-base-content/5"
             title="Protect Streak"
           >
             <Shield className="size-3.5" />
           </button>
           
          {post.userId === authUser?._id && (
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs btn-circle hover:bg-error/10 hover:text-error text-base-content/40 active:scale-90 transition-all border border-base-content/5"
              disabled={isDeleting}
              title="Delete Post"
            >
              {isDeleting ? (
                <span className="loading loading-spinner size-3.5"></span>
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-base leading-[1.6] mb-4 text-base-content/90 font-medium whitespace-pre-wrap">
          {post.content}
        </p>
      )}

      {/* Media with Double-Tap Support */}
      {post.mediaUrl && (
        <div
          className="relative rounded-[20px] overflow-hidden bg-black/5 mb-4 border border-base-content/5 cursor-pointer group/media selection:bg-transparent"
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
                <Heart className="size-28 text-white fill-white filter drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]" />
              </motion.div>
            )}
          </AnimatePresence>

          {post.mediaType === "image" ? (
            <img
              src={post.mediaUrl}
              alt="Post image"
              className="w-full max-h-[600px] object-cover sm:object-contain transition-transform duration-[1.5s] ease-out group-hover/media:scale-105"
              loading="lazy"
            />
          ) : post.mediaType === "video" ? (
            <video
              src={post.mediaUrl}
              controls
              className="w-full max-h-[600px] object-contain bg-black"
              playsInline
              preload="metadata"
            />
          ) : null}
          
          {/* Subtle vignette for premium feel on images */}
          {post.mediaType === "image" && (
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          )}
        </div>
      )}

      {/* QUICK REACTION BAR (ADDICTIVE ENGAGEMENT) */}
      <div className="flex items-center justify-center gap-4 bg-base-100/50 backdrop-blur-md rounded-[18px] p-2 mb-4 opacity-0 hover:opacity-100 transition-opacity duration-300 relative overflow-hidden border border-base-content/5 shadow-sm max-w-sm mx-auto -mt-16 z-10 translate-y-8 hover:translate-y-0 invisible hover:visible">
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
            className="text-2xl filter drop-shadow-sm hover:drop-shadow-md transition-all cursor-pointer relative z-10"
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
              className="absolute text-2xl pointer-events-none"
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

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleLike}
          className={`btn flex-1 btn-ghost h-10 min-h-10 rounded-xl gap-2 font-bold active:scale-95 transition-all text-sm group ${isLiked ? "text-primary hover:bg-primary/10" : "text-base-content/70 hover:bg-base-content/5"}`}
          disabled={isLiking}
        >
          <Heart
            className={`size-5 transition-transform duration-300 ${isLiked ? "fill-primary text-primary" : "group-hover:scale-110"
              } ${likeAnimationPulse ? "scale-[1.3] text-primary" : ""}`}
            strokeWidth={isLiked ? 2 : 1.5}
          />
          {likeCount > 0 ? (
             <span onClick={(e) => { e.stopPropagation(); setLikedByPostId(post._id); }} className="hover:underline hover:text-primary transition-colors cursor-pointer">
               {likeCount}
             </span>
          ) : "Like"}
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className={`btn flex-1 btn-ghost h-10 min-h-10 rounded-xl gap-2 font-bold active:scale-95 transition-all text-sm group ${showComments ? "bg-base-content/5 text-base-content" : "text-base-content/70 hover:bg-base-content/5"}`}
        >
          <MessageCircle className={`size-5 transition-transform duration-300 ${showComments ? "fill-base-content/20 scale-105" : "group-hover:scale-110"}`} strokeWidth={showComments ? 2 : 1.5} />
          {commentCount > 0 ? commentCount : "Comment"}
        </button>

        <button
          onClick={handleShare}
          className="btn flex-1 btn-ghost h-10 min-h-10 rounded-xl gap-2 font-bold text-base-content/70 hover:bg-base-content/5 active:scale-95 transition-all text-sm group"
        >
          <Share2 className="size-4.5 transition-transform duration-300 group-hover:scale-110 group-hover:text-success" strokeWidth={1.5} />
          {post.shareCount > 0 ? post.shareCount : "Share"}
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-base-content/5 animate-in slide-in-from-top-2 fade-in duration-300">
          
          {/* Add Comment Input */}
          <div className="flex gap-3 mb-5">
            <div className="avatar w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-sm">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt="You"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 relative group rounded-2xl bg-base-100 overflow-hidden border border-base-content/10 transition-colors focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 shadow-sm">
              <input
                type="text"
                placeholder="Write a comment..."
                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm py-2.5 pl-4 pr-12 font-medium"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
              />
              <button
                onClick={handleComment}
                disabled={!commentText.trim() || isCommenting}
                className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle text-primary active:scale-90 transition-all hover:bg-primary/10"
              >
                <Send className={`size-4 ${commentText.trim() ? 'translate-x-[1px]' : 'opacity-40'}`} />
              </button>
            </div>
          </div>

          {/* Existing Comments */}
          <div className="space-y-4">
            {post.comments?.map((comment, index) => (
              <div key={comment._id || index} className="flex gap-3 animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                <div className="avatar w-8 h-8 rounded-full overflow-hidden bg-base-300 flex-shrink-0 border border-base-content/5 mt-0.5">
                  {comment.profilePic ? (
                    <img
                      src={comment.profilePic}
                      alt={comment.fullName}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-4 h-4 opacity-40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="bg-base-200/50 rounded-2xl rounded-tl-sm px-4 py-2.5 inline-block max-w-full">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-xs">
                        {comment.fullName}
                      </p>
                      {(comment.role === "admin" || comment.isVerified) && (
                        <BadgeCheck className="size-[14px] text-primary fill-primary/10" />
                      )}
                      {comment.caption && (
                        <>
                          <span className="text-base-content/20 text-xs mx-0.5">•</span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
                            {emotionEmoji[comment.caption.toLowerCase()] || "💬"} {comment.caption}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[13px] font-medium leading-snug break-words text-base-content/80">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
            
            {(!post.comments || post.comments.length === 0) && (
              <div className="text-center py-6">
                <p className="text-xs font-bold uppercase tracking-widest opacity-30">No comments yet</p>
                <p className="text-[10px] uppercase tracking-widest opacity-20 mt-1">Be the first to share your thoughts</p>
              </div>
            )}
          </div>
        </div>
      )}
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
