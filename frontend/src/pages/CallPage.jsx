import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { useVideoClient } from "../components/VideoProvider";
import {
  PhoneOff, Mic, MicOff, Video, VideoOff, RefreshCw, Lock,
  Monitor, StopCircle, Circle, Maximize2, Minimize2, Wifi, WifiOff, Phone
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

const ringbackTone = new Audio("https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3");
ringbackTone.loop = true;
const endCallTone = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
const errorTone = new Audio("https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3");

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

        // Fetch call state from server
        await callInstance.getOrCreate();
        const state = callInstance.state.callingState;
        console.log("📞 Call state:", state);

        // INCOMING CALL: accept first, then join
        if (state === CallingState.RINGING) {
          console.log("📞 Accepting ringing call...");
          if (window.AndroidBridge) window.AndroidBridge.vibrate(50);
          await callInstance.accept();
        } else if (state !== CallingState.JOINED) {
          // OUTGOING CALL or JOINING (not yet connected): play ringback
          // Only play if there are no remote participants yet
          if (callInstance.state.remoteParticipants.length === 0) {
            console.log("📞 Outgoing call - playing ringback...");
            ringbackTone.play().catch(() => { });
          }
        }

        // Join the call
        await callInstance.join({ create: !state });

        if (isAudioCall) {
          await callInstance.camera.disable();
        }

        callRef.current = callInstance;
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Call no longer available or invalid.");
        ringbackTone.pause();
        joiningRef.current = false;
        setIsConnecting(false);
        navigate("/"); // Professional redirect
        return;
      }
      joiningRef.current = false;
      setIsConnecting(false);
    };

    joinCall();

    // Keep screen awake
    let wakeLock = null;
    if ("wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then(wl => {
        wakeLock = wl;
      }).catch(() => { });
    }

    return () => {
      ringbackTone.pause();
      ringbackTone.currentTime = 0;
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
      <CallUI isAudioCall={isAudioCall} />
    </StreamCall>
  );
};

// ==============================
// MAIN CALL UI (WhatsApp-style)
// ==============================
const CallUI = ({ isAudioCall }) => {
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
  const remoteParticipant = remoteParticipants[0];
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
  const startTimeRef = useRef(null);

  // Waiting timeout
  const [waitingTime, setWaitingTime] = useState(0);
  const waitTimerRef = useRef(null);

  // --- Timer ---
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callingState]);

  // --- Auto-leave if alone 60s ---
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

  // --- Auto-end when remote leaves (1-on-1) ---
  const prevRemoteRef = useRef(remoteParticipants.length);
  useEffect(() => {
    if (remoteParticipants.length > 0) {
      ringbackTone.pause();
      ringbackTone.currentTime = 0;
    }

    if (prevRemoteRef.current > 0 && remoteParticipants.length === 0 && callingState === CallingState.JOINED) {
      toast("Call ended.", { icon: "📞" });
      call?.leave().catch(() => { });
      navigate("/");
    }
    prevRemoteRef.current = remoteParticipants.length;
  }, [remoteParticipants.length, callingState, call, navigate]);

  // --- Listen for call events ---
  useEffect(() => {
    if (!call) return;

    const onEnded = () => {
      endCallTone.play().catch(() => { });
      const summary = formatTime(timerRef.current ? (Date.now() - startTimeRef.current) / 1000 : callDuration);
      toast(`Call ended • ${summary}`, { icon: "📞" });
      if (window.AndroidBridge) window.AndroidBridge.vibrate(100);
      navigate("/");
    };

    const onRejected = (event) => {
      errorTone.play().catch(() => { });
      toast.error(`Call declined by ${remoteParticipant?.name || 'user'}`);
      if (window.AndroidBridge) window.AndroidBridge.vibrate(200);
      setTimeout(() => navigate("/"), 1500);
    };

    call.on('call.ended', onEnded);
    call.on('call.rejected', onRejected);

    return () => {
      call.off('call.ended', onEnded);
      call.off('call.rejected', onRejected);
    };
  }, [call, navigate, remoteParticipant]);

  // --- Auto-hide controls (video only) ---
  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => {
      if (!isAudioCall) setShowControls(false);
    }, 4000);
  }, [isAudioCall]);

  useEffect(() => {
    if (!isAudioCall) resetControlsTimeout();
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [isAudioCall, resetControlsTimeout]);

  const formatTime = (secs) => {
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
      await call?.endCall();
    } catch {
      try { await call?.leave(); } catch { }
    }
    navigate("/");
  }, [call, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key.toLowerCase()) {
        case "m": call?.microphone.toggle(); break;
        case "v": if (!isAudioCall) call?.camera.toggle(); break;
        case "escape": handleEndCall(); break;
        case "f": toggleFullscreen(); break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [call, isAudioCall, handleEndCall]);

  useEffect(() => {
    if (callingState === CallingState.LEFT) navigate("/");
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  if (callingState === CallingState.RINGING || callingState === CallingState.JOINING) {
    return <OutgoingRingingScreen isAudioCall={isAudioCall} />;
  }

  const handleToggleScreenShare = async () => {
    try {
      if (isSharingScreen) {
        await call.screenShare.disable();
        toast.success("Screen sharing stopped");
      } else {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          toast.error("Screen sharing not supported on this device.");
          return;
        }
        await call.screenShare.enable({ audio: true });
        toast.success("Screen sharing started");
      }
    } catch (e) {
      if (e.name === "NotAllowedError") {
        toast.error("Screen share permission denied.");
      } else {
        toast.error("Screen share failed.");
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
    } catch {
      toast.error("Recording not available.");
    }
  };

  // ==============================
  // RENDER
  // ==============================
  return (
    <StreamTheme className="call-page-theme">
      <div
        className="h-dvh w-screen flex flex-col relative overflow-hidden cursor-default select-none bg-black"
        onMouseMove={resetControlsTimeout}
        onClick={resetControlsTimeout}
      >
        {/* Animated Background Layer */}
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 -left-20 size-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 -right-20 size-[500px] bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>


        {/* === TOP BAR (WhatsApp green gradient) === */}
        <div className={`absolute top-0 inset-x-0 p-4 sm:p-6 lg:p-8 flex items-center justify-between z-40 bg-gradient-to-b from-black/70 via-black/30 to-transparent transition-all duration-500 safe-area-top ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 opacity-50 mb-0.5">
              <Lock className="size-2.5 text-white" />
              <span className="text-[9px] text-white uppercase tracking-widest font-bold">Encrypted</span>
            </div>
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-md">
              {remoteParticipant?.name || "Connecting..."}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-white/60 font-mono">{formatTime(callDuration)}</span>
              {remoteParticipant ? (
                <span className="flex items-center gap-1">
                  <Wifi className="size-3 text-[#25D366]" />
                  <span className="text-[9px] text-[#25D366]/80 font-bold">Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <WifiOff className="size-3 text-yellow-400 animate-pulse" />
                  <span className="text-[9px] text-yellow-400/80 font-bold">Waiting ({60 - waitingTime}s)</span>
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isRecording && (
              <div className="bg-red-500/20 text-red-500 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 animate-pulse">
                <div className="size-1.5 rounded-full bg-red-500" />
                REC
              </div>
            )}
            <button
              onClick={toggleFullscreen}
              className="hidden lg:flex size-9 rounded-full bg-white/10 backdrop-blur-md items-center justify-center border border-white/10 hover:bg-white/20 transition-all active:scale-90"
            >
              {isFullscreen ? <Minimize2 className="size-4 text-white" /> : <Maximize2 className="size-4 text-white" />}
            </button>
          </div>
        </div>

        {/* === RECONNECTING OVERLAY === */}
        {callingState === CallingState.RECONNECTING && (
          <div className="absolute inset-0 z-[60] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="size-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin mb-4" />
            <h4 className="text-white font-black uppercase tracking-widest text-sm">Poor Connection</h4>
            <p className="text-white/40 text-[10px] mt-1 font-bold uppercase">Reconnecting your love line...</p>
          </div>
        )}

        {/* === SCREEN SHARE BANNER === */}
        {isSharingScreen && (
          <div className="absolute top-16 sm:top-20 inset-x-0 z-40 flex justify-center">
            <div className="bg-[#25D366]/90 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <Monitor className="size-3.5" />
              Sharing your screen
              <button onClick={handleToggleScreenShare} className="ml-1 bg-white/20 hover:bg-white/30 rounded-full px-2 py-0.5 text-[10px] transition-colors">Stop</button>
            </div>
          </div>
        )}

        {/* === CENTER: VIDEO / AUDIO === */}
        <div className="flex-1 relative bg-[#0a0a0a]">
          {isAudioCall ? (
            /* --- AUDIO CALL VIEW --- */
            <div className="h-full w-full flex items-center justify-center px-6">
              {/* Bars visualizer */}
              <div className="absolute inset-x-0 bottom-40 flex items-center justify-center opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                <div className="flex items-end gap-1.5 h-32">
                  {[...Array(32)].map((_, i) => (
                    <div key={i} className="w-1 bg-gradient-to-t from-primary to-pink-500 rounded-full"
                      style={{
                        height: `${Math.random() * 80 + 20}%`,
                        animation: `audioBar ${0.4 + Math.random() * 0.8}s ease-in-out infinite alternate`,
                        animationDelay: `${i * 0.03}s`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-6 z-10">
                <div className="relative">
                  <div className="absolute -inset-12 rounded-full bg-[#25D366]/8 blur-3xl animate-pulse" />
                  {!micMuted && remoteParticipant && (
                    <>
                      <div className="absolute -inset-4 rounded-full border-2 border-[#25D366]/20 animate-ping" style={{ animationDuration: '2s' }} />
                      <div className="absolute -inset-8 rounded-full border border-[#25D366]/10 animate-ping" style={{ animationDuration: '3s' }} />
                    </>
                  )}
                  <div className="size-44 sm:size-56 lg:size-64 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] relative z-10 p-1 bg-gradient-to-br from-white/20 to-transparent">
                    <img src={remoteParticipant?.image || "/avatar.png"} alt="avatar" className="w-full h-full object-cover rounded-full" />
                  </div>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{remoteParticipant?.name || "Waiting..."}</h2>
                  <p className="text-[#25D366]/70 font-mono text-lg tracking-wider font-semibold">{formatTime(callDuration)}</p>
                  {micMuted && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-red-400/70">
                      <MicOff className="size-3" />
                      <span className="text-[10px] font-bold uppercase">Muted</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* --- VIDEO CALL VIEW --- */
            <div className="h-full w-full relative">
              {/* Main view */}
              <div className="h-full w-full">
                {isSwapped ? (
                  localParticipant && <ParticipantView participant={localParticipant} ParticipantDetails={null} Menu={null} />
                ) : (
                  remoteParticipant ? (
                    <ParticipantView participant={remoteParticipant} ParticipantDetails={null} Menu={null} />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="relative inline-block mb-6">
                          <div className="absolute -inset-6 rounded-full bg-[#25D366]/15 blur-2xl animate-pulse" />
                          <PageLoader />
                        </div>
                        <p className="text-white/40 font-bold text-xs tracking-[0.3em] uppercase">Waiting ({60 - waitingTime}s)</p>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* PIP window */}
              {localParticipant && remoteParticipant && (
                <div
                  onClick={() => setIsSwapped(!isSwapped)}
                  className={`absolute top-20 right-3 sm:top-28 sm:right-6 lg:top-24 lg:right-10 w-24 h-36 sm:w-40 sm:h-60 lg:w-56 lg:h-[330px] rounded-2xl overflow-hidden border-2 border-white/15 shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-30 active:scale-95 transition-all cursor-pointer bg-black group hover:border-[#25D366]/30 ${showControls ? '' : 'opacity-50 hover:opacity-100'}`}
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
                  {isSwapped ? (
                    <ParticipantView participant={remoteParticipant} ParticipantDetails={null} Menu={null} />
                  ) : (
                    <ParticipantView participant={localParticipant} ParticipantDetails={null} Menu={null} />
                  )}
                </div>
              )}

              {/* Status badges */}
              {remoteParticipant && (
                <div className={`absolute bottom-28 left-3 z-30 flex gap-1.5 transition-opacity ${showControls ? '' : 'opacity-0'}`}>
                  {micMuted && (
                    <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-1.5"><MicOff className="size-3.5 text-white" /></div>
                  )}
                  {cameraMuted && (
                    <div className="bg-red-500/80 backdrop-blur-sm rounded-full p-1.5"><VideoOff className="size-3.5 text-white" /></div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* === BOTTOM CONTROLS (WhatsApp-style) === */}
        <div className={`safe-area-bottom bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-center gap-5 sm:gap-7 lg:gap-9 px-4 py-5 sm:py-6">

            {/* Screen share (desktop) */}
            <button onClick={handleToggleScreenShare}
              className={`hidden sm:flex call-ctrl-btn ${isSharingScreen ? 'bg-[#25D366] text-white' : ''}`} title="Screen Share">
              <Monitor className="size-5 lg:size-6" />
            </button>

            {/* Mic */}
            <button onClick={() => {
              if (window.AndroidBridge) window.AndroidBridge.vibrate(20);
              call.microphone.toggle();
            }}
              className={`call-ctrl-btn ${micMuted ? 'bg-white text-black' : ''}`} title="Mute (M)">
              {micMuted ? <MicOff className="size-5 lg:size-6" /> : <Mic className="size-5 lg:size-6" />}
            </button>

            {/* End Call - Big red WhatsApp button */}
            <button onClick={() => {
              if (window.AndroidBridge) window.AndroidBridge.vibrate(150);
              handleEndCall();
            }}
              className="size-16 sm:size-[68px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_8px_25px_rgba(255,59,48,0.4)] active:scale-90 transition-all hover:bg-[#ff453a]"
              title="End Call (Esc)">
              <PhoneOff className="size-7 sm:size-8 text-white fill-current" />
            </button>

            {/* Camera */}
            {!isAudioCall && (
              <>
                <button onClick={() => {
                  if (window.AndroidBridge) window.AndroidBridge.vibrate(20);
                  call.camera.toggle();
                }}
                  className={`call-ctrl-btn ${cameraMuted ? 'bg-white text-black' : ''}`} title="Camera (V)">
                  {cameraMuted ? <VideoOff className="size-5 lg:size-6" /> : <Video className="size-5 lg:size-6" />}
                </button>
                <button onClick={() => call.camera.flip()}
                  className="call-ctrl-btn sm:hidden" title="Flip">
                  <RefreshCw className="size-5" />
                </button>
              </>
            )}

            {/* Record (desktop) */}
            <button onClick={handleToggleRecording}
              className={`hidden sm:flex call-ctrl-btn ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`} title="Record">
              {isRecording ? <StopCircle className="size-5 lg:size-6" /> : <Circle className="size-5 lg:size-6" />}
            </button>

          </div>
        </div>

      </div>
    </StreamTheme>
  );
};

// ==============================
// OUTGOING RINGING SCREEN
// ==============================
const OutgoingRingingScreen = ({ isAudioCall }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const call = useCall();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();
  const otherMember = members?.find((m) => !m.isLocalParticipant);
  const callee = otherMember?.user || location.state?.callee;
  const [ringTime, setRingTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRingTime(prev => {
        if (prev >= 44) {
          toast("No answer.", { icon: "📞" });
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
    try { await call?.endCall(); } catch { try { await call?.leave(); } catch { } }
    navigate("/");
  };

  return (
    <div className="h-dvh bg-[#080808] flex flex-col items-center justify-between py-14 sm:py-20 px-6 overflow-hidden safe-area-bottom safe-area-top relative">
      {/* Premium Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] size-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] size-[80%] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>


      {/* Top info */}
      <div className="text-center z-10 w-full">
        <div className="flex items-center justify-center gap-2 opacity-50 mb-3">
          <Lock className="size-3 text-white" />
          <span className="text-[10px] text-white uppercase font-bold tracking-[0.2em]">Encrypted</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4">
          {isAudioCall ? <Phone className="size-3.5 text-white" /> : <Video className="size-3.5 text-white" />}
          <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{isAudioCall ? "Voice Call" : "Video Call"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg">
          {callee?.name || "Connecting..."}
        </h2>
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="flex gap-1.5">
            <div className="size-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0s' }} />
            <div className="size-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
            <div className="size-1.5 rounded-full bg-white/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
          </div>
          <span className="text-white/60 text-sm font-medium">Ringing</span>
        </div>
      </div>

      {/* Avatar */}
      <div className="relative z-10">
        <div className="absolute -inset-16 rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute -inset-4 rounded-full border-2 border-white/15 animate-ping" style={{ animationDuration: '1.5s' }} />
        <div className="absolute -inset-8 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="size-48 sm:size-64 lg:size-72 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
          <img src={callee?.image || "/avatar.png"} alt="callee" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Cancel button */}
      <div className="z-10 flex flex-col items-center gap-4">
        <button onClick={handleCancel}
          className="size-16 sm:size-[72px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_12px_30px_rgba(255,59,48,0.4)] active:scale-90 transition-all hover:bg-[#ff453a]">
          <PhoneOff className="size-8 sm:size-9 text-white fill-current" />
        </button>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Cancel</span>
      </div>
    </div>
  );
};

export default CallPage;