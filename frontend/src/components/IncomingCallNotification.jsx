import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import { PhoneOff, PhoneIncoming } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { outgoingCallIds } from "./VideoProvider";

// Professional ringtone
const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
ringtone.loop = true;

const IncomingCallNotification = () => {
    const calls = useCalls();
    const navigate = useNavigate();

    // Debug: log all calls the SDK is aware of
    useEffect(() => {
        if (calls.length > 0) {
            console.log("📞 useCalls() detected calls:", calls.map(c => ({
                id: c.id,
                state: c.state.callingState,
                isOutgoing: outgoingCallIds.has(c.id),
                createdBy: c.state.createdBy?.id || "unknown",
            })));
        }
    }, [calls]);

    // Filter: only ringing calls that WE did NOT initiate
    const incomingCalls = calls.filter((call) => {
        const callingState = call.state.callingState;
        const isRinging = callingState === CallingState.RINGING;
        const isOurCall = outgoingCallIds.has(call.id);
        const isOnCallPage = window.location.pathname.includes(`/call/${call.id}`);

        if (isRinging) {
            console.log(`📞 Ringing call ${call.id}: isOurCall=${isOurCall}, isOnCallPage=${isOnCallPage}`);
        }

        return isRinging && !isOurCall && !isOnCallPage;
    });

    if (incomingCalls.length === 0) return null;

    return (
        <>
            {incomingCalls.map((call) => (
                <IncomingCallUI key={call.id} call={call} navigate={navigate} />
            ))}
        </>
    );
};

const IncomingCallUI = ({ call, navigate }) => {
    const [caller, setCaller] = useState(null);

    useEffect(() => {
        // Start ringtone
        ringtone.play().catch(e => console.log("Ringtone blocked:", e));

        // Get the caller info — the person who created the call
        const createdBy = call.state.createdBy;
        if (createdBy) {
            setCaller(createdBy);
        } else {
            const members = call.state.members;
            if (members) {
                const callerMember = members.find(
                    (m) => m.user?.id !== call.currentUserId
                );
                if (callerMember) setCaller(callerMember.user);
            }
        }

        return () => {
            ringtone.pause();
            ringtone.currentTime = 0;
        };
    }, [call]);

    const isAudioOnly = call.state.custom?.audioOnly || call.data?.audioOnly;

    const handleAccept = async () => {
        try {
            // Stop ringtone immediately
            ringtone.pause();
            ringtone.currentTime = 0;

            // Just navigate to the call page. 
            const typeParam = isAudioOnly ? "?type=audio" : "";
            navigate(`/call/${call.id}${typeParam}`);
        } catch (error) {
            console.error("Failed to accept call:", error);
        }
    };

    const handleReject = async () => {
        try {
            await call.leave({ reject: true });
        } catch (error) {
            console.error("Failed to reject call:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-base-100 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center">
                {/* Pulsing ring animation */}
                <div className="relative mx-auto w-24 h-24 mb-6">
                    <div className="absolute inset-0 rounded-full bg-success/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-success/30 animate-pulse" />
                    <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-success/50">
                        <img
                            src={caller?.image || "/avatar.png"}
                            alt={caller?.name || "Caller"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                <h2 className="text-xl font-bold mb-1">
                    {caller?.name || "Someone"}
                </h2>
                <p className="text-base-content/60 mb-8 text-sm">
                    {isAudioOnly ? "Incoming audio call..." : "Incoming video call..."}
                </p>

                <div className="flex items-center justify-center gap-8">
                    <button
                        onClick={handleReject}
                        className="btn btn-circle btn-lg bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/30 transition-transform hover:scale-110"
                        aria-label="Reject call"
                    >
                        <PhoneOff className="size-6" />
                    </button>

                    <button
                        onClick={handleAccept}
                        className="btn btn-circle btn-lg bg-green-500 hover:bg-green-600 text-white border-none shadow-lg shadow-green-500/30 transition-transform hover:scale-110"
                        aria-label="Accept call"
                    >
                        <PhoneIncoming className="size-6" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallNotification;
