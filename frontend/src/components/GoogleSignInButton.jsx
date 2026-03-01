import { useEffect, useRef, useCallback, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { googleLogin, googleLoginWithAccessToken } from "../lib/api";
import toast from "react-hot-toast";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleSignInButton = ({ text = "signin_with" }) => {
    const btnRef = useRef(null);
    const queryClient = useQueryClient();
    const [gsiReady, setGsiReady] = useState(false);
    const tokenClientRef = useRef(null);

    // Mutation for ID Token method (GIS renderButton)
    const { mutate: googleLoginMutation, isPending: isPendingIdToken } = useMutation({
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

    // Mutation for Access Token method (custom popup — reliable fallback)
    const { mutate: accessTokenMutation, isPending: isPendingAccessToken } = useMutation({
        mutationFn: googleLoginWithAccessToken,
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

    const isPending = isPendingIdToken || isPendingAccessToken;

    const handleCredentialResponse = useCallback(
        (response) => {
            if (response.credential) {
                googleLoginMutation(response.credential);
            }
        },
        [googleLoginMutation]
    );

    // Initialize BOTH flows: GIS renderButton + OAuth2 token client
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn("VITE_GOOGLE_CLIENT_ID is not set");
            return;
        }

        const initGoogle = () => {
            if (window.google?.accounts?.id) {
                // Try rendering the GIS button (may or may not work)
                try {
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
                } catch (err) {
                    console.log("GIS renderButton failed:", err);
                }
            }

            // Also initialize the OAuth2 token client as fallback
            if (window.google?.accounts?.oauth2) {
                tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
                    client_id: GOOGLE_CLIENT_ID,
                    scope: "email profile openid",
                    callback: (tokenResponse) => {
                        if (tokenResponse.access_token) {
                            accessTokenMutation(tokenResponse.access_token);
                        }
                    },
                });
                setGsiReady(true);
            }
        };

        if (window.google?.accounts) {
            initGoogle();
        } else {
            const interval = setInterval(() => {
                if (window.google?.accounts) {
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
    }, [handleCredentialResponse, text, accessTokenMutation]);

    // Custom fallback button click handler
    const handleCustomGoogleClick = () => {
        if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken();
        } else {
            toast.error("Google Sign-In is not ready. Please refresh and try again.");
        }
    };

    const buttonLabel = text === "signup_with" ? "Sign up with Google" : "Sign in with Google";

    return (
        <div className="w-full space-y-4 py-2">
            {/* Divider */}
            <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-base-300/50" />
                <span className="text-[10px] font-bold opacity-30 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-base-300/50" />
            </div>

            {/* Google Button — Custom reliable button */}
            <div className="w-full flex justify-center min-h-[44px]">
                {isPending ? (
                    <div className="flex items-center justify-center w-full py-2.5 rounded-xl border border-base-300 bg-base-200/30 animate-pulse">
                        <span className="loading loading-spinner loading-xs mr-2 opacity-50"></span>
                        <span className="text-xs font-semibold opacity-50">
                            Connecting...
                        </span>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleCustomGoogleClick}
                        className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-base-300 bg-base-100 hover:bg-base-200/50 transition-all cursor-pointer"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="text-sm font-semibold opacity-80">
                            {buttonLabel}
                        </span>
                    </button>
                )}
            </div>

            {/* Hidden GIS rendered button (backup) */}
            <div
                ref={btnRef}
                className="hidden"
            />

            {!GOOGLE_CLIENT_ID && (
                <p className="text-[10px] text-error text-center font-medium opacity-70">
                    Google Sign-In is currently unavailable (Missing Client ID)
                </p>
            )}
        </div>
    );
};

export default GoogleSignInButton;
