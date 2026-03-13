import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts, getOtherUserFriends, sendFriendRequest, unfriend } from "../lib/api";
import { Loader2, Grid, List, UserPlus, MessageCircle, BadgeCheck, Users, Lock, X, Globe, Languages, MapPin, UserCheck, UserCheck as Check, UserX, Clock, Heart } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import PostsFeed from "../components/PostsFeed";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";
import { AnimatePresence } from "framer-motion";

const UserProfilePage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();
    const { userId } = useParams();

    useEffect(() => {
        if (authUser?._id && userId && authUser._id.toString() === userId.toString()) {
            navigate("/profile", { replace: true });
        }
    }, [authUser, userId, navigate]);
    const [viewMode, setViewMode] = useState("grid"); // grid or feed
    const [viewingDP, setViewingDP] = useState(null);
    const [showFriends, setShowFriends] = useState(false);
    const [userPosts, setUserPosts] = useState([]);
    const loadMoreRef = useRef(null);

    const { mutate: addFriendMutation, isPending: isAddingFriend } = useMutation({
        mutationFn: () => sendFriendRequest(userId),
        onSuccess: () => {
            toast.success("Friend request sent!");
            queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to send request");
        }
    });

    const { mutate: unfriendMutation, isPending: isUnfriending } = useMutation({
        mutationFn: () => unfriend(userId),
        onSuccess: () => {
            toast.success("Unfriended");
            queryClient.invalidateQueries({ queryKey: ["userProfile", userId] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
    });

    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => getUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });

    // Professional Infinite Scroll for User Posts
    const {
        data: postsData,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading: isPostsLoading,
    } = useInfiniteQuery({
        queryKey: ["userPosts", userId],
        queryFn: ({ pageParam }) => getUserPosts(userId, pageParam, 12),
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
    });

    // Flatten pages
    const allPosts = useMemo(() => postsData?.pages.flatMap((page) => page.posts) || [], [postsData]);

    useEffect(() => {
        setUserPosts(allPosts);
    }, [allPosts]);

    // Intersection Observer for User Posts
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.1 }
        );

        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isUserLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (userError || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-xl font-bold opacity-50">User not found</p>
                <Link to="/" className="btn btn-primary btn-sm rounded-xl">Go Home</Link>
            </div>
        );
    }

    const isPublic = user.isPublic;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Profile Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 border-b border-base-300 pb-10">
                <div
                    className="avatar cursor-pointer active:scale-95 transition-transform shrink-0"
                    onClick={() => setViewingDP({ url: user.profilePic || "/avatar.png", name: user.fullName, isVerified: user.isVerified || user.role === "admin" })}
                >
                    <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-2xl">
                        <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="object-cover w-full h-full" />
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h1 className="text-xl font-medium tracking-tight truncate max-w-xs mx-auto sm:mx-0 flex items-center justify-center sm:justify-start gap-1">
                            @{user.username || 'user'}
                            {(user.role === "admin" || user.isVerified) && (
                                <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                   <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                 </div>
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-10 py-2">
                        <div className="flex flex-col items-center sm:items-start">
                            <span className="font-bold text-lg leading-none">{userPosts.length}</span>
                            <span className="text-sm opacity-60">posts</span>
                        </div>
                        <div
                            className={`flex flex-col items-center sm:items-start ${isPublic ? 'cursor-pointer hover:text-primary transition-colors' : 'opacity-50 cursor-not-allowed'}`}
                            onClick={() => isPublic && setShowFriends(true)}
                        >
                            <span className="font-bold text-lg leading-none">{user.friendCount ?? user.friends?.length ?? 0}</span>
                            <span className="text-sm opacity-60">friends</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="font-bold text-sm tracking-tight">{user.fullName}</p>
                        {user.bio && <p className="text-sm opacity-90 max-w-md mx-auto sm:mx-0 whitespace-pre-wrap leading-relaxed">{user.bio}</p>}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 pb-4">
                            {user.nativeLanguage && (
                                <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50">
                                    <Globe className="size-3 text-secondary" /> {user.nativeLanguage}
                                </span>
                            )}
                            {user.learningLanguage && (
                                <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50">
                                    <Languages className="size-3 text-primary" /> {user.learningLanguage}
                                </span>
                            )}
                            {user.location && (
                                <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50">
                                    <MapPin className="size-3 text-accent" /> {user.location}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 w-full pt-2">
                        {authUser?._id === userId ? (
                            <>
                                <Link to="/profile" className="btn btn-base-300 btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case">
                                    Edit Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        const url = `${window.location.origin}/user/${authUser._id}`;
                                        navigator.clipboard.writeText(url);
                                        toast.success("Profile link copied!");
                                    }}
                                    className="btn btn-base-300 btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case"
                                >
                                    Share Profile
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to={`/chat/${user._id}`} className="btn btn-primary btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2">
                                    <MessageCircle className="size-4" /> Message
                                </Link>
                                {authUser?.friends?.includes(user._id) ? (
                                    <button
                                        onClick={() => unfriendMutation()}
                                        disabled={isUnfriending}
                                        className="btn btn-error btn-outline btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2"
                                    >
                                        <UserX className="size-4" /> {isUnfriending ? "Processing..." : "Unfriend"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => addFriendMutation()}
                                        disabled={isAddingFriend}
                                        className="btn btn-base-200 btn-sm w-full sm:w-auto rounded-lg font-bold px-8 normal-case gap-2"
                                    >
                                        <UserPlus className="size-4" /> {isAddingFriend ? "Sending..." : "Add Friend"}
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex justify-center border-b border-base-300 mb-6">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2 px-8 py-3 border-b-2 transition-all font-black text-xs uppercase tracking-widest ${viewMode === "grid" ? "border-primary text-primary" : "border-transparent opacity-40"}`}
                >
                    <Grid className="size-4" /> Grid
                </button>
                <button
                    onClick={() => setViewMode("feed")}
                    className={`flex items-center gap-2 px-8 py-3 border-b-2 transition-all font-black text-xs uppercase tracking-widest ${viewMode === "feed" ? "border-primary text-primary" : "border-transparent opacity-40"}`}
                >
                    <List className="size-4" /> Feed
                </button>
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {isPostsLoading && userPosts.length === 0 ? (
                    <div className="grid grid-cols-3 gap-1 sm:gap-4 animate-pulse">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-base-300 rounded-sm sm:rounded-xl" />
                        ))}
                    </div>
                ) : !isPublic && authUser?._id !== user._id && !authUser?.friends?.includes(user._id) ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                        <Lock className="size-16" />
                        <h3 className="text-xl font-black uppercase tracking-widest italic">Private Profile</h3>
                        <p className="text-sm">Follow this user to see their posts and friends</p>
                    </div>
                ) : userPosts.length > 0 ? (
                    <>
                        {viewMode === "grid" ? (
                            <div className="grid grid-cols-3 gap-1 sm:gap-4">
                                {userPosts.map((post) => (
                                    <div
                                        key={post._id}
                                        className="aspect-square relative group cursor-pointer overflow-hidden bg-base-300 rounded-sm sm:rounded-xl"
                                        onClick={() => setViewMode("feed")}
                                    >
                                        {post.mediaUrl ? (
                                            <div className="w-full h-full">
                                                {post.mediaType === "video" ? (
                                                    <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                                                ) : (
                                                    <img src={post.mediaUrl} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-full p-3 flex flex-col items-center justify-center text-[10px] sm:text-sm text-center font-medium opacity-60 bg-gradient-to-br from-base-200 to-base-300">
                                                <List className="size-4 mb-2 opacity-20" />
                                                <span className="line-clamp-3">{post.content}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                            <div className="flex items-center gap-1"><Heart className="size-4 fill-current" /> {post.likes?.length || 0}</div>
                                            <div className="flex items-center gap-1"><MessageCircle className="size-4 fill-current" /> {post.comments?.length || 0}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="max-w-xl mx-auto space-y-6">
                                <PostsFeed posts={userPosts} setPosts={setUserPosts} />
                            </div>
                        )}

                        {/* Infinite Scroll Trigger */}
                        <div ref={loadMoreRef} className="py-12 flex justify-center">
                            {isFetchingNextPage ? (
                                <div className="flex flex-col items-center gap-3 opacity-40">
                                    <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Loading History...</p>
                                </div>
                            ) : hasNextPage ? (
                                <div className="h-20" />
                            ) : (
                                <div className="divider opacity-20 text-[10px] font-black uppercase tracking-[0.2em]">End of Transmission</div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
                        <Grid className="size-12 mb-4" />
                        <p>No posts yet</p>
                    </div>
                )
                }
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showFriends && (
                    <FriendsListModal
                        userId={userId}
                        isOpen={showFriends}
                        onClose={() => setShowFriends(false)}
                    />
                )}
            </AnimatePresence>

            {viewingDP && (
                <ProfilePhotoViewer
                    imageUrl={viewingDP.url}
                    fullName={viewingDP.name}
                    isVerified={viewingDP.isVerified}
                    onClose={() => setViewingDP(null)}
                />
            )}
        </div>
    );
};

const FriendsListModal = ({ userId, isOpen, onClose }) => {
    const { data: friends, isLoading } = useQuery({
        queryKey: ["userFriends", userId],
        queryFn: () => getOtherUserFriends(userId),
        enabled: isOpen,
    });

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 sm:p-6 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold italic tracking-tight uppercase">Friends</h2>
                            <p className="text-[10px] font-black opacity-50 uppercase tracking-widest">{friends?.length || 0} Connected</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4 no-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="size-10 animate-spin text-primary opacity-20" />
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest animate-pulse">Loading list...</p>
                        </div>
                    ) : friends?.length > 0 ? (
                        <div className="space-y-1">
                            {friends.map((friend) => (
                                <div key={friend._id} className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:bg-base-200 active:scale-[0.98] group">
                                    <Link to={`/user/${friend._id}`} onClick={onClose} className="avatar">
                                        <div className="size-12 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/40 transition-all overflow-hidden bg-base-300">
                                            <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} className="object-cover w-full h-full" />
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/user/${friend._id}`} onClick={onClose} className="font-bold text-sm block truncate hover:text-primary transition-colors flex items-center gap-1">
                                            {friend.fullName}
                                            {(friend.role === "admin" || friend.isVerified) && (
                                                <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                                   <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                                                </div>
                                            )}
                                        </Link>
                                        <p className="text-[10px] opacity-40 truncate">@{friend.username || 'user'}</p>
                                    </div>
                                    <Link to={`/chat/${friend._id}`} className="btn btn-primary btn-xs rounded-lg">Chat</Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-4">
                            <Users className="size-16" />
                            <p className="text-sm font-bold uppercase tracking-widest italic">No friends found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
