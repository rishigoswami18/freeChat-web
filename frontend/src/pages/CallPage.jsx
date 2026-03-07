import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import {
  PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Volume2, Lock,
  Monitor, StopCircle, Circle, Maximize2, Minimize2, Wifi, WifiOff
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

    // Keep screen awake during call
    let wakeLock = null;
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(wl => {
        wakeLock = wl;
        console.log("🔒 Screen wake lock acquired");
      }).catch(() => { });
    }

    return () => {
      const currentCall = callRef.current;
      if (currentCall) {
        currentCall.leave().catch(console.error);
        callRef.current = null;
      }
      if (wakeLock) {
        wakeLock.release().catch(() => { });
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
  const { isSharingScreen } = useScreenShareState();
  const isRecording = useIsCallRecordingInProgress();
  const navigate = useNavigate();

  const [isSwapped, setIsSwapped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimerRef = useRef(null);

  // Call timer
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef(null);

  // Auto-dismiss timeout — leave if no one joins in 60s
  const [waitingTime, setWaitingTime] = useState(0);
  const waitTimerRef = useRef(null);

  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callingState]);

  // Auto-leave if alone for 60 seconds
  useEffect(() => {
    if (callingState === CallingState.JOINED && remoteParticipants.length === 0) {
      waitTimerRef.current = setInterval(() => {
        setWaitingTime(prev => {
          if (prev >= 59) {
            toast("No one joined. Call ended.", { icon: "📞" });
            call?.leave().catch(() => { });
            navigate("/");
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setWaitingTime(0);
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
    }
    return () => {
      if (waitTimerRef.current) clearInterval(waitTimerRef.current);
    };
  }, [callingState, remoteParticipants.length, navigate, call]);

  // ===== FIX: End call for both sides =====
  // When remote participant leaves in a 1-on-1 call, end for us too
  const prevRemoteCountRef = useRef(remoteParticipants.length);
  useEffect(() => {
    // If we had a remote participant and now they're gone (and call is still joined)
    if (prevRemoteCountRef.current > 0 && remoteParticipants.length === 0 && callingState === CallingState.JOINED) {
      toast("Call ended by the other side.", { icon: "📞" });
      call?.leave().catch(() => { });
      navigate("/");
    }
    prevRemoteCountRef.current = remoteParticipants.length;
  }, [remoteParticipants.length, callingState, call, navigate]);

  // Listen for call.ended event from Stream SDK
  useEffect(() => {
    if (!call) return;
    const handleCallEnded = () => {
      console.log("📞 Call ended event received");
      toast("Call ended.", { icon: "📞" });
      navigate("/");
    };
    call.on('call.ended', handleCallEnded);
    return () => {
      call.off('call.ended', handleCallEnded);
    };
  }, [call, navigate]);

  // Auto-hide controls on desktop after 4 seconds
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (!isAudioCall) setShowControls(false);
    }, 4000);
  }, [isAudioCall]);

  useEffect(() => {
    if (!isAudioCall) {
      resetControlsTimeout();
    }
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    };
  }, [isAudioCall, resetControlsTimeout]);

  const formatDuration = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleEndCall = useCallback(async () => {
    try {
      // Try endCall() first — this ends the call for ALL participants
      await call?.endCall();
    } catch (e) {
      // If endCall fails (e.g. not the creator), just leave
      try {
        await call?.leave();
      } catch (e2) {
        console.error("Leave error:", e2);
      }
    }
    navigate("/");
  }, [call, navigate]);

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  // Keyboard shortcut: M = mute, V = camera, Esc = end call
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case "m": call?.microphone.toggle(); break;
        case "v": if (!isAudioCall) call?.camera.toggle(); break;
        case "escape": handleEndCall(); break;
        case "f": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [call, isAudioCall, handleEndCall]);

  if (callingState === CallingState.LEFT) return null;

  if (callingState === CallingState.RINGING || callingState === CallingState.JOINING) {
    return <WhatsAppRingingScreen isAudioCall={isAudioCall} />;
  }

  const remoteParticipant = remoteParticipants[0];

  const handleToggleScreenShare = async () => {
    try {
      if (isSharingScreen) {
        await call.screenShare.disable();
        toast.success("Screen sharing stopped");
      } else {
        // Check if browser supports getDisplayMedia
        if (!navigator.mediaDevices?.getDisplayMedia) {
          toast.error("Screen sharing is not supported on this device/browser.");
          return;
        }
        await call.screenShare.enable({ audio: true });
        toast.success("Screen sharing started");
      }
    } catch (e) {
      console.error("Screen share error:", e);
      if (e.name === "NotAllowedError" || e.message?.includes("denied") || e.message?.includes("Permission")) {
        toast.error("Screen share permission denied. Please allow access.");
      } else {
        toast.error("Screen share failed. Try again.");
      }
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
      <div
        className="whatsapp-call-bg h-dvh w-screen flex flex-col relative overflow-hidden cursor-default select-none"
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
      >

        {/* Top Overlay */}
        <div className={`absolute top-0 inset-x-0 p-5 sm:p-8 lg:p-10 flex items-center justify-between z-40 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 group cursor-default">
              <Lock className="size-3 text-white/50 group-hover:text-primary transition-colors" />
              <span className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold">End-to-End Encrypted</span>
            </div>
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mt-1 drop-shadow-lg">
              {remoteParticipant?.name || "Connecting..."}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-sm lg:text-base text-white/60 font-mono tracking-wider">
                {formatDuration(callDuration)}
              </p>
              {/* Connection indicator */}
              {remoteParticipant ? (
                <div className="flex items-center gap-1.5">
                  <Wifi className="size-3.5 text-green-400" />
                  <span className="text-[10px] text-green-400/70 font-bold uppercase">Connected</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <WifiOff className="size-3.5 text-yellow-400 animate-pulse" />
                  <span className="text-[10px] text-yellow-400/70 font-bold uppercase">
                    Waiting ({60 - waitingTime}s)
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-4">
            {isRecording && (
              <div className="bg-red-500/20 text-red-500 px-3 py-1.5 rounded-full text-[11px] font-bold border border-red-500/30 flex items-center gap-2 animate-pulse backdrop-blur-md">
                <div className="size-2 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                REC
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="hidden lg:flex size-10 rounded-full bg-white/10 backdrop-blur-xl items-center justify-center border border-white/10 hover:bg-white/20 transition-all cursor-pointer group active:scale-90"
              title={isFullscreen ? "Exit Fullscreen (F)" : "Fullscreen (F)"}
            >
              {isFullscreen
                ? <Minimize2 className="size-4.5 text-white group-hover:scale-110 transition-transform" />
                : <Maximize2 className="size-4.5 text-white group-hover:scale-110 transition-transform" />
              }
            </button>
          </div>
        </div>

        {/* Screen Share Active Banner */}
        {isSharingScreen && (
          <div className="absolute top-[72px] sm:top-[88px] inset-x-0 z-40 flex justify-center pointer-events-none">
            <div className="bg-primary/90 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg shadow-primary/30 backdrop-blur-sm pointer-events-auto">
              <Monitor className="size-4" />
              Sharing your screen
              <button
                onClick={handleToggleScreenShare}
                className="ml-2 bg-white/20 hover:bg-white/30 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors"
              >
                Stop
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Center Area / Video Views */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {isAudioCall ? (
            <div className="h-full w-full flex items-center justify-center px-6">
              {/* Audio visualizer background */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="flex items-end gap-1.5 h-32">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1.5 bg-primary rounded-full transition-all"
                      style={{
                        height: `${Math.random() * 100 + 20}%`,
                        animation: `audioBar ${0.3 + Math.random() * 0.7}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="call-avatar-container flex flex-col items-center gap-8 lg:gap-10">
                <div className="relative">
                  <div className="absolute -inset-16 rounded-full bg-primary/10 blur-3xl animate-pulse" />
                  {/* Audio waveform rings */}
                  {!micMuted && remoteParticipant && (
                    <>
                      <div className="absolute -inset-6 rounded-full border-2 border-primary/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute -inset-10 rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }} />
                    </>
                  )}
                  <div className="size-48 sm:size-64 lg:size-80 rounded-full overflow-hidden border-8 border-white/5 ring-4 ring-black/40 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative z-10">
                    <img
                      src={remoteParticipant?.image || "/avatar.png"}
                      alt="avatar"
                      className="w-full h-full object-cover scale-110"
                    />
                  </div>
                </div>
                <div className="text-center z-10">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2 drop-shadow-lg">
                    {remoteParticipant?.name || "Waiting..."}
                  </h2>
                  <p className="text-white/40 text-xs font-bold tracking-[0.3em] uppercase mb-1">
                    {remoteParticipant ? "Secure Audio Call" : "Ringing..."}
                  </p>
                  <p className="text-primary/80 font-mono text-xl lg:text-2xl tracking-widest font-bold">
                    {formatDuration(callDuration)}
                  </p>
                  {micMuted && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-red-400/70">
                      <MicOff className="size-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">Muted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full w-full relative">
              {/* Main View */}
              <div className="h-full w-full">
                {isSwapped ? (
                  localParticipant && (
                    <ParticipantView
                      participant={localParticipant}
                      ParticipantDetails={null}
                      Menu={null}
                    />
                  )
                ) : (
                  remoteParticipant ? (
                    <ParticipantView
                      participant={remoteParticipant}
                      ParticipantDetails={null}
                      Menu={null}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-block mb-8">
                          <div className="absolute -inset-8 rounded-full bg-primary/20 blur-2xl animate-pulse" />
                          <PageLoader />
                        </div>
                        <p className="text-white font-black text-xs sm:text-sm tracking-[0.5em] uppercase opacity-40">
                          Waiting for participant ({60 - waitingTime}s)
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* PIP Window */}
              {localParticipant && remoteParticipant && (
                <div
                  onClick={() => setIsSwapped(!isSwapped)}
                  className={`absolute top-28 right-4 sm:top-36 sm:right-8 lg:top-32 lg:right-12 w-28 h-40 sm:w-48 sm:h-72 lg:w-64 lg:h-[380px] xl:w-72 xl:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-30 active:scale-95 transition-all duration-300 cursor-pointer bg-black group ring-1 ring-white/10 hover:ring-primary/40 hover:border-primary/30 ${showControls ? '' : 'opacity-60 hover:opacity-100'}`}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors z-10" />
                  {/* Swap indicator */}
                  <div className="absolute top-2 left-2 z-20 bg-black/50 backdrop-blur-sm rounded-full px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[9px] text-white/80 font-bold">Tap to swap</span>
                  </div>
                  {isSwapped ? (
                    <ParticipantView participant={remoteParticipant} ParticipantDetails={null} Menu={null} />
                  ) : (
                    <ParticipantView participant={localParticipant} ParticipantDetails={null} Menu={null} />
                  )}
                </div>
              )}

              {/* Camera/Mic status badges on video */}
              {remoteParticipant && (
                <div className={`absolute bottom-32 sm:bottom-36 left-4 sm:left-6 z-30 flex items-center gap-2 transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                  {micMuted && (
                    <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <MicOff className="size-4 text-white" />
                    </div>
                  )}
                  {cameraMuted && !isAudioCall && (
                    <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-2 shadow-lg">
                      <VideoOff className="size-4 text-white" />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className={`p-4 pb-10 sm:pb-10 lg:pb-14 flex justify-center z-50 transition-all duration-500 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          <div className="floating-controls px-5 py-3.5 sm:px-10 sm:py-4.5 lg:px-14 lg:py-5 gap-4 sm:gap-7 lg:gap-10 backdrop-blur-2xl">
            {/* Screen Share (desktop only) */}
            <button
              onClick={handleToggleScreenShare}
              className={`control-btn hidden sm:flex ${isSharingScreen ? 'bg-primary text-white shadow-[0_0_20px_rgba(37,211,102,0.4)]' : 'control-btn-active'}`}
              title="Screen Share"
            >
              <Monitor className="size-5 sm:size-6 lg:size-7" />
            </button>

            {/* Mic Toggle */}
            <button
              onClick={() => call.microphone.toggle()}
              className={`control-btn ${micMuted ? 'bg-white text-black' : 'control-btn-active'}`}
              title={`${micMuted ? "Unmute" : "Mute"} (M)`}
            >
              {micMuted ? <MicOff className="size-5 sm:size-6 lg:size-7" /> : <Mic className="size-5 sm:size-6 lg:size-7" />}
            </button>

            {/* Video Toggle */}
            {!isAudioCall && (
              <>
                <button
                  onClick={() => call.camera.toggle()}
                  className={`control-btn ${cameraMuted ? 'bg-white text-black' : 'control-btn-active'}`}
                  title={`${cameraMuted ? "Camera On" : "Camera Off"} (V)`}
                >
                  {cameraMuted ? <VideoOff className="size-5 sm:size-6 lg:size-7" /> : <Video className="size-5 sm:size-6 lg:size-7" />}
                </button>
                <button
                  onClick={() => call.camera.flip()}
                  className="control-btn control-btn-active sm:hidden"
                  title="Flip Camera"
                >
                  <RefreshCw className="size-5" />
                </button>
              </>
            )}

            {/* Record */}
            <button
              onClick={handleToggleRecording}
              className={`control-btn hidden sm:flex ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)]' : 'control-btn-active shadow-lg shadow-red-500/10'}`}
              title="Record Call"
            >
              {isRecording ? <StopCircle className="size-5 sm:size-6 lg:size-7" /> : <Circle className="size-5 sm:size-6 lg:size-7" />}
            </button>

            {/* End Call */}
            <button
              onClick={handleEndCall}
              className="control-btn control-btn-danger"
              title="End Call (Esc)"
            >
              <PhoneOff className="size-7 sm:size-9 lg:size-10 fill-current" />
            </button>
          </div>
        </div>

      </div>
    </StreamTheme>
  );
};

const WhatsAppRingingScreen = ({ isAudioCall }) => {
  const navigate = useNavigate();
  const call = useCall();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();
  const otherMember = members?.find((m) => !m.isLocalParticipant);
  const callee = otherMember?.user;
  const [ringTime, setRingTime] = useState(0);

  // Auto-cancel if ringing for 45 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRingTime(prev => {
        if (prev >= 44) {
          toast("No answer. Call ended.", { icon: "📞" });
          call?.endCall().catch(() => call?.leave().catch(() => { }));
          navigate("/");
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [call, navigate]);

  const handleCancel = async () => {
    try {
      await call?.endCall();
    } catch (e) {
      try { await call?.leave(); } catch (e2) { }
    }
    navigate("/");
  };

  return (
    <div className="h-dvh whatsapp-call-bg flex flex-col items-center justify-between py-14 sm:py-20 lg:py-24 px-6 overflow-hidden">
      <div className="text-center z-10 w-full">
        <div className="flex items-center justify-center gap-2 opacity-50 mb-3">
          <Lock className="size-3.5 text-white" />
          <span className="text-[11px] text-white uppercase font-black tracking-[0.2em] text-shadow">End-to-End Encrypted</span>
        </div>
        <p className="text-white/70 text-sm sm:text-base font-medium uppercase tracking-[0.3em] mb-4">
          {isAudioCall ? "Voice Call" : "Video Call"}
        </p>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mt-4 tracking-tight drop-shadow-2xl">
          {callee?.name || "Connecting..."}
        </h2>
        <div className="mt-5 flex items-center justify-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
            <div className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <span className="text-primary/80 font-bold tracking-[0.3em] text-sm uppercase">Ringing</span>
        </div>
      </div>

      <div className="call-avatar-container relative z-10">
        <div className="absolute -inset-24 rounded-full bg-primary/20 blur-[100px] animate-pulse" />
        {/* Ringing pulse rings */}
        <div className="absolute -inset-4 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute -inset-8 rounded-full border border-primary/15 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="size-52 sm:size-72 lg:size-80 rounded-full overflow-hidden border-8 border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] relative">
          <img
            src={callee?.image || "/avatar.png"}
            alt="callee"
            className="w-full h-full object-cover scale-110"
          />
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-6">
        <button
          onClick={handleCancel}
          className="control-btn control-btn-danger size-18 sm:size-22 lg:size-24 shadow-[0_20px_50px_rgba(239,68,68,0.5)] active:scale-90 transition-all hover:bg-red-600 group"
        >
          <PhoneOff className="size-9 sm:size-11 fill-current group-hover:scale-110 transition-transform" />
        </button>
        <span className="text-[10px] sm:text-xs text-white/40 font-black uppercase tracking-[0.4em]">Cancel Call</span>
      </div>
    </div>
  );
};

export default CallPage;