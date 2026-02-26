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

    useEffect(() => {
        if (!STREAM_API_KEY) {
            console.error("VITE_STREAM_API_KEY is missing from .env");
            toast.error("Config missing: VITE_STREAM_API_KEY");
        }
    }, []);

    const { data: tokenData, error: tokenError } = useQuery({
        queryKey: ["streamToken"],
        queryFn: getStreamToken,
        enabled: !!authUser,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });

    useEffect(() => {
        if (tokenError) {
            const status = tokenError.response?.status;
            const message = tokenError.response?.data?.message || tokenError.message;
            console.error("❌ Chat Token Failure:", { status, message });

            toast.error(
                `Messenger connection failed (${status || 'Network Error'}): ${message.substring(0, 30)}...`,
                { duration: 6000 }
            );
        }
    }, [tokenError]);

    useEffect(() => {
        if (!authUser || !tokenData?.token || !STREAM_API_KEY) {
            if (authUser && !tokenData?.token) {
                console.warn("Chat connection delayed: Waiting for token from server...");
            }
            if (authUser && tokenData?.token && !STREAM_API_KEY) {
                console.error("❌ VITE_STREAM_API_KEY is missing from frontend environment variables!");
            }
            return;
        }

        let isMounted = true;

        const connect = async () => {
            try {
                const client = StreamChat.getInstance(STREAM_API_KEY);
                const currentUserId = String(authUser._id);

                // Add debugger helper for production console
                window.logChatStatus = () => {
                    const status = {
                        currentUserId,
                        clientUserId: client.userID,
                        keyPreview: `${STREAM_API_KEY.substring(0, 3)}...`,
                        hasToken: !!tokenData?.token,
                        tokenPreview: tokenData.token ? `${tokenData.token.substring(0, 10)}...` : "none",
                        isConnected: client.userID === currentUserId
                    };
                    console.table(status);
                    return status;
                };

                // If already connected for this user, just set it
                if (client.userID === currentUserId) {
                    if (isMounted) {
                        console.log("✅ Using existing chat connection");
                        setChatClient(client);
                    }
                    return;
                }

                setIsConnecting(true);

                // If connected to wrong user, disconnect first
                if (client.userID && client.userID !== currentUserId) {
                    console.log("🔄 Disconnecting previous user:", client.userID);
                    await client.disconnectUser();
                }

                console.log("🔌 Connecting to Stream Chat as:", currentUserId);
                await client.connectUser(
                    {
                        id: currentUserId,
                        name: authUser.fullName,
                        image: authUser.profilePic,
                    },
                    tokenData.token
                );

                if (isMounted) {
                    console.log("✅ Chat connected successfully");
                    setChatClient(client);
                }

                // Global Message Handler
                const handleNewMessage = (event) => {
                    if (event.user.id === currentUserId) return;
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

            } catch (error) {
                console.error("❌ Chat connection failed:", error);
                if (isMounted) {
                    toast.error("Messenger connection failed. Please check your internet.");
                }
            } finally {
                if (isMounted) setIsConnecting(false);
            }
        };

        connect();

        return () => {
            isMounted = false;
        };
    }, [tokenData, authUser, navigate]);

    return (
        <ChatContext.Provider value={chatClient}>
            {children}
        </ChatContext.Provider>
    );
};
