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
      queryClient.clear(); // Clear EVERYTHING on logout for security
      toast.success("Logged out successfully");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to logout");
    }
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;