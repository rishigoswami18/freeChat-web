import { useState, useRef, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Send,
  BadgeCheck,
  MoreHorizontal,
  Bookmark,
  Lock,
  Unlock,
  Share2,
  DollarSign,
  Loader2
} from "lucide-react";
import { likePost, commentOnPost, unlockPost, deletePost } from "../../lib/api";
import useAuthUser from "../../hooks/useAuthUser";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const timeAgoShort = (date) => {
  const seconds = Math.floor((Date.now() - new Date(date)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(date).toLocaleDateString();
};

const PremiumPostCard = ({ post, setLikedByPostId, setViewingDP }) => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [showHeartOverlay, setShowHeartOverlay] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  
  const lastTap = useRef(0);
  
  const isLiked = post?.likes?.includes(authUser?._id);
  const likeCount = post?.likes?.length || 0;
  const commentCount = post?.comments?.length || 0;
  const isLocked = post?.isLocked || (post?.isPaid && post?.mediaUrl === "LOCKED");
  const isOwnPost = (post?.userId?._id || post?.userId) === authUser?._id;

  const handleLike = useCallback(async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await likePost(post._id);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
    } catch {
      toast.error("Handshake Error");
    } finally {
      setIsLiking(false);
    }
  }, [isLiking, post._id, queryClient]);

  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      if (!isLiked) handleLike();
      setShowHeartOverlay(true);
      setTimeout(() => setShowHeartOverlay(false), 800);
    }
    lastTap.current = now;
  }, [isLiked, handleLike]);

  const handleUnlock = async () => {
    if (isUnlocking) return;
    setIsUnlocking(true);
    try {
        const res = await unlockPost(post._id);
        if (res.success) {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
            queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
            toast.success("Protocol Unlocked 💎");
        }
    } catch (err) {
        toast.error(err.response?.data?.message || "Unlock Protocol Failed");
    } finally {
        setIsUnlocking(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
        await commentOnPost(post._id, commentText);
        setCommentText("");
        queryClient.invalidateQueries({ queryKey: ["posts"] });
        queryClient.invalidateQueries({ queryKey: ["homeFeed"] });
        setShowComments(true);
        toast.success("Signal Relayed");
    } catch {
        toast.error("Broadcast Interrupted");
    } finally {
        setIsCommenting(false);
    }
  };

  return (
    <motion.article 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="w-full bg-white/[0.02] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 group/card hover:border-white/10 transition-colors duration-500"
    >
      {/* Header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link 
            to={`/user/${post.userId?._id || post.userId}`}
            className="relative size-11 rounded-2xl overflow-hidden ring-2 ring-white/10 group-hover/card:ring-primary/40 transition-all"
          >
            <img 
              src={post.profilePic || "/avatar.png"} 
              alt={post.fullName} 
              className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700" 
            />
          </Link>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <Link 
                  to={`/user/${post.userId?._id || post.userId}`} 
                  className="text-[14px] font-black text-white hover:text-primary transition-colors leading-[18px]"
              >
                {post.fullName || "user"}
              </Link>
              {(post.role === "admin" || post.isVerified) && (
                <BadgeCheck className="size-4 text-primary fill-[#020617]" />
              )}
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">
                  {timeAgoShort(post.createdAt)}
              </span>
            </div>
            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] leading-none">
                Professional Account Verified
            </p>
          </div>
        </div>
        <button className="p-2 text-white/20 hover:text-white transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Caption Area (If present and not locked strictly) */}
      {post.content && !isLocked && (
        <div className="px-6 pb-4">
            <p className="text-sm font-bold text-white/90 leading-relaxed italic">
                {post.content}
            </p>
        </div>
      )}

      {/* Main Signal Display (Media) */}
      <div 
        className="relative aspect-square w-full bg-white/[0.01] overflow-hidden flex items-center justify-center cursor-pointer group"
        onDoubleClick={handleDoubleTap}
      >
        <AnimatePresence>
          {showHeartOverlay && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.2, 1], opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
            >
              <Heart className="size-32 text-primary fill-primary drop-shadow-[0_0_20px_rgba(99,101,241,0.5)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {isLocked ? (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#020617]/95 backdrop-blur-3xl px-8 text-center space-y-6">
            <div className="size-20 rounded-[32px] bg-primary/10 border border-primary/20 flex items-center justify-center mb-2 shadow-2xl group-hover:scale-110 transition-transform duration-700">
              <Lock size={36} className="text-primary" />
            </div>
            <div className="space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase">Exclusive Content Gated</h3>
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-[280px]">
                  Unlock this professional insight for <span className="text-primary font-black">{post.price || 99} Gems</span>
                </p>
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); handleUnlock(); }}
                disabled={isUnlocking}
                className="h-14 px-10 bg-primary text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3 disabled:opacity-50"
            >
              {isUnlocking ? <Loader2 className="size-5 animate-spin" /> : <>Unlock Content <DollarSign size={16} /></>}
            </button>
          </div>
        ) : null}

        {!isLocked && post.mediaUrl ? (
          post.mediaType === "video" ? (
            <video src={post.mediaUrl} className="w-full h-full object-cover" controls playsInline />
          ) : (
            <img src={post.mediaUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]" />
          )
        ) : !isLocked && post.content && (
          <div className="p-12 text-center">
            <p className="text-2xl font-black text-white italic tracking-tighter leading-tight italic">"{post.content}"</p>
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-6">
            <button onClick={handleLike} className="flex items-center gap-2 group">
              <div className={`p-2 rounded-xl transition-all ${isLiked ? 'bg-primary/10 text-primary' : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}>
                <Heart size={22} className={isLiked ? 'fill-primary' : ''} />
              </div>
              <span className={`text-xs font-black tracking-widest ${isLiked ? 'text-white' : 'text-white/40'}`}>{likeCount}</span>
            </button>

            <button onClick={() => setShowComments(!showComments)} className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-white transition-all">
                <MessageCircle size={22} />
              </div>
              <span className="text-xs font-black text-white/40 group-hover:text-white tracking-widest transition-colors">{commentCount}</span>
            </button>

            <button className="flex items-center gap-2 group">
              <div className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all">
                <Share2 size={22} />
              </div>
            </button>
          </div>
          <button 
            onClick={() => setIsSaved(!isSaved)}
            className={`p-2 rounded-xl transition-all ${isSaved ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Bookmark size={22} className={isSaved ? 'fill-white' : ''} />
          </button>
        </div>
      </div>

      {/* Expansion Area: Comments */}
      <AnimatePresence>
        {showComments && (
            <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-6 pb-6 overflow-hidden border-t border-white/5 pt-6 bg-white/[0.01]"
            >
                <div className="space-y-4 max-h-[250px] overflow-y-auto no-scrollbar mb-6">
                    {(post.comments || []).map((comment, i) => (
                        <div key={i} className="flex gap-3 items-start">
                            <div className="size-8 rounded-xl overflow-hidden shrink-0 border border-white/10">
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
                    {(post.comments || []).length === 0 && (
                        <p className="text-center py-4 text-[10px] font-black uppercase tracking-widest text-white/20">No comments yet</p>
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
                        className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-primary btn-xs rounded-xl h-10 px-4 font-black uppercase text-[9px] tracking-widest"
                    >
                        {isCommenting ? <Loader2 size={12} className="animate-spin" /> : "Send"}
                    </button>
                </form>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default memo(PremiumPostCard);
