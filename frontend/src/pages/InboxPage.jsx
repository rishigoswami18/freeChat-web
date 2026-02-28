import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Search, ArrowRight, X } from "lucide-react";
import toast from "react-hot-toast";

// Mock data – replace with real API calls later
const mockConversations = [
    {
        id: "c1",
        partner: { name: "Alex Rivera", avatar: "/avatar.png" },
        lastMessage: "Can't wait for our weekend getaway! 🌴",
        timestamp: "2026-02-27T18:45:00Z",
        unread: true,
    },
    {
        id: "c2",
        partner: { name: "Samira Khan", avatar: "/avatar.png" },
        lastMessage: "Did you see that new recipe?",
        timestamp: "2026-02-27T14:12:00Z",
        unread: false,
    },
    {
        id: "c3",
        partner: { name: "Jordan Lee", avatar: "/avatar.png" },
        lastMessage: "❤️",
        timestamp: "2026-02-26T22:03:00Z",
        unread: true,
    },
];

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
    const [conversations, setConversations] = useState([]);
    const [search, setSearch] = useState("");

    // Simulated fetch – replace with real API later
    useEffect(() => {
        const timer = setTimeout(() => setConversations(mockConversations), 300);
        return () => clearTimeout(timer);
    }, []);

    const filtered = conversations.filter((c) =>
        c.partner.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = (id) => {
        setConversations((prev) => prev.filter((c) => c.id !== id));
        toast.success("Conversation removed");
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
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-30 gap-3">
                        <MessageSquare className="size-12" />
                        <p className="font-bold uppercase tracking-widest text-xs">No active chats</p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {filtered.map((conv) => (
                            <Link
                                key={conv.id}
                                to={`/chat/fake_${conv.partner.name.toLowerCase().replace(/\s/g, '_')}`}
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
