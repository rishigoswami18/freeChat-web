import { createContext, useContext, useEffect, useState, useRef } from "react";
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
    const [isConnecting, setIsConnecting] = useState(false);
    const connectionRef = useRef(null);
    const { authUser } = useAuthUser();
    const navigate = useNavigate();

    const { data: tokenData, error: tokenError } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });

    useEffect(() => {
        if (tokenError) {
            console.error("Failed to fetch stream token:", tokenError);
            toast.error("Messenger connection failed. Please refresh.");
        }
    }, [tokenError]);

    useEffect(() => {
        let isInstanceCurrent = true;

        const initChat = async () => {
            if (!tokenData?.token || !authUser) return;

            // If already connected correctly, skip
            const client = StreamChat.getInstance(STREAM_API_KEY);
            if (client.userID === authUser._id && chatClient) return;

            // Prevent overlapping connection attempts
            if (connectionRef.current === tokenData.token) return;
            connectionRef.current = tokenData.token;

            try {
                setIsConnecting(true);

                // Disconnect existing wrong user if any
                if (client.userID && client.userID !== authUser._id) {
                    await client.disconnectUser();
                }

                // Connect user
                if (client.userID !== authUser._id) {
                    await client.connectUser(
                        {
                            id: authUser._id,
                            name: authUser.fullName,
                            image: authUser.profilePic,
                        },
                        tokenData.token
                    );
                }

                if (isInstanceCurrent) {
                    console.log("Stream Chat Connected:", authUser.fullName);
                    setChatClient(client);
                }

                // Message Handlers
                const handleNewMessage = (event) => {
                    if (event.user.id === authUser._id) return;
                    const isOnChatPage = window.location.pathname.includes(`/chat/${event.user.id}`);
                    if (!isOnChatPage) {
                        messageSound.play().catch(() => { });
                        toast((t) => (
                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => {
                                navigate(`/chat/${event.user.id}`);
                                toast.dismiss(t.id);
                            }}>
                                <div className="avatar w-10 h-10 rounded-full overflow-hidden shrink-0">
                                    <img src={event.user.image || "/avatar.png"} alt={event.user.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate">{event.user.name}</p>
                                    <p className="text-xs opacity-80 truncate max-w-[150px]">{event.message.text}</p>
                                </div>
                            </div>
                        ), { duration: 5000, position: "top-right", style: { borderRadius: '12px', background: '#1c1c1c', color: '#fff', border: '1px solid #333', padding: '12px' } });
                    }
                };

                client.on("message.new", handleNewMessage);
                client.on("notification.message_new", handleNewMessage);

            } catch (err) {
                console.error("Chat Connection Error:", err);
                connectionRef.current = null;
            } finally {
                if (isInstanceCurrent) setIsConnecting(false);
            }
        };

        initChat();

        return () => {
            isInstanceCurrent = false;
        };
    }, [tokenData, authUser, navigate, chatClient]);

    return (
        <ChatContext.Provider value={chatClient}>
            {children}
        </ChatContext.Provider>
    );
};
