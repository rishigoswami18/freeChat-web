import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import { PhoneOff, PhoneIncoming, Video, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef, useCallback } from "react";
import { outgoingCallIds } from "./VideoProvider";

// WhatsApp ringtone
const ringtone = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
ringtone.loop = true;

const IncomingCallNotification = () => {
    const calls = useCalls();
    const navigate = useNavigate();

    // Filter: only ringing calls that WE did NOT initiate & we're not already on that call page
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
                <WhatsAppIncomingCall key={call.id} call={call} navigate={navigate} />
            ))}
        </>
    );
};

const WhatsAppIncomingCall = ({ call, navigate }) => {
    const [caller, setCaller] = useState(null);
    const [ringSeconds, setRingSeconds] = useState(0);
    const intervalRef = useRef(null);
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        // 1. Play Web Ringtone
        ringtone.play().catch(() => { });

        // 2. Native Android Bridge: Long Vibration + Native Call UI
        if (window.AndroidBridge) {
            try {
                // High-priority native notification
                window.AndroidBridge.showCallNotification(
                    `📞 Incoming Call`,
                    `${call.state.createdBy?.name || 'Someone'} is calling you...`
                );

                // Start a repeating vibration pattern
                const vibrateInterval = setInterval(() => {
                    window.AndroidBridge.vibrate(500);
                }, 1000);

                return () => {
                    clearInterval(vibrateInterval);
                    ringtone.pause();
                    ringtone.currentTime = 0;
                };
            } catch (e) {
                console.error("Android Bridge Error:", e);
            }
        }

        // Get caller info
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

        // Auto-reject after 40 seconds (like WhatsApp)
        intervalRef.current = setInterval(() => {
            setRingSeconds(prev => {
                if (prev >= 39) {
                    handleReject();
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

    const handleAccept = useCallback(async () => {
        if (isAccepting) return;
        setIsAccepting(true);

        try {
            // Stop ringtone & bridge
            ringtone.pause();
            ringtone.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);

            // Close native notification if possible via bridge (not strictly necessary as we navigate)
            if (window.AndroidBridge) {
                window.AndroidBridge.vibrate(50); // Small haptic for click
            }

            // Navigate to call page — CallPage will handle accept + join
            const typeParam = isAudioOnly ? "?type=audio" : "";
            navigate(`/call/${call.id}${typeParam}`);
        } catch (error) {
            console.error("Failed to accept call:", error);
            setIsAccepting(false);
        }
    }, [call, navigate, isAudioOnly, isAccepting]);

    const handleReject = useCallback(async () => {
        try {
            ringtone.pause();
            ringtone.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (window.AndroidBridge) window.AndroidBridge.vibrate(50);
            await call.leave({ reject: true });
        } catch (error) {
            console.error("Failed to reject call:", error);
        }
    }, [call]);

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden">
            {/* Full-screen dark background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#075e54] via-[#054d44] to-[#022c27]" />

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}
            />

            {/* Animated pulse rings behind avatar */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none">
                <div className="size-[400px] rounded-full border border-white/5 animate-ping" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none">
                <div className="size-[300px] rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-between py-16 sm:py-20 px-6 safe-area-bottom safe-area-top">

                {/* Top: Encrypted badge + Call type */}
                <div className="text-center w-full">
                    <div className="flex items-center justify-center gap-2 mb-4 opacity-60">
                        <Lock className="size-3 text-white" />
                        <span className="text-[10px] text-white uppercase font-black tracking-[0.2em]">End-to-End Encrypted</span>
                    </div>

                    <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
                        {isAudioOnly ? (
                            <Phone className="size-3.5 text-white" />
                        ) : (
                            <Video className="size-3.5 text-white" />
                        )}
                        <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                            {isAudioOnly ? "Voice Call" : "Video Call"}
                        </span>
                    </div>

                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg mb-2">
                        {caller?.name || "Someone"}
                    </h2>

                    <div className="flex items-center justify-center gap-2 mt-3">
                        <div className="flex items-center gap-1.5">
                            <div className="size-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '0s' }} />
                            <div className="size-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '0.15s' }} />
                            <div className="size-1.5 rounded-full bg-[#25D366] animate-bounce" style={{ animationDelay: '0.3s' }} />
                        </div>
                        <span className="text-[#25D366]/80 text-sm font-semibold">Incoming call</span>
                    </div>
                </div>

                {/* Center: Large avatar */}
                <div className="relative">
                    {/* Glow */}
                    <div className="absolute -inset-16 rounded-full bg-[#25D366]/10 blur-3xl animate-pulse" />

                    {/* Pulse rings */}
                    <div className="absolute -inset-4 rounded-full border-2 border-[#25D366]/25 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-8 rounded-full border border-[#25D366]/15 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute -inset-12 rounded-full border border-[#25D366]/8 animate-ping" style={{ animationDuration: '2.5s' }} />

                    <div className="relative size-40 sm:size-52 rounded-full overflow-hidden ring-4 ring-white/20 shadow-[0_0_80px_rgba(37,211,102,0.15)]">
                        <img
                            src={caller?.image || "/avatar.png"}
                            alt={caller?.name || "Caller"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>

                {/* Bottom: Accept / Decline buttons - WhatsApp style */}
                <div className="w-full max-w-xs">
                    <div className="flex items-center justify-between px-4">
                        {/* Decline */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={handleReject}
                                className="size-16 sm:size-[72px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_8px_30px_rgba(255,59,48,0.35)] transition-all duration-200 active:scale-90 hover:bg-[#ff453a] hover:shadow-[0_8px_40px_rgba(255,59,48,0.5)]"
                                aria-label="Decline"
                            >
                                <PhoneOff className="size-7 sm:size-8 text-white fill-current" />
                            </button>
                            <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">Decline</span>
                        </div>

                        {/* Accept */}
                        <div className="flex flex-col items-center gap-3">
                            <button
                                onClick={handleAccept}
                                disabled={isAccepting}
                                className="size-16 sm:size-[72px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_30px_rgba(37,211,102,0.35)] transition-all duration-200 active:scale-90 hover:bg-[#22c55e] hover:shadow-[0_8px_40px_rgba(37,211,102,0.5)] disabled:opacity-50 animate-pulse"
                                style={{ animationDuration: '2s' }}
                                aria-label="Accept"
                            >
                                {isAccepting ? (
                                    <div className="size-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <PhoneIncoming className="size-7 sm:size-8 text-white" />
                                )}
                            </button>
                            <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">Accept</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default IncomingCallNotification;
