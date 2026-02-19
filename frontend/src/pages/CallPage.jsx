import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import { PhoneOff } from "lucide-react";

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
  const videoClient = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const callRef = useRef(null);
  const joiningRef = useRef(false);

  useEffect(() => {
    if (!videoClient || !callId) return;

    const joinCall = async () => {
      // Prevent multiple concurrent join attempts
      if (joiningRef.current) return;
      joiningRef.current = true;

      try {
        const callInstance = videoClient.call("default", callId);

        // Only join if not already in the process of joining or already joined
        const state = callInstance.state.callingState;
        if (state !== CallingState.JOINED && state !== CallingState.JOINING) {
          await callInstance.join({ create: true });
        }

        callRef.current = callInstance;
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        joiningRef.current = false;
        setIsConnecting(false);
      }
    };

    joinCall();

    // Cleanup: properly leave the call session
    // DO NOT use endCall() here as it terminates the call for everyone
    return () => {
      const currentCall = callRef.current;
      if (currentCall) {
        currentCall.leave().catch(console.error);
        callRef.current = null;
      }
    };
  }, [videoClient, callId]);

  if (isConnecting || !call) return <PageLoader />;

  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};

const CallContent = () => {
  const { useCallCallingState, useParticipantCount } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  // Show ringing screen while waiting for the other person
  if (
    callingState === CallingState.RINGING ||
    callingState === CallingState.JOINING
  ) {
    return <OutgoingCallScreen />;
  }

  // Active call — full screen
  return (
    <StreamTheme className="call-page-theme">
      <div className="call-page">
        {/* Header */}
        <div className="call-header">
          <div className="call-header-info">
            <div className="call-status-dot" />
            <span className="call-status-text">
              {participantCount} participant{participantCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Video Area */}
        <div className="call-video-area">
          <SpeakerLayout participantsBarPosition="bottom" />
        </div>

        {/* Controls */}
        <div className="call-controls-bar">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

const OutgoingCallScreen = () => {
  const navigate = useNavigate();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();

  const otherMember = members?.find((m) => !m.isLocalParticipant);
  const callee = otherMember?.user;

  const handleCancel = async () => {
    navigate("/");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-b from-neutral to-base-300">
      <div className="relative mb-8">
        <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping" />
        <div className="absolute -inset-2 rounded-full bg-primary/20 animate-pulse" />
        <div className="relative w-28 h-28 rounded-full overflow-hidden ring-4 ring-primary/40 shadow-2xl">
          <img
            src={callee?.image || "/avatar.png"}
            alt={callee?.name || "User"}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-base-content mb-1">
        {callee?.name || "Connecting..."}
      </h2>

      <div className="flex items-center gap-2 mb-14">
        <span className="text-base-content/50 text-lg">Ringing</span>
        <span className="loading loading-dots loading-sm text-primary" />
      </div>

      <button
        onClick={handleCancel}
        className="btn btn-circle btn-lg bg-red-500 hover:bg-red-600 text-white border-none shadow-lg shadow-red-500/30 transition-transform hover:scale-110"
      >
        <PhoneOff className="size-6" />
      </button>
      <p className="text-sm text-base-content/40 mt-3">Cancel</p>
    </div>
  );
};

export default CallPage;