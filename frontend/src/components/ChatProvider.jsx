import { createContext, useContext, useEffect, useState, useRef } from "react";
import { StreamChat } from "stream-chat";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ChatContext = createContext(null);

export const useChatClient = () => useContext(ChatContext);

// === PERFORMANCE OPTIMIZATION: Global Audio Instance ===
// Initialized precisely once outside the component lifecycle to prevent redundant 
// browser API allocations and catastrophic DOM audio leaks.
const messageSound = new Audio("https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3");

// Safe audio trigger that handles rapid-fire sounds and browser policy rejections
const playNotificationSound = () => {
    messageSound.currentTime = 0;
    messageSound.play().catch((err) => console.warn("Audio autoplay blocked:", err));
};

export const ChatProvider = ({ children }) => {
    const [chatClient, setChatClient] = useState(null);
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    
    // Connection lock preventing duplicate network calls (Fixes StrictMode double-mounting)
    const connectionRef = useRef(null);

    // Fetch Stream Chat token (Cached for stability via React Query)
    const { data: tokenData, error: tokenError } = useQuery({
        queryKey: ["streamToken", authUser?._id],
        queryFn: getStreamToken,
        enabled: !!authUser?._id,
        staleTime: 5 * 60 * 1000,
        retry: 3,
    });

    // --- Error Handlers ---
    useEffect(() => {
        if (tokenError) {
            const status = tokenError.response?.status;
            const message = tokenError.response?.data?.message || tokenError.message;
            console.error("❌ Chat Token Failure:", { status, message });

            toast.error(
                `Messenger connection failed (${status || 'Network Error'}): ${message.substring(0, 30)}...`,
                { duration: 6000, id: "chat-token-error" } // Id prevents toast spam
            );
        }
    }, [tokenError]);

    // --- Core Connection Lifecycle ---
    useEffect(() => {
        if (!authUser?._id || !tokenData?.token || !tokenData?.apiKey) {
            if (authUser && !tokenData?.token) {
                console.warn("Chat connection delayed: Waiting for token from server...");
            }
            return;
        }

        let isMounted = true;
        let client = null;
        const currentUserId = String(authUser._id);
        const STREAM_API_KEY = tokenData.apiKey;

        const connectStream = async () => {
            try {
                // Prevent duplicate simultaneous connection sweeps in React
                if (connectionRef.current) await connectionRef.current;

                client = StreamChat.getInstance(STREAM_API_KEY);

                // Setup global debug helper safely for production environments
                window.logChatStatus = () => {
                    const status = {
                        currentUserId,
                        clientUserId: client?.userID,
                        keyPreview: `${STREAM_API_KEY.substring(0, 3)}...`,
                        isConnected: client?.userID === currentUserId
                    };
                    console.table(status);
                    return status;
                };

                // Safely lock connection routine mapping
                connectionRef.current = (async () => {
                    // Bypass WebRTC logic if socket is already bound properly
                    if (client.userID === currentUserId) {
                        return client; 
                    }

                    // Security: Disconnect if lingering socket from another user identity exists (Logout scenario)
                    if (client.userID && client.userID !== currentUserId) {
                        console.log("🔄 Disconnecting previous user socket:", client.userID);
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
                    
                    return client;
                })();

                await connectionRef.current;

                if (isMounted) {
                    console.log("✅ Chat connected successfully");
                    setChatClient(client);
                }

                // Global Message / Notification Handler
                // Wrapped directly in scope avoiding 'useCallback' dependencies to guarantee access to stable client references
                const handleNewMessage = (event) => {
                    // Ignore outbound sync sweeps from self
                    if (event.user?.id === currentUserId) return;

                    const isGroup = event.channel_type === "messaging" && event.channel_id.startsWith("group_");
                    const targetId = isGroup ? event.channel_id : event.user?.id;
                    
                    // Optimization: Read location dynamically off window object to bypass React render cycle dependencies.
                    // If we strictly checked react-router location hooks here, this provider would re-render the app on every page navigation.
                    const isOnChatPage = window.location.pathname.includes(`/chat/${targetId}`);
                    
                    if (!isOnChatPage && targetId) {
                        playNotificationSound();
                        
                        // Custom Notification Toast Architecture
                        toast((t) => (
                            <div 
                                className="flex items-center gap-3 cursor-pointer" 
                                onClick={() => {
                                    toast.dismiss(t.id);
                                    navigate(`/chat/${targetId}`);
                                }}
                            >
                                <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-white/10">
                                    <img 
                                        src={event.user?.image || "/avatar.png"} 
                                        alt={event.user?.name || "User"} 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm truncate text-white">
                                        {isGroup ? `${event.channel_id.replace('group_', '').replace(/_/g, ' ')}` : event.user?.name}
                                    </p>
                                    <p className="text-[10px] font-bold text-primary mb-0.5 truncate uppercase">
                                        {isGroup ? `${event.user?.name}:` : "New Message"}
                                    </p>
                                    <p className="text-xs text-white/80 truncate max-w-[150px]">
                                        {event.message?.text || "Sent an attachment"}
                                    </p>
                                </div>
                            </div>
                        ), { 
                            duration: 5000, 
                            position: "top-right", 
                            style: { borderRadius: '14px', background: '#1c1c1c', border: '1px solid #333', padding: '12px' },
                            id: `msg-${event.message?.id}` // Stability: Prevents identical messages from stacking toasts
                        });
                    }
                };

                // Bind exact listener instances
                client.on("message.new", handleNewMessage);
                client.on("notification.message_new", handleNewMessage);

                // Preserve reference tracking so cleanup phase isn't blinded by closure
                client._memoizedMessageHandler = handleNewMessage;

            } catch (error) {
                if (isMounted) {
                    const errorMsg = error.message || "Unknown connection error";
                    console.error("❌ Chat connection failed:", error);
                    toast.error(`Messenger error: ${errorMsg.substring(0, 60)}`, {
                        duration: 5000,
                        id: "chat-conn-error"
                    });
                }
            } finally {
                connectionRef.current = null;
            }
        };

        connectStream();

        // Memory Leak Prevention Module
        return () => {
            isMounted = false;
            
            if (client) {
                if (client._memoizedMessageHandler) {
                    // Detach explicit listener references avoiding floating background tasks processing dead webhook signals
                    client.off("message.new", client._memoizedMessageHandler);
                    client.off("notification.message_new", client._memoizedMessageHandler);
                    delete client._memoizedMessageHandler; // Purge
                }
                
                // Note: We deliberately DO NOT disconnect the user on simple component unmounts. 
                // Stream 'getInstance' maintains the active WebSocket efficiently locally across page navigations.
                // Complete disconnection logic is handled exclusively if the actual user identity changes (Line 104).
            }
            
            if (window.logChatStatus) {
                delete window.logChatStatus;
            }
        };
    // By monitoring strict primitive strings, we prevent unexpected recursive connections when entire auth objects mutate unrelated state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tokenData?.token, tokenData?.apiKey, authUser?._id, navigate]); 

    return (
        <ChatContext.Provider value={chatClient}>
            {children}
        </ChatContext.Provider>
    );
};
