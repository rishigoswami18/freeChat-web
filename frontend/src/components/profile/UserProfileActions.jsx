import { memo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendFriendRequest, unfriend } from "../../lib/api";
import { MessageCircle, UserX, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

const UserProfileActions = memo(({ userId, authUser, user }) => {
    const queryClient = useQueryClient();

    const { mutate: addFriendMutation, isPending: isAddingFriend } = useMutation({
        mutationFn: () => sendFriendRequest(userId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });
            const previousUser = queryClient.getQueryData(["userProfile", userId]);
            queryClient.setQueryData(["userProfile", userId], (old) => {
                if (old) return { ...old, friendRequestSent: true };
                return old;
            });
            return { previousUser };
        },
        onError: (err, _, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(["userProfile", userId], context.previousUser);
            }
            toast.error(err.response?.data?.message || "Failed to send request");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        }
    });

    const { mutate: unfriendMutation, isPending: isUnfriending } = useMutation({
        mutationFn: () => unfriend(userId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });
            const previousUser = queryClient.getQueryData(["userProfile", userId]);
            queryClient.setQueryData(["userProfile", userId], (old) => {
                if (old) {
                    return { 
                        ...old, 
                        isFriend: false, 
                        friendCount: Math.max(0, (old.friendCount || 0) - 1)
                    };
                }
                return old;
            });
            return { previousUser };
        },
        onError: (err, _, context) => {
            if (context?.previousUser) {
                queryClient.setQueryData(["userProfile", userId], context.previousUser);
            }
            toast.error(err.response?.data?.message || "Failed to unfriend");
        },
        onSettled: () => {
             queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
             queryClient.invalidateQueries({ queryKey: ["authUser"] });
        }
    });

    // Determine current friendship status efficiently
    const isSelf = authUser?._id === userId;
    const isFriend = authUser?.friends?.includes(userId) || user?.isFriend;
    const hasSentRequest = user?.friendRequestSent;

    const handleShare = () => {
        const url = `${window.location.origin}/user/${userId}`;
        navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
    };

    if (isSelf) {
        return (
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 pt-2 w-full">
                <Link to="/profile" className="btn btn-base-300 btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case">
                    Edit Profile
                </Link>
                <button
                    onClick={handleShare}
                    aria-label="Share Profile Link"
                    className="btn btn-base-300 btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case"
                >
                    Share Profile
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 pt-2 w-full">
            <Link to={`/chat/${userId}`} className="btn btn-primary btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2 focus:ring-2 focus:ring-primary/50">
                <MessageCircle className="size-4" aria-hidden="true" /> Message
            </Link>
            
            {isFriend ? (
                <button
                    onClick={() => unfriendMutation()}
                    disabled={isUnfriending}
                    aria-label={`Unfriend ${user?.fullName}`}
                    className="btn btn-error btn-outline btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2 disabled:opacity-50"
                >
                    <UserX className="size-4" aria-hidden="true" /> {isUnfriending ? "Processing..." : "Unfriend"}
                </button>
            ) : (
                <button
                    onClick={() => addFriendMutation()}
                    disabled={isAddingFriend || hasSentRequest}
                    aria-label={hasSentRequest ? "Friend request sent" : `Send friend request to ${user?.fullName}`}
                    className={`btn btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2 ${
                        hasSentRequest 
                            ? "btn-disabled bg-base-300 text-base-content/40 cursor-not-allowed" 
                            : "btn-base-200 hover:btn-primary"
                    }`}
                >
                    <UserPlus className="size-4" aria-hidden="true" /> 
                    {isAddingFriend ? "Sending..." : hasSentRequest ? "Sent" : "Add Friend"}
                </button>
            )}
        </div>
    );
});

UserProfileActions.displayName = "UserProfileActions";

export default UserProfileActions;
