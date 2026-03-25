import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // 1. Clear Local/Query Cache
      queryClient.clear();

      // 2. Disable Google One-Tap for next land (Standard security practice)
      if (window.google?.accounts?.id) {
        window.google.accounts.id.disableAutoSelect();
      }

      toast.success("Logged out successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to logout");
    }
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
