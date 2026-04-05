import { useState, useCallback } from "react";
import { useSearchUsers, useFriendRequest } from "../hooks/useSearchUsers";
import { ChatSkeleton } from "../components/Skeletons";
import { useDebounce } from "../hooks/useDebounce";

import SearchInput from "../components/search/SearchInput";
import UserSearchResult from "../components/search/UserSearchResult";
import EmptySearchState from "../components/search/EmptySearchState";

import { axiosInstance } from "../lib/axios";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, BadgeCheck, Search as SearchIcon } from "lucide-react";
import { motion } from "framer-motion";

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 300);

    const { data: trending = [], isLoading: trendingLoading } = useQuery({
        queryKey: ["trendingCreators"],
        queryFn: async () => {
            const res = await axiosInstance.get("/users/trending");
            return res.data;
        }
    });

    const { data: users = [], isLoading } = useSearchUsers(debouncedSearch);
    const { mutate: addFriend, variables: pendingUserId, isPending } = useFriendRequest();

    const handleAddFriend = useCallback((userId) => {
        addFriend(userId);
    }, [addFriend]);

    const categories = [
        { name: "Digital Creators", color: "#818cf8", bgColor: "rgba(99,102,241,0.08)", borderColor: "rgba(99,102,241,0.15)", icon: "💎" },
        { name: "Finance", color: "#34d399", bgColor: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.15)", icon: "📈" },
        { name: "Lifestyle", color: "#fbbf24", bgColor: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.15)", icon: "🌍" },
        { name: "AI & Tech", color: "#c084fc", bgColor: "rgba(192,132,252,0.08)", borderColor: "rgba(192,132,252,0.15)", icon: "🧠" }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white px-4 sm:px-6 py-8 pb-32">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <header className="space-y-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                            Explore <SearchIcon className="size-5 text-indigo-400" />
                        </h1>
                        <p className="text-[11px] text-white/30 font-medium mt-1">Discover creators, communities, and trending content</p>
                    </div>
                    <SearchInput 
                        searchTerm={searchTerm} 
                        setSearchTerm={setSearchTerm} 
                    />
                </header>

                {!searchTerm && (
                    <div className="space-y-8">
                        {/* Trending Creators */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-base font-bold">Trending Creators</h2>
                                    <p className="text-[10px] text-white/30 font-medium mt-0.5">Popular this week</p>
                                </div>
                                <TrendingUp className="size-4 text-emerald-400" />
                            </div>
                            
                            <div className="flex gap-3 overflow-x-auto pb-3 no-scrollbar">
                                {trendingLoading ? (
                                    [1, 2, 3].map(i => <div key={i} className="min-w-[130px] h-44 bg-white/[0.02] animate-pulse rounded-2xl border border-white/5" />)
                                ) : trending.map((creator) => (
                                    <motion.div 
                                        key={creator._id}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => window.location.href = `/user/${creator._id}`}
                                        className="min-w-[130px] bg-white/[0.02] border border-white/5 rounded-2xl p-4 text-center space-y-3 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                                    >
                                        <div className="relative mx-auto size-14">
                                            <img src={creator.profilePic || "/avatar.png"} alt="" className="size-full rounded-xl object-cover ring-1 ring-white/10" />
                                            {creator.isVerified && <BadgeCheck className="absolute -top-1 -right-1 size-4 text-sky-400 fill-[#020617]" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold truncate">{creator.fullName.split(' ')[0]}</p>
                                            <p className="text-[10px] text-white/30 truncate">@{creator.username}</p>
                                        </div>
                                        <div className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/15 rounded-full">
                                            <p className="text-[10px] font-semibold text-amber-400">🪙 {creator.chatPrice || "FREE"}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="space-y-4">
                            <h2 className="text-base font-bold">Browse Categories</h2>
                            <div className="grid grid-cols-2 gap-2.5">
                                {categories.map(cat => (
                                    <div 
                                        key={cat.name} 
                                        className="h-20 rounded-2xl flex flex-col items-center justify-center gap-1.5 group cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        style={{ 
                                            backgroundColor: cat.bgColor, 
                                            border: `1px solid ${cat.borderColor}` 
                                        }}
                                    >
                                        <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: cat.color }}>{cat.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Search Results */}
                {searchTerm && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                             <h2 className="text-sm font-semibold text-white/60">Results</h2>
                             <span className="text-[10px] font-medium text-white/30">{users.length} found</span>
                        </div>
                        <div className="space-y-3" role="list" aria-live="polite">
                            {isLoading ? (
                                <ChatSkeleton />
                            ) : users.length === 0 ? (
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
                )}
            </div>
        </div>
    );
};

export default SearchPage;
