import { useState, useEffect, memo } from "react";
import { axiosInstance } from "../lib/axios";
import { Sparkles, Loader2 } from "lucide-react";

const SmartReply = memo(({ channel, onSelect }) => {
    const [replies, setReplies] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchReplies = async () => {
            const messages = channel.state.messages;
            const lastMessage = messages[messages.length - 1];

            if (!lastMessage || lastMessage.type === "error" || lastMessage.user.id === channel.getClient().userID) {
                setReplies([]);
                return;
            }

            setLoading(true);
            try {
                const text = lastMessage.text?.toLowerCase() || "";
                let suggestions = ["Cool", "Nice!", "Okay", "Lol"];

                if (text.includes("hello") || text.includes("hi") || text.includes("hey")) {
                    suggestions = ["Hey!", "Hello there", "Hi! How are you?", "Yo!"];
                } else if (text.includes("how are you")) {
                    suggestions = ["I'm doing great!", "Not bad, you?", "Pretty good", "Living the dream"];
                } else if (text.includes("where")) {
                    suggestions = ["On my way", "I'm at home", "Not sure yet", "Let me check"];
                } else if (text.includes("busy") || text.includes("available")) {
                    suggestions = ["I'm free now", "A bit busy", "Call you later?", "Available in 10"];
                } else if (text.includes("hungry") || text.includes("eat") || text.includes("food")) {
                    suggestions = ["I am!", "Let's grab food", "Maybe later", "What's the plan?"];
                } else if (text.includes("thanks") || text.includes("thank you")) {
                    suggestions = ["No worries", "Anytime!", "You're welcome", "Glad to help"];
                } else if (text.includes("bye") || text.includes("goodnight")) {
                    suggestions = ["Bye!", "Goodnight", "Talk tomorrow", "See ya"];
                }

                setReplies(suggestions);
            } catch (error) {
                console.error("Error fetching smart replies:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReplies();

        const handleNewMessage = (event) => {
            // Re-fetch suggestions when a NEW message arrives from the OTHER user
            if (event.message?.user?.id !== channel.getClient().userID) {
                fetchReplies();
            }
        };

        channel.on("message.new", handleNewMessage);
        return () => channel.off("message.new", handleNewMessage);
    }, [channel]);

    if (replies.length === 0) return null;

    const colors = [
        "border-blue-500/30 text-blue-500 hover:bg-blue-500 hover:text-white",
        "border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white",
        "border-yellow-500/30 text-yellow-600 hover:bg-yellow-500 hover:text-white",
        "border-green-500/30 text-green-500 hover:bg-green-500 hover:text-white"
    ];

    return (
        <div className="flex gap-2 p-2.5 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2 duration-400 bg-base-100/40 backdrop-blur-md rounded-2xl border border-base-content/5 mb-1 mx-1 scroll-smooth">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full border border-primary/20 shrink-0 shadow-sm self-center">
                <Sparkles className="size-3 animate-pulse" />
                AI SUGGEST
            </div>
            {replies.map((reply, idx) => (
                <button
                    key={idx}
                    onClick={() => onSelect(reply)}
                    className="px-5 py-2 bg-base-100 border border-base-content/10 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-primary/5 text-base-content/70 hover:text-primary"
                >
                    {reply}
                </button>
            ))}
        </div>
    );
});

export default SmartReply;
