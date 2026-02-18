import { useChannelStateContext } from "stream-chat-react";
import { VideoIcon, PhoneIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router";
import { useVideoClient, outgoingCallIds } from "./VideoProvider";
import toast from "react-hot-toast";

function ChatHeader() {
    const { channel } = useChannelStateContext();
    const navigate = useNavigate();
    const videoClient = useVideoClient();

    // Get the other member's info
    const members = Object.values(channel.state.members);
    const otherMember = members.find(
        (m) => m.user?.id !== channel._client?.userID
    );

    const user = otherMember?.user;
    const isOnline = user?.online;

    const handleCall = async () => {
        if (!videoClient || !user) {
            toast.error("Call service not ready. Please try again.");
            return;
        }

        try {
            const timestamp = Date.now().toString(36);
            const callId = `${[channel._client.userID, user.id].sort().join("-")}-${timestamp}`;

            // Mark this as OUR outgoing call BEFORE creating it
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

            // Navigate caller to the call page
            navigate(`/call/${callId}`);
        } catch (error) {
            console.error("Failed to initiate call:", error);
            toast.error("Could not start the call. Please try again.");
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-b border-base-300 bg-base-100/80 backdrop-blur-sm">
            {/* Left: Back + Avatar + Info */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/")}
                    className="btn btn-ghost btn-sm btn-circle"
                    aria-label="Go back"
                >
                    <ArrowLeft className="size-5" />
                </button>

                <div className="avatar">
                    <div className="w-10 h-10 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-1">
                        <img
                            src={user?.image || "/avatar.png"}
                            alt={user?.name || "User"}
                        />
                    </div>
                    {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                    )}
                </div>

                <div>
                    <h3 className="font-semibold text-sm leading-tight">
                        {user?.name || "Chat"}
                    </h3>
                    <p className={`text-xs ${isOnline ? "text-success" : "text-base-content/50"}`}>
                        {isOnline ? "Online" : "Offline"}
                    </p>
                </div>
            </div>

            {/* Right: Call Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={handleCall}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-success/20 hover:text-success transition-colors"
                    aria-label="Video call"
                >
                    <VideoIcon className="size-5" />
                </button>
                <button
                    onClick={handleCall}
                    className="btn btn-ghost btn-sm btn-circle hover:bg-primary/20 hover:text-primary transition-colors"
                    aria-label="Voice call"
                >
                    <PhoneIcon className="size-5" />
                </button>
            </div>
        </div>
    );
}

export default ChatHeader;
