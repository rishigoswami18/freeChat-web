import { useEffect, useState, useRef } from "react";
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
                // Using "livestream" call type which is optimized for 1-to-many
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
        useCallStatsReport,
        useMicrophoneState,
        useCameraState,
        useParticipantCount,
    } = useCallStateHooks();

    const callingState = useCallCallingState();
    const localParticipant = useLocalParticipant();
    const remoteParticipants = useRemoteParticipants();
    const participantCount = useParticipantCount();
    const { isMuted: micMuted } = useMicrophoneState();
    const { isMuted: cameraMuted } = useCameraState();
    const navigate = useNavigate();

    // The host is usually the local participant if they created the call
    const isHost = localParticipant && (localParticipant.role === 'admin' || localParticipant.role === 'host');

    // For the UI, we prioritize showing the host
    const hostParticipant = isHost ? localParticipant : (remoteParticipants.find(p => p.role === 'host' || p.role === 'admin') || remoteParticipants[0]);

    const notificationSent = useRef(false);

    useEffect(() => {
        if (isHost && callingState === CallingState.JOINED && !notificationSent.current) {
            notificationSent.current = true;
            const triggerNotification = async () => {
                try {
                    await notifyLiveStreamStart();
                    toast.success("Followers notified! 🚀");
                } catch (error) {
                    console.error("Failed to notify followers:", error);
                }
            };
            triggerNotification();
        }
    }, [isHost, callingState]);

    useEffect(() => {

        if (callingState === CallingState.LEFT) {
            navigate("/");
        }
    }, [callingState, navigate]);

    const handleExit = () => {
        call.leave();
        navigate("/");
    };

    if (callingState === CallingState.LEFT) return null;

    return (
        <StreamTheme className="live-stream-theme">
            <div className="h-screen w-screen bg-[#050505] flex flex-col relative overflow-hidden font-outfit">

                {/* Immersive Background Blur */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px]" />
                </div>

                {/* Top Overlay Controls */}
                <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExit}
                            className="btn btn-ghost btn-sm btn-circle text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="size-5" />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-sm tracking-tighter uppercase animate-pulse">
                                    LIVE
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-white max-w-[120px] sm:max-w-none truncate">
                                    {isHost ? "You are Streaming" : `${hostParticipant?.name || "Host"}'s Live`}
                                </h3>
                            </div>
                            <div className="flex items-center gap-3 mt-0.5">
                                <div className="flex items-center gap-1.5 text-white/60 text-[11px] font-bold">
                                    <Eye className="size-3.5 text-primary" />
                                    <span>{participantCount} viewers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                            <Users className="size-3.5 text-secondary" />
                            <span className="text-[11px] text-white font-black uppercase tracking-widest">{participantCount} Online</span>
                        </div>
                        <button
                            onClick={handleExit}
                            className="btn btn-error btn-sm rounded-xl gap-2 font-black uppercase italic shadow-lg shadow-error/20"
                        >
                            <PhoneOff className="size-4" />
                            <span className="hidden sm:inline">End Stream</span>
                            <span className="sm:hidden">Exit</span>
                        </button>
                    </div>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 relative bg-black flex items-center justify-center">
                    {hostParticipant ? (
                        <div className="w-full h-full">
                            <ParticipantView
                                participant={hostParticipant}
                                ParticipantDetails={null}
                                Menu={null}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="relative inline-block mb-6">
                                <div className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                                <PageLoader />
                            </div>
                            <p className="text-white/40 font-black text-xs sm:text-sm tracking-[0.5em] uppercase">Waiting for Host</p>
                        </div>
                    )}

                    {/* Interaction Overlay (Right Side) */}
                    {!isHost && hostParticipant && (
                        <div className="absolute right-4 bottom-24 flex flex-col gap-4 z-40 items-center">
                            <div className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform">
                                <div className="size-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-red-500/20 group-hover:border-red-500/50">
                                    <Heart className="size-6 text-white group-hover:fill-red-500 group-hover:text-red-500 transition-all" />
                                </div>
                                <span className="text-[10px] text-white/60 font-black">2.4k</span>
                            </div>
                            <div className="flex flex-col items-center gap-1 group cursor-pointer active:scale-90 transition-transform">
                                <div className="size-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 group-hover:bg-primary/20 group-hover:border-primary/50">
                                    <Share2 className="size-6 text-white group-hover:text-primary transition-all" />
                                </div>
                                <span className="text-[10px] text-white/60 font-black">Share</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Host Controls Section (Only visible to host) */}
                {isHost && (
                    <div className="absolute bottom-10 inset-x-0 px-6 flex justify-center z-50">
                        <div className="bg-black/60 backdrop-blur-3xl px-8 py-5 rounded-[2.5rem] border border-white/10 flex items-center gap-8 shadow-2xl">
                            <button
                                onClick={() => call.microphone.toggle()}
                                className={`size-14 rounded-full flex items-center justify-center transition-all ${micMuted ? 'bg-white text-black' : 'bg-primary/20 text-primary border border-primary/30'}`}
                            >
                                {micMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
                            </button>
                            <button
                                onClick={() => call.camera.toggle()}
                                className={`size-14 rounded-full flex items-center justify-center transition-all ${cameraMuted ? 'bg-white text-black' : 'bg-secondary/20 text-secondary border border-secondary/30'}`}
                            >
                                {cameraMuted ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                            </button>
                            <div className="h-10 w-px bg-white/10 mx-2" />
                            <button
                                onClick={handleExit}
                                className="size-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 hover:scale-110 active:scale-90 transition-all"
                            >
                                <PhoneOff className="size-8" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Interaction Row (Mobile optimized bottom bar) */}
                {!isHost && (
                    <div className="p-4 sm:p-6 pb-10 sm:pb-8 flex items-center gap-3 z-50 bg-gradient-to-t from-black via-black/40 to-transparent">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Say something nice..."
                                className="w-full bg-white/10 border border-white/10 rounded-2xl px-5 py-3.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 backdrop-blur-xl"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <Sparkles className="size-4 text-primary animate-pulse" />
                                <button className="btn btn-primary btn-sm rounded-xl font-black italic">SEND</button>
                            </div>
                        </div>
                        <button className="btn btn-ghost btn-circle bg-white/5 backdrop-blur-xl text-white">
                            <Maximize2 className="size-5" />
                        </button>
                    </div>
                )}

            </div>
        </StreamTheme>
    );
};

export default LiveStreamPage;
