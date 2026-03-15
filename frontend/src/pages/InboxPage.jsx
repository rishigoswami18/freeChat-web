import { useState, useEffect, useMemo, useCallback, useDeferredValue, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Search, X, BadgeCheck, Users, ChevronDown, Edit } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";
import toast from "react-hot-toast";
import { useChatClient } from "../components/ChatProvider";
import useAuthUser from "../hooks/useAuthUser";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";
import { ChatSkeleton } from "../components/Skeletons";

// === UTILITIES ===
const timeAgo = (iso) => {
    if (!iso) return "";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
};

// === STREAM CHAT DATA MAPPING ===
// Extracted outside component to prevent re-creation and memory leaks
const mapChannelToConversation = (channel, authUser) => {
    const isGroup = channel.id.startsWith("group_");
    let partner = { name: "Unknown", avatar: "/avatar.png", id: channel.id };

    if (isGroup) {
        partner = {
            name: channel.data.name || "Group",
            avatar: channel.data.image || "/avatar.png",
            id: channel.id
        };
    } else {
        const otherMember = Object.values(channel.state.members).find(
            (m) => m.user?.id !== authUser._id
        );
        
        let name = otherMember?.user?.name || "Deleted User";
        let avatar = otherMember?.user?.image || "/avatar.png";
        const id = otherMember?.user?.id || "unknown";

        if (id === "ai-user-id") {
            name = authUser.aiPartnerName || "Aria";
            avatar = authUser.aiPartnerPic || "/ai-girlfriend.png";
        } else if (id === "ai-friend-id") {
            name = authUser.aiFriendName || "Golu";
            avatar = authUser.aiFriendPic || "/ai-bestfriend.png";
        } else if (id === "ai-coach-id") {
            name = "Dr. Bond (Relationship Coach)";
            avatar = "https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png";
        }

        partner = {
            name,
            avatar,
            id,
            role: otherMember?.user?.role,
            isVerified: otherMember?.user?.isVerified
        };
    }

    const lastMessage = channel.state.messages[channel.state.messages.length - 1];

    return {
        id: channel.id,
        targetUserId: partner.id,
        partner,
        lastMessage: lastMessage?.text || "No messages yet",
        timestamp: channel.state.last_message_at || channel.data.created_at,
        unread: channel.countUnread() > 0,
        rawChannel: channel
    };
};

// === SUBCOMPONENT: Conversation Item ===
// Fully memoized item ensuring 100+ lists only render the physically changed message nodes
const ConversationItem = memo(({ conv, onViewAvatar, onDelete }) => {
    // Isolated callbacks inside sub-component prevent mapping recreation overhead
    const handleAvatarClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onViewAvatar({ 
            url: conv.partner.avatar, 
            name: conv.partner.name, 
            isVerified: conv.partner.isVerified || conv.partner.role === "admin" 
        });
    }, [conv.partner, onViewAvatar]);

    const handleDeleteClick = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        onDelete(conv.id);
    }, [conv.id, onDelete]);

    return (
        <Link
            to={`/chat/${conv.targetUserId}`}
            className="group flex items-center gap-3 px-4 py-2.5 hover:bg-base-content/5 transition-colors active:bg-base-content/10 relative"
        >
            <div className="relative flex-shrink-0" onClick={handleAvatarClick}>
                <div className="w-14 h-14 rounded-full overflow-hidden border border-base-content/10 shrink-0">
                    <img src={conv.partner.avatar} alt={conv.partner.name} className="object-cover w-full h-full" loading="lazy" decoding="async" />
                </div>
                {/* Active Status Dot Placeholder */}
                <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-base-100" />
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h2 className="font-medium text-[15px] text-base-content truncate flex items-center gap-1.5 leading-tight">
                    {conv.partner.name}
                    {(conv.partner.role === "admin" || conv.partner.isVerified) && (
                        <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                            <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                        </div>
                    )}
                </h2>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <p className={`text-[14px] truncate leading-tight ${conv.unread ? "font-semibold text-base-content" : "text-base-content/60 font-normal"}`}>
                        {conv.lastMessage}
                    </p>
                    <span className={`text-[13px] whitespace-nowrap leading-tight ${conv.unread ? "font-semibold text-base-content" : "text-base-content/60"}`}>
                        · {timeAgo(conv.timestamp)}
                    </span>
                </div>
            </div>

            {conv.unread && (
                <div className="size-2.5 bg-blue-500 rounded-full shrink-0 mr-1" />
            )}

            <div className="absolute right-4 hidden group-hover:flex items-center gap-3 bg-gradient-to-l from-base-100 via-base-100 to-transparent pl-8 py-2">
                <button
                    onClick={handleDeleteClick}
                    className="p-1.5 text-base-content/40 hover:text-red-500 transition-colors bg-base-content/5 rounded-full"
                    title="Delete Conversation"
                >
                    <X className="size-4" />
                </button>
            </div>
        </Link>
    );
});
ConversationItem.displayName = "ConversationItem";

// === MAIN COMPONENT ARCHITECTURE ===
const InboxPage = ({ isSideNav = false }) => {
    const chatClient = useChatClient();
    const navigate = useNavigate();
    const { authUser } = useAuthUser();
    
    // Core Layout States
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // De-coupled High Priority CPU Ticks via Deferred Bounds
    const deferredSearch = useDeferredValue(search);

    // Dynamic UI Render States
    const [viewingDP, setViewingDP] = useState(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    // === STREAM CHAT LOGIC (Optimized Local Sync) ===
    useEffect(() => {
        if (!chatClient?.userID || !authUser) return;

        const fetchChannels = async (retries = 3) => {
            try {
                if (!chatClient?.userID) {
                    if (retries > 0) {
                        setTimeout(() => fetchChannels(retries - 1), 1000);
                        return;
                    }
                    throw new Error("Chat client not ready");
                }

                const filter = {
                    type: "messaging",
                    members: { $in: [authUser._id] }
                };

                const sort = [{ last_message_at: -1 }, { updated_at: -1 }];
                const options = { limit: 30, presence: true, state: true, watch: true };

                const channels = await chatClient.queryChannels(filter, sort, options);
                const mapped = channels.map(c => mapChannelToConversation(c, authUser));
                
                setConversations(mapped);
            } catch (error) {
                console.error("Error fetching channels:", error);
                if (retries > 0) {
                    setTimeout(() => fetchChannels(retries - 1), 1500);
                    return;
                }
                toast.error("Could not load conversations.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChannels();

        // High-frequency Event Firewall 
        // Prevents mass network array queries on single message events
        const handleEvent = (event) => {
            const refreshEvents = ['message.new', 'notification.message_new', 'channel.updated', 'channel.visible', 'member.added'];
            
            if (refreshEvents.includes(event.type) && event.channel) {
                setConversations(prev => {
                    const channelId = event.channel.id || event.channel.cid?.replace('messaging:', '');
                    const existingIndex = prev.findIndex(c => c.id === channelId);
                    
                    let newMappedChannel;
                    try {
                         // Safely map incoming stream block purely locally
                         const syncedChannel = chatClient.channel(event.channel.type || 'messaging', channelId);
                         if (syncedChannel && syncedChannel.state && syncedChannel.state.members) {
                              newMappedChannel = mapChannelToConversation(syncedChannel, authUser);
                         } else {
                              // Failsafe triggers total pull if object payload is malformed
                              fetchChannels();
                              return prev;
                         }
                    } catch(e) {
                         fetchChannels();
                         return prev;
                    }

                    // Pure array replacement and chronological re-sort matching WhatsApp behavior
                    if (existingIndex >= 0) {
                        const copy = [...prev];
                        copy[existingIndex] = newMappedChannel;
                        copy.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                        return copy;
                    } else {
                        return [newMappedChannel, ...prev].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                    }
                });
            }
        };

        const listener = chatClient.on(handleEvent);
        return () => listener.unsubscribe();
    }, [chatClient, chatClient?.userID, authUser]);


    // === SEARCH FILTERING (MEMOIZED & DEFERRED) ===
    // Prevents list recalculation during fast typing until keyboard bounds rest
    const filteredConversations = useMemo(() => {
        if (!deferredSearch) return conversations;
        const lowerQ = deferredSearch.toLowerCase();
        return conversations.filter((c) =>
            c.partner.name.toLowerCase().includes(lowerQ)
        );
    }, [conversations, deferredSearch]);


    // === HANDLERS (STABILIZED) ===
    const handleDelete = useCallback(async (id) => {
        if (!chatClient) return;
        try {
            const channel = chatClient.channel("messaging", id);
            await channel.hide();
            setConversations((prev) => prev.filter((c) => c.id !== id));
            toast.success("Conversation hidden");
        } catch (error) {
            toast.error("Failed to remove conversation");
        }
    }, [chatClient]);

    const handleViewAvatar = useCallback((dpObj) => {
        setViewingDP(dpObj);
    }, []);

    // === RENDER PIPELINE ===
    return (
        <div className={`flex w-full h-[100dvh] bg-base-100 text-base-content font-outfit ${!isSideNav ? "lg:flex-row flex-col" : ""}`}>
            {/* Left Panel: Inbox List */}
            <div className={`flex flex-col h-full overflow-hidden shrink-0 ${isSideNav ? "w-full lg:w-[350px]" : "w-full lg:w-[350px] lg:border-r border-base-content/10"}`}>
                <div className="flex-1 overflow-y-auto w-full sm:max-w-[600px] lg:max-w-none mx-auto pb-10 no-scrollbar">
                    
                    {/* Sticky Header */}
                    <div className="sticky top-0 z-20 bg-base-100/95 backdrop-blur-md border-b border-base-content/10 pt-4 px-4 pb-3">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 cursor-pointer">
                                <h1 className="text-xl font-bold tracking-tight">{authUser?.fullName || "Messages"}</h1>
                                <ChevronDown className="size-4 text-base-content/70" />
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setIsGroupModalOpen(true)}
                                    className="hover:opacity-70 transition-opacity"
                                    title="Create Group"
                                >
                                    <Users className="size-6" strokeWidth={2} />
                                </button>
                                <button
                                    onClick={() => navigate("/search")}
                                    className="hover:opacity-70 transition-opacity"
                                    title="New Message"
                                >
                                    <Edit className="size-6" strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-base-content/50 group-focus-within:text-base-content/80 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-base-content/5 focus:bg-base-content/10 border-none outline-none transition-all text-[15px] placeholder:text-base-content/50"
                            />
                        </div>
                    </div>

                    {/* Conversation List Container */}
                    <div className="pt-2">
                        <div className="px-4 py-2 flex items-center justify-between">
                            <h2 className="text-[15px] font-semibold text-base-content">Messages</h2>
                            <span className="text-[14px] text-base-content/50 font-medium cursor-pointer hover:text-base-content/80 transition-colors">Requests</span>
                        </div>

                        {/* Staggered Content Render */}
                        {isLoading ? (
                            <ChatSkeleton />
                        ) : filteredConversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                                <MessageSquare className="size-12 opacity-50 font-light" strokeWidth={1} />
                                <p className="text-[15px] font-medium">No messages found.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {filteredConversations.map((conv) => (
                                    <ConversationItem 
                                        key={conv.id} 
                                        conv={conv} 
                                        onViewAvatar={handleViewAvatar} 
                                        onDelete={handleDelete} 
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Panel: Empty State */}
            {!isSideNav && (
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-base-100 h-full">
                    <div className="size-24 rounded-full border-2 border-base-content/20 flex flex-col items-center justify-center mb-4">
                        <MessageSquare className="size-10 text-base-content" />
                    </div>
                    <h2 className="text-xl font-bold text-base-content mb-2 font-outfit">Your Messages</h2>
                    <p className="text-base-content/50 text-sm mb-6 font-outfit">Send private messages to a friend or group.</p>
                    <button className="btn btn-primary rounded-xl font-outfit font-bold px-8 shadow-lg shadow-primary/20" onClick={() => setIsGroupModalOpen(true)}>Send Message</button>
                </div>
            )}

            {/* Modals & Overlays */}
            {viewingDP && (
                <ProfilePhotoViewer
                    imageUrl={viewingDP.url}
                    fullName={viewingDP.name}
                    isVerified={viewingDP.isVerified}
                    onClose={() => setViewingDP(null)}
                />
            )}

            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />
        </div>
    );
};

export default InboxPage;
