import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecommendedUsers, sendFriendRequest, getOutgoingFriendReqs } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { BadgeCheck, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";

const RightSidebar = () => {
    const { authUser } = useAuthUser();
    
    const queryClient = useQueryClient();

    // Fetch recommended users for "Suggested for you"
    const { data: recommendedUsers = [], isLoading } = useQuery({
        queryKey: ["users"],
        queryFn: getRecommendedUsers,
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    });

    // Fetch outgoing requests to handle button states
    const { data: outgoingRequests = [] } = useQuery({
        queryKey: ["outgoingFriendReqs"],
        queryFn: getOutgoingFriendReqs,
        staleTime: 1000 * 60,
    });

    const { mutate: followUser, variables: pendingId } = useMutation({
        mutationFn: sendFriendRequest,
        onSuccess: () => {
            toast.success("Request sent!");
            queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to follow");
        }
    });

    // Take only the top 5 recommendations
    const suggestions = recommendedUsers.slice(0, 5);

    if (!authUser) return null;

    return (
        <aside className="w-[320px] hidden lg:block h-screen sticky top-0 pt-10 px-4 font-outfit text-base-content">
            {/* Current User Profile Switcher */}
            <div className="flex items-center justify-between mb-8 group">
                <Link to="/profile" className="flex items-center gap-4">
                    <div className="size-14 rounded-full overflow-hidden border border-white/10 shrink-0">
                        <img 
                            src={authUser?.profilePic || "/avatar.png"} 
                            alt={authUser?.fullName} 
                            className="size-full object-cover group-hover:scale-105 transition-transform"
                        />
                    </div>
                    <div>
                        <div className="font-semibold text-[15px] leading-tight group-hover:text-primary transition-colors flex items-center gap-1">
                            {authUser?.fullName?.replace(" ", "_").toLowerCase() || "user"}
                            {(authUser?.isVerified || authUser?.role === "admin") && (
                                <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                   <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <div className="text-[14px] text-base-content/60 font-normal mt-0.5">
                            {authUser?.fullName}
                        </div>
                    </div>
                </Link>
                <button className="text-[12px] font-bold text-primary hover:opacity-70 transition-colors">
                    Switch
                </button>
            </div>

            {/* Suggested for You Header */}
            <div className="flex items-center justify-between mb-4 mt-2">
                <span className="text-[14px] font-semibold text-base-content/50">Suggested for you</span>
                <Link to="/search" className="text-[12px] font-semibold hover:text-primary transition-colors">
                    See all
                </Link>
            </div>

            {/* Suggestions List */}
            <div className="space-y-4">
                
                {/* AI Coach Always Visible */}
                <div className="flex items-center justify-between">
                    <Link to="/chat/ai-coach-id" className="flex items-center gap-3 group min-w-0 pr-2">
                        <div className="size-11 rounded-full overflow-hidden border-2 border-green-500/50 shrink-0">
                            <img 
                                src="https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png" 
                                alt="Dr. Bond" 
                                className="size-full object-cover group-hover:scale-105 transition-transform bg-black"
                                onError={(e) => { e.target.src = "/avatar.png" }}
                            />
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                            <div className="font-semibold text-[14px] leading-tight group-hover:text-primary transition-colors truncate pb-0.5 flex items-center gap-1">
                                Dr. Bond <Sparkles className="size-3.5 text-green-400" />
                            </div>
                            <div className="text-[12px] text-green-500 font-medium truncate">
                                AI Relationship Coach
                            </div>
                        </div>
                    </Link>
                    <Link 
                        to="/chat/ai-coach-id"
                        className="text-[12px] font-bold text-primary-content bg-primary px-3 py-1.5 rounded-full hover:opacity-90 transition-colors ml-2 flex-shrink-0"
                    >
                        Chat
                    </Link>
                </div>

                {isLoading ? (
                    // Skeleton loader
                    Array.from({ length: 5 }).map((_, i) => (
                        <div key={`sk-${i}`} className="flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="size-11 rounded-full bg-white/10"></div>
                                <div className="space-y-2 py-1">
                                    <div className="h-3 bg-white/10 rounded w-24"></div>
                                    <div className="h-2.5 bg-white/5 rounded w-16"></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : suggestions.length > 0 ? (
                    suggestions.map((user) => (
                        <div key={user._id} className="flex items-center justify-between">
                            <Link to={`/user/${user._id}`} className="flex items-center gap-3 group min-w-0 pr-2">
                                <div className="size-11 rounded-full overflow-hidden border border-white/10 shrink-0">
                                    <img 
                                        src={user.profilePic || "/avatar.png"} 
                                        alt={user.fullName} 
                                        className="size-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="min-w-0 flex flex-col justify-center">
                                    <div className="font-semibold text-[14px] leading-tight group-hover:text-primary transition-colors truncate pb-0.5 flex items-center gap-1">
                                        {user.fullName}
                                        {(user.isVerified || user.role === "admin") && (
                                            <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                               <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[12px] text-base-content/50 font-normal truncate">
                                        {user.isTandemMatch ? "Suggested for you" : "New to BondBeyond"}
                                    </div>
                                </div>
                            </Link>
                            {outgoingRequests?.some(req => req.recipient?._id === user._id) ? (
                                <span className="text-[12px] font-bold text-white/30 ml-2 flex-shrink-0 cursor-default">
                                    Requested
                                </span>
                            ) : (
                                <button 
                                    onClick={() => followUser(user._id)}
                                    disabled={pendingId === user._id}
                                    className="text-[12px] font-bold text-primary hover:opacity-70 transition-colors ml-2 flex-shrink-0 disabled:opacity-50"
                                >
                                    {pendingId === user._id ? (
                                        <Loader2 className="size-3 animate-spin" />
                                    ) : (
                                        "Follow"
                                    )}
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-[14px] text-white/50 text-left py-4">
                        No suggestions found.
                    </div>
                )}
            </div>

            {/* Links Section placeholder - matching IG style lightly */}
            <div className="mt-10 text-[12px] text-base-content/40 space-y-4">
                <div className="flex flex-wrap gap-x-2 gap-y-1">
                    <a href="#" className="hover:underline hover:text-primary">About</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Help</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Press</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">API</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Jobs</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Privacy</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Terms</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Locations</a>
                    <span>•</span>
                    <a href="#" className="hover:underline hover:text-primary">Language</a>
                </div>
                <div className="uppercase tracking-wider font-semibold opacity-60">
                    © 2026 BONDBEYOND FROM freechatweb.in
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
