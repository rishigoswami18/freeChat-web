import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFriends, unfriend } from "../lib/api";
import { User, MessageSquare, UserMinus, Loader2, Users } from "lucide-react";
import NoNotificationsFound from "../components/NoNotificationsFound";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const FriendsPage = () => {
  const queryClient = useQueryClient();
  const { data: friends = [], isLoading } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const res = await getFriends();
      return res;
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : friends.length > 0 ? (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend._id}
                className="card bg-base-200 shadow-sm hover:shadow-md transition-all active:scale-[0.99]"
              >
                <div className="card-body p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="avatar w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-base-300 overflow-hidden flex-shrink-0">
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
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{friend.fullName}</h3>
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
    </div>
  );
};

export default FriendsPage;
