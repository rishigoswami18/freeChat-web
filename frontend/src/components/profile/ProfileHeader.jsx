import { memo } from "react";
import { Camera, Globe, MapPin, BadgeCheck, LogOut, Instagram, Linkedin } from "lucide-react";

/**
 * ProfileHeader
 * Memoized to prevent re-renders when a user switches tabs (Grid/Feed)
 * or when they click on unrelated buttons.
 */
const ProfileHeader = memo(({ 
    authUser, 
    postsCount, 
    onEditClick, 
    onShareClick, 
    onFriendsClick, 
    onLogout, 
    isLoggingOut,
    isOwnProfile = true,
    isFollowing = false,
    onFollowClick,
    onMessageClick
}) => {

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
                    <div className="flex flex-col items-center sm:items-start group cursor-pointer transition-all">
                        <span className="font-bold text-lg leading-none group-hover:text-primary">{authUser?.followersCount || 0}</span>
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest leading-none mt-1">followers</span>
                    </div>
                    <div className="flex flex-col items-center sm:items-start group cursor-pointer transition-all">
                        <span className="font-bold text-lg leading-none group-hover:text-primary">{authUser?.followingCount || 0}</span>
                        <span className="text-[10px] font-black uppercase text-white/30 tracking-widest leading-none mt-1">following</span>
                    </div>

                </div>

                {/* 💰 Wallet Snapshot (Owner Only) */}
                {isOwnProfile && (
                    <div className="grid grid-cols-2 gap-3 max-w-sm">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 flex flex-col">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[7px] font-black uppercase text-emerald-500 tracking-widest">Winnings</span>
                            </div>
                            <span className="font-black text-sm text-emerald-400">🪙 {(authUser?.wallet?.winnings || 0).toLocaleString()}</span>
                        </div>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 flex flex-col text-left">
                            <div className="flex items-center gap-1 mb-1">
                                <span className="text-[7px] font-black uppercase text-amber-500 tracking-widest">Bond Coins</span>
                            </div>
                            <span className="font-black text-sm text-amber-500">🪙 {(authUser?.wallet?.bonusBalance || 0).toLocaleString()}</span>
                        </div>
                    </div>
                )}



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
                        {authUser?.instagram && (
                             <a 
                                href={`https://instagram.com/${authUser.instagram.replace('@', '')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="size-7 rounded-lg bg-base-200 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-base-300/50"
                             >
                                <Instagram className="size-4" />
                             </a>
                        )}
                        {authUser?.linkedin && (
                             <a 
                                href={authUser.linkedin.includes('http') ? authUser.linkedin : `https://linkedin.com/in/${authUser.linkedin}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="size-7 rounded-lg bg-base-200 flex items-center justify-center hover:bg-primary/10 hover:text-primary transition-all duration-300 border border-base-300/50"
                             >
                                <Linkedin className="size-4" />
                             </a>
                        )}
                    </div>
                </div>

                {/* Action Buttons at the bottom of header */}
                <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
                    {isOwnProfile ? (
                        <>
                            <button onClick={onEditClick} className="btn btn-base-200 btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case">
                                Edit Profile
                            </button>
                            <button onClick={onShareClick} className="btn btn-base-200 btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case">
                                Share Profile
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={onFollowClick} 
                                className={`btn btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case ${isFollowing ? 'btn-base-200' : 'btn-indigo-600 bg-indigo-600 text-white hover:bg-indigo-700'}`}
                            >
                                {isFollowing ? 'Unfollow' : 'Follow'}
                            </button>
                            <button 
                                onClick={onMessageClick}
                                className="btn btn-base-200 btn-sm flex-1 sm:flex-none rounded-lg font-bold px-8 normal-case"
                            >
                                Message
                            </button>
                        </>
                    )}
                    
                    {/* Logout Button (Primarily for Mobile Accessibility) */}
                    {isOwnProfile && (
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
                    )}
                </div>

            </div>
        </div>
    );
});

ProfileHeader.displayName = "ProfileHeader";

export default ProfileHeader;
