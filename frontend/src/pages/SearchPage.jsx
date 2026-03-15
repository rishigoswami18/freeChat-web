import { useState, useCallback, useMemo } from "react";
import { useSearchUsers, useFriendRequest } from "../hooks/useSearchUsers";
import { ChatSkeleton } from "../components/Skeletons";
import { useDebounce } from "../hooks/useDebounce"; // We'll create a safer hook for this

import SearchInput from "../components/search/SearchInput";
import UserSearchResult from "../components/search/UserSearchResult";
import EmptySearchState from "../components/search/EmptySearchState";

const SearchPage = () => {
    // 1. UI Controlled State
    const [searchTerm, setSearchTerm] = useState("");
    
    // 2. Extracted React standard debounce hook bounds
    const debouncedSearch = useDebounce(searchTerm, 300);

    // 3. Isolated Network Hooks
    const { data: users = [], isLoading } = useSearchUsers(debouncedSearch);
    const { mutate: addFriend, variables: pendingUserId, isPending } = useFriendRequest();

    // 4. Stable Handlers 
    const handleAddFriend = useCallback((userId) => {
        addFriend(userId);
    }, [addFriend]);

    // 5. Derived Computations
    const showEmptyState = !isLoading && users.length === 0;

    return (
        <div 
            className="px-4 py-6 sm:p-6 lg:p-8 sm:max-w-2xl mx-auto space-y-6"
            // Accessibility labels for screenreaders entering the view
            role="region" 
            aria-label="User Search Page"
        >
            <SearchInput 
                searchTerm={searchTerm} 
                setSearchTerm={setSearchTerm} 
            />

            <div 
                className="space-y-4"
                role="list"
                aria-live="polite"
            >
                {isLoading ? (
                    // Display loading skeleton array to prevent page jerk
                    <ChatSkeleton />
                ) : showEmptyState ? (
                    <EmptySearchState isSearching={!!debouncedSearch} />
                ) : (
                    users.map((user) => (
                        <UserSearchResult 
                            key={user._id} 
                            user={user} 
                            onAddFriend={handleAddFriend} 
                            isPending={isPending && pendingUserId === user._id} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

export default SearchPage;
