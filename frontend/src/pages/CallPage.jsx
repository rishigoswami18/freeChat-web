import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import {
  PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Volume2, Lock,
  Monitor, StopCircle, Circle, ArrowLeft, Grid, Maximize2
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

const CallPage = () => {
  const { id: callId } = useParams();
  const location = useLocation();
  const videoClient = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const callRef = useRef(null);
  const joiningRef = useRef(false);

  const queryParams = new URLSearchParams(location.search);
  const isAudioCall = queryParams.get("type") === "audio";

  useEffect(() => {
    if (!videoClient || !callId) return;

    const joinCall = async () => {
      if (joiningRef.current) return;
      joiningRef.current = true;

      try {
        const callInstance = videoClient.call("default", callId);

        const state = callInstance.state.callingState;
        if (state !== CallingState.JOINED && state !== CallingState.JOINING) {
          await callInstance.join({ create: true });

          if (isAudioCall) {
            await callInstance.camera.disable();
          }
        }

        callRef.current = callInstance;
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call.");
      } finally {
        joiningRef.current = false;
        setIsConnecting(false);
      }
    };

    joinCall();

    return () => {
      const currentCall = callRef.current;
      if (currentCall) {
        currentCall.leave().catch(console.error);
        callRef.current = null;
      }
    };
  }, [videoClient, callId, isAudioCall]);

  if (isConnecting || !call) return <PageLoader />;

  return (
    <StreamCall call={call}>
      <CallContent isAudioCall={isAudioCall} />
    </StreamCall>
  );
};

const CallContent = ({ isAudioCall }) => {
  const call = useCall();
  const {
    useCallCallingState,
    useRemoteParticipants,
    useLocalParticipant,
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useIsCallRecordingInProgress
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const { isMuted: micMuted } = useMicrophoneState();
  const { isMuted: cameraMuted } = useCameraState();
  const { isSharingScreen, screenShareParticipant } = useScreenShareState();
  const isRecording = useIsCallRecordingInProgress();
  const navigate = useNavigate();

  // For swapping views in 1-on-1 calls
  const [isSwapped, setIsSwapped] = useState(false);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  if (callingState === CallingState.RINGING || callingState === CallingState.JOINING) {
    return <WhatsAppRingingScreen isAudioCall={isAudioCall} />;
  }

  const remoteParticipant = remoteParticipants[0];

  const handleToggleScreenShare = async () => {
    try {
      if (isSharingScreen) {
        await call.screenShare.disable();
      } else {
        await call.screenShare.enable();
        toast.success("Screen sharing started");
      }
    } catch (e) {
      toast.error("Screen share failed");
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await call.stopRecording();
        toast.success("Recording saved");
      } else {
        await call.startRecording();
        toast.success("Recording started");
      }
    } catch (e) {
      toast.error("Recording not available. Check dashboard settings.");
    }
  };

  return (
    <StreamTheme className="call-page-theme">
      <div className="whatsapp-call-bg h-screen w-screen flex flex-col relative overflow-hidden">

        {/* Top Overlay */}
        <div className="absolute top-0 inset-x-0 p-6 sm:p-10 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group cursor-default">
              <Lock className="size-3 text-white/50 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">End-to-End Encrypted</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white mt-1 drop-shadow-lg">
              {remoteParticipant?.name || "Connecting..."}
            </h3>
          </div>

          <div className="flex items-center gap-4">
            {isRecording && (
              <div className="bg-red-500/20 text-red-500 px-4 py-1.5 rounded-full text-[11px] font-bold border border-red-500/30 flex items-center gap-2 animate-pulse backdrop-blur-md">
                <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                REC
              </div>
            )}
            <div className="size-11 sm:size-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-white/20 transition-all cursor-pointer group active:scale-90">
              <Volume2 className="size-5 sm:size-6 text-white group-hover:scale-110 transition-transform" />
            </div>
            <button
              onClick={() => navigate("/")}
              className="size-11 sm:size-12 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all group active:scale-90"
              title="Leave call"
            >
              <ArrowLeft className="size-5 sm:size-6 text-white group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Dynamic Center Area / Video Views */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {isAudioCall ? (
            <div className="h-full w-full flex items-center justify-center px-6">
              <div className="call-avatar-container flex flex-col items-center gap-10">
                <div className="relative">
                  <div className="absolute -inset-16 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                  <div className="size-56 sm:size-72 rounded-full overflow-hidden border-8 border-white/5 ring-4 ring-black/40 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative z-10">
                    <img
                      src={remoteParticipant?.image || "/avatar.png"}
                      alt="avatar"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                </div>
                <div className="text-center z-10">
                  <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-2">Secure Audio Call</p>
                  <p className="text-primary font-bold tracking-widest text-lg animate-pulse">INCALL</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {/* Main View (The "Big" screen) */}
              <div className="h-full w-full">
                {isSwapped ? (
                  localParticipant && <ParticipantView participant={localParticipant} />
                ) : (
                  remoteParticipant ? (
                    <ParticipantView participant={remoteParticipant} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-block mb-8">
                          <div className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                          <PageLoader />
                        </div>
                        <p className="text-white font-black text-xs sm:text-sm tracking-[0.5em] uppercase opacity-40">Waiting for participant</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Local Preview / PIP (The "Small" screen) */}
              {localParticipant && remoteParticipant && (
                <div
                  onClick={() => setIsSwapped(!isSwapped)}
                  className="absolute top-32 right-6 sm:top-40 sm:right-12 w-32 h-48 sm:w-56 sm:h-80 lg:w-64 lg:h-96 rounded-3xl overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 active:scale-95 transition-all cursor-pointer bg-black group ring-1 ring-white/20"
                >
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors z-10" />
                  {isSwapped ? (
                    <ParticipantView
                      participant={remoteParticipant}
                      ParticipantDetails={null}
                      Menu={null}
                    />
                  ) : (
                    <ParticipantView
                      participant={localParticipant}
                      ParticipantDetails={null}
                      Menu={null}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* WhatsApp Style Controls Bar */}
        <div className="p-6 pb-14 sm:pb-12 flex justify-center z-50">
          <div className="floating-controls px-6 py-4 sm:px-12 sm:py-5 gap-6 sm:gap-10 backdrop-blur-2xl">
            {/* Screen Share */}
            <button
              onClick={handleToggleScreenShare}
              className={`control-btn ${isSharingScreen ? 'bg-primary text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]' : 'control-btn-active'}`}
              title="Screen Share"
            >
              <Monitor className="size-6 sm:size-7" />
            </button>

            {/* Mic Mute */}
            <button
              onClick={() => call.microphone.toggle()}
              className={`control-btn ${micMuted ? 'bg-white text-black' : 'control-btn-active'}`}
              title={micMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {micMuted ? <MicOff className="size-6 sm:size-7" /> : <Mic className="size-6 sm:size-7" />}
            </button>

            {/* Video Mute */}
            {!isAudioCall && (
              <>
                <button
                  onClick={() => call.camera.toggle()}
                  className={`control-btn ${cameraMuted ? 'bg-white text-black' : 'control-btn-active'}`}
                  title={cameraMuted ? "Turn Camera On" : "Turn Camera Off"}
                >
                  {cameraMuted ? <VideoOff className="size-6 sm:size-7" /> : <Video className="size-6 sm:size-7" />}
                </button>
                <button
                  onClick={() => call.camera.flip()}
                  className="control-btn control-btn-active"
                  title="Flip Camera"
                >
                  <RefreshCw className="size-6 sm:size-7" />
                </button>
              </>
            )}

            {/* Record Button */}
            <button
              onClick={handleToggleRecording}
              className={`control-btn ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'control-btn-active shadow-lg shadow-red-500/10'}`}
              title="Record Call"
            >
              {isRecording ? <StopCircle className="size-6 sm:size-7" /> : <Circle className="size-6 sm:size-7" />}
            </button>

            {/* End Call */}
            <button
              onClick={() => navigate("/")}
              className="control-btn control-btn-danger"
              title="End Call"
            >
              <PhoneOff className="size-8 sm:size-10 fill-current" />
            </button>
          </div>
        </div>

      </div>
    </StreamTheme>
  );
};

const WhatsAppRingingScreen = ({ isAudioCall }) => {
  const navigate = useNavigate();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();
  const otherMember = members?.find((m) => !m.isLocalParticipant);
  const callee = otherMember?.user;

  return (
    <div className="h-screen whatsapp-call-bg flex flex-col items-center justify-between py-16 sm:py-24 px-6 overflow-hidden">
      <div className="text-center z-10 w-full">
        <div className="flex items-center justify-center gap-2 opacity-50 mb-3">
          <Lock className="size-3.5 text-white" />
          <span className="text-[11px] text-white uppercase font-black tracking-[0.2em] text-shadow">End-to-End Encrypted</span>
        </div>
        <p className="text-white/70 text-sm sm:text-base font-medium uppercase tracking-[0.3em] mb-4">
          {isAudioCall ? "WhatsApp Voice Call" : "WhatsApp Video Call"}
        </p>
        <h2 className="text-4xl sm:text-6xl font-black text-white mt-4 tracking-tight drop-shadow-2xl">
          {callee?.name || "Connecting..."}
        </h2>
        <div className="mt-6 flex items-center justify-center gap-3">
          <span className="text-primary font-black tracking-[0.5em] text-sm sm:text-base animate-pulse">RINGING</span>
        </div>
      </div>

      <div className="call-avatar-container relative z-10">
        <div className="absolute -inset-24 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
        <div className="size-64 sm:size-80 rounded-full overflow-hidden border-8 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative">
          <img
            src={callee?.image || "/avatar.png"}
            alt="callee"
            className="w-full h-full object-cover scale-110"
          />
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-8">
        <button
          onClick={() => navigate("/")}
          className="control-btn control-btn-danger size-20 sm:size-24 shadow-[0_20px_50px_rgba(239,68,68,0.5)] active:scale-90 transition-all hover:bg-red-600 group"
        >
          <PhoneOff className="size-10 sm:size-12 fill-current group-hover:scale-110 transition-transform" />
        </button>
        <span className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-[0.4em]">Cancel Call</span>
      </div>
    </div>
  );
};

export default CallPage;