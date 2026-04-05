import { useState, useEffect, useMemo } from "react";
import { useChatClient } from "../components/ChatProvider";
import { useQuery } from "@tanstack/react-query";
import { getFriendRequests, getNotifications } from "../lib/api";
import useAuthUser from "./useAuthUser";

const useNotificationCounts = () => {
    const chatClient = useChatClient();
    const { authUser } = useAuthUser();
    const [unreadMessages, setUnreadMessages] = useState(0);

    // 1. Fetch Friend Requests
    const { data: friendRequests } = useQuery({
        queryKey: ["friendRequests"],
        queryFn: getFriendRequests,
        enabled: !!authUser,
        refetchInterval: 60000, 
    });

    // 2. Fetch Social Notifications
    const { data: notifications = [] } = useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        enabled: !!authUser,
        refetchInterval: 30000, 
    });

    const unreadPulseCount = useMemo(() => 
        notifications.filter(n => !n.isRead).length
    , [notifications]);

    const notificationCount = (friendRequests?.incomingReqs?.length || 0) + unreadPulseCount;

    useEffect(() => {
        if (!chatClient) return;

        const updateCount = () => {
            const count = chatClient.user?.total_unread_count ?? chatClient.total_unread_count ?? 0;
            setUnreadMessages(count);
        };

        updateCount();

        const events = [
            'message.new',
            'notification.message_new',
            'notification.mark_read',
            'message.read'
        ];

        const handleChatEvent = (event) => {
            if (event.total_unread_count !== undefined) {
                setUnreadMessages(event.total_unread_count);
            } else {
                updateCount();
            }
        };

        events.forEach(eventName => chatClient.on(eventName, handleChatEvent));
        const interval = setInterval(updateCount, 60000);

        return () => {
            events.forEach(eventName => chatClient.off(eventName, handleChatEvent));
            clearInterval(interval);
        };
    }, [chatClient]);

    return {
        unreadMessages,
        notificationCount,
        unreadPulseCount
    };
};

export default useNotificationCounts;
