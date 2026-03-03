import { useState } from "react";
import { MessageSimple, useMessageContext } from "stream-chat-react";
import { Play, Pause, Volume2, Languages, Loader2, Star, Camera, CheckCheck, Mic } from "lucide-react";
import SnapViewer from "./SnapViewer";
import useAuthUser from "../hooks/useAuthUser";
import { translateText } from "../lib/api";
import toast from "react-hot-toast";
import { isPremiumUser } from "../lib/premium";
import { useRef, useEffect } from "react";

const emotionColors = {
  joy: "bg-yellow-400 text-yellow-950 border-yellow-500",
  love: "bg-pink-400 text-pink-950 border-pink-500",
  sadness: "bg-blue-500 text-white border-blue-600",
  anger: "bg-red-500 text-white border-red-600",
  fear: "bg-purple-500 text-white border-purple-600",
  surprise: "bg-orange-400 text-orange-950 border-orange-500",
  neutral: "bg-slate-300 text-slate-900 border-slate-400",
};

const VoiceMessagePlayer = ({ url, duration, isMyMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-md min-w-[180px] sm:min-w-[240px] border transition-all ${isMyMessage ? 'bg-primary text-primary-content border-primary/20' : 'bg-base-200 text-base-content border-base-300'}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`size-10 rounded-full flex items-center justify-center transition-all active:scale-95 ${isMyMessage ? 'bg-white/20 text-white hover:bg-white/30' : 'bg-primary text-primary-content hover:bg-primary-focus'}`}
      >
        {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5">
        <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden relative">
          <div
            className={`h-full transition-all duration-100 ease-linear ${isMyMessage ? 'bg-white' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className="text-[9px] font-bold opacity-70">
            {isPlaying ? formatTime(currentTime) : <Mic className="size-2.5" />}
          </span>
          <span className="text-[9px] font-mono tracking-tighter opacity-70">
            {formatTime(duration || 0)}
          </span>
        </div>
      </div>

      <div className={`flex items-center gap-0.5 ${isPlaying ? 'animate-pulse opacity-100' : 'opacity-30'}`}>
        <div className="w-[2px] h-3 bg-current rounded-full" />
        <div className="w-[2px] h-5 bg-current rounded-full" />
        <div className="w-[2px] h-2 bg-current rounded-full" />
      </div>
    </div>
  );
};

const EmotionMessage = (props) => {
  const messageContext = useMessageContext();
  const message = messageContext?.message || props.message;
  const isMyMessage = messageContext?.isMyMessage
    ? messageContext.isMyMessage()
    : props.isMyMessage
      ? props.isMyMessage()
      : false;

  const { authUser } = useAuthUser();
  const isPremium = isPremiumUser(authUser);

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isViewingSnap, setIsViewingSnap] = useState(false);

  const isSnap = message?.extra_data?.isSnap || message?.isSnap;
  const isVoice = message?.extra_data?.isVoice || message?.isVoice;
  const isViewed = message?.extra_data?.isViewed || message?.isViewed;

  const handleMarkViewed = async () => {
    setIsViewingSnap(false);
    if (isViewed || isMyMessage) return;

    try {
      // Update message on Stream
      const client = messageContext?.client;
      if (client) {
        await client.partialUpdateMessage(message.id, {
          set: { isViewed: true, extra_data: { ...message.extra_data, isViewed: true } }
        });
      }
    } catch (error) {
      console.error("Error marking snap as viewed:", error);
    }
  };

  const emotion =
    message?.emotion ||
    message?.extra_data?.emotion ||
    message?.custom?.emotion;

  const handleTranslate = async () => {
    if (!isPremium) {
      toast.error("Translation is a premium feature. Please upgrade!");
      return;
    }

    if (translatedText) {
      setTranslatedText(""); // Toggle off
      return;
    }

    setIsTranslating(true);
    try {
      const targetLang = authUser?.nativeLanguage || "en";
      const res = await translateText(message.text, targetLang);
      setTranslatedText(res.translatedText);
    } catch (err) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const { groupStyles = [] } = messageContext || {};
  const isFirstInGroup = groupStyles.includes("top") || groupStyles.includes("single");
  const isLastInGroup = groupStyles.includes("bottom") || groupStyles.includes("single");
  // isMyMessage is already declared above, just use it.

  const messageFontSize = Number(message?.extra_data?.fontSize || message?.fontSize || 1);
  // Clamp scale between 0.5 and 2.5 for safety
  const scale = Math.min(2.5, Math.max(0.5, messageFontSize));
  const isWhisper = scale < 0.9;
  const isShout = scale > 1.3;

  return (
    <div
      className={`stream-message-wrapper relative group ${isFirstInGroup ? "mt-4" : "mt-0.5"}`}
    >
      {isSnap ? (
        <div className={`flex flex-col ${isMyMessage ? "items-end" : "items-start"} mb-2 ml-12 mr-12`}>
          {isViewed ? (
            <div className="flex items-center gap-2 bg-base-200/50 px-4 py-2 rounded-2xl border border-base-300 opacity-60">
              <CheckCheck className="size-4 text-success" />
              <span className="text-xs font-medium italic">Viewed snap</span>
            </div>
          ) : (
            <button
              onClick={() => setIsViewingSnap(true)}
              className="flex items-center gap-3 bg-primary text-primary-content px-5 py-3 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all group/snap"
            >
              <div className="size-8 rounded-full bg-white/20 flex items-center justify-center">
                <Camera className="size-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold uppercase tracking-wider">New Snap</p>
                <p className="text-[10px] opacity-80">Tap to view</p>
              </div>
            </button>
          )}

          {isViewingSnap && (
            <SnapViewer message={message} onClose={handleMarkViewed} />
          )}
        </div>
      ) : isVoice ? (
        <div className={`flex flex-col ${isMyMessage ? "items-end mr-12" : "items-start ml-12"} mb-2`}>
          <VoiceMessagePlayer
            url={message.mediaUrl || message.extra_data?.mediaUrl}
            duration={message.duration || message.extra_data?.duration}
            isMyMessage={isMyMessage}
          />
        </div>
      ) : (
        <div
          className={`relative ${isShout ? 'drop-shadow-xl' : ''} ${isMyMessage ? 'flex justify-end' : 'flex justify-start'}`}
        >
          <div
            className={`message-scale-container transition-all duration-300 ${isWhisper ? 'opacity-60' : ''}`}
            style={{
              transform: `scale(${scale})`,
              transformOrigin: isMyMessage ? 'right bottom' : 'left bottom',
              marginTop: isShout ? `${(scale - 1) * 20}px` : undefined,
              marginBottom: isShout ? `${(scale - 1) * 20}px` : undefined,
            }}
          >
            <div className={`relative ${isFirstInGroup ? (isMyMessage ? 'bubble-tail-me' : 'bubble-tail-others') : ''}`}>
              <MessageSimple
                {...props}
                hideAvatar={!isFirstInGroup || isMyMessage}
                // Force fully disable these to avoid ANY leakage
                MessageHeader={() => null}
                MessageTimestamp={() => null}
                MessageStatus={() => null}
                // Internal bubble layout
                className={`
                  ${isFirstInGroup ? (isMyMessage ? 'bubble-top-right' : 'bubble-top-left') : ''}
                  ${!isLastInGroup ? 'mb-0.5' : 'mb-3'}
                  custom-message-bubble
                `}
                MessageFooter={() => (
                  <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none pointer-events-none z-10">
                    <span className={`text-[9.5px] font-bold tracking-tight ${isMyMessage ? 'text-white/80' : 'text-base-content/40'}`}>
                      {new Date(message.created_at).toLocaleTimeString("en-US", { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false })}
                    </span>
                    {isMyMessage && (
                      <div className="flex -space-x-1.5 translate-y-[1px]">
                        <CheckCheck className={`size-3 ${message.status === 'received' || message.status === 'read' ? 'text-sky-300' : 'text-white/40'}`} />
                      </div>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isMyMessage ? "items-end mr-14" : "items-start ml-14"} -mt-1.5 mb-1 gap-1`}>
        {/* Emotion Badge & Translation - Single Row */}
        <div className="flex items-center gap-2">
          {emotion && emotionColors[emotion] && (
            <span
              className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-sm border shadow-sm ${emotionColors[emotion]}`}
            >
              {emotion}
            </span>
          )}

          {message.text && !translatedText && (
            <button
              onClick={handleTranslate}
              className="text-[9px] flex items-center gap-1 opacity-40 hover:opacity-100 transition-opacity text-primary font-bold"
              disabled={isTranslating}
            >
              {isTranslating ? (
                <Loader2 className="size-2.5 animate-spin" />
              ) : (
                <>
                  <Languages className="size-2.5" />
                  Translate
                  {!isPremium && <Star className="size-2 text-warning fill-warning" />}
                </>
              )}
            </button>
          )}
        </div>

        {/* Translation Result */}
        {translatedText && (
          <div className="bg-base-200/80 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-base-300 max-w-[220px] animate-in slide-in-from-top-1 duration-300 shadow-sm relative group/trans">
            <p className="text-[10px] italic text-base-content leading-tight pr-4">
              <Languages className="size-2.5 inline mr-1 text-primary" />
              {translatedText}
            </p>
            <button
              onClick={() => setTranslatedText("")}
              className="absolute top-1 right-1 text-primary hover:scale-110"
              title="Hide"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionMessage;
