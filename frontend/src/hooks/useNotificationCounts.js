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

        const updateCount = () => {
            const count = chatClient.user?.total_unread_count ?? chatClient.total_unread_count ?? 0;
            setUnreadMessages(count);
        };

        // Initial check
        updateCount();

        // Specific events that always affect unread counts
        const events = [
            'message.new',
            'notification.message_new',
            'notification.mark_read',
            'message.read',
            'connection.changed',
            'user.updated'
        ];

        const handleChatEvent = (event) => {
            if (event.total_unread_count !== undefined) {
                setUnreadMessages(event.total_unread_count);
            } else {
                updateCount();
            }
        };

        events.forEach(eventName => {
            chatClient.on(eventName, handleChatEvent);
        });

        // Failsafe: Sync every 60 seconds in case events are missed
        const interval = setInterval(updateCount, 60000);

        return () => {
            events.forEach(eventName => {
                chatClient.off(eventName, handleChatEvent);
            });
            clearInterval(interval);
        };
    }, [chatClient]);

    return {
        unreadMessages,
        notificationCount
    };
};

export default useNotificationCounts;
