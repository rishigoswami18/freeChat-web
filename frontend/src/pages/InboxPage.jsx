import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, ArrowRight, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useChatClient } from "../components/ChatProvider";
import useAuthUser from "../hooks/useAuthUser";

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
    const { authUser } = useAuthUser();
    const [conversations, setConversations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!chatClient?.userID || !authUser) return;

        // Debug helper
        window.logInbox = async () => {
            const filter = { type: "messaging", members: { $in: [authUser._id] } };
            const channels = await chatClient.queryChannels(filter, { updated_at: -1 });
            console.log("Inbox Channels Found:", channels.length, channels);
            return channels;
        };

        const fetchChannels = async () => {
            try {
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
                        partner = {
                            name: otherMember?.user?.name || "Deleted User",
                            avatar: otherMember?.user?.image || "/avatar.png",
                            id: otherMember?.user?.id || "unknown"
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
        <div className="flex flex-col h-full bg-base-100 max-w-2xl mx-auto overflow-hidden">
            {/* Page Title & Compose (Consistent with app style) */}
            <div className="px-4 py-6 flex items-center justify-between">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-2">
                    <MessageSquare className="size-6 text-primary" />
                    Messages
                </h1>
                <button
                    onClick={() => toast("Coming soon!")}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-primary/10 text-primary transition-all active:scale-90"
                >
                    <ArrowRight className="size-5 rotate-[-45deg]" />
                </button>
            </div>

            {/* Search Bar - Modern Look */}
            <div className="px-4 pb-4">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 text-base-content/30 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search for a name..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-5 py-3 rounded-2xl bg-base-200 focus:bg-base-100 border-none ring-1 ring-base-content/5 focus:ring-2 focus:ring-primary/40 transition-all text-sm font-medium"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto no-scrollbar pb-4 pr-1">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-40">
                        <Loader2 className="size-8 animate-spin text-primary" />
                        <p className="font-bold uppercase tracking-widest text-xs">Loading chats...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-3">
                        <MessageSquare className="size-12" />
                        <p className="font-bold uppercase tracking-widest text-xs">No active chats</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/chat/${conv.targetUserId}`}
                                className="group flex items-center gap-4 px-4 py-4 hover:bg-base-200/50 transition-all active:bg-base-200"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="avatar ring-2 ring-primary/20 ring-offset-base-100 ring-offset-2 rounded-full p-0.5">
                                        <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg group-active:scale-95 transition-transform">
                                            <img src={conv.partner.avatar} alt={conv.partner.name} className="object-cover w-full h-full" />
                                        </div>
                                    </div>
                                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success rounded-full border-2 border-base-100" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline gap-2 mb-1">
                                        <h2 className="font-black italic text-base uppercase tracking-tight text-base-content truncate">
                                            {conv.partner.name}
                                        </h2>
                                        <span className="text-[10px] uppercase font-black opacity-30 whitespace-nowrap">
                                            {timeAgo(conv.timestamp)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm truncate flex-1 ${conv.unread ? "font-bold text-base-content" : "opacity-50"}`}>
                                            {conv.lastMessage}
                                        </p>
                                        {conv.unread && (
                                            <div className="size-2 rounded-full bg-primary animate-pulse" />
                                        )}
                                    </div>
                                </div>

                                {/* Desktop-only delete icon or swipe action hinted */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(conv.id);
                                    }}
                                    className="hidden group-hover:flex btn btn-ghost btn-xs btn-circle text-error/30 hover:text-error transition-all"
                                >
                                    <X className="size-3.5" />
                                </button>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InboxPage;
