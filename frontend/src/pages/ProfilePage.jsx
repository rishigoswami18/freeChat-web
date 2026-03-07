import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { updateProfile, getUserPosts } from "../lib/api";
import { Camera, MapPin, Globe, User, Languages, Loader2, Save, Shield, Keyboard, Star, Calendar, Grid, Flame } from "lucide-react";
import toast from "react-hot-toast";
import { useStealthStore } from "../store/useStealthStore";
import BadgeIcon from "../components/BadgeIcon";
import PostsFeed from "../components/PostsFeed";
import { isPremiumUser } from "../lib/premium";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";

const ProfilePage = () => {
    const { authUser, isLoading } = useAuthUser();
    const queryClient = useQueryClient();
    const { isStealthMode, setStealthMode, panicShortcut, setPanicShortcut } = useStealthStore();
    const [viewingDP, setViewingDP] = useState(null);
    const isPremium = isPremiumUser(authUser);

    const [userPosts, setUserPosts] = useState([]);

    // Fetch user specific posts with caching
    const { data: serverPosts, isLoading: isLoadingPosts } = useQuery({
        queryKey: ["userPosts", authUser?._id],
        queryFn: () => getUserPosts(authUser._id),
        enabled: !!authUser?._id,
        staleTime: 1000 * 60 * 5,
        placeholderData: (prev) => prev,
    });

    useEffect(() => {
        if (serverPosts) {
            setUserPosts(serverPosts);
        }
    }, [serverPosts]);

    const [formData, setFormData] = useState({
        fullName: "",
        bio: "",
        location: "",
        nativeLanguage: "",
        learningLanguage: "",
        dateOfBirth: "",
        isPublic: true,
    });

    // Initialize/Update form data when authUser loads
    useEffect(() => {
        if (authUser) {
            setFormData({
                fullName: authUser.fullName || "",
                bio: authUser.bio || "",
                location: authUser.location || "",
                nativeLanguage: authUser.nativeLanguage || "",
                learningLanguage: authUser.learningLanguage || "",
                dateOfBirth: authUser.dateOfBirth ? authUser.dateOfBirth.split("T")[0] : "",
                isPublic: authUser.isPublic !== undefined ? authUser.isPublic : true,
            });
        }
    }, [authUser]);

    const [selectedImg, setSelectedImg] = useState(null);

    const { mutate: doUpdate, isPending } = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            toast.success("Profile updated successfully!");
            queryClient.setQueryData(["authUser"], data.user);
            // Also invalidate to be safe
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update profile");
        }
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (selectedImg) payload.profilePic = selectedImg;

        // Only send premium fields if the user is actually premium
        if (isPremium) {
            payload.isStealthMode = isStealthMode;
            payload.panicShortcut = panicShortcut;
        }

        doUpdate(payload);
    };

    const [isEditing, setIsEditing] = useState(false);
    const [viewMode, setViewMode] = useState("grid"); // grid or feed

    const handleShareProfile = () => {
        const url = `${window.location.origin}/user/${authUser._id}`;
        navigator.clipboard.writeText(url);
        toast.success("Profile link copied!");
    };

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isEditing) {
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setIsEditing(false)}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <X className="size-6" />
                    </button>
                    <h1 className="text-xl font-bold">Edit Profile</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Profile Picture Section */}
                    <div className="flex flex-col items-center gap-4 mb-8 profile-cover-gradient rounded-2xl py-10 px-4 relative">
                        <div className="relative group">
                            <div className="avatar">
                                <div
                                    className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-300 cursor-pointer active:scale-95 transition-transform"
                                    onClick={() => setViewingDP({ url: selectedImg || authUser?.profilePic || "/avatar.png", name: authUser?.fullName })}
                                >
                                    <img
                                        src={selectedImg || authUser?.profilePic || "/avatar.png"}
                                        alt="Profile"
                                        className="object-cover w-full h-full"
                                    />
                                </div>
                            </div>
                            <label
                                htmlFor="profile-upload"
                                className="absolute bottom-0 right-0 bg-primary text-primary-content p-2 rounded-full cursor-pointer hover:scale-110 transition-transform shadow-lg"
                            >
                                <Camera className="size-5" />
                                <input
                                    id="profile-upload"
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                        <p className="text-xs opacity-50">Click the camera to upload a new photo</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <User className="size-4 opacity-50" /> Full Name
                                </span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                className="input input-bordered focus:input-primary transition-all rounded-xl"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <MapPin className="size-4 opacity-50" /> Location
                                </span>
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleInputChange}
                                placeholder="City, Country"
                                className="input input-bordered focus:input-primary transition-all rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-semibold">Bio</span>
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself..."
                            className="textarea textarea-bordered focus:textarea-primary transition-all rounded-xl h-24"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <Globe className="size-4 opacity-50" /> Native Language
                                </span>
                            </label>
                            <input
                                type="text"
                                name="nativeLanguage"
                                value={formData.nativeLanguage}
                                onChange={handleInputChange}
                                placeholder="e.g. English"
                                className="input input-bordered focus:input-primary transition-all rounded-xl"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <Languages className="size-4 opacity-50" /> Learning Language
                                </span>
                            </label>
                            <input
                                type="text"
                                name="learningLanguage"
                                value={formData.learningLanguage}
                                onChange={handleInputChange}
                                placeholder="e.g. Spanish"
                                className="input input-bordered focus:input-primary transition-all rounded-xl"
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-semibold flex items-center gap-2">
                                    <Calendar className="size-4 opacity-50" /> Date of Birth
                                </span>
                            </label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleInputChange}
                                className="input input-bordered focus:input-primary transition-all rounded-xl"
                                required
                            />
                        </div>
                    </div>

                    <div className="bg-base-200 p-4 rounded-xl flex items-center justify-between border border-primary/5">
                        <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-sm flex items-center gap-2">
                                {formData.isPublic ? <Globe className="size-4 text-success" /> : <Shield className="size-4 text-warning" />}
                                Profile Visibility
                            </span>
                            <p className="text-xs opacity-50">
                                {formData.isPublic
                                    ? "Your profile is public and discoverable by others."
                                    : "Your profile is private and hidden from search/recommendations."}
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-success"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                        />
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isPending}
                            className="btn btn-primary w-full sm:w-auto min-w-[200px] gap-2 rounded-xl shadow-lg shadow-primary/20"
                        >
                            {isPending ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                <Save className="size-5" />
                            )}
                            Save Changes
                        </button>
                    </div>
                </form>

                <div className="mt-12 pt-8">
                    <div className="section-divider" />
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 section-heading">
                        <Shield className="text-secondary" />
                        Stealth Mode Settings
                    </h2>

                    <div className="bg-base-200 p-6 rounded-2xl space-y-6 relative overflow-hidden">
                        {!isPremium && (
                            <div className="absolute inset-0 bg-base-200/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                                <div className="bg-primary/20 p-3 rounded-full mb-4">
                                    <Shield className="size-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">Privacy Pro Required</h3>
                                <p className="max-w-xs text-sm opacity-80 mb-6">
                                    Stealth Mode and custom panic shortcuts are exclusive to Premium members.
                                </p>
                                <a href="/membership" className="btn btn-primary rounded-xl gap-2 shadow-lg shadow-primary/20">
                                    <Star className="size-4" />
                                    Upgrade to Premium
                                </a>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">Privacy Pro (Stealth Mode)</h3>
                                    <span className="badge badge-primary badge-sm gap-1">
                                        <Star className="size-3" /> Premium
                                    </span>
                                </div>
                                <p className="text-sm opacity-60">Instantly switch to a dummy educational view.</p>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={isStealthMode}
                                onChange={(e) => isPremium && setStealthMode(e.target.checked)}
                                disabled={!isPremium}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <Keyboard className="size-4 opacity-50" /> Panic Shortcut
                                    </span>
                                </label>
                                <select
                                    className="select select-bordered rounded-xl"
                                    value={panicShortcut}
                                    onChange={(e) => setPanicShortcut(e.target.value)}
                                    disabled={!isPremium}
                                >
                                    <option value="Escape">Escape Key</option>
                                    <option value="F2">F2 Key</option>
                                    <option value="q">'q' Key</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-semibold flex items-center gap-2">
                                        <Globe className="size-4 opacity-50" /> Dummy View
                                    </span>
                                </label>
                                <select className="select select-bordered rounded-xl" disabled>
                                    <option>LexiLearn Dictionary (Default)</option>
                                    <option>Science Lab Reports (Coming Soon)</option>
                                </select>
                            </div>
                        </div>

                        <div className="p-4 bg-info/10 text-info text-sm rounded-xl flex gap-3">
                            <div className="size-5 shrink-0"><Shield className="size-5" /></div>
                            <div>
                                <p><strong>PC:</strong> Use your shortcut key (Default: <code>Esc</code>) to hide.</p>
                                <p className="mt-1"><strong>Mobile:</strong> 📱 <strong>Triple-tap</strong> anywhere on the screen to hide instantly!</p>
                                <p className="mt-2 opacity-70"><strong>To Exit:</strong> Double-click the menu icon in the top right of the mask, or repeat your trigger.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs opacity-40 mt-8 italic pb-10">
                    All changes are saved instantly to your global profile.
                </p>

                {viewingDP && (
                    <ProfilePhotoViewer
                        imageUrl={viewingDP.url}
                        fullName={viewingDP.name}
                        onClose={() => setViewingDP(null)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
            {/* Instagram Style Header */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 pb-6 border-b border-base-300">
                <div
                    className="avatar cursor-pointer active:scale-95 transition-transform shrink-0"
                    onClick={() => setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName })}
                >
                    <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600">
                        <div className="size-full rounded-full border-2 border-base-100 overflow-hidden bg-base-300">
                            <img src={authUser?.profilePic || "/avatar.png"} alt={authUser?.fullName} className="object-cover w-full h-full" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <h1 className="text-xl font-medium tracking-tight truncate max-w-xs mx-auto sm:mx-0">
                            @{authUser?.username || 'user'}
                        </h1>
                        <div className="flex items-center justify-center sm:justify-start gap-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-base-200 btn-sm rounded-lg font-bold px-6 normal-case"
                            >
                                Edit Profile
                            </button>
                            <button
                                onClick={handleShareProfile}
                                className="btn btn-base-200 btn-sm rounded-lg font-bold px-6 normal-case"
                            >
                                Share Profile
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center sm:justify-start gap-10">
                        <div className="flex flex-col sm:flex-row items-center gap-1">
                            <span className="font-bold text-lg">{userPosts.length}</span>
                            <span className="text-sm opacity-60">posts</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-1">
                            <span className="font-bold text-lg">{authUser?.friendCount || 0}</span>
                            <span className="text-sm opacity-60">friends</span>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <p className="font-bold text-sm">{authUser?.fullName}</p>
                        {authUser?.bio && <p className="text-sm opacity-90 max-w-md mx-auto sm:mx-0 whitespace-pre-wrap">{authUser.bio}</p>}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                            {authUser?.nativeLanguage && (
                                <span className="text-xs font-medium bg-base-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <Globe className="size-3 opacity-50" /> {authUser.nativeLanguage}
                                </span>
                            )}
                            {authUser?.location && (
                                <span className="text-xs font-medium bg-base-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                                    <MapPin className="size-3 opacity-50" /> {authUser.location}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* View Mode Toggle */}
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

            {/* Content Area */}
            <div className="min-h-[300px]">
                {isLoadingPosts ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="size-8 animate-spin text-primary opacity-20" />
                    </div>
                ) : userPosts.length > 0 ? (
                    viewMode === "grid" ? (
                        <div className="grid grid-cols-3 gap-0.5 sm:gap-4">
                            {userPosts.map((post) => (
                                <div
                                    key={post._id}
                                    className="aspect-square relative group cursor-pointer overflow-hidden bg-base-300"
                                    onClick={() => setViewMode("feed")}
                                >
                                    {post.mediaUrl ? (
                                        <div className="w-full h-full">
                                            {post.mediaType === "video" ? (
                                                <video src={post.mediaUrl} className="w-full h-full object-cover" muted />
                                            ) : (
                                                <img src={post.mediaUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full h-full p-2 flex items-center justify-center text-[10px] sm:text-xs text-center font-medium opacity-60 italic bg-gradient-to-br from-base-200 to-base-300">
                                            {post.content?.substring(0, 50)}...
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-bold">
                                        <div className="flex items-center gap-1"><Flame className="size-4 fill-current" /> {post.likes?.length || 0}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="max-w-xl mx-auto space-y-6 pb-20">
                            <PostsFeed posts={userPosts} setPosts={setUserPosts} />
                        </div>
                    )
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 italic">
                        <Grid className="size-12 mb-4" />
                        <p>No posts yet</p>
                    </div>
                )}
            </div>

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

export default ProfilePage;
