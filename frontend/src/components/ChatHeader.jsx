import { memo, useState, useMemo } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { Video, Phone, ArrowLeft, Wind, BadgeCheck, Heart, Sparkles, Info } from "lucide-react";
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
                const rawName = authUser?.aiPartnerName || otherMember?.user?.name || "Aisha";
                const sanitizedName = ["baby", "darling", "jaan", "shona", "sweetheart"].includes(rawName.toLowerCase()) 
                    ? "AI Bestie" 
                    : rawName;
                    
                return {
                    name: sanitizedName,
                    image: authUser?.aiPartnerPic || "/ai-bestie.png",
                    id: "ai-user-id",
                    user: { ...otherMember?.user, online: true, name: sanitizedName },
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

            // AI Coach Fallback
            if (otherMember?.user?.id === "ai-coach-id" || channel.id.toLowerCase().includes("ai-coach-id")) {
                return {
                    name: "Dr. Bond (Relationship Coach)",
                    image: "https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png",
                    id: "ai-coach-id",
                    user: { ...otherMember?.user, online: true, name: "Dr. Bond" },
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

    const initiateStreamCall = async (isAudio = false) => {
        if (!user || !user.id) {
            toast.error("Unable to identify call recipient.");
            return;
        }

        // 🧠 AI bots → redirect to AI Face Call page (DO NOT wait for videoClient)
        if (["ai-user-id", "ai-friend-id", "ai-coach-id", "ai-bot"].includes(user.id)) {
            const aiId = user.id === "ai-bot" ? "ai-user-id" : user.id;
            navigate(`/ai-face-call/${aiId}`);
            return;
        }

        if (!videoClient) {
            toast.error("Call service is not ready. Please wait a moment.");
            return;
        }

        if (isGroup) {
            toast.error("Group calls are not supported yet.");
            return;
        }

        try {
            const myId = String(authUser?._id);
            const theirId = String(user.id);
            const timestamp = Date.now();
            const callId = `${[myId, theirId].sort().join("-")}-${timestamp}`;

            const call = videoClient.call("default", callId);
            
            console.log("📞 [ChatHeader] Initiating call:", { callId, myId, theirId });

            await call.getOrCreate({
                ring: true,
                data: {
                    members: [
                        { user_id: myId },
                        { user_id: theirId },
                    ],
                    custom: {
                        audioOnly: isAudio,
                        callerName: authUser.fullName,
                        callerImage: authUser.profilePic
                    }
                },
            });

            // Mark this call as outgoing so we don't notify ourselves
            outgoingCallIds.add(callId);

            // Notify recipient (Push Notification / API signal)
            notifyCall(theirId, callId, isAudio ? "audio" : "video").catch(err => {
                console.error("Failed to send call notification:", err);
            });

            // Navigate to the call page
            const typeParam = isAudio ? "?type=audio" : "";
            navigate(`/call/${callId}${typeParam}`, { 
                state: { callee: { name: user.name, image: user.image } } 
            });

        } catch (error) {
            console.error("❌ [ChatHeader] Call failed to spawn:", error);
            toast.error("Could not start call. Please check your network.");
        }
    };

    const handleCall = () => initiateStreamCall(false);
    const handleAudioCall = () => initiateStreamCall(true);

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
        <div className="flex items-center justify-between px-3 py-2 border-b border-base-content/5 bg-base-100 relative z-[100] w-full flex-shrink-0 select-none transition-all font-outfit text-base-content">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                    onClick={() => navigate("/inbox")}
                    className="flex-shrink-0 p-1 hover:bg-base-content/10 rounded-full transition-colors"
                >
                    <ArrowLeft className="size-6 text-base-content" strokeWidth={2} />
                </button>

                <div className="flex-shrink-0 cursor-pointer" onClick={() => setViewingDP({ url: displayData.image, name: displayData.name, isVerified: user?.isVerified })}>
                    <div className="size-10 rounded-full overflow-hidden border border-base-content/10">
                        <img src={displayData.image} alt={displayData.name} className="object-cover w-full h-full" />
                    </div>
                </div>

                <div className="min-w-0 flex-1 flex flex-col justify-center cursor-pointer" onClick={() => navigate(isGroup ? "#" : `/user/${user?.id}`)}>
                    <div className="flex items-center gap-1">
                        <h3 className="font-bold text-[15px] leading-tight truncate">
                            {displayData.name}
                        </h3>
                        {(user?.role === "admin" || user?.isVerified) && (
                            <BadgeCheck className="size-4 text-blue-500 fill-current" />
                        )}
                    </div>
                    {!isGroup && (
                        <p className="text-[11px] font-medium opacity-50 truncate leading-none mt-0.5">
                            {displayData.id === 'ai-coach-id' ? 'Relationship Coach' : 
                             displayData.id === 'ai-user-id' ? 'AI Bestie' : 
                             displayData.id === 'ai-friend-id' ? 'AI Bestie' : 
                             (isOnline ? "Active now" : (user?.last_active ? formatLastSeen(user.last_active) : "Offline"))}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
                {!isGroup && (
                    <>
                        {/* AI Relationship Coach Tools */}
                        <button onClick={handleCoolDown} className="p-2 hover:bg-base-content/10 rounded-full transition-all active:scale-90" title="Cool Down">
                            <Wind className="size-6 text-base-content" strokeWidth={1.5} />
                        </button>
                        <button onClick={handleAnalyze} className="p-2 hover:bg-base-content/10 rounded-full transition-all active:scale-90" title="Analyze Conflict">
                            <Sparkles className="size-6 text-base-content" strokeWidth={1.5} />
                        </button>
                        
                        <button onClick={handleAudioCall} className="p-2 hover:bg-base-content/10 rounded-full transition-all active:scale-90" title="Voice Call">
                            <Phone className="size-6 text-base-content" strokeWidth={1.5} />
                        </button>
                        <button onClick={handleCall} className="p-2 hover:bg-base-content/10 rounded-full transition-all active:scale-90" title="Video Call">
                            <Video className="size-7 text-base-content" strokeWidth={1.5} />
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
