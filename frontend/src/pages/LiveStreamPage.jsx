import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import {
    Users,
    Zap,
    Video,
    VideoOff,
    Mic,
    MicOff,
    PhoneOff,
    Eye,
    MessageCircle,
    Share2,
    Heart,
    Maximize2,
    ArrowLeft,
    Sparkles,
    Radio,
    Copy,
    Check,
    Clock,
    Signal,
    Camera,
    CameraOff,
    Loader2,
} from "lucide-react";

import {
    StreamCall,
    StreamTheme,
    CallingState,
    useCallStateHooks,
    ParticipantView,
    useCall,
} from "@stream-io/video-react-sdk";

import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";
import { notifyLiveStreamStart } from "../lib/api";


const LiveStreamPage = () => {
    const { id: streamId } = useParams();
    const videoClient = useVideoClient();
    const [call, setCall] = useState(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const callRef = useRef(null);
    const joiningRef = useRef(false);

    useEffect(() => {
        if (!videoClient || !streamId) return;

        const joinStream = async () => {
            if (joiningRef.current) return;
            joiningRef.current = true;

            try {
                const callInstance = videoClient.call("livestream", streamId);

                const state = callInstance.state.callingState;
                if (state !== CallingState.JOINED && state !== CallingState.JOINING) {
                    await callInstance.join({ create: true });
                }

                callRef.current = callInstance;
                setCall(callInstance);
            } catch (error) {
                console.error("Error joining stream:", error);
                toast.error("Could not join the stream.");
            } finally {
                joiningRef.current = false;
                setIsConnecting(false);
            }
        };

        joinStream();

        return () => {
            const currentCall = callRef.current;
            if (currentCall) {
                currentCall.leave().catch(console.error);
                callRef.current = null;
            }
        };
    }, [videoClient, streamId]);

    if (isConnecting || !call) return <PageLoader />;

    return (
        <StreamCall call={call}>
            <LiveStreamContent />
        </StreamCall>
    );
};

const LiveStreamContent = () => {
    const call = useCall();
    const {
        useCallCallingState,
        useLocalParticipant,
        useRemoteParticipants,
        useMicrophoneState,
        useCameraState,
        useParticipantCount,
        useIsCallLive,
    } = useCallStateHooks();

    const callingState = useCallCallingState();
    const localParticipant = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const participantCount = useParticipantCount();
    const { isMuted: micMuted } = useMicrophoneState();
    const { isMuted: cameraMuted } = useCameraState();
    const isLive = useIsCallLive();
    const navigate = useNavigate();

    const [isGoingLive, setIsGoingLive] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [linkCopied, setLinkCopied] = useState(false);
    const [showReaction, setShowReaction] = useState(false);
    const [likeCount, setLikeCount] = useState(0);

    // The host is usually the local participant if they created the call
    const isHost = localParticipant && (localParticipant.role === 'admin' || localParticipant.role === 'host');

    // For the UI, we prioritize showing the host
    const hostParticipant = isHost
        ? localParticipant
        : (remoteParticipants.find(p => p.role === 'host' || p.role === 'admin') || remoteParticipants[0]);

    const notificationSent = useRef(false);

    // Auto-enable camera & mic when host joins, then go live
    useEffect(() => {
        if (!isHost || callingState !== CallingState.JOINED) return;

        const setupAndGoLive = async () => {
            try {
                // Enable camera and microphone for the host
                await call.camera.enable();
                await call.microphone.enable();
                console.log("🎥 Camera & mic enabled for host");

                // Check if already live
                if (!isLive) {
                    setIsGoingLive(true);
                    await call.goLive();
                    console.log("🔴 Stream is now LIVE!");
                    setIsGoingLive(false);
                }

                // Notify followers (once)
                if (!notificationSent.current) {
                    notificationSent.current = true;
                    try {
                        await notifyLiveStreamStart();
                        toast.success("Followers notified! 🚀");
                    } catch (error) {
                        console.error("Failed to notify followers:", error);
                    }
                }
            } catch (error) {
                console.error("Failed to setup stream:", error);
                setIsGoingLive(false);
            }
        };

        setupAndGoLive();
    }, [isHost, callingState, call, isLive]);

    // Timer for live duration
    useEffect(() => {
        if (!isLive) return;
        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [isLive]);

    useEffect(() => {
        if (callingState === CallingState.LEFT) {
            navigate("/");
        }
    }, [callingState, navigate]);

    const handleExit = async () => {
        try {
            if (isHost && isLive) {
                await call.stopLive();
            }
            await call.leave();
        } catch (e) {
            console.error("Error leaving stream:", e);
        }
        navigate("/");
    };

    const handleToggleLive = async () => {
        try {
            setIsGoingLive(true);
            if (isLive) {
                await call.stopLive();
                toast("Stream paused", { icon: "⏸️" });
            } else {
                await call.goLive();
                toast.success("You're live! 🔴");
            }
        } catch (error) {
            console.error("Error toggling live:", error);
            toast.error("Failed to toggle live status.");
        } finally {
            setIsGoingLive(false);
        }
    };

    const handleCopyLink = useCallback(() => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setLinkCopied(true);
        toast.success("Link copied!");
        setTimeout(() => setLinkCopied(false), 2000);
    }, []);

    const handleLike = () => {
        setLikeCount(prev => prev + 1);
        setShowReaction(true);
        setTimeout(() => setShowReaction(false), 1000);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    if (callingState === CallingState.LEFT) return null;

    return (
        <StreamTheme className="live-stream-theme">
            <div className="h-screen w-screen bg-[#030305] flex flex-col relative overflow-hidden font-outfit">

                {/* Ambient Background Glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-primary/8 via-transparent to-transparent rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[120px]" />
                </div>

                {/* ===== TOP BAR ===== */}
                <div className="absolute top-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between z-50 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExit}
                            className="size-10 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all active:scale-90"
                        >
                            <ArrowLeft className="size-5 text-white" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                {isLive ? (
                                    <div className="flex items-center gap-1.5 bg-red-600/90 text-white text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase shadow-lg shadow-red-600/30">
                                        <Radio className="size-3 animate-pulse" />
                                        LIVE
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-amber-500/90 text-black text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider uppercase">
                                        <Clock className="size-3" />
                                        BACKSTAGE
                                    </div>
                                )}
                                <h3 className="text-sm sm:text-base font-bold text-white max-w-[140px] sm:max-w-none truncate">
                                    {isHost ? "Your Stream" : `${hostParticipant?.name || "Host"}'s Live`}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                                <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
                                    <Eye className="size-3.5" />
                                    <span>{participantCount} {participantCount === 1 ? 'viewer' : 'viewers'}</span>
                                </div>
                                {isLive && (
                                    <div className="flex items-center gap-1.5 text-white/50 text-[11px] font-medium">
                                        <Clock className="size-3.5" />
                                        <span>{formatTime(elapsedTime)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Online Count Pill */}
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/8 backdrop-blur-xl rounded-full border border-white/10">
                            <Signal className="size-3.5 text-green-400" />
                            <span className="text-[11px] text-white/80 font-semibold">{participantCount} online</span>
                        </div>

                        {/* Copy Link Button */}
                        <button
                            onClick={handleCopyLink}
                            className="size-10 rounded-full bg-white/8 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/15 transition-all active:scale-90"
                            title="Copy stream link"
                        >
                            {linkCopied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4 text-white/70" />}
                        </button>

                        {/* End Stream Button */}
                        <button
                            onClick={handleExit}
                            className="flex items-center gap-2 bg-red-600/90 hover:bg-red-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-red-600/20 transition-all hover:shadow-red-600/40 active:scale-95"
                        >
                            <PhoneOff className="size-4" />
                            <span className="hidden sm:inline">End Stream</span>
                        </button>
                    </div>
                </div>

                {/* ===== MAIN VIDEO AREA ===== */}
                <div className="flex-1 relative flex items-center justify-center">
                    {hostParticipant && isLive ? (
                        <div className="w-full h-full live-stream-video-container">
                            <ParticipantView
                                participant={hostParticipant}
                                ParticipantViewUI={null}
                                trackType="videoTrack"
                            />
                        </div>
                    ) : hostParticipant && !isLive && isHost ? (
                        /* Backstage Preview for Host */
                        <div className="w-full h-full relative">
                            <div className="w-full h-full live-stream-video-container opacity-70">
                                <ParticipantView
                                    participant={hostParticipant}
                                    ParticipantViewUI={null}
                                    trackType="videoTrack"
                                />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                                <div className="text-center p-8 animate-scale-in">
                                    <div className="relative inline-block mb-4">
                                        <div className="absolute -inset-6 bg-primary/20 rounded-full blur-2xl animate-pulse" />
                                        <div className="relative size-20 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full flex items-center justify-center border border-white/10">
                                            <Camera className="size-10 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-white text-lg font-bold mb-1">Backstage Preview</h3>
                                    <p className="text-white/50 text-sm mb-6">Check your camera & mic before going live</p>
                                    <button
                                        onClick={handleToggleLive}
                                        disabled={isGoingLive}
                                        className="btn border-0 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white gap-2 rounded-2xl px-8 py-3 font-bold text-base shadow-2xl shadow-red-600/40 hover:shadow-red-600/60 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                                    >
                                        {isGoingLive ? (
                                            <Loader2 className="size-5 animate-spin" />
                                        ) : (
                                            <Radio className="size-5" />
                                        )}
                                        {isGoingLive ? "Going Live..." : "Go Live Now"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Waiting for Host (Viewer perspective) */
                        <div className="text-center animate-scale-in">
                            <div className="relative inline-block mb-8">
                                <div className="absolute -inset-10 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                                <div className="relative">
                                    <div className="size-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-xl">
                                        <Radio className="size-12 text-white/60" />
                                    </div>
                                    {/* Orbiting dots */}
                                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 size-2 bg-primary rounded-full" />
                                    </div>
                                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '1.3s' }}>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 size-2 bg-secondary rounded-full" />
                                    </div>
                                    <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s', animationDelay: '2.6s' }}>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2 size-1.5 bg-white/50 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <p className="text-white/40 font-semibold text-sm tracking-[0.3em] uppercase mb-2">
                                Waiting for Host
                            </p>
                            <p className="text-white/20 text-xs">The stream will begin shortly</p>
                        </div>
                    )}

                    {/* ===== Floating Reactions (Right Side) ===== */}
                    {showReaction && (
                        <div className="absolute right-8 bottom-32 z-40 pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={`reaction-${i}-${Date.now()}`}
                                    className="absolute text-2xl"
                                    style={{
                                        animation: 'floatUp 1s ease-out forwards',
                                        animationDelay: `${i * 0.1}s`,
                                        right: `${Math.random() * 30}px`,
                                        bottom: 0,
                                        opacity: 0,
                                    }}
                                >
                                    ❤️
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ===== Viewer Side Buttons ===== */}
                    {!isHost && hostParticipant && isLive && (
                        <div className="absolute right-3 sm:right-5 bottom-28 sm:bottom-24 flex flex-col gap-4 z-40 items-center">
                            <div className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform" onClick={handleLike}>
                                <div className="size-12 rounded-full bg-white/8 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-red-500/20 group-hover:border-red-500/40 transition-all">
                                    <Heart className="size-6 text-white group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                                </div>
                                <span className="text-[10px] text-white/50 font-semibold tabular-nums">{likeCount > 0 ? likeCount : ''}</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform" onClick={handleCopyLink}>
                                <div className="size-12 rounded-full bg-white/8 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/40 transition-all">
                                    <Share2 className="size-6 text-white group-hover:text-primary transition-all" />
                                </div>
                                <span className="text-[10px] text-white/50 font-semibold">Share</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ===== HOST FLOATING CONTROLS ===== */}
                {isHost && (
                    <div className="absolute bottom-8 sm:bottom-10 inset-x-0 px-4 sm:px-6 flex justify-center z-50">
                        <div className="bg-black/60 backdrop-blur-2xl px-5 sm:px-8 py-4 sm:py-5 rounded-[2rem] border border-white/8 flex items-center gap-4 sm:gap-6 shadow-2xl shadow-black/50">
                            {/* Mic */}
                            <button
                                onClick={() => call.microphone.toggle()}
                                className={`size-12 sm:size-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${micMuted
                                        ? 'bg-white text-black shadow-lg shadow-white/20'
                                        : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
                                    }`}
                                title={micMuted ? 'Unmute mic' : 'Mute mic'}
                            >
                                {micMuted ? <MicOff className="size-5 sm:size-6" /> : <Mic className="size-5 sm:size-6" />}
                            </button>

                            {/* Camera */}
                            <button
                                onClick={() => call.camera.toggle()}
                                className={`size-12 sm:size-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${cameraMuted
                                        ? 'bg-white text-black shadow-lg shadow-white/20'
                                        : 'bg-white/10 text-white border border-white/10 hover:bg-white/15'
                                    }`}
                                title={cameraMuted ? 'Turn on camera' : 'Turn off camera'}
                            >
                                {cameraMuted ? <VideoOff className="size-5 sm:size-6" /> : <Video className="size-5 sm:size-6" />}
                            </button>

                            <div className="h-8 w-px bg-white/10" />

                            {/* Toggle Live */}
                            <button
                                onClick={handleToggleLive}
                                disabled={isGoingLive}
                                className={`size-12 sm:size-14 rounded-full flex items-center justify-center transition-all active:scale-90 ${isLive
                                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-500'
                                        : 'bg-green-600 text-white shadow-lg shadow-green-600/30 hover:bg-green-500'
                                    }`}
                                title={isLive ? 'Stop Live' : 'Go Live'}
                            >
                                {isGoingLive ? (
                                    <Loader2 className="size-5 sm:size-6 animate-spin" />
                                ) : (
                                    <Radio className="size-5 sm:size-6" />
                                )}
                            </button>

                            <div className="h-8 w-px bg-white/10" />

                            {/* End Call */}
                            <button
                                onClick={handleExit}
                                className="size-14 sm:size-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl shadow-red-600/30 hover:bg-red-500 hover:scale-105 active:scale-90 transition-all"
                                title="End stream"
                            >
                                <PhoneOff className="size-6 sm:size-7" />
                            </button>
                        </div>
                    </div>
                )}

                {/* ===== VIEWER BOTTOM BAR ===== */}
                {!isHost && (
                    <div className="p-3 sm:p-5 pb-8 sm:pb-6 flex items-center gap-3 z-50 bg-gradient-to-t from-black via-black/60 to-transparent">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Say something nice..."
                                className="w-full bg-white/8 border border-white/8 rounded-2xl px-5 py-3 text-white placeholder:text-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 backdrop-blur-xl transition-all"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                                <Sparkles className="size-3.5 text-primary/50 animate-pulse" />
                                <button className="bg-primary hover:bg-primary/80 text-primary-content text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all active:scale-90">
                                    Send
                                </button>
                            </div>
                        </div>
                        <button className="size-11 rounded-full bg-white/5 backdrop-blur-xl flex items-center justify-center border border-white/10 text-white/60 hover:bg-white/10 transition-all active:scale-90">
                            <Maximize2 className="size-5" />
                        </button>
                    </div>
                )}

            </div>
        </StreamTheme>
    );
};

export default LiveStreamPage;
