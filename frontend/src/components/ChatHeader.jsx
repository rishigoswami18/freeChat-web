import { useChannelStateContext } from "stream-chat-react";
import { Video, Phone, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVideoClient, outgoingCallIds } from "./VideoProvider";
import toast from "react-hot-toast";

function ChatHeader() {
    const { channel } = useChannelStateContext();
    const navigate = useNavigate();
    const videoClient = useVideoClient();
    console.log("ChatHeader: videoClient available?", !!videoClient);

    const isGroup = channel.id.startsWith("group_");

    // Resolve display data (name and image)
    const displayData = isGroup ? {
        name: channel.data.name || "Group",
        image: channel.data.image || "/avatar.png"
    } : (() => {
        const members = Object.values(channel.state.members);
        const otherMember = members.find((m) => m.user?.id !== channel._client?.userID);
        return {
            name: otherMember?.user?.name || "Chat",
            image: otherMember?.user?.image || "/avatar.png",
            user: otherMember?.user
        };
    })();

    const user = displayData.user;
    const isOnline = user?.online;

    const handleCall = async () => {
        if (!videoClient || isGroup || !user) {
            toast.error(isGroup ? "Calls are not supported in groups yet." : "Call service not ready.");
            return;
        }

        try {
            const timestamp = Date.now().toString(36);
            const callId = `${[channel._client.userID, user.id].sort().join("-")}-${timestamp}`;
            outgoingCallIds.add(callId);

            const call = videoClient.call("default", callId);
            await call.getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: channel._client.userID },
                        { user_id: user.id },
                    ],
                },
            });
            navigate(`/call/${callId}`);
        } catch (error) {
            console.error("Call Error:", error);
            toast.error("Could not start call.");
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-base-300 bg-base-100 shadow-sm sticky top-0 z-50">
            {/* Left: Back + Avatar + Info */}
            <div className="flex items-center gap-2 sm:gap-3">
                <button
                    onClick={() => navigate("/inbox")}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label="Go back to inbox"
                >
                    <ArrowLeft className="size-5" />
                </button>

                <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-1">
                        <img
                            src={displayData.image}
                            alt={displayData.name}
                        />
                    </div>
                    {isOnline && !isGroup && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                    )}
                </div>

                <div className="min-w-0">
                    <h3 className="font-bold text-sm leading-tight truncate">
                        {displayData.name}
                    </h3>
                    <p className={`text-[10px] font-medium ${isOnline && !isGroup ? "text-success" : "text-base-content/50"}`}>
                        {isGroup ? `${Object.keys(channel.state.members).length} members` : (isOnline ? "Online" : "Offline")}
                    </p>
                </div>
            </div>

            {/* Right: Call Buttons (Only for 1v1) */}
            {!isGroup && (
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={handleCall}
                        className="btn btn-ghost btn-md btn-circle text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Video call"
                    >
                        <Video className="size-6" />
                    </button>
                    <button
                        onClick={handleCall}
                        className="btn btn-ghost btn-md btn-circle text-success hover:bg-success/10 transition-colors"
                        aria-label="Voice call"
                    >
                        <Phone className="size-6" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatHeader;
