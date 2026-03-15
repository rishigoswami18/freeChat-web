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
 * BondBeyond — Premium Video/Voice Service Provider
 * Robust initialization architecture with auto-retries and identity verification.
 */
const VideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState(null);
    const { authUser } = useAuthUser();
    
    // Connection lock preventing race conditions in React 18+
    const initialInstanceRef = useRef(null);
    const userId = authUser?._id ? String(authUser._id) : null;

    // --- FETCH CREDENTIALS ---
    // Using TanStack Query ensures the token is cached and retried with exponential backoff on network failures.
    const { data: streamData, error: fetchError } = useQuery({
        queryKey: ["streamToken", userId],
        queryFn: getStreamToken,
        enabled: !!userId,
        staleTime: 5 * 60 * 1000, // 5 min cache
        retry: 3,
    });

    // Stable token provider function for the SDK
    const tokenProvider = useCallback(async () => {
        try {
            const data = await getStreamToken();
            console.log("🎥 Video Token Provider: Refreshed credentials");
            return data.token;
        } catch (error) {
            console.error("❌ Video Token Provider: Refresh error:", error);
            throw error;
        }
    }, []);

    // --- CORE CLIENT LIFECYCLE ---
    useEffect(() => {
        if (!userId || !streamData?.token || !streamData?.apiKey) {
            return;
        }

        let isMounted = true;
        const apiKey = streamData.apiKey;

        const initClient = async () => {
            try {
                // If identity changed, wipe previous socket
                if (initialInstanceRef.current && initialInstanceRef.current.user?.id !== userId) {
                    console.log("🔄 Video Identity: Cleaning up stale socket...");
                    await initialInstanceRef.current.disconnectUser();
                    initialInstanceRef.current = null;
                    if (isMounted) setVideoClient(null);
                }

                // Skip if already connected to this user
                if (initialInstanceRef.current) return;

                console.log("🔌 Video Identity: Initializing for user", userId);
                
                const client = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: userId,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    tokenProvider,
                });

                initialInstanceRef.current = client;

                if (isMounted) {
                    setVideoClient(client);
                    console.log("✅ Video Identity: Service ready");
                } else {
                    await client.disconnectUser();
                }
            } catch (err) {
                console.error("❌ Video Identity: Initialization failed:", err);
            }
        };

        initClient();

        return () => {
            isMounted = false;
            // Note: We avoid disconnect on every mount/unmount cycle to maintain background incoming call listeners.
            // Disposal is handled during identity swaps or app shutdowns.
        };
    }, [userId, streamData, authUser, tokenProvider]);

    // Cleanup on complete auth loss
    useEffect(() => {
        if (!userId && initialInstanceRef.current) {
            const client = initialInstanceRef.current;
            initialInstanceRef.current = null;
            setVideoClient(null);
            client.disconnectUser().catch(() => {});
        }
    }, [userId]);

    // Provide context even if value is null to ensure hooks don't fail, 
    // but downstream components should still check for presence.
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
