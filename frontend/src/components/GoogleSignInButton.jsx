import { useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin } from "../lib/api";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ text = "signin_with" }) => {
    const btnRef = useRef(null);
    const queryClient = useQueryClient();

    const { mutate: googleLoginMutation, isPending } = useMutation({
        mutationFn: googleLogin,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            toast.success("Signed in with Google!");
        },
        onError: (error) => {
            toast.error(
                error.response?.data?.message || "Google sign-in failed. Please try again."
            );
        },
    });

    const handleCredentialResponse = useCallback(
        (response) => {
            if (response.credential) {
                googleLoginMutation(response.credential);
            }
        },
        [googleLoginMutation]
    );

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("VITE_GOOGLE_CLIENT_ID is not set");
            return;
        }

        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                window.google.accounts.id.initialize({
                    client_id: GOOGLE_CLIENT_ID,
                    callback: handleCredentialResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true,
                });

                if (btnRef.current) {
                    window.google.accounts.id.renderButton(btnRef.current, {
                        theme: "outline",
                        size: "large",
                        width: btnRef.current.offsetWidth || 320,
                        text: text,
                        shape: "pill",
                        logo_alignment: "left",
                    });
                }
            }
        };

        if (window.google?.accounts?.id) {
            initGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google?.accounts?.id) {
                    clearInterval(interval);
                    initGoogle();
                }
            }, 100);

            const timeout = setTimeout(() => clearInterval(interval), 10000);
            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [handleCredentialResponse, text]);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <div className="w-full space-y-3">
            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs font-medium opacity-40 uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-base-300" />
            </div>

            {/* Button */}
            {isPending ? (
                <div className="flex items-center justify-center py-3 rounded-full border border-base-300 bg-base-200/50">
                    <span className="loading loading-spinner loading-sm mr-2"></span>
                    <span className="text-sm font-medium opacity-70">
                        Signing in with Google...
                    </span>
                </div>
            ) : (
                <div
                    ref={btnRef}
                    className="w-full flex items-center justify-center [&>div]:w-full"
                />
            )}
        </div>
    );
};

export default GoogleSignInButton;
