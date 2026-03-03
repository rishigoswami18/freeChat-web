import { useState, useEffect } from "react";
import { useChatClient } from "../components/ChatProvider";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests } from "../lib/api";
import useAuthUser from "./useAuthUser";

const useNotificationCounts = () => {
    const chatClient = useChatClient();
    const { authUser } = useAuthUser();
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Fetch friend requests for notification count
    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendRequests,
        enabled: !!authUser,
        refetchInterval: 30000, // Poll every 30s for friend requests
    });

    const notificationCount = friendRequests?.incomingReqs?.length || 0;

    useEffect(() => {
        if (!chatClient) return;

        // Set initial count
        setUnreadMessages(chatClient.total_unread_count || 0);

        // Listen for message events to update count
        const handleEvent = (event) => {
            if (event.total_unread_count !== undefined) {
                setUnreadMessages(event.total_unread_count);
            }
        };

        chatClient.on(handleEvent);
        return () => chatClient.off(handleEvent);
    }, [chatClient]);

    return {
        unreadMessages,
        notificationCount
    };
};

export default useNotificationCounts;
