/**
 * AIFaceCallPage — Pure Face-to-Face AI Video Call
 * 
 * NO transcript. NO text input. Pure voice-to-voice video calling.
 * Realistic talking head animation with micro-movements.
 */
import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Volume2, VolumeX } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const formatDuration = (s) => {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

// ═══════════════════════════════════════════
//  REALISTIC TALKING HEAD — Full Screen
// ═══════════════════════════════════════════
const RealisticTalkingHead = memo(({ isSpeaking, isThinking, idleImg, talkImg, name }) => {
  const [talkFrame, setTalkFrame] = useState(false);
  const [headX, setHeadX] = useState(0);
  const [headY, setHeadY] = useState(0);
  const [headRotate, setHeadRotate] = useState(0);

  // Lip-sync: rapid alternation between idle & talk images
  useEffect(() => {
    if (!isSpeaking) { setTalkFrame(false); return; }
    let f = 0;
    const iv = setInterval(() => {
      f++;
      // Natural speech pattern: talk-talk-idle repeating rhythm
      setTalkFrame(f % 4 !== 0);
    }, 150);
    return () => clearInterval(iv);
  }, [isSpeaking]);

  // Micro head movement when speaking (subtle, natural)
  useEffect(() => {
    if (!isSpeaking) {
      setHeadX(0); setHeadY(0); setHeadRotate(0);
      return;
    }
    const iv = setInterval(() => {
      setHeadX((Math.random() - 0.5) * 3);     // ±1.5px horizontal
      setHeadY((Math.random() - 0.5) * 2);     // ±1px vertical
      setHeadRotate((Math.random() - 0.5) * 0.8); // ±0.4deg subtle rotation
    }, 200);
    return () => clearInterval(iv);
  }, [isSpeaking]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Full-bleed background blur of the avatar */}
      <div className="absolute inset-0 z-0">
        <img src={idleImg} alt="" className="w-full h-full object-cover scale-125 blur-[60px] opacity-30" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Speaking energy waves */}
      {isSpeaking && (
        <div className="absolute inset-0 z-[1] pointer-events-none flex items-center justify-center">
          <div className="w-[350px] h-[470px] sm:w-[420px] sm:h-[560px] rounded-[36px] border-2 border-violet-400/15 animate-ping" style={{ animationDuration: "2.5s" }} />
          <div className="absolute w-[380px] h-[500px] sm:w-[450px] sm:h-[590px] rounded-[36px] border border-violet-400/10 animate-ping" style={{ animationDuration: "3s" }} />
        </div>
      )}

      {/* ═══ THE FACE ═══ */}
      <div
        className="relative z-10 transition-transform duration-200 ease-out"
        style={{
          transform: `translate(${headX}px, ${headY}px) rotate(${headRotate}deg)`,
        }}
      >
        <div className={`relative w-[280px] h-[380px] sm:w-[340px] sm:h-[460px] lg:w-[380px] lg:h-[510px] rounded-[28px] overflow-hidden transition-all duration-300
          ${isSpeaking
            ? "shadow-[0_0_120px_rgba(139,92,246,0.25),0_25px_80px_rgba(0,0,0,0.6)] border-[2.5px] border-violet-400/40"
            : "shadow-[0_25px_80px_rgba(0,0,0,0.7)] border-[2.5px] border-white/8"
          }`}
        >
          {/* Idle face layer */}
          <img
            src={idleImg}
            alt={name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[80ms]
              ${talkFrame ? "opacity-0" : "opacity-100"}`}
            draggable={false}
          />
          {/* Talking face layer */}
          <img
            src={talkImg}
            alt={`${name} speaking`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[80ms]
              ${talkFrame ? "opacity-100" : "opacity-0"}`}
            draggable={false}
          />

          {/* Cinematic grade: top vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40 pointer-events-none" />

          {/* Speaking chin glow */}
          {isSpeaking && (
            <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-violet-500/15 to-transparent pointer-events-none animate-pulse" style={{ animationDuration: "1.5s" }} />
          )}
        </div>

        {/* Name plate — like FaceTime */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
          <div className={`flex items-center gap-2 px-5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-xl border transition-all duration-500
            ${isSpeaking
              ? "bg-violet-500/25 text-white border-violet-400/30 shadow-[0_0_30px_rgba(139,92,246,0.2)]"
              : isThinking
                ? "bg-amber-500/20 text-amber-200 border-amber-400/20"
                : "bg-white/8 text-white/70 border-white/8"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isSpeaking ? "bg-violet-400 animate-pulse" : isThinking ? "bg-amber-400 animate-pulse" : "bg-green-400"}`} />
            {name}
          </div>
        </div>
      </div>

      {/* Voice wave at bottom when speaking */}
      {isSpeaking && (
        <div className="absolute bottom-[100px] inset-x-0 flex justify-center z-20 pointer-events-none">
          <div className="flex items-end gap-[3px] h-10 opacity-60">
            {[...Array(24)].map((_, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-gradient-to-t from-violet-500 to-fuchsia-400"
                style={{
                  height: `${20 + Math.random() * 80}%`,
                  animation: `waveBar ${0.25 + Math.random() * 0.45}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.03}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Thinking indicator */}
      {isThinking && !isSpeaking && (
        <div className="absolute bottom-[100px] inset-x-0 flex justify-center z-20 pointer-events-none">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full px-5 py-2 border border-white/10">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
              <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
RealisticTalkingHead.displayName = "RealisticTalkingHead";


// ═══════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════
const AIFaceCallPage = () => {
  const navigate = useNavigate();
  const { id: aiType } = useParams();
  const { authUser } = useAuthUser();

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState(""); // Track specific error
  const [isProcessing, setIsProcessing] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [subtitle, setSubtitle] = useState("");
  const [aiSubtitle, setAiSubtitle] = useState("");
  const [showControls, setShowControls] = useState(true);
  const [callStarted, setCallStarted] = useState(false); 
  const [avatarStream, setAvatarStream] = useState(null); 
  const [useStreamingAvatar, setUseStreamingAvatar] = useState(false); // Fallback toggle
  const [userEmotion, setUserEmotion] = useState({ emotion: "neutral", insight: "" });
  const [isSensing, setIsSensing] = useState(false);

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const conversationHistory = useRef([]);
  const isMicOnRef = useRef(true);
  const isAISpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isMutedRef = useRef(false);
  const handleSpeechRef = useRef(null);
  const mountedRef = useRef(true);
  const controlsTimerRef = useRef(null);
  const subtitleTimerRef = useRef(null);
  const micReadyRef = useRef(false);
  const senseTimerRef = useRef(null);
  const canvasRef = useRef(null); // For snapshotting user face
  const pcRef = useRef(null); // WebRTC Peer Connection
  const sessionIdRef = useRef(null);

  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { isAISpeakingRef.current = isAISpeaking; }, [isAISpeaking]);
  useEffect(() => { isProcessingRef.current = isProcessing; }, [isProcessing]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // AI config
  const ai = useMemo(() => ({
    "ai-friend-id": {
      name: authUser?.aiFriendName || "Golu",
      idle: "/ai-bestfriend-real.png",
      talk: "/ai-bestfriend-talk.png",
    },
    "ai-user-id": {
      name: authUser?.aiPartnerName || "Aria",
      idle: authUser?.aiPartnerPic || "/ai-girlfriend.png",
      talk: authUser?.aiPartnerPic || "/ai-girlfriend.png",
    },
    "ai-coach-id": {
      name: "Dr. Bond",
      idle: "/dr-bond-real.png",
      talk: "/dr-bond-talk.png",
    },
    "ai-match-analyst": {
      name: "Commander",
      idle: "/dr-bond-real.png",
      talk: "/dr-bond-talk.png",
    },
  }[aiType] || { name: "AI", idle: "/ai-bestfriend-real.png", talk: "/ai-bestfriend-talk.png" }), [aiType, authUser]);

  // Preload images
  useEffect(() => { new Image().src = ai.idle; new Image().src = ai.talk; }, [ai]);

  // Preload TTS voices — critical for some browsers
  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    const load = () => {
        const v = s.getVoices();
        if (v.length > 0) console.log("✅ TTS Voices Loaded:", v.length);
    };
    load();
    s.onvoiceschanged = load;
    // Retry load after 1s just in case
    const t = setTimeout(load, 1000);
    return () => clearTimeout(t);
  }, []);

  // Camera + Microphone
  useEffect(() => {
    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 640 } },
          audio: true,
        });
        if (!mountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
        mediaStreamRef.current = stream;
        stream.getAudioTracks().forEach(t => { t.enabled = true; });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => videoRef.current.play();
        }
        micReadyRef.current = true;
        setIsCameraOn(true);
        console.log("🎤 Mic + Camera ready");
      } catch (err) {
        console.warn("Media error:", err.message);
        try {
          const vs = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
          if (!mountedRef.current) { vs.getTracks().forEach(t => t.stop()); return; }
          mediaStreamRef.current = vs;
          if (videoRef.current) videoRef.current.srcObject = vs;
        } catch { setIsCameraOn(false); }
        try {
          const as = await navigator.mediaDevices.getUserMedia({ audio: true });
          as.getTracks().forEach(t => t.stop()); // Just need permission
          micReadyRef.current = true;
        } catch {
          toast.error("🎤 Mic blocked! Allow microphone in browser.", { duration: 6000, id: "mic-err" });
        }
      }
    })();
    return () => {
      mountedRef.current = false;
      mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // Timer — starts only after call connects
  useEffect(() => {
    if (!callStarted) return;
    timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [callStarted]);

  // Auto-hide controls
  const resetControls = useCallback(() => {
    setShowControls(true);
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(false), 4000);
  }, []);

  useEffect(() => {
    resetControls();
    return () => { if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current); };
  }, [resetControls]);

  // ─── Speech Recognition — DEFINED FIRST ───
  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} recognitionRef.current = null; }
    setIsListening(false); setSubtitle("");
  }, []);

  const startRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      toast.error("Voice not supported. Use Chrome/Edge.", { id: "sr-err" });
      return;
    }

    if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} }

    const r = new SR();
    r.lang = "hi-IN";
    r.continuous = true; // NOW ACTIVE thanks to user gesture
    r.interimResults = true;
    r.maxAlternatives = 1;

    r.onstart = () => {
      setIsListening(true);
      setMicError("");
      console.log("🎤 Mic is ACTIVE (Continuous)");
    };

    r.onresult = (e) => {
      let interim = "", final = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript;
        else interim += e.results[i][0].transcript;
      }
      if (interim) {
        setSubtitle(interim);
      }
      if (e.results[e.results.length-1].isFinal) {
        const txt = e.results[e.results.length-1][0].transcript.trim();
        if (txt) {
            console.log("✅ Final Speech:", txt);
            setSubtitle(txt); // Show it fixed on screen
            handleSpeechRef.current?.(txt);
        }
      }
    };

    r.onerror = (e) => {
      setIsListening(false);
      setMicError(e.error);
      console.error("🎤 Mic error:", e.error);

      if (e.error === "not-allowed") {
        toast.error("🎤 Mic blocked! Check browser settings.", { id: "mic-blocked" });
        return;
      }
      
      // Auto-retry unless it's a critical error
      if (isMicOnRef.current && !isProcessingRef.current && !isAISpeakingRef.current) {
        if (e.error === "no-speech") {
            // Don't toast for silence, just restart quietly
            setTimeout(() => startRecognition(), 1000);
        } else {
            setTimeout(() => startRecognition(), 3000); // Slower retry for other errors
        }
      }
    };

    r.onend = () => {
      // With continuous: true, onend only happens on error or long pause
      setIsListening(false);
      console.log("🎤 Mic session ended.");
      if (isMicOnRef.current && !isProcessingRef.current && !isAISpeakingRef.current) {
        setTimeout(() => {
          if (isMicOnRef.current && !isProcessingRef.current && !isAISpeakingRef.current) startRecognition();
        }, 500);
      }
    };

    recognitionRef.current = r;
    try {
      r.start();
    } catch (err) {
      setTimeout(() => {
        if (isMicOnRef.current && !isProcessingRef.current) startRecognition();
      }, 1000);
    }
  }, []);

  // ─── TTS — PRIORITIZE HEYGEN STREAMING ───
  const speakText = useCallback(async (text) => {
    if (useStreamingAvatar && sessionIdRef.current) {
        console.log("🧬 [HeyGen] Sending script:", text);
        try {
            await axiosInstance.post("/chat/avatar-task", {
                sessionId: sessionIdRef.current,
                text: text
            });
            setIsAISpeaking(true);
            setAiSubtitle(text);

            // Calculate duration (roughly 150ms per word + 1s buffer)
            const wordCount = text.split(" ").length;
            const duration = Math.max(2500, wordCount * 500 + 1000); 

            setTimeout(() => {
                setIsAISpeaking(false);
                setIsProcessing(false);
                isProcessingRef.current = false;
                startRecognition(); // SNAP RESTART
            }, duration);
            return;
        } catch (err) {
            console.error("❌ HeyGen Task Error");
        }
    }

    // 2. FALLBACK: Browser window.speechSynthesis 
    const synth = window.speechSynthesis;
    if (!synth) { 
      setIsProcessing(false); isProcessingRef.current = false; 
      return; 
    }
    synth.cancel();

    console.log("🔊 AI trying to speak:", text);

    const clean = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "")
      .replace(/[*_~`#\[\]()]/g, "")
      .replace(/\bhaha+\b/gi, "")
      .trim();

    if (!clean) {
      setIsProcessing(false); isProcessingRef.current = false;
      if (isMicOnRef.current) startRecognition();
      return;
    }

    setAiSubtitle(text.length > 120 ? text.slice(0, 120) + "..." : text);

    const utt = new SpeechSynthesisUtterance(clean);
    utt.rate = 1.05;
    utt.pitch = aiType === "ai-coach-id" ? 0.8 : 0.95;
    utt.volume = 1;

    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.startsWith("hi")) || 
                  voices.find(v => v.lang.startsWith("en-IN")) ||
                  voices.find(v => v.lang.startsWith("en"));
    if (voice) utt.voice = voice;

    utt.onstart = () => {
      setIsAISpeaking(true);
      console.log("🗣️ AI Speech Started");
    };
    
    utt.onend = () => {
      setIsAISpeaking(false);
      setIsProcessing(false);
      isProcessingRef.current = false;
      subtitleTimerRef.current = setTimeout(() => setAiSubtitle(""), 2000);
      if (isMicOnRef.current) setTimeout(() => startRecognition(), 300);
    };

    utt.onerror = (e) => {
      setIsAISpeaking(false);
      setIsProcessing(false);
      isProcessingRef.current = false;
      if (isMicOnRef.current) startRecognition();
    };

    // Chrome Fix: Resume synthesis if it stalls
    setTimeout(() => {
      synth.speak(utt);
      // Aggressive heartbeat to prevent Chrome speaker from falling asleep
      const ka = setInterval(() => {
        if (!synth.speaking) { clearInterval(ka); return; }
        if (synth.paused) synth.resume();
        else { synth.pause(); synth.resume(); } // Hack to keep engine alive
      }, 3000);
    }, 50);
  }, [aiType, startRecognition]);

  // ─── Process Input — DEPENDS ON speakText/recognition ───
  const processInput = useCallback(async (text) => {
    if (!text.trim() || isProcessingRef.current) return;

    console.log("🎤 USER SAID:", text);
    setSubtitle(text);
    setTimeout(() => setSubtitle(""), 3000);

    conversationHistory.current.push({ role: "user", parts: [{ text }] });
    if (conversationHistory.current.length > 10) conversationHistory.current = conversationHistory.current.slice(-10);

    setIsProcessing(true); isProcessingRef.current = true;
    stopRecognition();

    try {
      const { data } = await axiosInstance.post("/chat/ai-face-call", {
        text, aiType,
        history: conversationHistory.current.slice(0, -1),
        userEmotion: userEmotion.emotion
      });

      const reply = data.reply || "Kya bola? Dobara bol na!";
      console.log("🤖 AI REPLY:", reply);
      conversationHistory.current.push({ role: "model", parts: [{ text: reply }] });

      if (!isMutedRef.current) {
        speakText(reply);
      } else {
        setAiSubtitle(reply.length > 120 ? reply.slice(0, 120) + "..." : reply);
        setIsProcessing(false); isProcessingRef.current = false;
        if (isMicOnRef.current) startRecognition();
      }
    } catch (err) {
      console.error("❌ AI API ERROR:", err);
      setIsProcessing(false); isProcessingRef.current = false;
      if (isMicOnRef.current) startRecognition();
    }
  }, [aiType, speakText, userEmotion.emotion, startRecognition, stopRecognition]);

  useEffect(() => { handleSpeechRef.current = processInput; }, [processInput]);

  // ─── Visual Memory (Sense loop) ───
  const senseUserFace = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !callStarted || isAISpeakingRef.current) return;
    
    setIsSensing(true);
    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = 300; // Small context capture
      canvas.height = 300;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, 300, 300);
      const snapshot = canvas.toDataURL("image/jpeg", 0.6);
      
      const { data } = await axiosInstance.post("/chat/sense-emotion", { image: snapshot });
      if (data.emotion) {
        setUserEmotion({ emotion: data.emotion, insight: data.insight });
        console.log("👁️ AI Sensed:", data.emotion, data.insight);
      }
    } catch (err) {
      console.error("Sense loop failed", err);
    } finally {
      setIsSensing(false);
    }
  }, [callStarted]);

  useEffect(() => {
    if (callStarted) {
      senseTimerRef.current = setInterval(senseUserFace, 8000); // Sense every 8 seconds
    }
    return () => clearInterval(senseTimerRef.current);
  }, [callStarted, senseUserFace]);

  // Start mic when user taps "Connect" (user gesture required)
  const startCall = useCallback(async () => {
    setCallStarted(true);
    console.log("📞 Starting Call...");
    
    // Greet user immediately
    const greeting = aiType === "ai-match-analyst" ? "Haan bhai! Commander here. Kya haal hai cricket ka?" : "Hello! Connect ho gaye hum. Kya bolte ho?";
    setIsProcessing(true);
    isProcessingRef.current = true;
    setTimeout(() => {
        speakText(greeting);
    }, 1000);

    // 🌐 INIT HEYGEN WEBRTC SESSION (With SDP Handshake)
    try {
      const { data } = await axiosInstance.post("/chat/avatar-session");
      if (data.status === "success" && data.sdp) {
        console.log("🌐 HeyGen Offer Received. Negotiating Answer...");
        
        const pc = new RTCPeerConnection({ iceServers: data.ice_servers });
        pcRef.current = pc;
        sessionIdRef.current = data.sessionId;

        pc.ontrack = (event) => {
          if (event.track.kind === "video") {
            console.log("📺 HeyGen Video Stream ACTIVE!");
            setAvatarStream(URL.createObjectURL(new MediaStream([event.track])));
            setUseStreamingAvatar(true);
          }
        };

        // 1. Set Remote Offer
        await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
        
        // 2. Create Local Answer
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        // 3. Finalize HeyGen session with the answer
        await axiosInstance.post("/chat/avatar-start", {
          sessionId: data.sessionId,
          sdp: answer
        });

        console.log("📡 WebRTC Handshake Finalized.");
        setAiSubtitle("Avatar Engine Connected.");
      } else {
        throw new Error(data.message || "HeyGen failed");
      }
    } catch (err) {
      console.warn("⚠️ HeyGen Streaming failed:", err.message);
      setUseStreamingAvatar(false); // AUTO-FALLBACK TO SIMULATED AVATAR
      toast.error("Avatar Engine busy. Using high-quality local character.", { duration: 3000, id: "avatar-fail" });
    }

    // Start recognition IMMEDIATELY on the same tick if possible
    setIsMicOn(true);
    isMicOnRef.current = true;
    startRecognition();
  }, [startRecognition, aiType, speakText]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecognition();
      window.speechSynthesis?.cancel();
      if (subtitleTimerRef.current) clearTimeout(subtitleTimerRef.current);
    };
  }, [stopRecognition]);

  // ─── Controls ───
  const toggleCamera = useCallback(() => {
    const vt = mediaStreamRef.current?.getVideoTracks()[0];
    if (vt) { vt.enabled = !vt.enabled; setIsCameraOn(vt.enabled); }
  }, []);

  const toggleMic = useCallback(() => {
    if (isMicOn) { stopRecognition(); setIsMicOn(false); }
    else { setIsMicOn(true); if (!isAISpeaking && !isProcessing) setTimeout(() => startRecognition(), 200); }
  }, [isMicOn, isAISpeaking, isProcessing, stopRecognition, startRecognition]);

  const toggleMute = useCallback(() => {
    setIsMuted(p => {
      if (!p) { window.speechSynthesis?.cancel(); setIsAISpeaking(false); }
      return !p;
    });
  }, []);

  const endCall = useCallback(() => {
    stopRecognition();
    window.speechSynthesis?.cancel();
    mediaStreamRef.current?.getTracks().forEach(t => t.stop());
    toast(`Call ended • ${formatDuration(callDuration)}`, { icon: "📞" });
    navigate(-1);
  }, [navigate, stopRecognition, callDuration]);

  // ═══════════════
  //  RENDER
  // ═══════════════
  return (
    <div
      className="h-dvh w-screen relative overflow-hidden bg-black text-white font-outfit select-none cursor-default"
      onClick={resetControls}
      onMouseMove={resetControls}
    >
      {/* ═══ TAP TO CONNECT OVERLAY ═══ */}
      {!callStarted && (
        <div className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 mx-auto shadow-2xl">
              <img src={ai.idle} alt={ai.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{ai.name}</h2>
              <p className="text-white/40 text-sm mt-1">AI Voice Call</p>
            </div>
            <button
              onClick={startCall}
              className="px-10 py-4 bg-green-500 hover:bg-green-400 text-white font-bold text-lg rounded-full shadow-[0_0_40px_rgba(34,197,94,0.4)] active:scale-95 transition-all flex items-center gap-3 mx-auto"
            >
              <Mic className="w-6 h-6" />
              Tap to Connect
            </button>
            <p className="text-white/30 text-xs">Microphone access required</p>
          </div>
        </div>
      )}
      {/* ═══ AI TALKING HEAD (full screen) ═══ */}
      {useStreamingAvatar && avatarStream ? (
        <div className="absolute inset-0 z-0 bg-black">
          <video 
            src={avatarStream} 
            autoPlay 
            muted={isMuted}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <RealisticTalkingHead
          isSpeaking={isAISpeaking}
          isThinking={isProcessing && !isAISpeaking}
          idleImg={ai.idle}
          talkImg={ai.talk}
          name={ai.name}
        />
      )}

      {/* ═══ THE "EYES" — Vision Processor Canvas (Hidden) ═══ */}
      <canvas ref={canvasRef} className="hidden" />

      {/* ═══ AI VISION HUD ═══ */}
      {callStarted && userEmotion.insight && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[45] flex flex-col items-center">
          <div className="bg-black/30 backdrop-blur-md border border-white/5 rounded-2xl px-4 py-2 flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className={`size-2 rounded-full ${isSensing ? "bg-red-500 animate-pulse" : "bg-cyan-400 opacity-50"}`} />
            <p className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
              AI Sensed: <span className="text-white ml-1">{userEmotion.emotion}</span>
            </p>
          </div>
          {isSensing && <p className="text-[8px] text-white/30 uppercase tracking-[.2em] mt-2 font-black animate-pulse">Syncing Visual Memory...</p>}
        </div>
      )}

      {/* ═══ USER WEBCAM PIP ═══ */}
      <div className={`absolute top-4 right-4 z-30 w-[100px] h-[140px] sm:w-[130px] sm:h-[180px] rounded-2xl overflow-hidden border-2 shadow-[0_10px_40px_rgba(0,0,0,0.6)] transition-all duration-500
        ${showControls ? "opacity-100" : "opacity-40 hover:opacity-100"}
        ${isCameraOn ? "border-white/15" : "border-white/5"}`}
      >
        {isCameraOn ? (
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-neutral-900/90">
            <VideoOff className="w-6 h-6 text-white/20" />
          </div>
        )}
        {/* Mic indicator */}
        {isListening && (
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-green-500/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
            <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
            MIC
          </div>
        )}
      </div>

      {/* ═══ TOP BAR (auto-hide) ═══ */}
      <div className={`absolute top-0 inset-x-0 z-40 px-4 py-3 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent transition-all duration-500 safe-area-top
        ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20">
            <img src={ai.idle} alt="" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-none">{ai.name}</h3>
            <span className="text-[10px] text-white/50 font-mono">{formatDuration(callDuration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase tracking-widest font-bold">
          <div className={`w-1.5 h-1.5 rounded-full ${isAISpeaking ? "bg-violet-400 animate-pulse" : isListening ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`} />
          {isAISpeaking ? "Speaking" : isProcessing ? "Thinking" : isListening ? "Listening" : "Ready"}
        </div>
      </div>

      {/* ═══ LIVE STATUS INDICATOR ═══ */}
      {callStarted && (
        <div className="absolute top-24 left-6 z-[45] flex flex-col gap-2">
           <div className={`px-3 py-1 rounded-md border text-[10px] font-bold tracking-tighter uppercase transition-all
             ${isListening ? "bg-green-500/20 border-green-500 text-green-400" : (micError ? "bg-red-500/20 border-red-500 text-red-500" : "bg-white/10 border-white/20 text-white/40")}`}>
             {isListening ? "● Listening..." : (micError ? `○ Error: ${micError}` : "○ Ready")}
           </div>
           {isProcessing && (
             <div className="bg-amber-500/20 border border-amber-500 text-amber-400 px-3 py-1 rounded-md text-[10px] font-bold uppercase animate-pulse">
               Thinking...
             </div>
           )}
        </div>
      )}

      {/* ═══ SUBTITLES ═══ */}
      {(subtitle || aiSubtitle) && (
        <div className="absolute bottom-24 sm:bottom-28 inset-x-0 z-30 flex justify-center px-6 pointer-events-none">
          <div className="max-w-xl bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <p className={`text-md sm:text-lg font-medium text-center leading-relaxed ${subtitle ? "text-cyan-400" : "text-white"}`}>
              {subtitle || aiSubtitle}
            </p>
          </div>
        </div>
      )}

      {/* ═══ BOTTOM CONTROLS (auto-hide) ═══ */}
      <div className={`absolute bottom-0 inset-x-0 z-40 bg-gradient-to-t from-black/70 via-black/30 to-transparent transition-all duration-500 safe-area-bottom
        ${showControls ? "opacity-100" : "opacity-0 pointer-events-none"}`}
      >
        <div className="flex items-center justify-center gap-6 sm:gap-8 px-4 py-5 sm:py-6">
          {/* Mute AI */}
          <button onClick={toggleMute}
            className={`ctrl-btn ${isMuted ? "bg-white text-black" : ""}`}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Mic */}
          <button onClick={toggleMic}
            className={`ctrl-btn ${!isMicOn ? "bg-white text-black" : isListening ? "bg-green-500/30 text-green-300 border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]" : ""}`}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* End */}
          <button onClick={endCall}
            className="w-[62px] h-[62px] rounded-full bg-[#ff3b30] flex items-center justify-center shadow-[0_8px_30px_rgba(255,59,48,0.4)] active:scale-90 transition-all hover:bg-[#ff453a]"
          >
            <PhoneOff className="w-7 h-7 text-white fill-current" />
          </button>

          {/* Camera */}
          <button onClick={toggleCamera}
            className={`ctrl-btn ${!isCameraOn ? "bg-white text-black" : ""}`}
          >
            {isCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          {/* Spacer button for balance */}
          <div className="w-12 h-12" />
        </div>
      </div>

      <style>{`
        .mirror { transform: scaleX(-1); }
        .ctrl-btn {
          width: 48px; height: 48px; border-radius: 9999px;
          display: flex; align-items: center; justify-content: center;
          transition: all 150ms; border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.12); color: white;
          backdrop-filter: blur(12px);
        }
        .ctrl-btn:hover { background: rgba(255,255,255,0.2); }
        .ctrl-btn:active { transform: scale(0.9); }
        @keyframes waveBar {
          0% { height: 15%; }
          100% { height: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AIFaceCallPage;
