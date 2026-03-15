import { memo } from "react";
import { Link } from "react-router-dom";
import { UserPlus, Loader2, Star, BadgeCheck, Check } from "lucide-react";

/**
 * Highly optimized isolated child node.
 * Uses `React.memo` to ensure unchanged list items do not re-render when querying new users or adding friends.
 */
const UserSearchResult = memo(({ user, onAddFriend, isPending, hasSent }) => {
    // If the backend returned a sent state or we optimistically injected it.
    const isSent = hasSent || user.requestSent;

    return (
        <div
            className={`group p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border shadow-sm stagger-item focus-within:ring-2 focus-within:ring-primary/20 ${user.isTandemMatch
                    ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40 shadow-md ring-1 ring-primary/5"
                    : "bg-base-200/50 hover:bg-base-200 border-transparent hover:border-primary/10"
                }`}
            role="listitem"
            tabIndex={0}
        >
            <div className="avatar">
                <div className={`size-14 rounded-full ring-2 transition-all ${user.isTandemMatch ? "ring-primary/40 scale-105" : "ring-transparent group-hover:ring-primary/20"
                    }`}>
                    <img
                        src={user.profilePic || "/avatar.png"}
                        alt={`${user.fullName} profile`}
                        loading="lazy"
                        decoding="async"
                    />
                </div>
            </div>

            <Link
                to={`/user/${user._id}`}
                className="flex-1 min-w-0 group-hover:text-primary transition-colors focus:outline-none"
                aria-label={`View ${user.fullName}'s profile`}
            >
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base tracking-tight truncate">{user.fullName}</h3>
                    {(user.role === "admin" || user.isVerified) && (
                        <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                            <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                        </div>
                    )}
                    {user.isTandemMatch && (
                        <span className="badge badge-primary badge-sm gap-1 py-2.5 font-bold animate-pulse">
                            <Star className="size-3 fill-current" />
                            Tandem Match
                        </span>
                    )}
                </div>

                {user.username && (
                    <p className="text-xs font-mono font-semibold opacity-70 truncate">@{user.username}</p>
                )}

                {(user.nativeLanguage || user.learningLanguage) && (
                    <p className="text-xs text-base-content/50 font-medium truncate mt-0.5">
                        {user.nativeLanguage || "Unknown"} • Learning {user.learningLanguage || "Unknown"}
                    </p>
                )}
            </Link>

            <button
                onClick={() => onAddFriend(user._id)}
                disabled={isPending || isSent}
                aria-label={isSent ? "Friend request sent" : `Add ${user.fullName} as friend`}
                className={`btn btn-sm rounded-xl px-4 transition-all duration-300 ${isPending || isSent
                        ? "btn-disabled bg-base-300 text-base-content/40 cursor-not-allowed"
                        : "btn-primary hover:scale-105 active:scale-95 shadow-md shadow-primary/20"
                    }`}
            >
                {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : isSent ? (
                    <>
                        <Check className="size-4 mr-1.5 text-success" />
                        <span className="font-bold">Sent</span>
                    </>
                ) : (
                    <>
                        <UserPlus className="size-4 mr-1.5" />
                        <span className="font-bold">Add</span>
                    </>
                )}
            </button>
        </div>
    );
});

UserSearchResult.displayName = "UserSearchResult";

export default UserSearchResult;
