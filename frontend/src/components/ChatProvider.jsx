import { createContext, useContext, useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatContext = createContext(null);

export const useChatClient = () => useContext(ChatContext);

// notification sound
const messageSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");

export const ChatProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const { authUser } = useAuthUser();
    const currentPath = window.location.pathname;

    const { data: tokenData } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
    });

    useEffect(() => {
        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;

            try {
                const client = StreamChat.getInstance(STREAM_API_KEY);

                if (client.userID !== authUser._id) {
                    console.log("ChatProvider: Connecting user...", authUser._id);
                    if (client.userID) await client.disconnectUser();
                    await client.connectUser(
                        {
                            id: authUser._id,
                            name: authUser.fullName,
                            image: authUser.profilePic,
                        },
                        tokenData.token
                    );
                }

                console.log("ChatProvider: Client connected and ready.");
                setChatClient(client);

                // Listen for new messages globally
                const handleNewMessage = (event) => {
                    console.log("ChatProvider: New message event received:", event);

                    // Don't show notification if it's our own message
                    if (event.user.id === authUser._id) return;

                    // Don't show notification if we are currently chatting with this person
                    // Path check: /chat/targetUserId
                    const isOnChatPage = window.location.pathname.includes(`/chat/${event.user.id}`);
                    console.log(`ChatProvider: isOnChatPage for ${event.user.id}? ${isOnChatPage}`);

                    if (!isOnChatPage) {
                        console.log("ChatProvider: Triggering notification for", event.user.name);
                        // Play sound
                        messageSound.play().catch(e => console.log("Sound play blocked:", e));

                        // Show toast
                        toast((t) => (
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => {
                                    window.location.href = `/chat/${event.user.id}`;
                                    toast.dismiss(t.id);
                                }}
                            >
                                <div className="avatar w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img
                                        src={event.user.image || "/avatar.png"}
                                        alt={event.user.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{event.user.name}</p>
                                    <p className="text-xs opacity-80 truncate max-w-[150px]">{event.message.text}</p>
                                </div>
                            </div>
                        ), {
                            duration: 5000,
                            position: "top-right",
                            style: {
                                borderRadius: '12px',
                                background: '#1c1c1c',
                                color: '#fff',
                                border: '1px solid #333',
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)',
                                padding: '12px',
                            },
                        });
                    }
                };

                // 'message.new' is for messages in channels we are watching
                // 'notification.message_new' is for global notifications on messages
                client.on("message.new", handleNewMessage);
                client.on("notification.message_new", handleNewMessage);

                return () => {
                    console.log("ChatProvider: Cleaning up listeners.");
                    client.off("message.new", handleNewMessage);
                    client.off("notification.message_new", handleNewMessage);
                };
            } catch (error) {
                console.error("ChatProvider: Error connecting to chat globally:", error);
            }
        };

        initChat();

        return () => {
            if (chatClient) {
                // We might want to keep it connected for notifications, 
                // but disconnect on logout or component destruction
            }
        };
    }, [tokenData, authUser]);

    return (
        <ChatContext.Provider value={chatClient}>
            {children}
        </ChatContext.Provider>
    );
};
