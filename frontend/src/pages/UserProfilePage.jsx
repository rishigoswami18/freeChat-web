import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts, getOtherUserFriends } from "../lib/api";
import { Loader2, Grid, List, UserPlus, MessageCircle, BadgeCheck, Users, Lock, X } from "lucide-react";
import PostsFeed from "../components/PostsFeed";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";
import { AnimatePresence } from "framer-motion";

const UserProfilePage = () => {
    const { userId } = useParams();
    const [viewMode, setViewMode] = useState("grid"); // grid or feed
    const [viewingDP, setViewingDP] = useState(null);
    const [showFriends, setShowFriends] = useState(false);
    const [userPosts, setUserPosts] = useState([]);

    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => getUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });

    const { data: serverPosts, isLoading: isPostsLoading } = useQuery({
        queryKey: ["userPosts", userId],
        queryFn: () => getUserPosts(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });

    useEffect(() => {
        if (serverPosts) {
            setUserPosts(serverPosts);
        }
    }, [serverPosts]);

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
                    onClick={() => setViewingDP({ url: user.profilePic || "/avatar.png", name: user.fullName })}
                >
                    <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-2xl">
                        <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="object-cover w-full h-full" />
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-2xl font-black flex items-center justify-center sm:justify-start gap-2 tracking-tight">
                            {user.fullName}
                            {(user.role === "admin" || user.isVerified) && (
                                <BadgeCheck className="size-6 text-amber-500 fill-amber-500/10" />
                            )}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <Link to={`/chat/${user._id}`} className="btn btn-primary btn-sm rounded-xl gap-2 font-bold px-5">
                                <MessageCircle className="size-4" /> Message
                            </Link>
                            <button className="btn btn-base-300 btn-sm rounded-xl font-bold">
                                <UserPlus className="size-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-6 font-medium">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                            <span className="font-bold text-lg">{userPosts.length}</span>
                            <span className="text-xs opacity-50 uppercase tracking-widest font-black">Posts</span>
                        </div>
                        <div
                            className={`flex flex-col sm:flex-row sm:items-center gap-1 ${isPublic ? 'cursor-pointer hover:text-primary transition-colors' : 'opacity-50 cursor-not-allowed'}`}
                            onClick={() => isPublic && setShowFriends(true)}
                        >
                            <span className="font-bold text-lg">{user.friendCount || 0}</span>
                            <span className="text-xs opacity-50 uppercase tracking-widest font-black">Friends</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="font-mono text-sm text-primary font-bold">@{user.username || 'user'}</p>
                        {user.bio && <p className="text-sm opacity-80 max-w-md mx-auto sm:mx-0 whitespace-pre-wrap">{user.bio}</p>}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                            {user.nativeLanguage && (
                                <span className="badge badge-secondary badge-sm font-bold">{user.nativeLanguage}</span>
                            )}
                            {user.learningLanguage && (
                                <span className="badge badge-outline badge-sm font-bold">Learning {user.learningLanguage}</span>
                            )}
                        </div>
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
                {isPostsLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="size-8 animate-spin text-primary opacity-20" />
                    </div>
                ) : !isPublic && user._id !== userId ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                        <Lock className="size-16" />
                        <h3 className="text-xl font-black uppercase tracking-widest italic">Private Profile</h3>
                        <p className="text-sm">Follow this user to see their posts and friends</p>
                    </div>
                ) : userPosts.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-3 gap-1 sm:gap-4">
                            {userPosts.map((post) => (
                                <div
                                    key={post._id}
                                    className="aspect-square relative group cursor-pointer overflow-hidden bg-base-300 rounded-sm sm:rounded-xl"
                                    onClick={() => setViewMode("feed")} // Simple way to "view" it for now
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
                                        <div className="w-full h-full p-2 flex items-center justify-center text-[10px] sm:text-xs text-center font-medium opacity-60 italic bg-gradient-to-br from-base-200 to-base-300">
                                            {post.content?.substring(0, 50)}...
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                        <div className="flex items-center gap-1"><Grid className="size-4 fill-current" /> {post.likes?.length || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-6">
                            <PostsFeed posts={userPosts} setPosts={setUserPosts} />
                        </div>
                    )
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
                                                <BadgeCheck className="size-3.5 text-amber-500 fill-amber-500/10" />
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
