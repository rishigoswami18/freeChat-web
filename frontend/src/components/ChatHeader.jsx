import { useChannelStateContext } from "stream-chat-react";
import { Video, Phone, ArrowLeft, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVideoClient, outgoingCallIds } from "./VideoProvider";
import toast from "react-hot-toast";

// Format "Last seen" like WhatsApp
function formatLastSeen(lastActive) {
    if (!lastActive) return "Offline";

    const now = new Date();
    const last = new Date(lastActive);
    const diffMs = now - last;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMs / 3600000);

    // Less than 1 minute ago
    if (diffMin < 1) return "Last seen just now";

    // Less than 60 minutes ago
    if (diffMin < 60) return `Last seen ${diffMin}m ago`;

    // Today
    const isToday = now.toDateString() === last.toDateString();
    if (isToday) {
        return `Last seen today at ${last.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (yesterday.toDateString() === last.toDateString()) {
        return `Last seen yesterday at ${last.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    // Older
    return `Last seen ${last.toLocaleDateString([], { day: "numeric", month: "short" })}`;
}

function ChatHeader() {
    const { channel } = useChannelStateContext();
    const navigate = useNavigate();
    const videoClient = useVideoClient();

    const isGroup = channel.id.startsWith("group_");

    const displayData = isGroup
        ? {
            name: channel.data.name || "Group",
            image: channel.data.image || "/avatar.png",
        }
        : (() => {
            const members = Object.values(channel.state.members);
            const otherMember = members.find(
                (m) => m.user?.id !== channel._client?.userID
            );
            return {
                name: otherMember?.user?.name || "Chat",
                image: otherMember?.user?.image || "/avatar.png",
                user: otherMember?.user,
            };
        })();

    const user = displayData.user;
    const isOnline = user?.online;

    const handleCall = async () => {
        if (!videoClient || isGroup || !user) {
            toast.error(
                isGroup
                    ? "Calls are not supported in groups yet."
                    : "Call service not ready."
            );
            return;
        }

        try {
            const myId = String(channel._client.userID);
            const theirId = String(user.id);
            const timestamp = Date.now().toString(36);
            const callId = `${[myId, theirId].sort().join("-")}-${timestamp}`;

            console.log("📞 Initiating call:", { callId, myId, theirId });
            outgoingCallIds.add(callId);

            const call = videoClient.call("default", callId);
            await call.getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: myId },
                        { user_id: theirId },
                    ],
                },
            });
            navigate(`/call/${callId}`);
        } catch (error) {
            console.error("Call Error:", error);
            toast.error("Could not start call.");
        }
    };

    const handleAudioCall = async () => {
        if (!videoClient || isGroup || !user) {
            toast.error(
                isGroup
                    ? "Calls are not supported in groups yet."
                    : "Call service not ready."
            );
            return;
        }
        try {
            const myId = String(channel._client.userID);
            const theirId = String(user.id);
            const timestamp = Date.now().toString(36);
            const callId = `${[myId, theirId].sort().join("-")}-${timestamp}`;
            outgoingCallIds.add(callId);
            const call = videoClient.call("default", callId);
            await call.getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: myId },
                        { user_id: theirId },
                    ],
                    audioOnly: true,
                },
            });
            navigate(`/call/${callId}?type=audio`);
        } catch (error) {
            console.error("Audio Call Error:", error);
            toast.error("Could not start audio call.");
        }
    };

    const handleCoolDown = async () => {
        try {
            await channel.sendMessage({
                text: "✨ [BondBeyond Insight] Let's take a 5-minute 'Cool Down' break. Take a deep breath and reflect on how much you mean to each other. 🧘‍♀️🧘‍♂️",
                silent: false,
            });
            toast.success("Suggested a 5-minute break. ✨");
        } catch (error) {
            toast.error("Failed to suggest break");
        }
    };

    return (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b border-base-300/20 bg-base-100/90 backdrop-blur-md relative z-[100] shadow-sm w-full flex-shrink-0 chat-header-locked select-none overflow-hidden transition-all">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 overflow-hidden">
                <button
                    onClick={() => navigate("/inbox")}
                    className="flex-shrink-0 btn btn-ghost btn-xs sm:btn-sm btn-circle hover:bg-primary/10 text-primary transition-colors"
                    aria-label="Go back to inbox"
                >
                    <ArrowLeft className="size-5 sm:size-6" />
                </button>

                <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => navigate(isGroup ? "#" : `/profile/${user?.id}`)}>
                    <div className="avatar">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all overflow-hidden bg-base-300">
                            <img src={displayData.image} alt={displayData.name} className="object-cover" />
                        </div>
                    </div>
                    {isOnline && !isGroup && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100 shadow-sm dot-pulse" />
                    )}
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <h3 className="font-extrabold text-[14px] sm:text-[16px] leading-tight truncate tracking-tight text-base-content/90">
                        {displayData.name}
                    </h3>
                    <p
                        className={`text-[10px] sm:text-[12px] font-semibold truncate tracking-wide ${isOnline && !isGroup
                            ? "text-success animate-pulse"
                            : "text-base-content/50"
                            }`}
                    >
                        {isGroup
                            ? `${Object.keys(channel.state.members).length} members`
                            : isOnline
                                ? "Online"
                                : formatLastSeen(user?.last_active)}
                    </p>
                </div>
            </div>

            {!isGroup && (
                <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0 ml-1">
                    <button
                        onClick={handleCoolDown}
                        className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-info hover:bg-info/10 transition-colors"
                        title="Cool Down"
                    >
                        <Wind className="size-4.5 sm:size-5" />
                    </button>
                    <button
                        onClick={handleCall}
                        className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-primary hover:bg-primary/10 transition-colors"
                        aria-label="Video call"
                    >
                        <Video className="size-4.5 sm:size-5" />
                    </button>
                    <button
                        onClick={handleAudioCall}
                        className="btn btn-ghost btn-xs sm:btn-sm btn-circle text-success hover:bg-success/10 transition-colors"
                        aria-label="Voice call"
                    >
                        <Phone className="size-4.5 sm:size-5" />
                    </button>
                </div>
            )}
        </div>
    );
}

export default ChatHeader;

