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
  Bookmark,
  Lock,
  DollarSign,
  Sparkles,
  Eye
} from "lucide-react";
import { likePost, commentOnPost, sharePost, deletePost, unlockPost } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import toast from "react-hot-toast";

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

// === SUBCOMPONENT: Post Header ===
const PostHeader = memo(({ post, authUser, onDeletePost, isDeleting }) => {
  const isOwnPost = (post?.userId?._id || post?.userId) === authUser?._id;

  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <Link 
          to={(post.userId?._id || post.userId) ? `/user/${(post.userId?._id || post.userId)}` : "#"}
          className="relative size-10 rounded-xl overflow-hidden ring-2 ring-white/10 hover:ring-primary/40 transition-all"
        >
          <img 
            src={post.profilePic || "/avatar.png"} 
            alt={post.fullName} 
            className="w-full h-full object-cover" 
          />
        </Link>
        
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <Link 
                to={(post.userId?._id || post.userId) ? `/user/${(post.userId?._id || post.userId)}` : "#"}
                className="text-sm font-black text-white hover:text-primary transition-colors"
            >
              {post.fullName || "Creator"}
            </Link>
            {(post.role === "admin" || post.isVerified) && (
              <BadgeCheck className="size-3.5 text-primary fill-[#020617]" />
            )}
            <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">
                {timeAgoShort(post.createdAt)}
            </span>
          </div>
          <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
              Verified Professional
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
         {isOwnPost && (
            <button 
              onClick={onDeletePost}
              className="p-2 text-white/20 hover:text-rose-500 transition-colors"
              disabled={isDeleting}
            >
              {isDeleting ? <span className="loading loading-spinner size-3.5" /> : <Trash2 size={16} />}
            </button>
         )}
         <button className="p-2 text-white/20 hover:text-white transition-colors">
            <MoreHorizontal size={20} />
         </button>
      </div>
    </div>
  );
});
PostHeader.displayName = "PostHeader";

// === SUBCOMPONENT: Post Media ===
const PostMedia = memo(({ post, onDoubleTap, showHeartOverlay, onUnlock }) => {
  const isLocked = post.isLocked || (post.isPaid && post.mediaUrl === "LOCKED");
  
  return (
    <div
      className="relative w-full aspect-square sm:aspect-auto sm:min-h-[400px] bg-white/[0.02] overflow-hidden flex justify-center items-center cursor-pointer group"
      onClick={onDoubleTap}
    >
      <AnimatePresence>
        {showHeartOverlay && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <Heart className="size-24 text-white fill-white shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {isLocked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 z-20">
            <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-3xl" />
            <div className="relative size-24 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-700">
                <Lock size={40} strokeWidth={1.5} />
            </div>
            <div className="relative space-y-2">
                <p className="text-xl font-black italic tracking-tighter uppercase">Premium Content Locked</p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
                    This content is protected. Access requires a contribution of <span className="text-primary">{post.price} Gems</span>.
                </p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onUnlock(); }}
                className="relative btn btn-primary rounded-2xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
                Unlock Content <DollarSign size={16} className="ml-2" />
            </button>
        </div>
      ) : post.mediaUrl ? (
        post.mediaType === "video" ? (
          <video
            src={post.mediaUrl}
            controls
            className="w-full h-full object-cover"
            playsInline
            preload="metadata"
          />
        ) : (
          <img
            src={post.mediaUrl}
            alt="Post"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
            loading="lazy"
          />
        )
      ) : (
         <div className="p-12 w-full text-center min-h-[300px] flex items-center justify-center">
            <p className="text-2xl font-black italic tracking-tight text-white/90 leading-tight">
                {post.content}
            </p>
         </div>
      )}
    </div>
  );
});
PostMedia.displayName = "PostMedia";

// === SUBCOMPONENT: Post Interactions ===
const PostActions = memo(({ isLiked, likeCount, commentCount, onLike, onShare, onToggleComments, isSaved, onToggleSave }) => {
    return (
        <div className="flex items-center justify-between px-6 py-5">
            <div className="flex items-center gap-6">
                <button onClick={onLike} className="flex items-center gap-2 group">
                  <div className={`p-2 rounded-xl transition-all ${isLiked ? "bg-rose-500/10 text-rose-500" : "bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white"}`}>
                    <Heart size={20} className={isLiked ? "fill-rose-500" : ""} />
                  </div>
                  <span className={`text-xs font-black tracking-widest ${isLiked ? "text-white" : "text-white/40"}`}>{likeCount}</span>
                </button>

                <button onClick={onToggleComments} className="flex items-center gap-2 group">
                  <div className="p-2 rounded-xl bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <MessageCircle size={20} />
                  </div>
                  <span className="text-xs font-black text-white/40 group-hover:text-white transition-colors tracking-widest">{commentCount}</span>
                </button>

                <button onClick={onShare} className="flex items-center gap-2 group">
                  <div className="p-2 rounded-xl bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                    <Share2 size={20} />
                  </div>
                </button>
            </div>

            <button onClick={onToggleSave} className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Bookmark size={20} className={isSaved ? "fill-white" : ""} />
            </button>
        </div>
    );
});
PostActions.displayName = "PostActions";

// === MAIN CARD COMPONENT ===
const PostCard = memo(({ post, setPosts }) => {
  const { authUser } = useAuthUser();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  
  const lastTap = useRef(0);
  
  const isLiked = post?.likes?.includes(authUser?._id) || false;
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;

  const handleDelete = useCallback(async () => {
    if (!window.confirm("Authorize permanent deletion of this broadcast?")) return;
    setIsDeleting(true);
    try {
      await deletePost(post._id);
      setPosts((prev) => prev.filter((p) => p && p._id !== post._id));
      toast.success("Post Removed");
    } catch {
      toast.error("Operation Failed");
    } finally {
      setIsDeleting(false);
    }
  }, [post._id, setPosts]);

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    const wasLiked = isLiked;
    setIsLiking(true);

    const newLikes = wasLiked 
        ? post.likes.filter(id => id !== authUser?._id)
        : [...(post.likes || []), authUser?._id];

    setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: newLikes } : p));

    try {
      const data = await likePost(post._id);
      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: data.likes } : p));
    } catch {
      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, likes: post.likes } : p));
      toast.error("Connection Error");
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, isLiked, post._id, post.likes, authUser?._id, setPosts]);

  const handleDoubleTap = useCallback((e) => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
      return;
    }
    lastTap.current = now;
  }, [isLiked, handleLike]);

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      const newComment = await commentOnPost(post._id, commentText);
      setPosts(prev => prev.map(p => p?._id === post._id ? { ...p, comments: [...(p.comments || []), newComment] } : p));
      setCommentText("");
      setShowComments(true);
      toast.success("Comment Posted");
    } catch {
      toast.error("Post Interrupted");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleUnlock = async () => {
    try {
        const res = await unlockPost(post._id);
        if (res.success) {
            setPosts(prev => prev.map(p => p._id === post._id ? { ...p, isLocked: false, mediaUrl: res.mediaUrl } : p));
            toast.success("Protocol Unlocked 💎");
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Unlock Protocol Failed");
    }
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl mb-8 group/card"
    >
      <PostHeader post={post} authUser={authUser} onDeletePost={handleDelete} isDeleting={isDeleting} />
      
      {post.content && post.mediaUrl && (
        <div className="px-6 pb-4">
            <p className="text-sm font-bold text-white/80 leading-relaxed italic">
                {post.caption && <span className="text-primary mr-2">[{post.caption.toUpperCase()}]</span>}
                {post.content}
            </p>
        </div>
      )}

      <PostMedia post={post} onDoubleTap={handleDoubleTap} showHeartOverlay={showHeartOverlay} onUnlock={handleUnlock} />

      <PostActions 
         isLiked={isLiked}
         likeCount={likeCount}
         commentCount={commentCount}
         onLike={handleLike}
         onShare={() => {
            navigator.clipboard.writeText(`${window.location.origin}/posts?id=${post._id}`);
            toast.success("Nexus Link Copied");
         }}
         onToggleComments={() => setShowComments(!showComments)}
         isSaved={isSaved}
         onToggleSave={() => setIsSaved(!isSaved)}
      />

      <AnimatePresence>
        {showComments && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6 overflow-hidden border-t border-white/5 pt-6 bg-white/[0.01]"
            >
                <div className="space-y-4 max-h-[300px] overflow-y-auto no-scrollbar mb-6">
                    {(post.comments || []).map((comment, i) => (
                        <div key={i} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="size-8 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                <img src={comment.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black italic text-white/50">{comment.fullName}</span>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">{timeAgoShort(comment.createdAt)}</span>
                                </div>
                                <p className="text-xs font-bold text-white/80 leading-snug">{comment.text}</p>
                            </div>
                        </div>
                    ))}
                    {(!post.comments || post.comments.length === 0) && (
                        <div className="py-4 text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 italic">No comments yet</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleComment} className="relative">
                    <input 
                        type="text" 
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-bold focus:outline-none focus:border-primary/50 transition-all placeholder:text-white/20"
                    />
                    <button 
                        type="submit"
                        disabled={!commentText.trim() || isCommenting}
                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-primary btn-xs rounded-lg h-10 px-4 font-black uppercase text-[9px] tracking-widest disabled:opacity-30"
                    >
                        {isCommenting ? <Loader2 size={12} className="animate-spin" /> : "Send"}
                    </button>
                </form>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
PostCard.displayName = "PostCard";

// === MAIN FEED ROOT ===
const PostsFeed = memo(({ posts, setPosts }) => {
  if (!posts || posts.length === 0) return null;

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post?._id} post={post} setPosts={setPosts} />
      ))}
    </div>
  );
});
PostsFeed.displayName = "PostsFeed";

export default PostsFeed;
