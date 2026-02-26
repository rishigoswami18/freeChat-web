import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { LANGUAGE_TO_FLAG } from "../constants";

const FriendCard = ({ friend }) => {
  return (
    <div className="card bg-base-200/80 border border-base-300/50 card-hover rounded-2xl overflow-hidden">
      <div className="card-body p-4">
        {/* USER INFO */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <div className="avatar w-12 h-12 rounded-full overflow-hidden ring-2 ring-base-300">
              <img
                src={friend.profilePic}
                alt={friend.fullName}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {friend.fullName}
            </h3>
            <p className="text-[11px] text-base-content/40 font-medium">
              @{friend.username || "user"}
            </p>
          </div>
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
          className="btn btn-primary btn-sm w-full rounded-xl gap-2 shadow-sm shadow-primary/20 hover:shadow-primary/30 transition-shadow"
        >
          <MessageCircle className="size-4" />
          Message
        </Link>
      </div>
    </div>
  );
};
export default FriendCard;

export function getLanguageFlag(language) {
  if (!language) return null;

  const langLower = language.toLowerCase();
  const countryCode = LANGUAGE_TO_FLAG[langLower];

  if (countryCode) {
    return (
      <img
        src={`https://flagcdn.com/24x18/${countryCode}.png`}
        alt={`${langLower} flag`}
        className="h-3 mr-0.5 inline-block"
      />
    );
  }
  return null;
}