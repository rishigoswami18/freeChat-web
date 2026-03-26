import { useEffect, useState, createContext, useContext, useCallback, useRef, useMemo } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import { useQuery } from "@tanstack/react-query";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import IncomingCallNotification from "./IncomingCallNotification";

import "@stream-io/video-react-sdk/dist/css/styles.css";

// Reliability: Static tracking for outgoing call identity
export const outgoingCallIds = new Set();

const VideoClientContext = createContext(null);

export const useVideoClient = () => useContext(VideoClientContext);

/**
 * Zyro — Premium Video/Voice Service Provider
 * Robust initialization architecture with auto-retries and identity verification.
 */
const VideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState(null);
    const [isInitializing, setIsInitializing] = useState(false);
    const { authUser } = useAuthUser();
    
    const initialInstanceRef = useRef(null);
    const userId = authUser?._id ? String(authUser._id) : null;

    // --- FETCH CREDENTIALS ---
    const { data: streamData, error: fetchError } = useQuery({
        queryKey: ["streamToken", userId],
        queryFn: getStreamToken,
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, 
        retry: 3,
    });

    useEffect(() => {
        if (fetchError) {
            console.error("❌ [VideoProvider] Credentials fetch failed:", fetchError);
            import("react-hot-toast").then(({ toast }) => {
                toast.error("Video service connection failed. Please check your network.", { id: "stream-fetch-error" });
            });
        }
    }, [fetchError]);

    const tokenProvider = useCallback(async () => {
        try {
            const data = await getStreamToken();
            return data.token;
        } catch (error) {
            console.error("❌ [VideoProvider] Token refresh failed:", error);
            throw error;
        }
    }, []);

    // --- CORE CLIENT LIFECYCLE ---
    useEffect(() => {
        if (!userId || !streamData?.token || !streamData?.apiKey) {
            if (userId && !videoClient) console.log("⏳ [VideoProvider] Waiting for credentials...");
            return;
        }

        if (initialInstanceRef.current && initialInstanceRef.current.user?.id === userId) {
            return; // Already initialized for this user
        }

        let isMounted = true;
        
        const initClient = async () => {
            if (isInitializing) return;
            setIsInitializing(true);

            try {
                // Cleanup previous identity if any
                if (initialInstanceRef.current) {
                    console.log("🔄 [VideoProvider] Swapping user identity...");
                    await initialInstanceRef.current.disconnectUser().catch(() => {});
                    initialInstanceRef.current = null;
                }

                console.log("🔌 [VideoProvider] Initializing SDK for:", userId);
                
                const client = new StreamVideoClient({
                    apiKey: streamData.apiKey,
                    user: {
                        id: userId,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    tokenProvider,
                    options: { logLevel: 'warn' }
                });

                initialInstanceRef.current = client;

                if (isMounted) {
                    setVideoClient(client);
                    console.log("✅ [VideoProvider] Service Ready");
                } else {
                    await client.disconnectUser().catch(() => {});
                }
            } catch (err) {
                console.error("❌ [VideoProvider] Init Failed:", err);
            } finally {
                if (isMounted) setIsInitializing(false);
            }
        };

        initClient();

        return () => {
            isMounted = false;
        };
    }, [userId, streamData, authUser, tokenProvider]);

    // Cleanup on complete auth loss
    useEffect(() => {
        if (!userId && initialInstanceRef.current) {
            const client = initialInstanceRef.current;
            initialInstanceRef.current = null;
            setVideoClient(null);
            client.disconnectUser().catch(() => {});
            console.log("👋 [VideoProvider] User logged out, disconnected.");
        }
    }, [userId]);

    return (
        <VideoClientContext.Provider value={videoClient}>
            {videoClient ? (
                <StreamVideo client={videoClient}>
                    <IncomingCallNotification />
                    {children}
                </StreamVideo>
            ) : (
                children
            )}
        </VideoClientContext.Provider>
    );
};

VideoProvider.displayName = "VideoProvider";
export default VideoProvider;
