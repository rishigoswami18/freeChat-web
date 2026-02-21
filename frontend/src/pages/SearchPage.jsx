import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecommendedUsers, sendFriendRequest } from "../lib/api";
import { Search, UserPlus, Check, X, Loader2, Star } from "lucide-react";
import toast from "react-hot-toast";

const SearchPage = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data: users = [], isLoading } = useQuery({
        queryKey: ["searchUsers", debouncedSearch],
        queryFn: () => getRecommendedUsers(debouncedSearch),
        enabled: true,
    });

    const { mutate: addFriend, variables: pendingUserId } = useMutation({
        mutationFn: sendFriendRequest,
        onSuccess: () => {
            toast.success("Friend request sent! ✨");
            queryClient.invalidateQueries({ queryKey: ["searchUsers"] });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Something went wrong");
        },
    });

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors" />
                <input
                    type="text"
                    placeholder="Search for friends by name..."
                    className="input input-bordered w-full pl-12 h-14 bg-base-200 border-none focus:ring-2 focus:ring-primary/20 transition-all rounded-2xl text-lg shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 btn btn-ghost btn-circle btn-xs"
                    >
                        <X className="size-4" />
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="size-10 animate-spin text-primary opacity-20" />
                        <p className="text-base-content/40 font-medium animate-pulse">Finding friends...</p>
                    </div>
                ) : users.length > 0 ? (
                    users.map((user) => (
                        <div
                            key={user._id}
                            className={`group p-4 rounded-2xl flex items-center gap-4 transition-all duration-300 border shadow-sm ${user.isTandemMatch
                                    ? "bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20 hover:border-primary/40 shadow-md ring-1 ring-primary/5"
                                    : "bg-base-200/50 hover:bg-base-200 border-transparent hover:border-primary/10"
                                }`}
                        >
                            <div className="avatar">
                                <div className={`size-14 rounded-full ring-2 transition-all ${user.isTandemMatch ? "ring-primary/40 scale-105" : "ring-transparent group-hover:ring-primary/20"
                                    }`}>
                                    <img src={user.profilePic || "/avatar.png"} alt={user.fullName} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base tracking-tight">{user.fullName}</h3>
                                    {user.isTandemMatch && (
                                        <span className="badge badge-primary badge-sm gap-1 py-2.5 font-bold animate-pulse">
                                            <Star className="size-3 fill-current" />
                                            Tandem Match
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-base-content/50 font-medium truncate">
                                    {user.nativeLanguage} • Learning {user.learningLanguage}
                                </p>
                            </div>
                            <button
                                onClick={() => addFriend(user._id)}
                                disabled={pendingUserId === user._id}
                                className={`btn btn-sm rounded-xl px-4 transition-all duration-300 ${pendingUserId === user._id ? "btn-disabled" : "btn-primary hover:scale-105"
                                    }`}
                            >
                                {pendingUserId === user._id ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="size-4 mr-1.5" />
                                        <span>Add</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                        <div className="size-20 bg-base-200 rounded-full flex items-center justify-center opacity-50">
                            <Search className="size-10 text-base-content/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-lg font-bold text-base-content/60">No new users found</p>
                            <p className="text-sm text-base-content/40">Try searching for a different name!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
