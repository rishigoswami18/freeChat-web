import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecommendedUsers, sendFriendRequest } from "../lib/api";
import toast from "react-hot-toast";

export const useSearchUsers = (debouncedSearch) => {
    return useQuery({
        queryKey: ["searchUsers", debouncedSearch],
        queryFn: () => getRecommendedUsers(debouncedSearch),
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        keepPreviousData: true, // Keep list on screen while typing
        refetchOnWindowFocus: false, // Prevent redundant checks
        retry: 1, // Only retry once if backend glitches
    });
};

export const useFriendRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: sendFriendRequest,
        onMutate: async (userId) => {
            // Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ["searchUsers"] });

            // Snapshot the previous value
            const previousUsersKeys = queryClient.getQueriesData({ queryKey: ["searchUsers"] });

            // Optimistically update all search result lists in cache that might contain this user
            previousUsersKeys.forEach(([queryKey, previousUsers]) => {
                if (previousUsers) {
                    queryClient.setQueryData(queryKey, (old) => {
                        if (!old) return old;
                        return old.map((u) => u._id === userId ? { ...u, requestSent: true } : u);
                    });
                }
            });

            return { previousUsersKeys };
        },
        onError: (err, newTodo, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousUsersKeys) {
                context.previousUsersKeys.forEach(([queryKey, previousUsers]) => {
                    queryClient.setQueryData(queryKey, previousUsers);
                });
            }
            toast.error(err.response?.data?.message || "Failed to send request.");
        },
        onSuccess: () => {
             toast.success("Friend request sent! ✨");
             // Instead of a full invalidation that clears the list and flashes, 
             // we let the optimistic UI do its job. We only invalidate in the background.
             queryClient.invalidateQueries({ queryKey: ["searchUsers"] });
        }
    });
};
