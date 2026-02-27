import { useEffect, useState, createContext, useContext, useCallback, useRef } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { getStreamToken } from "../lib/api";
import IncomingCallNotification from "./IncomingCallNotification";

import "@stream-io/video-react-sdk/dist/css/styles.css";

// Module-level set to track call IDs that WE initiated
// This is the reliable way to distinguish outgoing vs incoming
export const outgoingCallIds = new Set();

// Cache the API key once fetched from backend
let cachedApiKey = null;

const VideoClientContext = createContext(null);

export const useVideoClient = () => useContext(VideoClientContext);

const VideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState(null);
    const { authUser } = useAuthUser();
    const clientRef = useRef(null);

    // Token provider function — Stream SDK calls this to get/refresh tokens
    const tokenProvider = useCallback(async () => {
        const data = await getStreamToken();
        // Cache the API key from the backend response
        if (data.apiKey) cachedApiKey = data.apiKey;
        console.log("🎥 Video token refreshed");
        return data.token;
    }, []);

    useEffect(() => {
        if (!authUser) return;

        // Prevent duplicate initialization
        if (clientRef.current) return;

        const userId = String(authUser._id);

        // First fetch the token + apiKey from backend, then create the client
        const initClient = async () => {
            try {
                const data = await getStreamToken();
                const apiKey = data.apiKey;
                cachedApiKey = apiKey;

                if (!apiKey) {
                    console.error("❌ No API key received from backend");
                    return;
                }

                const client = new StreamVideoClient({
                    apiKey,
                    user: {
                        id: userId,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    tokenProvider,
                });

                clientRef.current = client;
                setVideoClient(client);
                console.log("🎥 Stream Video client created for:", userId);
            } catch (error) {
                console.error("🎥 Failed to init video client:", error);
            }
        };

        initClient();

        return () => {
            if (clientRef.current) {
                console.log("🎥 Disconnecting Stream Video client");
                clientRef.current.disconnectUser();
                clientRef.current = null;
                setVideoClient(null);
            }
        };
    }, [authUser, tokenProvider]);

    // No client yet — render children without video context
    if (!videoClient) return <>{children}</>;

    return (
        <VideoClientContext.Provider value={videoClient}>
            <StreamVideo client={videoClient}>
                <IncomingCallNotification />
                {children}
            </StreamVideo>
        </VideoClientContext.Provider>
    );
};

export default VideoProvider;
