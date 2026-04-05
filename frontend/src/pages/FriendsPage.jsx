import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, unfriend } from "../lib/api";
import { User, MessageSquare, UserMinus, Loader2, Users, Sparkles, UserPlus, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import LinkFriendAIModal from "../components/LinkFriendAIModal";
import { useState } from "react";
import { motion } from "framer-motion";

const FriendsPage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: () => getFriends(),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  });

  const { mutate: doUnfriend, variables: pendingId } = useMutation({
    mutationFn: unfriend,
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to unfriend");
    }
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        
        {/* Header */}
        <header>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10">
              <Users className="size-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Connections</h1>
              <p className="text-xs text-white/30 font-medium">
                {friends.length} professional connection{friends.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </header>

        {/* AI Best Friend Promo */}
        {!authUser?.isFriendedWithAI && (
          <motion.div
            whileTap={{ scale: 0.99 }}
            onClick={() => setIsAIModalOpen(true)}
            className="p-5 rounded-2xl bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent border border-indigo-500/10 cursor-pointer group transition-all hover:border-indigo-500/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <Sparkles className="size-20 text-indigo-400" />
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="size-14 rounded-2xl overflow-hidden ring-2 ring-indigo-500/20 shadow-lg">
                <img src={authUser?.aiFriendPic || "/ai-bestfriend.png"} alt="AI Co-Pilot" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="text-[9px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md">Executive Feature</span>
                <h3 className="text-base font-bold mt-1 text-white">Add AI Co-Pilot</h3>
                <p className="text-[11px] text-white/40 font-medium">Your 24/7 strategic partner and advisor.</p>
              </div>
              <div className="hidden sm:flex size-10 rounded-xl bg-indigo-500/10 items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                <UserPlus className="size-5" />
              </div>
            </div>
          </motion.div>
        )}

        {/* AI Best Friend Entry */}
        {authUser?.isFriendedWithAI && (
          <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-center gap-4">
            <Link to="/chat/ai-friend-id" className="size-12 rounded-xl overflow-hidden ring-1 ring-indigo-500/20">
              <img src={authUser?.aiFriendPic || "/ai-bestfriend.png"} alt="AI Friend" className="w-full h-full object-cover" />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm truncate">{authUser.aiFriendName}</h3>
                <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded-md uppercase">Co-Pilot</span>
              </div>
              <p className="text-[10px] text-white/30 font-medium mt-0.5">Active Assistant</p>
            </div>
            <Link
              to="/chat/ai-friend-id"
              className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5"
            >
              <MessageSquare className="size-3.5" /> Chat
            </Link>
          </div>
        )}

        {/* Friends List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-[72px] rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
            ))}
          </div>
        ) : friends.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-2"
          >
            {friends.map((friend) => (
              <motion.div
                key={friend._id}
                variants={itemVariants}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Link to={`/user/${friend._id}`} className="size-12 rounded-xl overflow-hidden bg-white/5 ring-1 ring-white/10 group-hover:ring-indigo-500/20 transition-all shrink-0">
                    {friend.profilePic ? (
                      <img src={friend.profilePic} alt={friend.fullName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full">
                        <User className="size-5 text-white/20" />
                      </div>
                    )}
                  </Link>

                  <div className="flex-1 min-w-0">
                    <Link to={`/user/${friend._id}`} className="flex items-center gap-1.5 hover:text-indigo-400 transition-colors">
                      <h3 className="font-semibold text-sm truncate">{friend.fullName}</h3>
                      {(friend.role === "admin" || friend.isVerified) && (
                        <BadgeCheck className="size-3.5 text-sky-400 fill-sky-400/10 shrink-0" />
                      )}
                    </Link>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[10px] text-white/30 font-medium">{friend.nativeLanguage}</span>
                      <span className="text-[10px] text-white/20">→</span>
                      <span className="text-[10px] text-indigo-400/60 font-medium">{friend.learningLanguage}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link
                      to={`/chat/${friend._id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-semibold transition-all active:scale-95 flex items-center gap-1.5"
                    >
                      <MessageSquare className="size-3.5" />
                      <span className="hidden sm:inline">Message</span>
                      <span className="sm:hidden">Chat</span>
                    </Link>

                    <button
                      onClick={() => {
                        if (window.confirm(`Unfriend ${friend.fullName}?`)) {
                          doUnfriend(friend._id);
                        }
                      }}
                      disabled={pendingId === friend._id}
                      className="size-9 rounded-xl flex items-center justify-center bg-white/[0.03] hover:bg-rose-500/10 text-white/30 hover:text-rose-400 border border-white/5 transition-all active:scale-90"
                    >
                      {pendingId === friend._id ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <UserMinus className="size-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center opacity-50">
            <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <Users className="size-8 text-white/20" />
            </div>
            <h3 className="text-base font-bold mb-1">No connections yet</h3>
            <p className="text-xs text-white/30 max-w-[200px]">Start exploring to expand your professional network.</p>
          </div>
        )}
      </div>
      <LinkFriendAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default FriendsPage;
