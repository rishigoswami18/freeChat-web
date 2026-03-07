import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import { PhoneOff, PhoneIncoming, Video, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef } from "react";
import { outgoingCallIds } from "./VideoProvider";

// Professional ringtone
const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
ringtone.loop = true;

const IncomingCallNotification = () => {
    const calls = useCalls();
    const navigate = useNavigate();

    // Filter: only ringing calls that WE did NOT initiate
    const incomingCalls = calls.filter((call) => {
        const callingState = call.state.callingState;
        const isRinging = callingState === CallingState.RINGING;
        const isOurCall = outgoingCallIds.has(call.id);
        const isOnCallPage = window.location.pathname.includes(`/call/${call.id}`);
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
    const [ringSeconds, setRingSeconds] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        // Start ringtone
        ringtone.play().catch(e => console.log("Ringtone blocked:", e));

        // Get the caller info
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

        // Ring timer — auto-reject after 40 seconds
        intervalRef.current = setInterval(() => {
            setRingSeconds(prev => {
                if (prev >= 39) {
                    call.leave({ reject: true }).catch(() => { });
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);

        return () => {
            ringtone.pause();
            ringtone.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [call]);

    const isAudioOnly = call.state.custom?.audioOnly || call.data?.audioOnly;

    const handleAccept = async () => {
        try {
            ringtone.pause();
            ringtone.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            const typeParam = isAudioOnly ? "?type=audio" : "";
            navigate(`/call/${call.id}${typeParam}`);
        } catch (error) {
            console.error("Failed to accept call:", error);
        }
    };

    const handleReject = async () => {
        try {
            ringtone.pause();
            ringtone.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            await call.leave({ reject: true });
        } catch (error) {
            console.error("Failed to reject call:", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden">
            {/* Full-screen blurred background */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1c] via-[#111827] to-[#0a0f1c]" />

            {/* Animated glow circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="size-[500px] rounded-full bg-primary/5 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="size-[350px] rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-8 sm:gap-10 w-full max-w-md px-6">

                {/* Encrypted badge */}
                <div className="flex items-center gap-2 opacity-40">
                    <Lock className="size-3 text-white" />
                    <span className="text-[10px] text-white uppercase font-black tracking-[0.2em]">End-to-End Encrypted</span>
                </div>

                {/* Call type */}
                <div className="flex items-center gap-2">
                    {isAudioOnly ? (
                        <Phone className="size-4 text-primary" />
                    ) : (
                        <Video className="size-4 text-primary" />
                    )}
                    <p className="text-white/60 text-sm font-medium uppercase tracking-[0.3em]">
                        {isAudioOnly ? "Voice Call" : "Video Call"}
                    </p>
                </div>

                {/* Avatar with pulse rings */}
                <div className="relative">
                    {/* Pulse rings */}
                    <div className="absolute -inset-6 rounded-full border-2 border-green-500/30 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-10 rounded-full border border-green-500/15 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute -inset-14 rounded-full border border-green-500/10 animate-ping" style={{ animationDuration: '2.5s' }} />

                    {/* Glow */}
                    <div className="absolute -inset-12 rounded-full bg-green-500/10 blur-3xl animate-pulse" />

                    <div className="relative size-36 sm:size-44 rounded-full overflow-hidden ring-4 ring-green-500/40 shadow-[0_0_80px_rgba(34,197,94,0.15)]">
                        <img
                            src={caller?.image || "/avatar.png"}
                            alt={caller?.name || "Caller"}
                            className="w-full h-full object-cover scale-105"
                        />
                    </div>
                </div>

                {/* Name */}
                <div className="text-center">
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                        {caller?.name || "Someone"}
                    </h2>
                    <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="size-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="size-1.5 rounded-full bg-green-400 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-white/50 text-sm font-semibold">Incoming call</span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-center gap-16 sm:gap-20 mt-4">
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={handleReject}
                            className="size-16 sm:size-18 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(239,68,68,0.4)] transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-[0_8px_40px_rgba(239,68,68,0.6)]"
                            aria-label="Reject call"
                        >
                            <PhoneOff className="size-7 sm:size-8 fill-current" />
                        </button>
                        <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Decline</span>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={handleAccept}
                            className="size-16 sm:size-18 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center shadow-[0_8px_30px_rgba(34,197,94,0.4)] transition-all duration-200 hover:scale-110 active:scale-95 hover:shadow-[0_8px_40px_rgba(34,197,94,0.6)] animate-pulse"
                            style={{ animationDuration: '2s' }}
                            aria-label="Accept call"
                        >
                            <PhoneIncoming className="size-7 sm:size-8" />
                        </button>
                        <span className="text-white/40 text-[10px] sm:text-xs font-bold uppercase tracking-wider">Accept</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomingCallNotification;
