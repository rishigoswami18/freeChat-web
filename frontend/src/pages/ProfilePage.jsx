import { useState, useCallback, Suspense, lazy } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile, getUserPosts, deleteAccount } from "../lib/api";
import { Loader2, X, Grid, List } from "lucide-react";
import useLogout from "../hooks/useLogout";
import toast from "react-hot-toast";
import { useStealthStore } from "../store/useStealthStore";
import { isPremiumUser } from "../lib/premium";
import { AnimatePresence, motion } from "framer-motion";

// Sub-component Architectures
import PremiumProfileHeader from "../components/profile/PremiumProfileHeader";
import EditProfileForm from "../components/profile/EditProfileForm";
import SecuritySettings from "../components/profile/SecuritySettings";
import StealthSettings from "../components/profile/StealthSettings";
import DangerZone from "../components/profile/DangerZone";
import { ProfileSkeleton } from "../components/Skeletons";

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
    console.log("📂 [Profile] Loaded posts count:", userPosts.length);
    if (isErrorPosts) console.error("❌ [Profile] Fetch error:", isErrorPosts);

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
        return <ProfileSkeleton />;
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
            <PremiumProfileHeader 
                authUser={authUser} 
                postsCount={userPosts.length} 
                onEditClick={() => setIsEditing(true)} 
                onShareClick={handleShareProfile} 
                onLogout={logoutMutation}
            />

            {/* View Mode Toggle Controls */}
            <div className="flex justify-center border-b border-white/5 mb-10 pb-2">
                <button
                    onClick={() => setViewMode("grid")}
                    className={`flex items-center gap-3 px-10 py-4 transition-all font-black text-[10px] uppercase tracking-[0.2em] relative ${viewMode === "grid" ? "text-primary" : "text-white/20"}`}
                >
                    <Grid className="size-4" /> Portfolio
                    {viewMode === "grid" && <motion.div layoutId="profileTab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(99,101,241,0.5)]" />}
                </button>
                <button
                    onClick={() => setViewMode("feed")}
                    className={`flex items-center gap-3 px-10 py-4 transition-all font-black text-[10px] uppercase tracking-[0.2em] relative ${viewMode === "feed" ? "text-primary" : "text-white/20"}`}
                >
                    <List className="size-4" /> Live Feed
                    {viewMode === "feed" && <motion.div layoutId="profileTab" className="absolute bottom-0 inset-x-0 h-1 bg-primary rounded-full shadow-[0_0_15px_rgba(99,101,241,0.5)]" />}
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
            {/* Footer Trust Badge */}
            <div className="mt-16 py-8 border-t border-white/5 text-center px-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/15 mb-3">
                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Secure & Verified</span>
                </div>
                <p className="text-[11px] text-white/30 font-medium max-w-xs mx-auto leading-relaxed">
                    FreeChat is committed to user safety. All interactions comply with global privacy standards.
                </p>
                <div className="flex justify-center gap-6 mt-5 opacity-20 grayscale hover:grayscale-0 hover:opacity-40 transition-all">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/8/89/Razorpay_logo.svg" className="h-3.5" alt="Razorpay" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d1/Google_Play_Arrow_logo.svg" className="h-3.5" alt="Google Play" />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
