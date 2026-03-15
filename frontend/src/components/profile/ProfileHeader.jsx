import { memo } from "react";
import { Camera, Globe, MapPin, BadgeCheck, LogOut } from "lucide-react";

/**
 * ProfileHeader
 * Memoized to prevent re-renders when a user switches tabs (Grid/Feed)
 * or when they click on unrelated buttons.
 */
const ProfileHeader = memo(({ authUser, postsCount, onEditClick, onShareClick, onFriendsClick, onLogout, isLoggingOut }) => {
    return (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 pb-6 border-b border-base-300">
            <div
                className="avatar cursor-pointer active:scale-95 transition-transform shrink-0 relative group"
                onClick={() => {
                    onEditClick();
                    setTimeout(() => document.getElementById("profile-upload")?.click(), 100);
                }}
            >
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600">
                    <div className="size-full rounded-full border-2 border-base-100 overflow-hidden bg-base-300 relative">
                        <img 
                            src={authUser?.profilePic || "/avatar.png"} 
                            alt={authUser?.fullName} 
                            className="object-cover w-full h-full" 
                            loading="lazy" 
                            decoding="async"
                        />
                        {/* Overlay for quick edit */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold">
                            <Camera className="size-5 sm:size-7" />
                            <span className="hidden sm:inline">CHANGE</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl font-bold tracking-tight truncate max-w-xs mx-auto sm:mx-0 flex items-center justify-center sm:justify-start gap-1">
                        @{authUser?.username || 'user'}
                        {(authUser?.role === "admin" || authUser?.isVerified) && (
                            <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                                <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                            </div>
                        )}
                    </h1>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-10 py-2">
                    <div className="flex flex-col items-center sm:items-start">
                        <span className="font-bold text-lg leading-none">
                            {postsCount}
                        </span>
                        <span className="text-sm opacity-60">posts</span>
                    </div>
                    <div
                        className="flex flex-col items-center sm:items-start cursor-pointer hover:text-primary transition-colors active:scale-95"
                        onClick={onFriendsClick}
                    >
                        <span className="font-bold text-lg leading-none">
                            {authUser?.friendCount ?? authUser?.friends?.length ?? 0}
                        </span>
                        <span className="text-sm opacity-60">friends</span>
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">{authUser?.fullName}</p>
                    {authUser?.bio && <p className="text-sm opacity-90 max-w-md mx-auto sm:mx-0 whitespace-pre-wrap leading-relaxed">{authUser.bio}</p>}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 pb-4">
                        {authUser?.nativeLanguage && (
                            <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50">
                                <Globe className="size-3 text-secondary" /> {authUser.nativeLanguage}
                            </span>
                        )}
                        {authUser?.location && (
                            <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50">
                                <MapPin className="size-3 text-primary" /> {authUser.location}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action Buttons at the bottom of header */}
                <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
                    <button
                        onClick={onEditClick}
                        className="btn btn-base-200 btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case"
                    >
                        Edit Profile
                    </button>
                    <button
                        onClick={onShareClick}
                        className="btn btn-base-200 btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case"
                    >
                        Share Profile
                    </button>
                    {/* Logout Button (Primarily for Mobile Accessibility) */}
                    <button
                        onClick={onLogout}
                        disabled={isLoggingOut}
                        className="btn btn-error btn-outline btn-sm sm:hidden flex-1 rounded-lg font-bold px-8 normal-case gap-2"
                    >
                        {isLoggingOut ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <LogOut className="size-4" />
                        )}
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
});

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;
