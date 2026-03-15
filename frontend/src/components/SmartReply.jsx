import { useState, useEffect, memo, useCallback } from "react";
import { Sparkles } from "lucide-react";

// === SCALABLE RULE-BASED SUGGESTION ENGINE ===
// Hoisted outside the component to prevent memory recreation and expensive regex
// compilation on every render cycle. This dictionary structure is easily expandable
// into a JSON import or backend API integration in the future.
const SUGGESTION_DICTS = [
    { match: ["hello", "hi", "hey"], replies: ["Hey!", "Hello there", "Hi! How are you?", "Yo!"] },
    { match: ["how are you", "how's it going"], replies: ["I'm doing great!", "Not bad, you?", "Pretty good", "Living the dream"] },
    { match: ["where"], replies: ["On my way", "I'm at home", "Not sure yet", "Let me check"] },
    { match: ["busy", "available", "free"], replies: ["I'm free now", "A bit busy", "Call you later?", "Available in 10"] },
    { match: ["hungry", "eat", "food"], replies: ["I am!", "Let's grab food", "Maybe later", "What's the plan?"] },
    { match: ["thanks", "thank you"], replies: ["No worries", "Anytime!", "You're welcome", "Glad to help"] },
    { match: ["bye", "goodnight", "cya"], replies: ["Bye!", "Goodnight", "Talk tomorrow", "See ya"] },
];

const DEFAULT_REPLIES = ["Cool", "Nice!", "Okay", "Lol"];

// Pure function extracting deduction logic from the React Lifecycle
const generateReplies = (messageText) => {
    if (!messageText) return DEFAULT_REPLIES;
    
    const text = messageText.toLowerCase();
    
    for (const rule of SUGGESTION_DICTS) {
        if (rule.match.some(keyword => text.includes(keyword))) {
            return rule.replies;
        }
    }
    
    return DEFAULT_REPLIES;
};

// === COMPONENT ===
const SmartReply = memo(({ channel, onSelect }) => {
    const [replies, setReplies] = useState([]);

    // Stable evaluator function protecting the event listener bindings
    const evaluateLatestMessage = useCallback((latestMessage) => {
        // Safe access guards
        if (!latestMessage || latestMessage.type === "error" || latestMessage.user?.id === channel?.getClient()?.userID) {
            setReplies([]);
            return;
        }

        const newReplies = generateReplies(latestMessage.text);
        setReplies(newReplies);
    }, [channel]);

    // === EVENT LISTENER CYCLE ===
    useEffect(() => {
        if (!channel) return;

        // 1. Initial Evaluation on Mount
        const messages = channel.state?.messages || [];
        evaluateLatestMessage(messages[messages.length - 1]);

        // 2. Real-time Subscription Binding
        const handleNewMessage = (event) => {
            const incomingMessage = event.message;
            if (incomingMessage?.user?.id !== channel.getClient()?.userID) {
                evaluateLatestMessage(incomingMessage);
            } else {
                // Instantly clear suggestions if the current user sends a message
                setReplies([]); 
            }
        };

        channel.on("message.new", handleNewMessage);

        // 3. Strict Teardown Cleanup
        return () => {
            channel.off("message.new", handleNewMessage);
        };
    }, [channel, evaluateLatestMessage]);

    // Fast-fail rendering
    if (replies.length === 0) return null;

    return (
        <div className="flex gap-2 p-2.5 overflow-x-auto no-scrollbar animate-in slide-in-from-bottom-2 duration-400 bg-base-100/40 backdrop-blur-md rounded-2xl border border-base-content/5 mb-1 mx-1 scroll-smooth">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-[9px] font-black rounded-full border border-primary/20 shrink-0 shadow-sm self-center select-none pointer-events-none">
                <Sparkles className="size-3 animate-[pulse_2s_ease-in-out_infinite]" />
                AI SUGGEST
            </div>
            {replies.map((reply, idx) => (
                <button
                    key={`reply-${idx}`} // Secure React keys
                    onClick={() => {
                        onSelect(reply);
                        setReplies([]); // Hide suggestion tray after selection
                    }}
                    className="px-5 py-2 bg-base-100 border border-base-content/10 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap active:scale-95 shadow-sm hover:shadow-md hover:border-primary/30 hover:bg-primary/5 text-base-content/70 hover:text-primary"
                    aria-label={`Send smart reply: ${reply}`}
                >
                    {reply}
                </button>
            ))}
        </div>
    );
});

SmartReply.displayName = "SmartReply";
export default SmartReply;
