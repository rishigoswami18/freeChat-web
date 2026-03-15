import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
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

// === PERFORMANCE OPTIMIZATION: Global Static Audio Resources ===
// Preload audio instances outside of the component to prevent memory leaks and garbage collection thrashing
const ringbackTone = new Audio("https://assets.mixkit.co/active_storage/sfx/1360/1360-preview.mp3");
ringbackTone.loop = true;
const endCallTone = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
const errorTone = new Audio("https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3");

// Pure Audio Management Helpers
const safePlayAudio = (audioObj) => {
  audioObj.currentTime = 0;
  audioObj.play().catch(() => {}); // Catch autoplay rejections gracefully
};

const safeStopAudio = (audioObj) => {
  audioObj.pause();
  audioObj.currentTime = 0;
};

// Pure utility function for formatting call duration
const formatTime = (secs) => {
  const totalSecs = Math.floor(secs);
  if (isNaN(totalSecs)) return "00:00";
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

const CallPage = () => {
  const { id: callId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const videoClient = useVideoClient();
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const joiningRef = useRef(false); // Ref prevents race condition on double join

  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const isAudioCall = queryParams.get("type") === "audio";

  useEffect(() => {
    let isMounted = true;
    let wakeLock = null;
    let timeoutId = null;

    const initCall = async () => {
      if (!videoClient || !callId) {
        console.log("⏳ [CallPage] Waiting for video engine context...");
        return;
      }

      if (joiningRef.current) return;
      joiningRef.current = true;

      console.log("🔌 [CallPage] Initializing WebRTC session:", callId);
      setIsConnecting(true);

      // Security timeout: If call doesn't connect in 15s, bail out
      timeoutId = setTimeout(() => {
          if (isMounted && !call) {
              console.warn("⏱️ [CallPage] Connection timed out.");
              toast.error("Connection timed out. Please try again.");
              navigate("/");
          }
      }, 15000);

      try {
        const callInstance = videoClient.call("default", callId);
        
        console.log("📡 [CallPage] Syncing call state...");
        await callInstance.getOrCreate().catch(err => {
            console.warn("Retrying call sync...", err.message);
            return callInstance.getOrCreate(); // One retry
        });

        const state = callInstance.state.callingState;
        console.log("📊 [CallPage] Calling State:", state);

        if (state === CallingState.RINGING) {
           console.log("🔔 [CallPage] Accepting incoming call...");
           if (window.AndroidBridge?.vibrate) window.AndroidBridge.vibrate(50);
           await callInstance.accept();
        } else {
           console.log("📤 [CallPage] Joining outgoing call...");
           if (callInstance.state.remoteParticipants.length === 0) {
              safePlayAudio(ringbackTone);
           }
        }

        await callInstance.join({ create: true });

        if (isAudioCall) {
          await callInstance.camera.disable().catch(() => {});
        }

        if (isMounted) {
          setCall(callInstance);
          setIsConnecting(false);
          clearTimeout(timeoutId);
          console.log("✅ [CallPage] Call linked successfully.");
        }
      } catch (error) {
        console.error("❌ [CallPage] Fatal Join Error:", error);
        if (isMounted) {
          toast.error("Call unavailable or expired.");
          setIsConnecting(false);
          navigate("/");
        }
      } finally {
        if (isMounted) joiningRef.current = false;
        clearTimeout(timeoutId);
      }
    };

    initCall();

    if ("wakeLock" in navigator && !isAudioCall) {
      navigator.wakeLock.request("screen").then(wl => wakeLock = wl).catch(() => {});
    }

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      safeStopAudio(ringbackTone);
      if (wakeLock) wakeLock.release().catch(() => {});
      // Note: we don't call leave() here as it might be handled by the End Call button 
      // or we want the user to be able to stay in the call if they just navigate briefly.
      // But usually, CallPage unmount = call end in this UX.
      // However, Stream Video hooks handle some of this.
    };
  }, [videoClient, callId, navigate, isAudioCall]);

  if (isConnecting || !call) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black">
            <PageLoader />
            <div className="text-white/50 text-[10px] mt-4 font-mono animate-pulse">
                Establishing Secure Tunnel...
            </div>
        </div>
    );
  }

  return (
    <StreamCall call={call}>
      <CallUI isAudioCall={isAudioCall} />
    </StreamCall>
  );
};

// ==============================
// MAIN CALL UI (WhatsApp-style)
// Deeply optimized to prevent micro-stutters during rapid WebRTC state changes
// ==============================
const CallUI = memo(({ isAudioCall }) => {
  const call = useCall();
  
  // Stream Hooks
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

  // Timer & State Refs
  const controlsTimerRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const waitTimerRef = useRef(null);

  const [callDuration, setCallDuration] = useState(0);
  const [waitingTime, setWaitingTime] = useState(0);

  // --- Call Control visibility timeouts ---
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

  // --- Call Duration Engine ---
  useEffect(() => {
    if (callingState === CallingState.JOINED) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setCallDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callingState]);

  // --- Call Lifecycle Handlers ---
  const handleEndCall = useCallback(async () => {
    try {
      await call?.endCall();
    } catch {
      try { await call?.leave(); } catch {}
    }
    navigate("/");
  }, [call, navigate]);

  // Handle waiting limits: End the call automatically if abandoned for 60s
  useEffect(() => {
    if (callingState === CallingState.JOINED && remoteParticipants.length === 0) {
      waitTimerRef.current = setInterval(() => {
        setWaitingTime((prev) => {
          if (prev >= 59) {
            toast("No one joined. Call ended.", { icon: "📞" });
            handleEndCall();
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
  }, [callingState, remoteParticipants.length, handleEndCall]);

  // Handle auto-finish on remote disconnect
  const prevRemoteRef = useRef(remoteParticipants.length);
  useEffect(() => {
    if (remoteParticipants.length > 0) {
      safeStopAudio(ringbackTone);
    }

    if (prevRemoteRef.current > 0 && remoteParticipants.length === 0 && callingState === CallingState.JOINED) {
      toast("Call ended.", { icon: "📞" });
      handleEndCall();
    }
    prevRemoteRef.current = remoteParticipants.length;
  }, [remoteParticipants.length, callingState, handleEndCall]);

  // --- Network Event Listeners ---
  useEffect(() => {
    if (!call) return;

    const onEnded = () => {
      safePlayAudio(endCallTone);
      const summary = formatTime((Date.now() - startTimeRef.current) / 1000);
      toast(`Call ended • ${summary}`, { icon: "📞" });
      if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
        window.AndroidBridge.vibrate(100);
      }
      navigate("/");
    };

    const onRejected = () => {
      safePlayAudio(errorTone);
      toast.error(`Call declined`);
      if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
        window.AndroidBridge.vibrate(200);
      }
      setTimeout(() => navigate("/"), 1500);
    };

    call.on('call.ended', onEnded);
    call.on('call.rejected', onRejected);

    return () => {
      call.off('call.ended', onEnded);
      call.off('call.rejected', onRejected);
    };
  }, [call, navigate]);

  // --- User Operation Callbacks ---
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  const toggleMic = useCallback(() => {
    if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
      window.AndroidBridge.vibrate(20);
    }
    call?.microphone.toggle();
  }, [call]);

  const toggleCamera = useCallback(() => {
    if (window.AndroidBridge && typeof window.AndroidBridge.vibrate === 'function') {
      window.AndroidBridge.vibrate(20);
    }
    call?.camera.toggle();
  }, [call]);

  const flipCamera = useCallback(() => call?.camera.flip(), [call]);

  const toggleScreenShare = useCallback(async () => {
    try {
      if (isSharingScreen) {
        await call?.screenShare.disable();
        toast.success("Screen sharing stopped");
      } else {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          toast.error("Screen sharing not supported.");
          return;
        }
        await call?.screenShare.enable({ audio: true });
        toast.success("Screen share active");
      }
    } catch (e) {
      if (e.name === "NotAllowedError") toast.error("Permission denied");
      else toast.error("Screen share failed");
    }
  }, [call, isSharingScreen]);

  const toggleRecording = useCallback(async () => {
    try {
      if (isRecording) {
        await call?.stopRecording();
        toast.success("Recording saved");
      } else {
        await call?.startRecording();
        toast.success("Recording started");
      }
    } catch {
      toast.error("Action unavailable");
    }
  }, [call, isRecording]);

  const toggleLayoutSwap = useCallback(() => setIsSwapped((s) => !s), []);

  // --- Keyboard Shortcuts Listeners ---
  useEffect(() => {
    const onKey = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      switch (e.key.toLowerCase()) {
        case "m": toggleMic(); break;
        case "v": if (!isAudioCall) toggleCamera(); break;
        case "escape": handleEndCall(); break;
        case "f": toggleFullscreen(); break;
        default: break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAudioCall, handleEndCall, toggleMic, toggleCamera, toggleFullscreen]);

  // Navigation Guard
  useEffect(() => {
    if (callingState === CallingState.LEFT) navigate("/");
  }, [callingState, navigate]);

  if (callingState === CallingState.LEFT) return null;

  if (callingState === CallingState.RINGING || callingState === CallingState.JOINING) {
    return <OutgoingRingingScreen isAudioCall={isAudioCall} />;
  }

  // ==============================
  // RENDER UI
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

        {/* === TOP BAR === */}
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
              <button onClick={toggleScreenShare} className="ml-1 bg-white/20 hover:bg-white/30 rounded-full px-2 py-0.5 text-[10px] transition-colors">Stop</button>
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
                  onClick={toggleLayoutSwap}
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

        {/* === BOTTOM CONTROLS === */}
        <div className={`safe-area-bottom z-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-500 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="flex items-center justify-center gap-5 sm:gap-7 lg:gap-9 px-4 py-5 sm:py-6">
            
            <button onClick={toggleScreenShare} className={`hidden sm:flex call-ctrl-btn ${isSharingScreen ? 'bg-[#25D366] text-white' : ''}`} title="Screen Share">
              <Monitor className="size-5 lg:size-6" />
            </button>

            <button onClick={toggleMic} className={`call-ctrl-btn ${micMuted ? 'bg-white text-black' : ''}`} title="Mute (M)">
              {micMuted ? <MicOff className="size-5 lg:size-6" /> : <Mic className="size-5 lg:size-6" />}
            </button>

            <button onClick={handleEndCall} className="size-16 sm:size-[68px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_8px_25px_rgba(255,59,48,0.4)] active:scale-90 transition-all hover:bg-[#ff453a]" title="End Call (Esc)">
              <PhoneOff className="size-7 sm:size-8 text-white fill-current" />
            </button>

            {!isAudioCall && (
              <>
                <button onClick={toggleCamera} className={`call-ctrl-btn ${cameraMuted ? 'bg-white text-black' : ''}`} title="Camera (V)">
                  {cameraMuted ? <VideoOff className="size-5 lg:size-6" /> : <Video className="size-5 lg:size-6" />}
                </button>
                <button onClick={flipCamera} className="call-ctrl-btn sm:hidden" title="Flip">
                  <RefreshCw className="size-5" />
                </button>
              </>
            )}

            <button onClick={toggleRecording} className={`hidden sm:flex call-ctrl-btn ${isRecording ? 'bg-red-500 text-white animate-pulse' : ''}`} title="Record">
              {isRecording ? <StopCircle className="size-5 lg:size-6" /> : <Circle className="size-5 lg:size-6" />}
            </button>
          </div>
        </div>
      </div>
    </StreamTheme>
  );
});

CallUI.displayName = "CallUI";

// ==============================
// OUTGOING RINGING SCREEN
// ==============================
const OutgoingRingingScreen = memo(({ isAudioCall }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const call = useCall();
  const { useCallMembers } = useCallStateHooks();
  const members = useCallMembers();
  
  // Explicitly mapping callee state safely
  const callee = useMemo(() => {
    return members?.find((m) => !m.isLocalParticipant)?.user || location.state?.callee || { name: "Connecting..." };
  }, [members, location.state?.callee]);

  // Handle ring timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setRingTime(prev => {
        if (prev >= 44) {
          toast("No answer.", { icon: "📞" });
          call?.endCall().catch(() => call?.leave().catch(() => {}));
          safeStopAudio(ringbackTone);
          navigate("/");
          return prev;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [call, navigate]);

  const [ringTime, setRingTime] = useState(0);

  const handleCancel = useCallback(async () => {
    try { await call?.endCall(); } catch { try { await call?.leave(); } catch {} }
    safeStopAudio(ringbackTone);
    navigate("/");
  }, [call, navigate]);

  return (
    <div className="h-dvh bg-[#080808] flex flex-col items-center justify-between py-14 sm:py-20 px-6 overflow-hidden safe-area-bottom safe-area-top relative">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] size-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] size-[80%] bg-pink-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="text-center z-10 w-full hover:scale-105 transition-transform duration-700">
        <div className="flex items-center justify-center gap-2 opacity-50 mb-3">
          <Lock className="size-3 text-white" />
          <span className="text-[10px] text-white uppercase font-bold tracking-[0.2em]">Encrypted</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1 mb-4 shadow-xl">
          {isAudioCall ? <Phone className="size-3.5 text-white" /> : <Video className="size-3.5 text-white" />}
          <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">{isAudioCall ? "Voice Call" : "Video Call"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight drop-shadow-lg max-w-[90vw] truncate">
          {callee.name}
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

      <div className="relative z-10">
        <div className="absolute -inset-16 rounded-full bg-white/5 blur-3xl animate-pulse" />
        <div className="absolute -inset-4 rounded-full border-2 border-white/15 animate-ping shadow-[0_0_50px_rgba(255,255,255,0.1)]" style={{ animationDuration: '1.5s' }} />
        <div className="absolute -inset-8 rounded-full border border-white/10 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="size-48 sm:size-64 lg:size-72 rounded-full overflow-hidden border-4 border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative">
          <img src={callee.image || "/avatar.png"} alt="callee" className="w-full h-full object-cover" />
        </div>
      </div>

      <div className="z-10 flex flex-col items-center gap-4">
        <button onClick={handleCancel}
          className="size-16 sm:size-[72px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_12px_30px_rgba(255,59,48,0.4)] active:scale-90 transition-all hover:bg-[#ff453a]">
          <PhoneOff className="size-8 sm:size-9 text-white fill-current" />
        </button>
        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Cancel</span>
      </div>
    </div>
  );
});

OutgoingRingingScreen.displayName = "OutgoingRingingScreen";

export default CallPage;