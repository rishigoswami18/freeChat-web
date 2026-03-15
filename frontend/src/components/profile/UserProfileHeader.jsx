import { memo } from "react";
import { BadgeCheck, Globe, Languages, MapPin } from "lucide-react";
import UserProfileActions from "./UserProfileActions";

const UserProfileHeader = memo(({ user, userId, authUser, userPostsLength, onShowDP, onShowFriends, isPublic }) => {
    return (
        <header className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-10 mb-10 border-b border-base-300 pb-10" role="banner">
            <div
                className="avatar cursor-pointer active:scale-95 transition-transform shrink-0"
                onClick={() => onShowDP({ url: user.profilePic || "/avatar.png", name: user.fullName, isVerified: user.isVerified || user.role === "admin" })}
                role="button"
                tabIndex={0}
                aria-label={`View ${user.fullName}'s profile photo`}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        onShowDP({ url: user.profilePic || "/avatar.png", name: user.fullName, isVerified: user.isVerified || user.role === "admin" });
                    }
                }}
            >
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full ring-4 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden shadow-2xl">
                    <img 
                        src={user.profilePic || "/avatar.png"} 
                        alt={user.fullName} 
                        className="object-cover w-full h-full" 
                        loading="eager" 
                        decoding="async"
                    />
                </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-4 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h1 className="text-xl font-medium tracking-tight truncate max-w-xs mx-auto sm:mx-0 flex items-center justify-center sm:justify-start gap-1">
                        @{user.username || 'user'}
                        {(user.role === "admin" || user.isVerified) && (
                            <div className="flex items-center justify-center shrink-0" title="Verified Professional" aria-label="Verified User">
                                <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                            </div>
                        )}
                    </h1>
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-10 py-2" role="group" aria-label="Profile stats">
                    <div className="flex flex-col items-center sm:items-start" aria-label={`${userPostsLength} posts`}>
                        <span className="font-bold text-lg leading-none">{userPostsLength}</span>
                        <span className="text-sm opacity-60">posts</span>
                    </div>
                    <button
                        className={`flex flex-col items-center sm:items-start ${isPublic ? 'cursor-pointer hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-md' : 'opacity-50 cursor-not-allowed'}`}
                        onClick={() => isPublic && onShowFriends()}
                        disabled={!isPublic}
                        aria-label={`View ${user.friendCount ?? user.friends?.length ?? 0} friends`}
                        aria-disabled={!isPublic}
                    >
                        <span className="font-bold text-lg leading-none">{user.friendCount ?? user.friends?.length ?? 0}</span>
                        <span className="text-sm opacity-60">friends</span>
                    </button>
                </div>

                <div className="space-y-1">
                    <p className="font-bold text-sm tracking-tight">{user.fullName}</p>
                    {user.bio && <p className="text-sm opacity-90 max-w-md mx-auto sm:mx-0 whitespace-pre-wrap leading-relaxed">{user.bio}</p>}
                    
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 pb-4" aria-label="User details">
                        {user.nativeLanguage && (
                            <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50" title={`Native speaker of ${user.nativeLanguage}`}>
                                <Globe className="size-3 text-secondary" aria-hidden="true" /> {user.nativeLanguage}
                            </span>
                        )}
                        {user.learningLanguage && (
                            <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50" title={`Learning ${user.learningLanguage}`}>
                                <Languages className="size-3 text-primary" aria-hidden="true" /> {user.learningLanguage}
                            </span>
                        )}
                        {user.location && (
                            <span className="text-xs font-semibold bg-base-200 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-base-300/50" title={`Lives in ${user.location}`}>
                                <MapPin className="size-3 text-accent" aria-hidden="true" /> {user.location}
                            </span>
                        )}
                    </div>
                </div>

                <UserProfileActions 
                    userId={userId} 
                    authUser={authUser} 
                    user={user} 
                />
            </div>
        </header>
    );
});

UserProfileHeader.displayName = "UserProfileHeader";

export default UserProfileHeader;
