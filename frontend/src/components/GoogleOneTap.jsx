import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin } from "../lib/api";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * GoogleOneTap Component
 * Optimizes login by showing the "One Tap" UI for already-signed-in users.
 */
const GoogleOneTap = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();

    const { mutate: doGoogleLogin } = useMutation({
        mutationFn: googleLogin,
        onSuccess: (data) => {
            queryClient.setQueryData(["authUser"], data.user);
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success(`Welcome back, ${data.user.fullName.split(" ")[0]}! ✨`, {
                icon: '👋',
                duration: 4000
            });
        },
        onError: (err) => {
            console.error("One Tap Login Failed:", err);
        }
    });

    useEffect(() => {
        // Only run if user is NOT logged in and we have a client ID
        if (authUser || !GOOGLE_CLIENT_ID || !window.google) return;

        try {
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: (response) => {
                    if (response.credential) {
                        doGoogleLogin(response.credential); // Simplified parameter
                    }
                },
                cancel_on_tap_outside: false,
                context: 'signin',
                ux_mode: 'popup'
            });

            // Prompt One-Tap
            window.google.accounts.id.prompt((notification) => {
                if (notification.isNotDisplayed()) {
                    console.log("One Tap not displayed:", notification.getNotDisplayedReason());
                }
            });
        } catch (err) {
            console.warn("One Tap Initialization failed", err);
        }
    }, [authUser, doGoogleLogin]);

    return null; // Invisible component
};

export default GoogleOneTap;
