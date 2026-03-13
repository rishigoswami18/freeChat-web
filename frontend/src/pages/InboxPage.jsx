import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Search, ArrowRight, X, Loader2, BadgeCheck, Plus, Users, ChevronDown, Edit } from "lucide-react";
import CreateGroupModal from "../components/CreateGroupModal";
import toast from "react-hot-toast";
import { useChatClient } from "../components/ChatProvider";
import useAuthUser from "../hooks/useAuthUser";
import ProfilePhotoViewer from "../components/ProfilePhotoViewer";
import AdSense from "../components/AdSense";
import { ChatSkeleton } from "../components/Skeletons";

// Removed mock data for real integration

/** Format timestamp to a friendly "time ago" string */
const timeAgo = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
};

const InboxPage = () => {
    const chatClient = useChatClient();
    const navigate = useNavigate();
    const { authUser } = useAuthUser();
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [viewingDP, setViewingDP] = useState(null);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

    useEffect(() => {
        if (!chatClient?.userID || !authUser) return;

        // Debug helper
        window.logInbox = async () => {
            const filter = { type: "messaging", members: { $in: [authUser._id] } };
            const channels = await chatClient.queryChannels(filter, { updated_at: -1 });
            console.log("Inbox Channels Found:", channels.length, channels);
            return channels;
        };

        const fetchChannels = async (retries = 3) => {
            try {
                // Check if client is actually ready to query
                if (!chatClient?.userID) {
                    if (retries > 0) {
                        console.log(`Waiting for chat client... (${retries} retries left)`);
                        setTimeout(() => fetchChannels(retries - 1), 1000);
                        return;
                    }
                    throw new Error("Chat client not ready");
                }

                // Broaden filter to ensure we see all chats user is part of
                const filter = {
                    type: "messaging",
                    members: { $in: [authUser._id] }
                };

                // Sort by last message OR update time to catch new empty channels
                const sort = [{ last_message_at: -1 }, { updated_at: -1 }];
                const options = {
                    limit: 30,
                    presence: true,
                    state: true,
                    watch: true // Watch for changes
                };

                const channels = await chatClient.queryChannels(filter, sort, options);

                const mapped = channels.map((channel) => {
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
                    };
                });

                setConversations(mapped);
            } catch (error) {
                console.error("Error fetching channels:", error);
                if (retries > 0) {
                    console.log(`Retrying fetchChannels due to error... (${retries} left)`);
                    setTimeout(() => fetchChannels(retries - 1), 1500);
                    return;
                }
                toast.error("Could not load conversations.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchChannels();

        // Listen for all relevant events to refresh the list automatically
        const handleEvent = (event) => {
            const refreshEvents = [
                'message.new',
                'notification.message_new',
                'channel.updated',
                'channel.visible',
                'member.added'
            ];
            if (refreshEvents.includes(event.type)) {
                console.log("Inbox event received:", event.type);
                fetchChannels();
            }
        };

        const listener = chatClient.on(handleEvent);
        return () => {
            listener.unsubscribe();
            delete window.logInbox;
        };

    }, [chatClient, chatClient?.userID, authUser]);

    const filtered = conversations.filter((c) =>
        c.partner.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (id) => {
        if (!chatClient) return;
        try {
            const channel = chatClient.channel("messaging", id);
            await channel.hide();
            setConversations((prev) => prev.filter((c) => c.id !== id));
            toast.success("Conversation hidden");
        } catch (error) {
            toast.error("Failed to remove conversation");
        }
    };

    return (
        <div className="w-full max-w-[600px] mx-auto bg-black min-h-screen pb-10 font-outfit text-white">
            {/* Sticky Header */}
            <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-md border-b border-white/10 pt-4 px-4 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 cursor-pointer">
                        <h1 className="text-xl font-bold tracking-tight">{authUser?.fullName || "Messages"}</h1>
                        <ChevronDown className="size-4 text-white/70" />
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
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/50 group-focus-within:text-white/80 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white/10 focus:bg-white/15 border-none outline-none transition-all text-[15px] placeholder:text-white/50"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="pt-2">
                <div className="px-4 py-2 flex items-center justify-between">
                    <h2 className="text-[15px] font-semibold text-white">Messages</h2>
                    <span className="text-[14px] text-white/50 font-medium cursor-pointer hover:text-white/80 transition-colors">Requests</span>
                </div>

                {isLoading ? (
                    <ChatSkeleton />
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-60">
                        <MessageSquare className="size-12 opacity-50 font-light" strokeWidth={1} />
                        <p className="text-[15px] font-medium">No messages found.</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/chat/${conv.targetUserId}`}
                                className="group flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors active:bg-white/10 relative"
                            >
                                <div className="relative flex-shrink-0" onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setViewingDP({ url: conv.partner.avatar, name: conv.partner.name });
                                }}>
                                    <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 shrink-0">
                                        <img src={conv.partner.avatar} alt={conv.partner.name} className="object-cover w-full h-full" />
                                    </div>
                                    {/* Active Status Dot Placeholder */}
                                    <span className="absolute bottom-0 right-0 size-3.5 bg-green-500 rounded-full border-2 border-black" />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h2 className="font-medium text-[15px] text-white truncate flex items-center gap-1.5 leading-tight">
                                        {conv.partner.name}
                                        {(conv.partner.role === "admin" || conv.partner.isVerified) && (
                                            <BadgeCheck className="size-3.5 text-blue-500 fill-blue-500" />
                                        )}
                                    </h2>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <p className={`text-[14px] truncate leading-tight ${conv.unread ? "font-semibold text-white" : "text-white/60 font-normal"}`}>
                                            {conv.lastMessage}
                                        </p>
                                        <span className={`text-[13px] whitespace-nowrap leading-tight ${conv.unread ? "font-semibold text-white" : "text-white/60"}`}>
                                            · {timeAgo(conv.timestamp)}
                                        </span>
                                    </div>
                                </div>

                                {conv.unread && (
                                    <div className="size-2.5 bg-blue-500 rounded-full shrink-0 mr-1" />
                                )}

                                <div className="absolute right-4 hidden group-hover:flex items-center gap-3 bg-gradient-to-l from-[#121212] via-[#121212] to-transparent pl-8 py-2">
                                     <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDelete(conv.id);
                                        }}
                                        className="p-1.5 text-white/40 hover:text-red-500 transition-colors bg-white/5 rounded-full"
                                        title="Delete Conversation"
                                    >
                                        <X className="size-4" />
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {viewingDP && (
                <ProfilePhotoViewer
                    imageUrl={viewingDP.url}
                    fullName={viewingDP.name}
                    onClose={() => setViewingDP(null)}
                />
            )}

            {/* Group Modal */}
            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />
        </div>
    );
};

export default InboxPage;
