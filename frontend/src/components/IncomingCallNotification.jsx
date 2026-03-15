import { useCalls, CallingState } from "@stream-io/video-react-sdk";
import { PhoneOff, PhoneIncoming, Video, Phone, Lock } from "lucide-react";
import { useNavigate } from "react-router";
import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
import { outgoingCallIds } from "./VideoProvider";

// === GLOBAL AUDIO OPTIMIZATION ===
// Instantiate the audio object conditionally to prevent 
// "Document not interacted with" Web Audio API block errors on load.
let ringtoneInstance = null;
const getRingtone = () => {
    if (!ringtoneInstance) {
        ringtoneInstance = new Audio("https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3");
        ringtoneInstance.loop = true;
    }
    return ringtoneInstance;
};

// === PARENT NOTIFICATION MANAGER ===
const IncomingCallNotification = memo(() => {
    const calls = useCalls();
    const navigate = useNavigate();

    // Purely derive the incoming calls payload shielding against rapid WebRTC connection ticks
    const incomingCalls = useMemo(() => {
        return calls.filter((call) => {
            const callingState = call.state.callingState;
            const isRinging = callingState === CallingState.RINGING;
            const isOurCall = outgoingCallIds.has(call.id);
            const isOnCallPage = window.location.pathname.includes(`/call/${call.id}`);
            return isRinging && !isOurCall && !isOnCallPage;
        });
    }, [calls]);

    if (incomingCalls.length === 0) return null;

    return (
        <>
            {incomingCalls.map((call) => (
                <WhatsAppIncomingCall key={call.id} call={call} navigate={navigate} />
            ))}
        </>
    );
});
IncomingCallNotification.displayName = "IncomingCallNotification";

// === CHILD: FULLSCREEN CALLER SCREEN ===
const WhatsAppIncomingCall = memo(({ call, navigate }) => {
    const [ringSeconds, setRingSeconds] = useState(0);
    const [isAccepting, setIsAccepting] = useState(false);
    
    // Stable Refs preventing closures from snapping
    const intervalRef = useRef(null);
    const vibrateIntervalRef = useRef(null);

    // === CALLER DETECTION LOGIC ===
    const caller = useMemo(() => {
        const createdBy = call.state.createdBy;
        if (createdBy) return createdBy;
        
        const members = call.state.members;
        if (members) {
            const callerMember = members.find(m => m.user?.id !== call.currentUserId);
            if (callerMember) return callerMember.user;
        }
        return null;
    }, [call.state.createdBy, call.state.members, call.currentUserId]);

    const isAudioOnly = useMemo(() => call.state.custom?.audioOnly || call.data?.audioOnly, [call.state.custom, call.data]);

    // === RINGTONE & TIMER LIFECYCLE ===
    useEffect(() => {
        // 1. Safe Ringtone Playback
        const ringAudio = getRingtone();
        const playPromise = ringAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay prevented by browser:", error);
            });
        }

        // 2. Safe Android Bridge Implementation
        if (typeof window !== "undefined" && window.AndroidBridge) {
            try {
                if (typeof window.AndroidBridge.showCallNotification === 'function') {
                    window.AndroidBridge.showCallNotification(
                        `📞 Incoming Call`,
                        `${caller?.name || 'Someone'} is calling you...`
                    );
                }

                if (typeof window.AndroidBridge.vibrate === 'function') {
                    vibrateIntervalRef.current = setInterval(() => {
                        window.AndroidBridge.vibrate(500);
                    }, 1000);
                }
            } catch (e) {
                console.error("Android Bridge Error:", e);
            }
        }

        // 3. WhatsApp 40-Second Hard Timeout
        intervalRef.current = setInterval(() => {
            setRingSeconds(prev => {
                if (prev >= 39) { // 40s timeout
                    // Directly leave the call to ensure SDK disconnects correctly
                    call.leave({ reject: true }).catch(() => {});
                    return prev;
                }
                return prev + 1;
            });
        }, 1000);

        // 4. Guaranteed Hardware Teardown
        return () => {
            ringAudio.pause();
            ringAudio.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);
        };
    }, [call, caller]);

    // === ACTION HANDLERS ===
    const handleAccept = useCallback(async () => {
        if (isAccepting) return;
        setIsAccepting(true);

        try {
            // Teardown Hardware instantly
            const ringAudio = getRingtone();
            ringAudio.pause();
            ringAudio.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);

            // Small haptic confirmation
            if (typeof window !== "undefined" && window.AndroidBridge) {
                if (typeof window.AndroidBridge.vibrate === 'function') {
                    window.AndroidBridge.vibrate(50);
                }
            }

            // Route execution
            const typeParam = isAudioOnly ? "?type=audio" : "";
            navigate(`/call/${call.id}${typeParam}`);
        } catch (error) {
            console.error("Failed to accept call:", error);
            setIsAccepting(false);
        }
    }, [call.id, navigate, isAudioOnly, isAccepting]);

    const handleReject = useCallback(async () => {
        try {
            // Teardown Hardware instantly
            const ringAudio = getRingtone();
            ringAudio.pause();
            ringAudio.currentTime = 0;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (vibrateIntervalRef.current) clearInterval(vibrateIntervalRef.current);

            if (typeof window !== "undefined" && window.AndroidBridge) {
                if (typeof window.AndroidBridge.vibrate === 'function') {
                    window.AndroidBridge.vibrate(50);
                }
            }

            await call.leave({ reject: true });
        } catch (error) {
            console.error("Failed to reject call:", error);
        }
    }, [call]);

    return (
        <div className="fixed inset-0 z-[9999] overflow-hidden bg-black select-none pointer-events-auto">
            {/* Full-screen dark background with premium glow */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] size-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute -bottom-[20%] -right-[10%] size-[80%] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            {/* Subtle pattern overlay */}
            <div className="absolute inset-0 opacity-5 pointer-events-none"
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

                    <div className="flex items-center justify-center gap-2 mt-3 cursor-default">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                            <div className="size-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                            <div className="size-1.5 rounded-full bg-primary animate-bounce" />
                            <span className="text-primary text-[10px] font-black uppercase tracking-widest ml-1">Incoming</span>
                        </div>
                    </div>
                </div>

                {/* Center: Large avatar */}
                <div className="relative pointer-events-none">
                    {/* Glow */}
                    <div className="absolute -inset-16 rounded-full bg-[#25D366]/10 blur-3xl animate-pulse" />

                    {/* Pulse rings */}
                    <div className="absolute -inset-4 rounded-full border-2 border-[#25D366]/25 animate-ping" style={{ animationDuration: '1.5s' }} />
                    <div className="absolute -inset-8 rounded-full border border-[#25D366]/15 animate-ping" style={{ animationDuration: '2s' }} />
                    <div className="absolute -inset-12 rounded-full border border-[#25D366]/8 animate-ping" style={{ animationDuration: '2.5s' }} />

                    <div className="relative size-44 sm:size-56 rounded-full overflow-hidden ring-4 ring-white/10 shadow-[0_0_80px_rgba(0,0,0,0.5)] p-1 bg-gradient-to-br from-white/20 to-transparent">
                        <img
                            src={caller?.image || "/avatar.png"}
                            alt={caller?.name || "Caller"}
                            className="w-full h-full object-cover rounded-full"
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
                                aria-label="Decline Call"
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
                                className="size-16 sm:size-[72px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_8px_35px_rgba(37,211,102,0.4)] transition-all duration-300 active:scale-90 hover:bg-[#22c55e] hover:shadow-[0_8px_45px_rgba(37,211,102,0.6)] disabled:opacity-50 animate-pulse outline outline-offset-4 outline-white/10"
                                style={{ animationDuration: '2s' }}
                                aria-label="Accept Call"
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
});
WhatsAppIncomingCall.displayName = "WhatsAppIncomingCall";

export default IncomingCallNotification;
