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
                    ux_mode: "popup",
                    use_fedcm_for_prompt: false,
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


    return (
        <div className="w-full space-y-4 py-2">
            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-base-300/50" />
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-base-300/50" />
            </div>

            {/* Google Button Container */}
            <div className="w-full flex justify-center min-h-[44px]">
                {isPending ? (
                    <div className="flex items-center justify-center w-full py-2.5 rounded-xl border border-base-300 bg-base-200/30 animate-pulse">
                        <span className="loading loading-spinner loading-xs mr-2 opacity-50"></span>
                        <span className="text-xs font-semibold opacity-50">
                            Connecting...
                        </span>
                    </div>
                ) : (
                    <div
                        ref={btnRef}
                        className="w-full flex justify-center [&>div]:mx-auto"
                        style={{ minWidth: '200px' }}
                    />
                )}
            </div>

            {!GOOGLE_CLIENT_ID && (
                <p className="text-[10px] text-error text-center font-medium opacity-70">
                    Google Sign-In is currently unavailable (Missing Client ID)
                </p>
            )}
        </div>
    );
};

export default GoogleSignInButton;

