import { createContext, useContext, useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatContext = createContext(null);

export const useChatClient = () => useContext(ChatContext);

// notification sound
const messageSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");

export const ChatProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const { authUser } = useAuthUser();
    const navigate = useNavigate();

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

                setChatClient(client);

                // Global Message Handler
                const handleNewMessage = (event) => {
                    // Don't show notification if it's our own message
                    if (event.user.id === authUser._id) return;

                    // Only show if not on the specific chat page
                    const isOnChatPage = window.location.pathname.includes(`/chat/${event.user.id}`);

                    if (!isOnChatPage) {
                        // Play sound
                        messageSound.play().catch(() => { }); // Catch and ignore play errors

                        // Show toast
                        toast((t) => (
                            <div
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={() => {
                                    navigate(`/chat/${event.user.id}`);
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

                // Listen for both regular and background notifications
                client.on("message.new", handleNewMessage);
                client.on("notification.message_new", handleNewMessage);

                return () => {
                    client.off("message.new", handleNewMessage);
                    client.off("notification.message_new", handleNewMessage);
                };
            } catch (error) {
                console.error("ChatProvider Connection Error:", error);
            }
        };

        initChat();
    }, [tokenData, authUser, navigate]);

    return (
        <ChatContext.Provider value={chatClient}>
            {children}
        </ChatContext.Provider>
    );
};
