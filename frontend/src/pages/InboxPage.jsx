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
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-50 to-white dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-700">
                <h1 className="text-xl font-black text-pink-600 flex items-center gap-2">
                    <MessageSquare className="size-5" />
                    Inbox
                </h1>
                <button
                    onClick={() => toast("Compose new message – coming soon!")}
                    className="btn btn-ghost btn-sm text-pink-600 hover:bg-pink-100/50 transition"
                >
                    New
                </button>
            </header>

            {/* Search Bar */}
            <div className="p-3 bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search conversations…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-pink-300 transition"
                    />
                </div>
            </div>

            {/* Conversation List */}
            <main className="flex-1 overflow-y-auto">
                {filtered.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No conversations found.</p>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {filtered.map((conv) => (
                            <li key={conv.id} className="group">
                                <Link
                                    to={`/chat/${conv.id}`}
                                    className="flex items-center p-4 hover:bg-pink-50 dark:hover:bg-gray-800 transition"
                                >
                                    <img
                                        src={conv.partner.avatar}
                                        alt={conv.partner.name}
                                        className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-pink-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center">
                                            <h2 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                                {conv.partner.name}
                                            </h2>
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                                {timeAgo(conv.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                                            {conv.lastMessage}
                                        </p>
                                    </div>
                                    {conv.unread && (
                                        <span className="ml-2 flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
                                        </span>
                                    )}
                                    {/* Delete button (mobile swipe‑to‑delete can be simulated with a tap) */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(conv.id);
                                        }}
                                        className="ml-2 opacity-0 group-hover:opacity-100 transition text-gray-400 hover:text-red-500"
                                    >
                                        <X className="size-5" />
                                    </button>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </main>

            {/* Footer navigation for mobile */}
            <footer className="p-2 bg-white/80 dark:bg-gray-900/80 border-t border-gray-200 dark:border-gray-700 flex justify-around">
                <Link to="/" className="text-pink-600 flex flex-col items-center text-xs">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2v6h14v-6l2 2V6a2 2 0 00-2-2h-4l-2-2-2 2H5a2 2 0 00-2 2v6z" /></svg>
                    Home
                </Link>
                <Link to="/inbox" className="text-pink-600 flex flex-col items-center text-xs">
                    <MessageSquare className="size-5" />
                    Inbox
                </Link>
                <Link to="/profile" className="text-pink-600 flex flex-col items-center text-xs">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" /></svg>
                    Profile
                </Link>
            </footer>
        </div>
    );
};

export default InboxPage;
