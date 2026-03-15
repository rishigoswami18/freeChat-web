import { memo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { MessageCircle, BadgeCheck } from "lucide-react";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import { LANGUAGE_TO_FLAG } from "../constants";

// === PERFORMANCE OPTIMIZATION: Pure Helper Function ===
// Extracted rendering function outside the component tree to prevent 
// re-evaluating and allocating function memory on every single card render.
export const getLanguageFlag = (language) => {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-0.5 inline-block"
        loading="lazy" // Network optimization: prevent 100+ flags loading un-scrolled
      />
    );
  }
  return null;
}

// === COMPONENT: FriendCard ===
// Wrapped in React.memo to completely halt re-renders if the main parent array 
// or feed alters state, guaranteeing smooth 60fps timeline scrolling.
const FriendCard = memo(({ friend }) => {
  const [viewingDP, setViewingDP] = useState(null);

  // Stable callbacks using useCallback prevent the ProfilePhotoViewer and event listeners
  // from silently tearing down and remounting.
  const handleViewDP = useCallback(() => {
    setViewingDP({ 
      url: friend.profilePic || "/avatar.png", 
      name: friend.fullName 
    });
  }, [friend.profilePic, friend.fullName]);

  const handleCloseDP = useCallback(() => {
    setViewingDP(null);
  }, []);

  const profileImg = friend.profilePic || "/avatar.png";
  const isVerified = friend.isVerified || friend.role === "admin";

  return (
    <div className="card bg-base-200/80 border border-base-300/50 hover:border-primary/20 card-hover rounded-2xl overflow-hidden group/friendcard transition-all duration-300">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div
              className="avatar w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300 group-hover/friendcard:ring-primary/30 transition-all cursor-pointer active:scale-95"
              onClick={handleViewDP}
              role="button"
              aria-label={`View ${friend.fullName}'s profile photo`}
            >
              <img
                src={profileImg}
                alt={friend.fullName}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async" // Offloads image decoding from the main UI thread
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200" />
          </div>
          <Link to={`/user/${friend._id}`} className="flex-1 min-w-0 hover:text-primary transition-colors">
            <h3 className="font-semibold text-sm truncate flex items-center gap-1">
              {friend.fullName}
              {isVerified && (
                <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
              )}
            </h3>
            <p className="text-[11px] text-base-content/40 font-medium truncate">
              @{friend.username || "user"}
            </p>
          </Link>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="badge badge-secondary badge-sm gap-1 font-medium">
            {getLanguageFlag(friend.nativeLanguage)}
            {friend.nativeLanguage}
          </span>
          <span className="badge badge-outline badge-sm gap-1 font-medium">
            {getLanguageFlag(friend.learningLanguage)}
            {friend.learningLanguage}
          </span>
        </div>

        <Link
          to={`/chat/${friend._id}`}
          className="btn btn-primary btn-sm w-full rounded-xl gap-2 shadow-sm shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] transition-all duration-300"
        >
          <MessageCircle className="size-4" />
          Message
        </Link>
      </div>

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          isVerified={isVerified}
          onClose={handleCloseDP}
        />
      )}
    </div>
  );
});

FriendCard.displayName = "FriendCard";
export default FriendCard;