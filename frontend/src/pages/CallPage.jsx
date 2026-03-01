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
        await localParticipant?.call?.screenShare.disable();
      } else {
        await localParticipant?.call?.screenShare.enable();
        toast.success("Screen sharing started");
      }
    } catch (e) {
      toast.error("Screen share failed");
    }
  };

  const handleToggleRecording = async () => {
    try {
      if (isRecording) {
        await localParticipant?.call?.stopRecording();
        toast.success("Recording saved");
      } else {
        await localParticipant?.call?.startRecording();
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
        <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-40 bg-gradient-to-b from-black/60 to-transparent">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Lock className="size-3 text-white/50" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Encrypted</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {remoteParticipant?.name || "Connected"}
            </h3>
          </div>

          <div className="flex gap-3">
            {isRecording && (
              <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold border border-red-500/30 flex items-center gap-2 animate-pulse">
                <div className="size-2 rounded-full bg-red-500" />
                REC
              </div>
            )}
            <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-all">
              <Volume2 className="size-5 text-white" />
            </div>
          </div>
        </div>

        {/* Dynamic Center Area / Video Views */}
        <div className="flex-1 relative bg-black">
          {isAudioCall ? (
            <div className="h-full w-full flex items-center justify-center px-6">
              <div className="call-avatar-container flex flex-col items-center gap-8">
                <div className="relative">
                  <div className="absolute -inset-10 rounded-full bg-primary/10 animate-pulse" />
                  <div className="size-48 sm:size-56 rounded-full overflow-hidden border-4 border-white/20 ring-4 ring-black/20 shadow-2xl relative z-10">
                    <img
                      src={remoteParticipant?.image || "/avatar.png"}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-white/60 text-sm font-medium tracking-wide uppercase">Voice Call</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {/* Main View (The "Big" screen) */}
              <div className="h-full w-full">
                {isSwapped ? (
                  <ParticipantView participant={localParticipant} />
                ) : (
                  remoteParticipant ? (
                    <ParticipantView participant={remoteParticipant} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <PageLoader />
                        <p className="text-white/40 mt-4 font-bold tracking-widest">WAITING FOR OTHERS</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Local Preview / PIP (The "Small" screen) */}
              {localParticipant && remoteParticipant && (
                <div
                  onClick={() => setIsSwapped(!isSwapped)}
                  className="absolute top-24 right-5 w-28 h-40 sm:w-44 sm:h-64 rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl z-30 active:scale-95 transition-transform cursor-pointer"
                >
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
        <div className="p-6 pb-14 sm:pb-8 flex justify-center z-50">
          <div className="floating-controls px-4 py-3 sm:px-8">
            {/* Screen Share */}
            <button
              onClick={handleToggleScreenShare}
              className={`control-btn ${isSharingScreen ? 'bg-primary text-white' : 'control-btn-active'}`}
              title="Screen Share"
            >
              <Monitor className="size-6" />
            </button>

            {/* Mic Mute */}
            <button
              onClick={() => localParticipant?.microphone?.toggle()}
              className={`control-btn ${micMuted ? 'bg-white text-black' : 'control-btn-active'}`}
              title="Mute Audio"
            >
              {micMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </button>

            {/* Video Mute */}
            {!isAudioCall && (
              <button
                onClick={() => localParticipant?.camera?.toggle()}
                className={`control-btn ${cameraMuted ? 'bg-white text-black' : 'control-btn-active'}`}
                title="Mute Video"
              >
                {cameraMuted ? <VideoOff className="size-6" /> : <Video className="size-6" />}
              </button>
            )}

            {/* Record Button */}
            <button
              onClick={handleToggleRecording}
              className={`control-btn ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'control-btn-active'}`}
              title="Record Call"
            >
              {isRecording ? <StopCircle className="size-6" /> : <Circle className="size-6" />}
            </button>

            {/* End Call */}
            <button
              onClick={() => navigate("/")}
              className="control-btn control-btn-danger"
              title="End Call"
            >
              <PhoneOff className="size-8 fill-current" />
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
    <div className="h-screen whatsapp-call-bg flex flex-col items-center justify-between py-16 px-6 overflow-hidden">
      <div className="text-center z-10 w-full">
        <div className="flex items-center justify-center gap-1.5 opacity-50 mb-2">
          <Lock className="size-3 text-white" />
          <span className="text-[10px] text-white uppercase font-bold tracking-widest text-shadow">End-to-End Encrypted</span>
        </div>
        <p className="text-white/70 text-sm font-medium uppercase tracking-widest">
          {isAudioCall ? "Voice Call" : "Video Call"}
        </p>
        <h2 className="text-3xl font-bold text-white mt-4">
          {callee?.name || "Connecting..."}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-primary font-bold tracking-widest text-sm animate-pulse">RINGING</span>
        </div>
      </div>

      <div className="call-avatar-container relative z-10">
        <div className="absolute -inset-16 rounded-full bg-primary/20 blur-3xl animate-pulse" />
        <div className="size-48 sm:size-56 rounded-full overflow-hidden border-4 border-white/10 shadow-2xl relative">
          <img
            src={callee?.image || "/avatar.png"}
            alt="callee"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        <button
          onClick={() => navigate("/")}
          className="control-btn control-btn-danger shadow-2xl shadow-red-500/40 active:scale-90 transition-transform"
        >
          <PhoneOff className="size-8 fill-current" />
        </button>
        <span className="text-[10px] text-white/40 font-bold uppercase tracking-[0.2em]">End Call</span>
      </div>
    </div>
  );
};

export default CallPage;