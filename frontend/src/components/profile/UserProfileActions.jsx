import { memo } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toggleFollow } from "../../lib/api";
import { MessageCircle, Heart, UserPlus, UserCheck } from "lucide-react";

import toast from "react-hot-toast";

const UserProfileActions = memo(({ userId, authUser, user }) => {
    const queryClient = useQueryClient();

    const { mutate: followMutation, isPending: isFollowingPending } = useMutation({
        mutationFn: () => toggleFollow(userId),
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ["userProfile", userId] });
            const previousUser = queryClient.getQueryData(["userProfile", userId]);
            queryClient.setQueryData(["userProfile", userId], (old) => {
                if (old) {
                    const willFollow = !old.isFollowing;
                    return { 
                        ...old, 
                        isFollowing: willFollow,
                        followersCount: Math.max(0, (old.followersCount || 0) + (willFollow ? 1 : -1))
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
            toast.error(err.response?.data?.message || "Failed to update follow status");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        }
    });

    const isFollowing = user?.isFollowing;


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
            
            <button
                onClick={() => followMutation()}
                disabled={isFollowingPending}
                className={`btn btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2 ${
                    isFollowing 
                        ? "btn-base-200 border-base-300" 
                        : "btn-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
            >
                {isFollowing ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
                {isFollowing ? "Following" : "Follow"}
            </button>
        </div>
    );

});

UserProfileActions.displayName = "UserProfileActions";

export default UserProfileActions;
