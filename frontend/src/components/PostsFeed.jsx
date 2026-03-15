import { useState, useRef, useMemo, useCallback, memo } from "react";
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
  MoreHorizontal,
  Bookmark
} from "lucide-react";
import { likePost, commentOnPost, sharePost, deletePost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";
import PostAd from "./PostAd";
import LikedByModal from "./LikedByModal";
import ProfilePhotoViewer from "./ProfilePhotoViewer";

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

// Pure function for fast inline time compilation
const timeAgoShort = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d`;
  const d = new Date(date);
  return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
};

// === SUBCOMPONENT: Post Header ===
// Isolated to prevent re-rendering when videos play or users type comments
const PostHeader = memo(({ post, authUser, onViewingDP, onDeletePost, isDeleting }) => {
  const isOwnPost = post?.userId === authUser?._id;

  return (
    <div className="flex items-center justify-between px-0 mb-3 select-none">
      <div className="flex items-center gap-3">
        {/* Story Ring Avatar */}
        <div 
          className="rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[2px] cursor-pointer hover:scale-[1.02] transition-transform"
          onClick={() => onViewingDP({ url: post.profilePic || "/avatar.png", name: post.fullName, isVerified: post.isVerified || post.role === "admin" })}
        >
          <div className="avatar w-8 h-8 rounded-full border-[1.5px] border-base-100 overflow-hidden bg-base-300">
            {post.profilePic ? (
              <img src={post.profilePic} alt={post.fullName} className="object-cover w-full h-full" loading="lazy" decoding="async" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-base-200">
                <User className="size-4 opacity-40" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            {post.isDiscovery ? (
              <span className="font-bold text-[14px] text-base-content truncate max-w-[150px]">
                {post.fullName || "Global Creator"}
              </span>
            ) : (
              <Link to={`/user/${post.userId}`} className="font-bold text-[14px] text-base-content hover:text-base-content/70 truncate max-w-[150px]">
                {post.fullName || "user"}
              </Link>
            )}
            {(post.role === "admin" || post.isVerified) && (
              <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                 <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
              </div>
            )}
            <span className="mx-1 text-base-content/40 text-[10px]">•</span>
            <span className="text-base-content/40 text-[13px]">{timeAgoShort(post.createdAt)}</span>
          </div>
          {post.isDiscovery && (
             <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest flex items-center gap-1">
               <span className="size-1 bg-primary/60 rounded-full animate-pulse" />
               Global Content
             </div>
          )}
          {post.isSuggested && !post.isDiscovery && (
             <div className="text-[12px] text-base-content/60 leading-tight">
               Suggested for you
             </div>
          )}
        </div>
      </div>

      {/* Header Right: Follow or More */}
      <div className="flex items-center gap-3">
         {!isOwnPost && (
            <button className="text-primary font-bold text-[13px] px-2 py-1 hover:opacity-70 transition-colors">
              Follow
            </button>
         )}
         <div className="flex items-center">
            <button 
              onClick={isOwnPost ? onDeletePost : undefined}
              className="btn btn-ghost btn-xs btn-circle text-base-content hover:bg-transparent hover:opacity-50"
              disabled={isDeleting}
              aria-label="More options"
            >
              {isDeleting ? <span className="loading loading-spinner size-3.5" /> : <MoreHorizontal className="size-5" strokeWidth={2.5} />}
            </button>
         </div>
      </div>
    </div>
  );
});
PostHeader.displayName = "PostHeader";

// === SUBCOMPONENT: Post Media ===
// Heavy video elements rigidly shielded from component tree re-renders
const PostMedia = memo(({ post, onDoubleTap, showHeartOverlay }) => {
  return (
    <div
      className="relative w-full sm:rounded-[4px] overflow-hidden bg-base-300/30 flex justify-center items-center cursor-pointer selection:bg-transparent mb-3 shadow-[inset_0_0_0_1px_oklch(var(--bc)/0.05)] sm:border-x border-y border-base-content/10"
      onClick={onDoubleTap}
      onDoubleClick={(e) => e.preventDefault()}
      role="button"
      aria-label="Double tap to like"
    >
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart className="size-32 text-white fill-white filter drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>

      {post.mediaUrl ? (
        post.mediaType === "image" ? (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full h-auto max-h-[585px] object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full max-h-[585px] object-cover bg-black"
            playsInline
            preload="metadata" // Huge performance boost
          />
        ) : null
      ) : (
         <div className="p-10 w-full text-center py-20 min-h-[300px] flex items-center justify-center bg-base-200">
            <span className="text-xl font-medium tracking-tight whitespace-pre-wrap px-4">{post.content}</span>
         </div>
      )}
    </div>
  );
});
PostMedia.displayName = "PostMedia";

// === SUBCOMPONENT: Post Interactions ===
const PostActions = memo(({ isLiked, likeCount, onLike, onShare, onToggleComments, isSaved, onToggleSave, onShowLikedBy }) => {
    return (
        <>
            <div className="flex items-center justify-between px-0 mb-3 select-none">
                <div className="flex items-center gap-4">
                  <button onClick={onLike} className="hover:opacity-50 transition-opacity active:scale-95 group" aria-label="Like Post">
                    <Heart 
                      className={`size-[26px] transition-all duration-300 ${isLiked ? "fill-[#ff3040] text-[#ff3040]" : "text-base-content group-hover:text-base-content/70"}`} 
                      strokeWidth={isLiked ? 2 : 2.5} 
                    />
                  </button>
                  <button onClick={onToggleComments} className="hover:opacity-50 transition-opacity active:scale-95" aria-label="Comment">
                    <MessageCircle className="size-[26px] text-base-content hover:text-base-content/70" style={{ transform: 'scaleX(-1)' }} strokeWidth={2.5} />
                  </button>
                  <button onClick={onShare} className="hover:opacity-50 transition-opacity active:scale-95" aria-label="Share">
                    <Send className="size-[26px] text-base-content hover:text-base-content/70" strokeWidth={2.5} />
                  </button>
                </div>
                <div>
                  <button onClick={onToggleSave} className="hover:opacity-50 transition-opacity active:scale-95 group" aria-label="Save Post">
                    <Bookmark className={`size-[26px] transition-all ${isSaved ? "fill-base-content text-base-content" : "text-base-content group-hover:text-base-content/70"}`} strokeWidth={2.5} />
                  </button>
                </div>
            </div>

            {(likeCount > 0) && (
              <div className="px-0 mb-1.5 select-none">
                <span 
                  className="font-semibold text-[14px] cursor-pointer hover:opacity-50 tracking-tight"
                  onClick={onShowLikedBy}
                >
                  {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
                </span>
              </div>
            )}
        </>
    );
});
PostActions.displayName = "PostActions";

// === SUBCOMPONENT: Caption Area ===
const PostCaption = memo(({ post }) => {
    if (!post.mediaUrl || !post.content) return null;

    return (
        <div className="px-0 text-[14px] leading-[18px] mb-2">
            <div className="flex items-center gap-1 inline-flex">
              {post.isDiscovery ? (
                <span className="font-semibold tracking-tight">
                  {post.fullName || "user"}
                </span>
              ) : (
                <Link to={`/user/${post.userId}`} className="font-semibold hover:opacity-50 tracking-tight">
                  {post.fullName || "user"}
                </Link>
              )}
              {(post.isVerified || post.role === "admin") && (
                  <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                     <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                  </div>
              )}
            </div>
            {post.caption && (
              <span className="text-[14px] mr-1">
                {emotionEmoji[post.caption.toLowerCase()]} {post.caption}
              </span>
            )}
            <span className="text-base-content/90 break-words whitespace-pre-wrap flex-inline pl-1">
              {post.content}
            </span>
        </div>
    );
});
PostCaption.displayName = "PostCaption";

// === SUBCOMPONENT: Comment Input Form ===
// Encapsulates keystroke state ensuring typing 30WPM doesn't stall the feed GPU loop
const PostCommentInput = memo(({ onComment, isCommenting }) => {
    const [text, setText] = useState("");

    const handleSubmit = useCallback(async () => {
        if (!text.trim() || isCommenting) return;
        
        const success = await onComment(text.trim());
        if (success) {
            setText("");
        }
    }, [text, isCommenting, onComment]);

    return (
        <div className="px-0 flex items-center justify-between border-b border-transparent focus-within:border-base-content/20 py-1 transition-colors">
            <input
                type="text"
                placeholder="Add a comment..."
                className="bg-transparent border-none outline-none text-[14px] w-full placeholder:text-base-content/50 h-8"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
            <AnimatePresence>
                {text.trim() && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleSubmit}
                    disabled={isCommenting}
                    className="text-blue-500 font-semibold text-[14px] hover:text-blue-600 pl-2 transition-colors disabled:opacity-50"
                  >
                    Post
                  </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
});
PostCommentInput.displayName = "PostCommentInput";

// === MAIN CARD COMPONENT ===
const PostCard = memo(({ post, setPosts, setLikedByPostId, setViewingDP }) => {
  const { authUser } = useAuthUser();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const lastTap = useRef(0);
  
  const isLiked = post?.likes?.includes(authUser?._id) || false;
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;

  // === STABLE HANDLERS ===
  const handleDelete = useCallback(async () => {
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
  }, [post._id, setPosts]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    
    // Aggressive Optimistic UI Strategy
    const wasLiked = isLiked;
    setIsLiking(true);

    const newLikes = wasLiked 
        ? post.likes.filter(id => id !== authUser?._id)
        : [...(post.likes || []), authUser?._id];

    // Instantly inject into parent cache
    setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: newLikes } : p));

    try {
      const data = await likePost(post._id);
      // Reconcile with verified backend state
      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: data.likes } : p));
    } catch {
      // Revert forcefully on error
      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: post.likes } : p));
      toast.error("Failed to like post");
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isLiked, post._id, post.likes, authUser?._id, setPosts]);

  const handleDoubleTap = useCallback((e) => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) handleLike();
      
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
      return;
    }
    lastTap.current = now;
  }, [isLiked, handleLike]);

  const handleComment = useCallback(async (text) => {
    setIsCommenting(true);
    try {
      // Optimistic comment structural mockup
      const tempComment = {
          _id: Date.now().toString(),
          userId: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic,
          role: authUser.role,
          isVerified: authUser.isVerified,
          text: text,
          createdAt: new Date().toISOString()
      };

      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, comments: [...(p.comments || []), tempComment] } : p));

      const newComment = await commentOnPost(post._id, text);
      
      // Inject actual database record to replace our optimistic mock
      setPosts((prev) =>
        prev.map((p) => {
          if (p?._id === post._id) {
             const cleanComments = (p.comments || []).filter(c => c._id !== tempComment._id);
             return { ...p, comments: [...cleanComments, newComment] };
          }
          return p;
        })
      );
      
      // Force open comments tray if they were closed
      setShowComments(true);
      return true; // Success flag for input box clearer
    } catch {
      toast.error("Failed to add comment");
      return false;
    } finally {
      setIsCommenting(false);
    }
  }, [post._id, authUser, setPosts]);

  const handleShare = useCallback(async () => {
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
  }, [post._id, setPosts]);

  const handleToggleComments = useCallback(() => setShowComments(s => !s), []);
  const handleToggleSave = useCallback(() => setIsSaved(s => !s), []);
  const handleShowLikedBy = useCallback(() => setLikedByPostId(post._id), [post._id, setLikedByPostId]);

  return (
    <div className="w-full sm:max-w-[470px] mx-auto bg-transparent mb-6 pb-6 border-b border-base-content/10 animate-in fade-in duration-500 will-change-transform">
      <PostHeader 
         post={post}
         authUser={authUser}
         onViewingDP={setViewingDP}
         onDeletePost={handleDelete}
         isDeleting={isDeleting}
      />
      
      <PostMedia 
         post={post}
         onDoubleTap={handleDoubleTap}
         showHeartOverlay={showHeartOverlay}
      />

      <PostActions 
         isLiked={isLiked}
         likeCount={likeCount}
         onLike={handleLike}
         onShare={handleShare}
         onToggleComments={handleToggleComments}
         isSaved={isSaved}
         onToggleSave={handleToggleSave}
         onShowLikedBy={handleShowLikedBy}
      />

      <PostCaption post={post} />

      {/* Quick View comments toggle */}
      {commentCount > 0 && (
        <button 
          onClick={handleToggleComments} 
          className="px-0 text-[14px] text-base-content/50 font-medium hover:text-base-content/70 mb-1 inline-block transition-colors"
        >
          {showComments ? `Hide all comments` : `View all ${commentCount} comments`}
        </button>
      )}

      {/* Expanded Comments Trace */}
      <AnimatePresence>
          {showComments && post.comments?.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, height: 0 }}
               animate={{ opacity: 1, height: "auto" }}
               exit={{ opacity: 0, height: 0 }}
               className="px-0 mt-2 space-y-4 pt-1 overflow-hidden"
            >
              {post.comments.map((comment, index) => (
                <div key={comment._id || `comm-${index}`} className="flex gap-3">
                  <div className="avatar w-8 h-8 rounded-full overflow-hidden flex-shrink-0 cursor-pointer border border-base-content/10">
                    <img src={comment.profilePic || "/avatar.png"} alt={comment.fullName} className="object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="flex-1 text-[14px] leading-[18px]">
                    <div className="flex items-center flex-wrap gap-x-1">
                        <span className="font-semibold cursor-pointer hover:opacity-50">{comment.fullName}</span>
                        {(comment.isVerified || comment.role === "admin") && (
                            <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                               <BadgeCheck className="size-3 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                            </div>
                        )}
                        <span className="break-words ml-0.5">{comment.text}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-base-content/50 font-medium select-none">
                      <span>{timeAgoShort(comment.createdAt || Date.now())}</span>
                      <button className="hover:opacity-70 font-semibold cursor-pointer">Reply</button>
                    </div>
                  </div>
                  <button className="self-center pr-2">
                    <Heart className="size-3 text-base-content/50 hover:text-base-content cursor-pointer transition-colors" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
      </AnimatePresence>

      <PostCommentInput 
         onComment={handleComment}
         isCommenting={isCommenting}
      />
    </div>
  );
});
PostCard.displayName = "PostCard";

// === MAIN FEED ROOT ===
const PostsFeed = memo(({ posts, setPosts }) => {
  const { authUser } = useAuthUser();
  const [likedByPostId, setLikedByPostId] = useState(null);
  const [viewingDP, setViewingDP] = useState(null);

  const isPremium = authUser?.role === "admin" || authUser?.isPremium;

  // Render Pipeline Guard
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-32 opacity-60">
        <div className="relative inline-block mb-6">
          <MessageSquare className="w-16 h-16 mx-auto opacity-10" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute -top-1 -right-1 size-4 bg-primary rounded-full"
          />
        </div>
        <p className="text-xl font-black italic uppercase tracking-tighter">
          No Posts Yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0 sm:space-y-2">
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
              <div className="max-w-[470px] mx-auto mt-4 sm:mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <PostAd index={Math.floor(index / 4)} />
              </div>
            )}
          </div>
        );
      })}

      {/* Global Hoisted Modals */}
      <AnimatePresence>
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
              isVerified={viewingDP.isVerified}
              onClose={() => setViewingDP(null)}
            />
          )}
      </AnimatePresence>
    </div>
  );
});
PostsFeed.displayName = "PostsFeed";

export default PostsFeed;
