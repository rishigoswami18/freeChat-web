import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import { PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Volume2, Lock } from "lucide-react";

import {
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
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

  // Check if it's an audio-only call from URL
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
    useParticipantCount,
    useRemoteParticipants,
    useLocalParticipant,
    useMicrophoneState,
    useCameraState
  } = useCallStateHooks();

  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const remoteParticipants = useRemoteParticipants();
  const localParticipant = useLocalParticipant();
  const { isMuted: micMuted } = useMicrophoneState();
  const { isMuted: cameraMuted } = useCameraState();
  const navigate = useNavigate();

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

  return (
    <StreamTheme className="call-page-theme">
      <div className="whatsapp-call-bg h-screen w-screen flex flex-col relative overflow-hidden">

        {/* Top Overlay */}
        <div className="absolute top-0 inset-x-0 p-6 flex items-center justify-between z-20 bg-gradient-to-b from-black/40 to-transparent">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <Lock className="size-3 text-white/50" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-bold">End-to-End Encrypted</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {remoteParticipant?.name || "Connected"}
            </h3>
            <p className="text-white/70 text-sm">
              {isAudioCall ? "Encrypted Voice Call" : "Video Call"}
            </p>
          </div>

          <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 active:scale-95 transition-all">
            <Volume2 className="size-5 text-white" />
          </div>
        </div>

        {/* Dynamic Center Area */}
        <div className="flex-1 flex items-center justify-center px-6">
          {isAudioCall ? (
            <div className="call-avatar-container flex flex-col items-center gap-8">
              <div className="relative">
                <div className="absolute -inset-10 rounded-full bg-primary/10 animate-pulse" />
                <div className="absolute -inset-20 rounded-full bg-primary/5 animate-pulse delay-500" />
                <div className="size-44 sm:size-52 rounded-full overflow-hidden border-4 border-white/20 ring-4 ring-black/20 shadow-2xl relative z-10">
                  <img
                    src={remoteParticipant?.image || "/avatar.png"}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-white/60 text-sm font-medium tracking-wide uppercase">In Call</p>
                <div className="mt-4 flex gap-1.5 justify-center">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full">
              <SpeakerLayout participantsBarPosition="bottom" />
            </div>
          )}
        </div>

        {/* WhatsApp Premium Controls Bar */}
        <div className="p-8 pb-12 sm:pb-8 flex justify-center z-30">
          <div className="floating-controls">
            <button
              onClick={() => localParticipant?.microphone?.toggle()}
              className={`control-btn ${micMuted ? 'control-btn-active bg-red-500/20 text-red-500' : 'control-btn-active'}`}
            >
              {micMuted ? <MicOff className="size-6" /> : <Mic className="size-6" />}
            </button>

            {!isAudioCall && (
              <>
                <button
                  onClick={() => localParticipant?.camera?.toggle()}
                  className={`control-btn ${cameraMuted ? 'control-btn-active bg-red-500/20 text-red-500' : 'control-btn-active'}`}
                >
                  {cameraMuted ? <VideoOff className="size-6" /> : <Video className="size-6" />}
                </button>
                <button
                  onClick={() => localParticipant?.camera?.flip()}
                  className="control-btn control-btn-active"
                >
                  <RefreshCw className="size-6" />
                </button>
              </>
            )}

            <button
              onClick={() => navigate("/")}
              className="control-btn control-btn-danger"
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
          <span className="text-[10px] text-white uppercase font-bold tracking-widest">End-to-End Encrypted</span>
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