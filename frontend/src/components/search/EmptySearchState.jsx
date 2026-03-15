import { memo } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

/**
 * Rendered when a search finds no users, or the query relies on a blank state.
 */
const EmptySearchState = memo(({ isSearching }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center gap-4 animate-in fade-in duration-500">
            <div className="empty-state-icon">
                <Search className="size-8 text-primary/50" />
            </div>
            <div className="space-y-1">
                <p className="text-lg font-bold text-base-content/60">
                    {isSearching ? "No users found" : "Looking for someone?"}
                </p>
                <p className="text-sm text-base-content/40">
                    {isSearching ? "Check the spelling or try a different username!" : "Type a name or username in the search bar above."}
                </p>
                <p className="text-xs text-base-content/30 mt-2 italic">
                    Note: Only new people show up here. Check your <Link to="/friends" className="link link-primary">Friends</Link> page for existing connections.
                </p>
            </div>
        </div>
    );
});

EmptySearchState.displayName = "EmptySearchState";

export default EmptySearchState;
