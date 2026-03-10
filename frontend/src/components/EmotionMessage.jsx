import React, { useState, memo, useRef, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSimple, useMessageContext } from "stream-chat-react";
import { Play, Pause, Volume2, Languages, Loader2, Star, Camera, CheckCheck, Mic, Download } from "lucide-react";
import SnapViewer from "./SnapViewer";
import useAuthUser from "../hooks/useAuthUser";
import { translateText } from "../lib/api";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { isPremiumUser } from "../lib/premium";

const handleFileDownload = async (url, type = 'media') => {
  if (!url) return;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    const ext = type === 'video' ? 'mp4' : type === 'audio' ? 'webm' : 'jpg';
    a.download = `freechat_${type}_${Date.now()}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(blobUrl);
    toast.success("Saved! 🚀");
  } catch (err) {
    window.open(url, '_blank');
  }
};

const emotionColors = {
  joy: "bg-yellow-400 text-yellow-950 border-yellow-500",
  love: "bg-pink-400 text-pink-950 border-pink-500",
  sadness: "bg-blue-500 text-white border-blue-600",
  anger: "bg-red-500 text-white border-red-600",
  fear: "bg-purple-500 text-white border-purple-600",
  surprise: "bg-orange-400 text-orange-950 border-orange-500",
  neutral: "bg-slate-300 text-slate-900 border-slate-400",
};

const VoiceMessagePlayer = memo(({ url, duration, isMyMessage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(audioRef.current?.currentTime || 0);
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-[0_5px_15px_-3px_rgba(0,0,0,0.1)] min-w-[200px] sm:min-w-[260px] border backdrop-blur-md ${isMyMessage ? 'bg-gradient-to-br from-primary/50 to-primary/80 text-white border-white/10' : 'bg-base-200/80 text-base-content border-base-300'}`}>
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />

      <button
        onClick={togglePlay}
        className={`size-11 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg ${isMyMessage ? 'bg-white text-primary hover:bg-zinc-100' : 'bg-primary text-primary-content hover:scale-105'}`}
      >
        {isPlaying ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current ml-0.5" />}
      </button>

      <div className="flex-1 space-y-1.5">
        <div className={`h-1.5 w-full rounded-full overflow-hidden relative ${isMyMessage ? 'bg-white/20' : 'bg-base-content/10'}`}>
          <div
            className={`h-full transition-all duration-100 ease-linear ${isMyMessage ? 'bg-white' : 'bg-primary'}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center px-0.5">
          <span className={`text-[10px] font-bold ${isMyMessage ? 'text-white/80' : 'opacity-60'}`}>
            {isPlaying ? formatTime(currentTime) : <div className="flex items-center gap-1.5"><Mic className="size-2.5" />{formatTime(duration)}</div>}
          </span>
        </div>
      </div>

      <button
        onClick={() => handleFileDownload(url, 'audio')}
        className={`ml-1 size-8 rounded-full flex items-center justify-center transition-all active:scale-95 opacity-50 hover:opacity-100 ${isMyMessage ? 'hover:bg-white/20' : 'hover:bg-base-300'}`}
      >
        <Download className="size-4" />
      </button>
    </div>
  );
});

VoiceMessagePlayer.displayName = "VoiceMessagePlayer";

// Static components to avoid re-renders when passed as props
const NullComponent = memo(() => null);

const EmotionMessage = memo((props) => {
  const messageContext = useMessageContext();
  const message = messageContext?.message || props.message;
  // Handle isMyMessage accurately whether as hook or prop
  const isMyMessage = useMemo(() => {
    if (messageContext?.isMyMessage) return messageContext.isMyMessage();
    if (typeof props.isMyMessage === 'function') return props.isMyMessage();
    return !!props.isMyMessage;
  }, [messageContext, props.isMyMessage]);

  const { authUser } = useAuthUser();
  const isPremium = isPremiumUser(authUser);

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [isViewingSnap, setIsViewingSnap] = useState(false);

  const extra = message?.extra_data || message || {};
  const isSnap = extra.isSnap;
  const isVoice = extra.isVoice;
  const isViewed = extra.isViewed;
  const emotion = extra.emotion;

  const handleMarkViewed = useCallback(async () => {
    setIsViewingSnap(false);
    if (isViewed || isMyMessage) return;

    try {
      const client = messageContext?.client;
      if (client) {
        await client.partialUpdateMessage(message.id, {
          set: { isViewed: true, extra_data: { ...message.extra_data, isViewed: true } }
        });
      }
    } catch (error) {
      console.error("Error marking snap as viewed:", error);
    }
  }, [isViewed, isMyMessage, message.id, message.extra_data, messageContext?.client]);

  const { i18n } = useTranslation();
  const handleTranslate = useCallback(async () => {
    if (!isPremium) {
      toast.error("Translation is a premium feature. Please upgrade!");
      return;
    }
    if (translatedText) {
      setTranslatedText("");
      return;
    }
    setIsTranslating(true);
    try {
      const targetLang = i18n.language?.split("-")[0] || authUser?.nativeLanguage || "en";
      const res = await translateText(message.text, targetLang);
      setTranslatedText(res.translatedText);
    } catch (err) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  }, [isPremium, translatedText, authUser?.nativeLanguage, message.text, i18n.language]);

  const { groupStyles = [] } = messageContext || {};
  const isFirstInGroup = groupStyles.includes("top") || groupStyles.includes("single");
  const isLastInGroup = groupStyles.includes("bottom") || groupStyles.includes("single");

  const scale = useMemo(() => Math.min(2.5, Math.max(0.5, Number(extra.fontSize || 1))), [extra.fontSize]);
  const isWhisper = scale < 0.9;
  const isShout = scale > 1.3;

  const isSystem = message?.user?.id === "system_announcement" || message?.text?.startsWith("📢 SYSTEM NOTIFICATION");

  const timestamp = useMemo(() => {
    if (!message.created_at) return "";
    return new Date(message.created_at).toLocaleTimeString("en-US", {
      timeZone: 'Asia/Kolkata',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }, [message.created_at]);

  const MessageFooter = useCallback(() => (
    <div className="absolute bottom-1 right-2 flex items-center gap-1 select-none pointer-events-none z-10">
      <span className={`text-[10px] font-bold tracking-tight ${isMyMessage ? 'text-white/70' : 'text-base-content/30'}`}>
        {timestamp}
      </span>
      {isMyMessage && (
        <div className="flex -space-x-1.5 translate-y-[1px]">
          <CheckCheck className={`size-3.5 stroke-[2.5px] ${message.status === 'read' ? 'text-sky-300' : 'text-white/40'}`} />
        </div>
      )}
    </div>
  ), [isMyMessage, timestamp, message.status]);

  const emotionStyle = useMemo(() => {
    if (!emotion || emotion === 'neutral' || !emotionColors[emotion]) return null;
    return emotionColors[emotion].split(' ')[0];
  }, [emotion]);

  if (isSystem) {
    return (
      <div className="flex flex-col items-center my-6 px-4">
        <div className="w-full max-w-sm sm:max-w-md overflow-hidden rounded-3xl border border-primary/20 bg-base-100 shadow-2xl shadow-primary/10">
          <div className="bg-gradient-to-r from-primary via-indigo-600 to-violet-600 p-4 sm:p-5 flex items-center justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_infinite]" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="size-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Mic className="size-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-black italic uppercase tracking-tighter text-sm sm:text-base leading-none">System Notification</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-1">Official Broadcast</p>
              </div>
            </div>
            <Star className="size-5 text-amber-300 fill-amber-300 relative z-10" />
          </div>
          <div className="p-5 sm:p-7 space-y-4 bg-gradient-to-b from-primary/5 to-transparent">
            <div className="text-sm sm:text-base font-medium leading-relaxed text-base-content/80 whitespace-pre-wrap">
              {message.text.replace(/📢 SYSTEM NOTIFICATION: \n\n|📢 SYSTEM NOTIFICATION:/i, "").trim()}
            </div>
            <div className="pt-4 border-t border-base-content/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 grayscale opacity-40">
                <div className="size-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCheck className="size-3 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest italic">Verified System Message</span>
              </div>
              <span className="text-[10px] font-bold opacity-30 tabular-nums">{timestamp}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className={`stream-message-wrapper relative group ${isFirstInGroup ? "mt-4" : "mt-0.5"}`}
      style={{ contain: 'layout style' }}
    >
      {isSnap ? (
        <div className={`flex flex-col ${isMyMessage ? "items-end pr-4" : "items-start pl-12"} mb-3`}>
          {isViewed ? (
            <div className="flex items-center gap-2 bg-base-200/40 px-3.5 py-1.5 rounded-full border border-base-300/50 opacity-50 select-none">
              <CheckCheck className="size-3.5 text-success/70" />
              <span className="text-[10px] font-bold uppercase tracking-widest italic opacity-70">Snap Viewed</span>
            </div>
          ) : (
            <button
              onClick={() => setIsViewingSnap(true)}
              className="flex items-center gap-3.5 bg-gradient-to-r from-primary to-indigo-600 text-white px-5 py-3 rounded-[20px] shadow-xl shadow-primary/20 active:scale-90 transition-all border border-white/10 group/snap"
            >
              <div className="size-9 rounded-full bg-white/20 flex items-center justify-center transition-transform group-hover/snap:rotate-12">
                <Camera className="size-5 fill-white/10" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black uppercase tracking-[0.15em] leading-none mb-1">New Snap</p>
                <p className="text-[9px] font-bold opacity-60 uppercase tracking-tighter">Tap to re-live</p>
              </div>
            </button>
          )}
          {isViewingSnap && <SnapViewer message={message} onClose={handleMarkViewed} />}
        </div>
      ) : isVoice ? (
        <div className={`flex flex-col ${isMyMessage ? "items-end pr-4" : "items-start pl-12"} mb-3`}>
          <VoiceMessagePlayer
            url={message.mediaUrl || extra.mediaUrl}
            duration={message.duration || extra.duration}
            isMyMessage={isMyMessage}
          />
        </div>
      ) : (
        <div className={`w-full flex ${isMyMessage ? 'justify-end' : 'justify-start'} px-2`}>
          <div
            className={`message-bubble-scaling flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-none ${isWhisper ? 'opacity-60' : ''}`}
            style={{
              transform: scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: isMyMessage ? 'right top' : 'left top',
              paddingTop: isShout ? `${(scale - 1) * 12}px` : undefined,
              paddingBottom: isShout ? `${(scale - 1) * 12}px` : undefined,
            }}
          >
            <div className={`relative ${isFirstInGroup ? (isMyMessage ? 'bubble-tail-me' : 'bubble-tail-others') : ''}`}>
              <MessageSimple
                {...props}
                hideAvatar={!isFirstInGroup || isMyMessage}
                MessageHeader={NullComponent}
                MessageTimestamp={NullComponent}
                MessageStatus={NullComponent}
                className={`
                  custom-message-bubble
                  ${isFirstInGroup ? (isMyMessage ? 'bubble-top-right' : 'bubble-top-left') : ''}
                  ${!isLastInGroup ? 'mb-0.5' : 'mb-3'}
                `}
                MessageFooter={MessageFooter}
              />
            </div>
          </div>
        </div>
      )}

      <div className={`flex flex-col ${isMyMessage ? "items-end mr-14" : "items-start ml-14"} -mt-1 mb-1 gap-1.5`}>
        <div className="flex items-center gap-3">
          {emotionStyle && (
            <div className="flex items-center gap-1.5 opacity-70">
              <div className={`size-1.5 rounded-full ${emotionStyle}`} />
              <span className="text-[9px] uppercase tracking-widest font-black italic text-base-content/60">
                {emotion}
              </span>
            </div>
          )}

          {message.text && !translatedText && (
            <button
              onClick={handleTranslate}
              className="flex items-center gap-1.5 transition-all opacity-20 hover:opacity-100 text-primary"
              disabled={isTranslating}
            >
              {isTranslating ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <>
                  <Languages className="size-3.5" />
                  {!isPremium && <Star className="size-2 text-warning fill-warning" />}
                </>
              )}
            </button>
          )}

          {/* Download button for ordinary attachments */}
          {message.attachments?.length > 0 && (
            <button
              onClick={() => {
                const att = message.attachments[0];
                handleFileDownload(att.asset_url || att.image_url, att.type || 'image');
              }}
              className="flex items-center gap-1 opacity-20 hover:opacity-100 text-primary transition-all p-1"
              title="Download Media"
            >
              <Download className="size-3.5" />
            </button>
          )}
        </div>

        {translatedText && (
          <div className="bg-base-200/90 backdrop-blur-md px-3 py-2 rounded-2xl border border-base-300 max-w-[240px] shadow-lg relative">
            <p className="text-[11px] italic text-base-content/90 leading-tight pr-5">
              <Languages className="size-3 inline mr-2 text-primary opacity-60" />
              {translatedText}
            </p>
            <button
              onClick={() => setTranslatedText("")}
              className="absolute top-1.5 right-1.5 size-4 flex items-center justify-center rounded-full hover:bg-base-300 text-base-content/40"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

EmotionMessage.displayName = "EmotionMessage";

export default EmotionMessage;
