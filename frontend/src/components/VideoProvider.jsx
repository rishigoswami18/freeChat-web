import { useEffect, useState, createContext, useContext } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import IncomingCallNotification from "./IncomingCallNotification";

import "@stream-io/video-react-sdk/dist/css/styles.css";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

// Module-level set to track call IDs that WE initiated
// This is the reliable way to distinguish outgoing vs incoming
export const outgoingCallIds = new Set();

const VideoClientContext = createContext(null);

export const useVideoClient = () => useContext(VideoClientContext);

const VideoProvider = ({ children }) => {
    const [videoClient, setVideoClient] = useState(null);
    const { authUser } = useAuthUser();

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    useEffect(() => {
        if (!authUser || !tokenData?.token) return;

        const client = new StreamVideoClient({
            apiKey: STREAM_API_KEY,
            user: {
                id: authUser._id,
                name: authUser.fullName,
                image: authUser.profilePic,
            },
            token: tokenData.token,
        });

        setVideoClient(client);

        return () => {
            client.disconnectUser();
            setVideoClient(null);
        };
    }, [authUser, tokenData]);

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
