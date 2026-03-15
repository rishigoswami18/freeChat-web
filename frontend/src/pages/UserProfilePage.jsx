import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getUserProfile, getUserPosts } from "../lib/api";
import { Grid, List } from "lucide-react";
import { AnimatePresence } from "framer-motion";

// Custom Hooks
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

// Sub-components
import UserProfileHeader from "../components/profile/UserProfileHeader";
import ProfileSkeleton from "../components/profile/ProfileSkeleton";
import PrivateProfileState from "../components/profile/PrivateProfileState";
import EmptyPostsState from "../components/profile/EmptyPostsState";
import UserPostsGrid from "../components/profile/UserPostsGrid";
import PostsFeed from "../components/PostsFeed";
import FriendsListModal from "../components/profile/FriendsListModal";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";

const UserProfilePage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthUser();
    const { userId } = useParams();

    // 1. Core State
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "feed"
    const [viewingDP, setViewingDP] = useState(null);
    const [showFriends, setShowFriends] = useState(false);
    
    // Redirect bound for self-profiles
    useEffect(() => {
        if (authUser?._id && userId && authUser._id.toString() === userId.toString()) {
            navigate("/profile", { replace: true });
        }
    }, [authUser, userId, navigate]);

    // 2. Fetch User Metadata
    const { data: user, isLoading: isUserLoading, error: userError } = useQuery({
        queryKey: ["userProfile", userId],
        queryFn: () => getUserProfile(userId),
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minute hard cache
        placeholderData: (prev) => prev,
    });

    // 3. Fetch Paginated Media
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
        staleTime: 1000 * 60 * 5, // Same sync timeline as profile
    });

    // 4. Transform API Data Shapes
    // Extracts flattened array out of internal React Query paginations structurally without storing local state
    const allPosts = useMemo(
        () => postsData?.pages.flatMap((page) => page.posts) || [],
        [postsData]
    );

    // 5. Hooks
    // Attaches the ref instance mapping purely instead of duplicating React internals
    const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

    // 6. Callbacks
    const handleShowDP = useCallback((dpData) => setViewingDP(dpData), []);
    const handleShowFriends = useCallback(() => setShowFriends(true), []);

    // 7. Structural Flags
    if (isUserLoading) return <ProfileSkeleton />;

    if (userError || !user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <p className="text-xl font-bold opacity-50" role="alert">User not found</p>
                <Link to="/" className="btn btn-primary btn-sm rounded-xl focus:ring-2 focus:ring-primary/40">Return Home</Link>
            </div>
        );
    }

    const isPublic = user.isPublic;
    const isSelf = authUser?._id === userId;
    const isFriend = authUser?.friends?.includes(userId);
    const hasAccessToPrivate = isPublic || isSelf || isFriend;

    return (
        <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in" aria-label="User Profile Main Layout">
            <UserProfileHeader 
                user={user}
                userId={userId}
                authUser={authUser}
                userPostsLength={allPosts.length}
                onShowDP={handleShowDP}
                onShowFriends={handleShowFriends}
                isPublic={isPublic}
            />

            {/* View Mode Context Toggles */}
            <nav className="flex justify-center border-b border-base-300 mb-6" aria-label="Posts View Navigation">
                <button
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                    className={`flex items-center gap-2 px-8 py-3 border-b-2 transition-all font-black text-xs uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-md ${viewMode === "grid" ? "border-primary text-primary" : "border-transparent opacity-40 hover:opacity-80"}`}
                >
                    <Grid className="size-4" aria-hidden="true" /> Grid
                </button>
                <button
                    onClick={() => setViewMode("feed")}
                    aria-pressed={viewMode === "feed"}
                    className={`flex items-center gap-2 px-8 py-3 border-b-2 transition-all font-black text-xs uppercase tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:rounded-md ${viewMode === "feed" ? "border-primary text-primary" : "border-transparent opacity-40 hover:opacity-80"}`}
                >
                    <List className="size-4" aria-hidden="true" /> Feed
                </button>
            </nav>

            {/* Content Display Mapping */}
            <section className="min-h-[300px]" aria-live="polite">
                {isPostsLoading && allPosts.length === 0 ? (
                    <div className="grid grid-cols-3 gap-1 sm:gap-4 animate-pulse" aria-busy="true" aria-label="Loading posts...">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="aspect-square bg-base-300 rounded-sm sm:rounded-xl border border-base-200" />
                        ))}
                    </div>
                ) : !hasAccessToPrivate ? (
                    <PrivateProfileState />
                ) : allPosts.length > 0 ? (
                    <>
                        {viewMode === "grid" ? (
                            <UserPostsGrid posts={allPosts} setViewMode={setViewMode} />
                        ) : (
                            <div className="max-w-xl mx-auto space-y-6">
                                {/* The setPosts prop implementation here ideally would be lifted strictly to query invalidation instead of state mutation going forward, but operates to sustain compatibility */}
                                <PostsFeed posts={allPosts} setPosts={() => {}} /> 
                            </div>
                        )}

                        {/* Pagination Sentinel Point for Intersection Hook Overlay */}
                        <div ref={observerTarget} className="py-12 flex justify-center w-full" aria-hidden="true">
                            {isFetchingNextPage ? (
                                <div className="flex flex-col items-center gap-3 opacity-40 transition-opacity">
                                    <div className="size-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest">Loading History...</p>
                                </div>
                            ) : hasNextPage ? (
                                <div className="h-20" /> // Hidden spacer map keeping layout shifts clean
                            ) : (
                                <div className="divider opacity-20 text-[10px] font-black uppercase tracking-[0.2em] w-1/2 mx-auto">End of Transmission</div>
                            )}
                        </div>
                    </>
                ) : (
                    <EmptyPostsState />
                )}
            </section>

            {/* Context Switch Modals */}
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
        </main>
    );
};

export default UserProfilePage;
