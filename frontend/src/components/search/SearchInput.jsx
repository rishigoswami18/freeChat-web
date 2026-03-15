import { memo } from "react";
import { Search, X } from "lucide-react";

/**
 * Isolated controlled input to prevent rendering the entire user list tree on every keystroke.
 */
const SearchInput = memo(({ searchTerm, setSearchTerm }) => {
    return (
        <div className="relative group w-full max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors pointer-events-none" />
            
            <input
                type="text"
                aria-label="Search users"
                placeholder="Search by name or @username..."
                className="input input-bordered w-full pl-12 h-14 bg-base-200 border-none focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl text-lg shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                    className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs hover:bg-base-300"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
});

SearchInput.displayName = "SearchInput";

export default SearchInput;
