import { memo, useState, useMemo } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { Video, Phone, ArrowLeft, Wind, BadgeCheck, Heart, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useVideoClient, outgoingCallIds } from "./VideoProvider";
import { notifyCall, getCoupleStatus } from "../lib/api";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";

// Format "Last seen" like WhatsApp
// Format "Last seen" like WhatsApp using Delhi (IST) time zone
function formatLastSeen(lastActive) {
    if (!lastActive) return "Offline";

    const tz = "Asia/Kolkata";
    const now = new Date();
    const last = new Date(lastActive);

    // Helper to get date string in Delhi TZ for comparison
    const getDelhiDate = (d) => d.toLocaleDateString("en-US", { timeZone: tz });

    const diffMs = now - last;
    const diffMin = Math.floor(diffMs / 60000);

    // Less than 1 minute ago
    if (diffMin < 1) return "Last seen just now";

    // Less than 60 minutes ago
    if (diffMin < 60) return `Last seen ${diffMin}m ago`;

    // Today/Yesterday logic using Delhi time
    const todayStr = getDelhiDate(now);
    const lastStr = getDelhiDate(last);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = getDelhiDate(yesterday);

    const timeOptions = {
        timeZone: tz,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    };

    if (todayStr === lastStr) {
        return `Last seen today at ${last.toLocaleTimeString("en-US", timeOptions)}`;
    }

    if (yesterdayStr === lastStr) {
        return `Last seen yesterday at ${last.toLocaleTimeString("en-US", timeOptions)}`;
    }

    // Older
    return `Last seen ${last.toLocaleDateString("en-US", {
        timeZone: tz,
        day: "numeric",
        month: "short"
    })}`;
}

const ChatHeader = memo(() => {
    const { channel } = useChannelStateContext();
    const { authUser } = useAuthUser();
    const navigate = useNavigate();
    const videoClient = useVideoClient();
    const [viewingDP, setViewingDP] = useState(null);

    const isGroup = channel.id.startsWith("group_");

    const displayData = isGroup
        ? {
            name: channel.data.name || "Group",
            image: channel.data.image || "/avatar.png",
        }
        : (() => {
            const members = Object.values(channel.state.members);
            const otherMember = members.find(
                (m) => m.user?.id !== authUser?._id?.toString()
            );

            // AI Partner Fallback
            if (otherMember?.user?.id === "ai-user-id" || channel.id.toLowerCase().includes("ai-user-id")) {
                return {
                    name: authUser?.aiPartnerName || otherMember?.user?.name || "Aria",
                    image: authUser?.aiPartnerPic || "/ai-girlfriend.png",
                    id: "ai-user-id",
                    user: { ...otherMember?.user, online: true, name: authUser?.aiPartnerName || "Aria" },
                };
            }

            // AI Best Friend Fallback
            if (otherMember?.user?.id === "ai-friend-id" || channel.id.toLowerCase().includes("ai-friend-id")) {
                return {
                    name: authUser?.aiFriendName || otherMember?.user?.name || "Golu",
                    image: authUser?.aiFriendPic || "/ai-bestfriend.png",
                    id: "ai-friend-id",
                    user: { ...otherMember?.user, online: true, name: authUser?.aiFriendName || "Golu" },
                };
            }

            return {
                name: otherMember?.user?.name || "Chat",
                image: otherMember?.user?.image || "/avatar.png",
                id: otherMember?.user?.id,
                user: otherMember?.user,
            };
        })();

    const user = displayData.user;
    const isOnline = user?.online;

    // Couple status for header
    const { data: coupleData } = useQuery({
        queryKey: ["coupleStatus"],
        queryFn: getCoupleStatus,
        enabled: !!authUser && !isGroup && displayData.id !== "system_announcement",
        staleTime: 1000 * 60 * 10
    });

    const isPartner = useMemo(() => {
        if (!coupleData || !displayData.id || coupleData.coupleStatus !== "coupled") return false;
        return coupleData.partner?._id === displayData.id;
    }, [coupleData, displayData.id]);

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
            const myId = String(authUser._id);
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
            navigate(`/call/${callId}`, { state: { callee: { name: user.name, image: user.image } } });

            // Send push notification to recipient (fire-and-forget)
            notifyCall(theirId, callId, "video").catch(() => { });
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
            const myId = String(authUser._id);
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
            navigate(`/call/${callId}?type=audio`, { state: { callee: { name: user.name, image: user.image } } });

            // Send push notification to recipient (fire-and-forget)
            notifyCall(theirId, callId, "audio").catch(() => { });
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

    const handleAnalyze = async () => {
        const tid = toast.loading("AI Coach is analyzing your vibes... 🩺");
        try {
            const { analyzeConflict } = await import("../lib/api");
            const result = await analyzeConflict(channel.id);
            toast.success("Analysis complete! ✨", { id: tid });

            await channel.sendMessage({
                text: `🩺 **AI Relationship Coach Insight**\n\n**Summary:** ${result.summary}\n\n**Possible Cause:** ${result.rootCause}\n\n**Actionable Steps:**\n${result.suggestions.map(s => `• ${s}`).join("\n")}\n\n*Current Tension: ${result.tensionLevel}/10*`,
                silent: false,
            });
        } catch (error) {
            toast.error("AI Coach is busy right now.", { id: tid });
        }
    };

    return (
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-black/95 backdrop-blur-md relative z-[100] w-full flex-shrink-0 select-none transition-all font-outfit text-white">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <button
                    onClick={() => navigate("/inbox")}
                    className="flex-shrink-0 p-1.5 hover:bg-white/10 rounded-full transition-colors group"
                    aria-label="Go back to inbox"
                >
                    <ArrowLeft className="size-5 sm:size-6 text-white group-active:scale-90 transition-transform" strokeWidth={2} />
                </button>

                <div className="relative flex-shrink-0 group cursor-pointer" onClick={() => setViewingDP({ url: displayData.image, name: displayData.name, isVerified: user?.isVerified || user?.role === "admin" })}>
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-white/10 bg-black shrink-0">
                        <img src={displayData.image} alt={displayData.name} className="object-cover w-full h-full" />
                    </div>
                    {isOnline && !isGroup && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-black bg-green-500 shadow-sm" />
                    )}
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer" onClick={() => navigate(isGroup ? "#" : `/user/${user?.id}`)}>
                    <h3 className="font-semibold text-[15px] sm:text-[16px] leading-tight truncate text-white flex items-center gap-1.5">
                        {displayData.name}
                        {(user?.role === "admin" || user?.isVerified) && (
                            <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                               <BadgeCheck className="size-3.5 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                            </div>
                        )}
                        {isPartner && <Heart className="size-3.5 text-pink-500 fill-pink-500 ml-0.5" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <p className={`text-[12px] sm:text-[13px] font-normal truncate ${isOnline && !isGroup ? "text-white/80" : "text-white/50"}`}>
                            {isGroup
                                ? `${Object.keys(channel.state.members).length} members`
                                : isOnline
                                    ? "Active now"
                                    : formatLastSeen(user?.last_active)}
                        </p>
                        {isPartner && (
                            <span className="text-[10px] font-medium bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded flex items-center gap-1">
                                Linked
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                {!isGroup && user?.id !== "system_announcement" && user?.id !== "ai-user-id" && user?.id !== "ai-friend-id" && (
                    <>
                        {isPartner && (
                            <button
                                onClick={handleAnalyze}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                title="AI Relationship Coach"
                            >
                                <Sparkles className="size-5 sm:size-[22px] text-white/90" strokeWidth={1.5} />
                            </button>
                        )}
                        <button
                            onClick={handleAudioCall}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Voice call"
                        >
                            <Phone className="size-5 sm:size-[22px] text-white/90" strokeWidth={1.5} />
                        </button>
                        <button
                            onClick={handleCall}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors"
                            aria-label="Video call"
                        >
                            <Video className="size-5 sm:size-[22px] text-white/90" strokeWidth={1.5} />
                        </button>
                    </>
                )}
            </div>

            {viewingDP && (
                <ProfilePhotoViewer
                    imageUrl={viewingDP.url}
                    fullName={viewingDP.name}
                    isVerified={viewingDP.isVerified}
                    onClose={() => setViewingDP(null)}
                />
            )}
        </div>
    );
});

export default ChatHeader;
