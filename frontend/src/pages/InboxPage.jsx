import { useState } from "react";
import {
    Chat,
    ChannelList,
    ChannelPreviewMessenger,
    Window
} from "stream-chat-react";
import { useChatClient } from "../components/ChatProvider";
import ChatLoader from "../components/ChatLoader";
import { Search, Plus, MessageSquare, Users, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateGroupModal from "../components/CreateGroupModal";

const InboxPage = () => {
    const chatClient = useChatClient();
    const navigate = useNavigate();
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    if (!chatClient) return <ChatLoader />;

    const filters = {
        members: { $in: [chatClient.userID] },
        type: "messaging"
    };

    const sort = { last_message_at: -1 };

    const handleChannelSelect = (channel) => {
        // ChatPage expects either a userId for 1v1 or a channelId starting with 'group_'
        const isGroup = channel.id.startsWith("group_");
        if (isGroup) {
            navigate(`/chat/${channel.id}`);
        } else {
            const otherMember = Object.values(channel.state.members).find(
                (m) => m.user.id !== chatClient.userID
            );
            if (otherMember) {
                navigate(`/chat/${otherMember.user.id}`);
            } else {
                navigate(`/chat/${channel.id}`);
            }
        }
    };

    const CustomChannelPreview = (props) => {
        const { channel, active, lastMessage } = props;
        const chatClient = useChatClient();

        // Resolve channel name: if data.name is missing, it's likely a 1v1 chat
        // Find the member that ISN'T the current user
        const displayData = channel.data.name ? {
            name: channel.data.name,
            image: channel.data.image
        } : (() => {
            const otherMember = Object.values(channel.state.members).find(m => m.user.id !== chatClient.userID);
            return {
                name: otherMember?.user.name || "Unknown User",
                image: otherMember?.user.image
            };
        })();

        return (
            <div
                onClick={() => handleChannelSelect(channel)}
                className={`flex items-center gap-4 p-4 cursor-pointer border-b border-base-300 transition-all hover:bg-base-200 outline-none
                    ${active ? "bg-primary/5 border-l-4 border-l-primary" : "border-l-4 border-l-transparent"}
                `}
            >
                <div className="avatar">
                    <div className="size-12 rounded-full ring-2 ring-primary/10 overflow-hidden">
                        <img
                            src={displayData.image || "/avatar.png"}
                            alt={displayData.name}
                            className="size-full object-cover"
                        />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                        <p className={`text-sm font-bold truncate ${active ? "text-primary" : ""}`}>
                            {displayData.name}
                        </p>
                        <span className="text-[10px] opacity-40 uppercase font-black">
                            {channel.data.last_message_at ? new Date(channel.data.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"}
                        </span>
                    </div>
                    <p className="text-xs opacity-60 truncate flex items-center gap-1">
                        {lastMessage ? (
                            <>
                                <span className="font-bold">{(lastMessage.user?.name || "Someone").split(" ")[0]}:</span> {lastMessage.text}
                            </>
                        ) : "No messages yet"}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="h-[100dvh] flex flex-col bg-base-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-base-300 bg-base-200/50 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary/20 rounded-2xl text-primary ring-4 ring-primary/5">
                        <MessageSquare className="size-6" />
                    </div>
                    <h1 className="text-2xl font-black italic tracking-tighter">INBOX</h1>
                </div>
                <button
                    onClick={() => setIsGroupModalOpen(true)}
                    className="btn btn-primary rounded-xl gap-2 font-bold shadow-lg shadow-primary/20"
                >
                    <Plus className="size-5" />
                    <span className="hidden sm:inline">New Group</span>
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-hidden">
                <Chat client={chatClient}>
                    <div className="h-full custom-scrollbar overflow-y-auto">
                        <ChannelList
                            filters={filters}
                            sort={sort}
                            Preview={CustomChannelPreview}
                            EmptyStateIndicator={() => (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40 px-6 text-center">
                                    <div className="p-10 bg-base-200 rounded-full mb-6">
                                        <Users className="size-16" />
                                    </div>
                                    <h2 className="text-xl font-bold mb-2">Your inbox looks empty</h2>
                                    <p className="max-w-xs text-sm">Start a conversation or create a group to see messages here.</p>
                                </div>
                            )}
                        />
                    </div>
                </Chat>
            </div>

            <CreateGroupModal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
            />
        </div>
    );
};

export default InboxPage;
