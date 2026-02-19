import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import {
    getCoupleStatus,
    sendCoupleRequest,
    acceptCoupleRequest,
    unlinkCouple,
    getFriends,
    getMembershipStatus,
} from "../lib/api";
import {
    Heart,
    HeartOff,
    Loader2,
    Search,
    CalendarHeart,
    User,
    HeartHandshake,
    Clock,
    Crown,
    Lock,
} from "lucide-react";
import toast from "react-hot-toast";

const CoupleProfilePage = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch couple status
    const { data: coupleData, isLoading: coupleLoading } = useQuery({
        queryKey: ["coupleStatus"],
        queryFn: getCoupleStatus,
    });

    // Fetch friends list (for sending couple requests)
    const { data: friends = [] } = useQuery({
        queryKey: ["friends"],
        queryFn: getFriends,
    });

    // Check membership
    const { data: memberData, isLoading: memberLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
    });

    // Send couple request
    const { mutate: sendRequest, isPending: isSending } = useMutation({
        mutationFn: sendCoupleRequest,
        onSuccess: () => {
            toast.success("Couple request sent! 💕");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
    });

    // Accept couple request
    const { mutate: acceptRequest, isPending: isAccepting } = useMutation({
        mutationFn: acceptCoupleRequest,
        onSuccess: () => {
            toast.success("You're now a couple! 💑");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to accept"),
    });

    // Unlink couple
    const { mutate: doUnlink, isPending: isUnlinking } = useMutation({
        mutationFn: unlinkCouple,
        onSuccess: () => {
            toast.success("Couple unlinked");
            queryClient.invalidateQueries({ queryKey: ["coupleStatus"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to unlink"),
    });

    if (coupleLoading || memberLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // Membership gate
    if (!memberData?.isMember) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                    <HeartHandshake className="text-pink-500" />
                    Couple Profile
                </h1>
                <div className="card bg-base-200 border border-amber-500/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-base-300 flex items-center justify-center mb-2">
                            <Lock className="size-8 opacity-40" />
                        </div>
                        <h2 className="text-lg font-bold">Premium Feature</h2>
                        <p className="text-sm opacity-60 max-w-xs">
                            Couple Profiles is a premium feature. Subscribe to freeChat Premium to link your profile with your partner.
                        </p>
                        <Link to="/membership" className="btn btn-primary gap-2 mt-4">
                            <Crown className="size-4" />
                            Subscribe — ₹49/month
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { coupleStatus, partner, anniversary } = coupleData || {};

    // Calculate days together
    const getDaysTogether = () => {
        if (!anniversary) return 0;
        return Math.floor((Date.now() - new Date(anniversary)) / (1000 * 60 * 60 * 24));
    };

    // Who initiated the request? If partnerId sent to me, I need to accept
    const iReceivedRequest =
        coupleStatus === "pending" && partner;

    const filteredFriends = friends.filter((f) =>
        f.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                <HeartHandshake className="text-pink-500" />
                Couple Profile
            </h1>

            {/* ===== COUPLED STATE ===== */}
            {coupleStatus === "coupled" && partner && (
                <div className="card bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20 shadow-xl">
                    <div className="card-body items-center text-center">
                        {/* Partner avatars */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="avatar">
                                <div className="w-20 h-20 rounded-full ring ring-pink-500/30 ring-offset-2 ring-offset-base-100">
                                    <img src={authUser?.profilePic || "/avatar.png"} alt="You" />
                                </div>
                            </div>
                            <Heart className="size-8 text-pink-500 fill-pink-500 animate-pulse" />
                            <div className="avatar">
                                <div className="w-20 h-20 rounded-full ring ring-pink-500/30 ring-offset-2 ring-offset-base-100">
                                    <img src={partner.profilePic || "/avatar.png"} alt={partner.fullName} />
                                </div>
                            </div>
                        </div>

                        <h2 className="text-lg font-bold">
                            {authUser?.fullName} & {partner.fullName}
                        </h2>

                        {partner.bio && (
                            <p className="text-sm opacity-70 max-w-xs">{partner.bio}</p>
                        )}

                        {/* Anniversary */}
                        <div className="flex items-center gap-2 mt-4 text-pink-400">
                            <CalendarHeart className="size-5" />
                            <span className="text-sm font-medium">
                                Together since {new Date(anniversary).toLocaleDateString()} •{" "}
                                {getDaysTogether()} days 💕
                            </span>
                        </div>

                        {/* Unlink Button */}
                        <button
                            onClick={() => doUnlink()}
                            disabled={isUnlinking}
                            className="btn btn-outline btn-error btn-sm mt-6 gap-2"
                        >
                            {isUnlinking ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <HeartOff className="size-4" />
                            )}
                            Unlink
                        </button>
                    </div>
                </div>
            )}

            {/* ===== PENDING STATE ===== */}
            {coupleStatus === "pending" && partner && (
                <div className="card bg-base-200 shadow-md">
                    <div className="card-body items-center text-center">
                        <Clock className="size-10 text-warning mb-2" />
                        <h2 className="text-lg font-bold">Couple Request Pending</h2>

                        <div className="flex items-center gap-3 mt-3">
                            <div className="avatar">
                                <div className="w-14 h-14 rounded-full">
                                    <img src={partner.profilePic || "/avatar.png"} alt={partner.fullName} />
                                </div>
                            </div>
                            <p className="font-medium">{partner.fullName}</p>
                        </div>

                        {iReceivedRequest && (
                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => acceptRequest(partner._id)}
                                    disabled={isAccepting}
                                    className="btn btn-primary btn-sm gap-2"
                                >
                                    {isAccepting ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        <Heart className="size-4" />
                                    )}
                                    Accept
                                </button>
                                <button
                                    onClick={() => doUnlink()}
                                    disabled={isUnlinking}
                                    className="btn btn-outline btn-sm gap-2"
                                >
                                    Decline
                                </button>
                            </div>
                        )}

                        {!iReceivedRequest && (
                            <p className="text-sm opacity-60 mt-3">
                                Waiting for {partner.fullName} to accept...
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* ===== SINGLE STATE ===== */}
            {(coupleStatus === "none" || !coupleStatus) && (
                <div className="space-y-6">
                    <div className="card bg-base-200 shadow-md">
                        <div className="card-body items-center text-center">
                            <Heart className="size-12 text-base-content/20 mb-2" />
                            <h2 className="text-lg font-bold">Find Your Partner</h2>
                            <p className="text-sm opacity-60">
                                Send a couple request to a friend to link your profiles together
                            </p>
                        </div>
                    </div>

                    {/* Search Friends */}
                    <div className="form-control">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                className="input input-bordered w-full pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Friends List */}
                    <div className="space-y-2">
                        {filteredFriends.length === 0 ? (
                            <p className="text-center text-sm opacity-50 py-8">
                                {friends.length === 0
                                    ? "Add some friends first to send a couple request"
                                    : "No friends match your search"}
                            </p>
                        ) : (
                            filteredFriends.map((friend) => (
                                <div
                                    key={friend._id}
                                    className="flex items-center justify-between p-3 bg-base-200 rounded-xl"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="w-10 h-10 rounded-full">
                                                {friend.profilePic ? (
                                                    <img src={friend.profilePic} alt={friend.fullName} />
                                                ) : (
                                                    <div className="bg-base-300 w-full h-full flex items-center justify-center">
                                                        <User className="size-4 opacity-40" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{friend.fullName}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => sendRequest(friend._id)}
                                        disabled={isSending}
                                        className="btn btn-primary btn-sm gap-1"
                                    >
                                        {isSending ? (
                                            <Loader2 className="size-3 animate-spin" />
                                        ) : (
                                            <Heart className="size-3" />
                                        )}
                                        Request
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CoupleProfilePage;
