import { useState, useCallback, Suspense, lazy } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile, getUserPosts, deleteAccount } from "../lib/api";
import { Loader2, X, Grid, List } from "lucide-react";
import useLogout from "../hooks/useLogout";
import toast from "react-hot-toast";
import { useStealthStore } from "../store/useStealthStore";
import { isPremiumUser } from "../lib/premium";
import { AnimatePresence } from "framer-motion";

// Sub-component Architectures
import ProfileHeader from "../components/profile/ProfileHeader";
import EditProfileForm from "../components/profile/EditProfileForm";
import SecuritySettings from "../components/profile/SecuritySettings";
import StealthSettings from "../components/profile/StealthSettings";
import DangerZone from "../components/profile/DangerZone";

// Lazy-loaded Weight Fragments reducing initial JavaScript Bundle parsed by browser
const ProfilePosts = lazy(() => import("../components/profile/ProfilePosts"));
const ProfilePhotoViewer = lazy(() => import("../components/ProfilePhotoViewer"));
const FriendsListModal = lazy(() => import("../components/profile/FriendsListModal"));

const ProfilePage = () => {
    // === AUTH & GLOBAL STATES ===
    const { authUser, isLoading: authLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const isPremium = isPremiumUser(authUser);
    const { logoutMutation, isPending: isLoggingOut } = useLogout();
    const { isStealthMode, setStealthMode, panicShortcut, setPanicShortcut } = useStealthStore();

    // === LOCAL RENDER STATES ===
    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid | feed
    const [showFriends, setShowFriends] = useState(false);
    const [viewingDP, setViewingDP] = useState(null);

    // === REACT QUERY DATA (Decoupled from redundant useState loops) ===
    const { 
        data: serverPosts, 
        isLoading: isLoadingPosts, 
        isError: isErrorPosts, 
        refetch: refetchPosts 
    } = useQuery({
        queryKey: ["userPosts", authUser?._id],
        queryFn: () => getUserPosts(authUser._id),
        enabled: !!authUser?._id,
        // High Cache duration reducing MongoDB calls when navigating off-page
        staleTime: 1000 * 60 * 5,
        cacheTime: 1000 * 60 * 30,
        refetchOnWindowFocus: false,
    });
    
    // Direct array pass safely bypassing undefined states
    const userPosts = serverPosts?.posts || [];

    // === MUTATION PIPELINES ===
    const { mutate: updateProfileMutation, isPending: isUpdating } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success("Profile updated successfully!");
            queryClient.setQueryData(["authUser"], data.user);
            queryClient.invalidateQueries({ queryKey: ["authUser"], exact: true });
            setIsEditing(false); // Seamlessly push user back after completion
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to update profile")
    });

    // === STABILIZED HANDLERS (Preventing sub-component thrashing) ===
    const handleShareProfile = useCallback(() => {
        if (!authUser?._id) return;
        const url = `${window.location.origin}/user/${authUser._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
    }, [authUser?._id]);

    const handleDeleteAccount = useCallback(async () => {
        try {
            await deleteAccount();
            toast.success("Account deleted. We're sad to see you go.");
            logoutMutation();
        } catch (err) {
            toast.error("Failed to delete account");
        }
    }, [logoutMutation]);

    const handleUpdateSubmit = useCallback((payload) => {
        updateProfileMutation(payload);
    }, [updateProfileMutation]);


    // === RENDER FALLBACKS ===
    if (authLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    // === RENDER: EDIT MODE ===
    if (isEditing) {
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setIsEditing(false)} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-6" />
                    </button>
                    <h1 className="text-xl font-bold">Edit Profile</h1>
                </div>

                <EditProfileForm 
                    authUser={authUser} 
                    isPremium={isPremium} 
                    isStealthMode={isStealthMode} 
                    panicShortcut={panicShortcut} 
                    isPending={isUpdating} 
                    onSubmit={handleUpdateSubmit} 
                />

                <SecuritySettings />
                
                <DangerZone onDeleteAccount={handleDeleteAccount} />

                <StealthSettings 
                    isPremium={isPremium}
                    isStealthMode={isStealthMode}
                    setStealthMode={setStealthMode}
                    panicShortcut={panicShortcut}
                    setPanicShortcut={setPanicShortcut}
                />

                <p className="text-center text-xs opacity-40 mt-8 italic pb-10">
                    All changes are saved instantly to your global profile.
                </p>

                {/* Optional overlay handler passed down implicitly */}
                <Suspense fallback={null}>
                    {viewingDP && (
                        <ProfilePhotoViewer
                            imageUrl={viewingDP.url}
                            fullName={viewingDP.name}
                            isVerified={authUser?.isVerified || authUser?.role === "admin"}
                            onClose={() => setViewingDP(null)}
                            onUpdate={async (base64) => {
                                await updateProfileMutation({ profilePic: base64 });
                                setViewingDP(null);
                            }}
                        />
                    )}
                </Suspense>
            </div>
        );
    }

    // === RENDER: VIEW MODE ===
    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Decoupled Header Matrix */}
            <ProfileHeader 
                authUser={authUser} 
                postsCount={userPosts.length} 
                onEditClick={() => setIsEditing(true)} 
                onShareClick={handleShareProfile} 
                onFriendsClick={() => setShowFriends(true)} 
                onLogout={logoutMutation}
                isLoggingOut={isLoggingOut}
            />

            {/* View Mode Toggle Controls */}
            <div className="flex justify-center border-t sm:border-t-0 sm:border-b border-base-300 mb-6">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-2 px-8 py-3 transition-all font-bold text-xs uppercase tracking-widest sm:border-t-2 ${viewMode === "grid" ? "sm:border-primary text-primary" : "border-transparent opacity-40"}`}
                >
                    <Grid className="size-4" /> Posts
                </button>
                <button
                    onClick={() => setViewMode("feed")}
                    className={`flex items-center gap-2 px-8 py-3 transition-all font-bold text-xs uppercase tracking-widest sm:border-t-2 ${viewMode === "feed" ? "sm:border-primary text-primary" : "border-transparent opacity-40"}`}
                >
                    <List className="size-4" /> Feed
                </button>
            </div>

            {/* Post Feed Extrication (Lazy Loaded) */}
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="size-8 animate-spin text-primary opacity-20" /></div>}>
                <ProfilePosts 
                    userPosts={userPosts}
                    viewMode={viewMode}
                    setViewMode={setViewMode}
                    isLoading={isLoadingPosts}
                    isError={isErrorPosts}
                    onRetry={refetchPosts}
                    queryClient={queryClient}
                />
            </Suspense>

            {/* Lazy Rendered Overlays */}
            <Suspense fallback={null}>
                <AnimatePresence>
                    {showFriends && (
                        <FriendsListModal
                            isOpen={showFriends}
                            onClose={() => setShowFriends(false)}
                        />
                    )}
                </AnimatePresence>

                {viewingDP && (
                    <ProfilePhotoViewer
                        imageUrl={viewingDP.url}
                        fullName={viewingDP.name}
                        isVerified={authUser?.isVerified || authUser?.role === "admin"}
                        onClose={() => setViewingDP(null)}
                    />
                )}
            </Suspense>
        </div>
    );
};

export default ProfilePage;
