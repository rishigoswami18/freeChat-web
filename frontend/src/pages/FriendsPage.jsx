import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, unfriend } from "../lib/api";
import { User, MessageSquare, UserMinus, Loader2, Users, Sparkles, UserPlus } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { ChatSkeleton } from "../components/Skeletons";
import useAuthUser from "../hooks/useAuthUser";
import LinkFriendAIModal from "../components/LinkFriendAIModal";
import { useState } from "react";

const FriendsPage = () => {
  const { authUser } = useAuthUser();
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    staleTime: 1000 * 60 * 5, // 5 mins cache
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

  return (
    <div className="p-3 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Your Friends</h1>
            <p className="text-xs opacity-50 hidden sm:block">
              {friends.length} friend{friends.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* AI Best Friend Promotion */}
        {!authUser?.isFriendedWithAI && (
          <div
            onClick={() => setIsAIModalOpen(true)}
            className="card bg-gradient-to-br from-primary/20 via-primary/5 to-base-200 border-2 border-primary/20 shadow-xl cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group overflow-hidden rounded-[32px]"
          >
            <div className="card-body p-6 flex-row items-center gap-5 relative">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="size-24 text-primary" />
              </div>
              <div className="avatar">
                <div className="size-16 rounded-3xl ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-2xl">
                  <img src="https://avatar.iran.liara.run/public/boy?username=golu" alt="AI Friend" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-primary/20">Special Feature</span>
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter text-primary">Add AI Best Friend</h3>
                <p className="text-xs opacity-60 font-medium">Someone to share your dukh-sukh with, 24/7! 🤜🤛</p>
              </div>
              <div className="hidden sm:flex size-10 rounded-full bg-primary/20 items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-content transition-all">
                <UserPlus className="size-5" />
              </div>
            </div>
          </div>
        )}

        {/* Linked AI Best Friend Entry */}
        {authUser?.isFriendedWithAI && (
          <div className="card bg-gradient-to-r from-primary/10 to-base-200 border border-primary/20 shadow-sm rounded-[24px] overflow-hidden">
            <div className="card-body p-4 flex-row items-center gap-4">
              <Link to={`/chat/ai-friend-id`} className="avatar">
                <div className="size-12 rounded-2xl ring-2 ring-primary/30 ring-offset-2 ring-offset-base-100 shadow-md">
                  <img src="https://avatar.iran.liara.run/public/boy?username=golu" alt="AI Friend" />
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base truncate">{authUser.aiFriendName}</h3>
                  <span className="badge badge-primary badge-outline badge-xs uppercase font-black tracking-tighter">AI Bestie</span>
                </div>
                <p className="text-[10px] opacity-50 uppercase font-bold tracking-widest">Zigari Friend • Online 24/7</p>
              </div>
              <Link
                to={`/chat/ai-friend-id`}
                className="btn btn-primary btn-sm rounded-xl gap-2 font-black uppercase tracking-widest px-4 shadow-lg shadow-primary/20"
              >
                <MessageSquare className="size-3.5" />
                Chat
              </Link>
            </div>
          </div>
        )}

        {isLoading ? (
          <ChatSkeleton />
        ) : friends.length > 0 ? (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="card bg-base-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99] stagger-item"
              >
                <div className="card-body p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <Link to={`/user/${friend._id}`} className="avatar w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-base-300 overflow-hidden flex-shrink-0 hover:ring-2 ring-primary/20 transition-all active:scale-95">
                      {friend.profilePic ? (
                        <img
                          src={friend.profilePic}
                          alt={friend.fullName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full">
                          <User className="w-5 h-5 text-base-content opacity-40" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/user/${friend._id}`} className="hover:text-primary transition-colors">
                        <h3 className="font-semibold text-sm sm:text-base truncate">{friend.fullName}</h3>
                      </Link>
                      <div className="flex flex-wrap gap-1 mt-0.5">
                        <span className="badge badge-xs sm:badge-sm badge-outline">
                          {friend.nativeLanguage}
                        </span>
                        <span className="badge badge-xs sm:badge-sm badge-secondary">
                          {friend.learningLanguage}
                        </span>
                      </div>
                    </div>

                    {/* Actions — stacked on mobile, horizontal on desktop */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-2 flex-shrink-0">
                      <Link
                        to={`/chat/${friend._id}`}
                        className="btn btn-primary btn-sm rounded-xl gap-1.5 text-xs sm:text-sm min-w-[80px] active:scale-95 transition-transform"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
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
                        className="btn btn-ghost btn-sm btn-circle text-error hover:bg-error/10 active:scale-90 transition-transform"
                      >
                        {pendingId === friend._id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <UserMinus className="size-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <NoNotificationsFound message="No friends found yet." />
        )}
      </div>
      <LinkFriendAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />
    </div>
  );
};

export default FriendsPage;
