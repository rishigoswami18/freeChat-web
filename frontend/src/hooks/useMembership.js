import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembershipStatus, cancelMembership } from "../lib/api";
import toast from "react-hot-toast";

export const useMembershipState = () => {
    return useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
        staleTime: 1000 * 60 * 10, // 10 minutes cache
        cacheTime: 1000 * 60 * 30, // 30 minutes garbage collection
        refetchOnWindowFocus: true, // Auto refetch if navigating back from browser banking tabs
        retry: 2, // Network glitch protection
    });
};

export const useCancelMembership = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelMembership,
        onMutate: async () => {
            // Cancel any outgoing refetches so they don't overwrite optimistic update
            await queryClient.cancelQueries({ queryKey: ["membershipStatus"] });

            // Snapshot the previous value
            const previousStatus = queryClient.getQueryData(["membershipStatus"]);

            // Optimistically downgrade user status before backend confirms
            queryClient.setQueryData(["membershipStatus"], (old) => {
                if (old) {
                    return { ...old, isMember: false, role: "user" };
                }
                return old;
            });

            return { previousStatus };
        },
        onError: (err, _, context) => {
            // Roll back on failure
            if (context?.previousStatus) {
                queryClient.setQueryData(["membershipStatus"], context.previousStatus);
            }
            toast.error(err.response?.data?.message || "Failed to cancel membership.");
        },
        onSuccess: () => {
            toast.success("Membership cancelled successfully.");
        },
        onSettled: () => {
            // Keep background sync clean
            queryClient.invalidateQueries({ queryKey: ["membershipStatus"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        }
    });
};
