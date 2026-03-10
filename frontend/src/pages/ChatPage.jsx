import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import { notifyMessage } from "../lib/api";
import { Camera, Loader2 } from "lucide-react";

import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import toast from "react-hot-toast";
import { useChatClient } from "../components/ChatProvider";

import ChatLoader from "../components/ChatLoader";
import ChatHeader from "../components/ChatHeader";
import EmotionMessage from "../components/EmotionMessage";
import VoiceRecorder from "../components/VoiceRecorder";
import SmartReply from "../components/SmartReply";

const ChatInputArea = memo(({ targetUserId, fontSize, setFontSize, showShoutSlider, setShowShoutSlider, handleSnapClick, handleVoiceSend }) => {
  if (targetUserId === "system_announcement") {
    return (
      <div className="flex-shrink-0 z-50 chat-input-glass p-4 text-center">
        <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic">
          Official Announcement (Read-Only)
        </p>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 z-50 chat-input-pro-optimized">
      <div className="flex flex-col gap-2 p-2 sm:p-3 max-w-5xl mx-auto w-full">
        {showShoutSlider && (
          <div className="flex items-center gap-4 bg-base-100/95 px-4 py-3 rounded-2xl border border-primary/20 shadow-2xl mb-2">
            <input
              type="range" min="0.5" max="2.5" step="0.1" value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="range range-primary range-xs flex-1"
            />
            <span className="font-bold text-primary text-xs">{(fontSize * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {/* Professional Action Toolbar */}
          <div className="flex items-center gap-4 px-3 pb-1 border-b border-base-content/5 mb-1">
            <div className="flex items-center gap-5">
              <button
                onClick={() => setShowShoutSlider(!showShoutSlider)}
                className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide transition-all ${showShoutSlider ? 'text-primary' : 'text-base-content/40 hover:text-base-content/70'}`}
              >
                <div className={`p-1 rounded-md ${showShoutSlider ? 'bg-primary/10' : ''}`}>
                  <span className="text-xs font-black">AA</span>
                </div>
                Size
              </button>
              <button
                onClick={handleSnapClick}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-base-content/40 hover:text-primary transition-all"
              >
                <div className="p-1 rounded-md hover:bg-primary/10">
                  <Camera className="size-4" />
                </div>
                Snap
              </button>
            </div>
            <div className="flex-1" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 bg-base-200/60 rounded-[28px] border border-base-content/5 shadow-inner focus-within:bg-base-100 focus-within:ring-1 focus-within:ring-primary/20">
              <MessageInput focus grow />
            </div>
            <div className="flex-shrink-0">
              <VoiceRecorder onSend={handleVoiceSend} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInputArea.displayName = "ChatInputArea";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const chatClient = useChatClient();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(!chatClient);
  const { authUser } = useAuthUser();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fontSize, setFontSize] = useState(1);
  const [showShoutSlider, setShowShoutSlider] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // Optimized viewport handling for smooth mobile typing
  useEffect(() => {
    if (!window.visualViewport) return;

    let timeoutId;
    const handleViewportChange = () => {
      // Debounce the height update slightly to stay responsive while keyboard is in motion
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportHeight(window.visualViewport.height);
        // Force scroll to bottom when keyboard opens
        if (window.visualViewport.height < window.innerHeight) {
          window.scrollTo(0, 0);
        }
      }, 33); // At least 30fps
    };

    window.visualViewport.addEventListener("resize", handleViewportChange);
    window.visualViewport.addEventListener("scroll", handleViewportChange);

    handleViewportChange();

    return () => {
      clearTimeout(timeoutId);
      window.visualViewport.removeEventListener("resize", handleViewportChange);
      window.visualViewport.removeEventListener("scroll", handleViewportChange);
    };
  }, []);

  const handleSnapClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Snap must be under 20MB");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const type = file.type.startsWith("video") ? "video" : "image";
        const res = await axiosInstance.post("/chat/upload-media", {
          media: reader.result,
          mediaType: type,
        });
        await channel.sendMessage({
          text: "Sent a snap",
          isSnap: true,
          mediaUrl: res.data.url,
          mediaType: type,
          isViewed: false,
        });

        // Push notification
        if (targetUserId && !targetUserId.startsWith("group_")) {
          notifyMessage(targetUserId, `📸 Sent a ${type} snap`).catch(() => { });
        }

        toast.success("Snap sent! 📸");
      } catch (error) {
        toast.error("Failed to send snap");
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const initChannel = async () => {
      if (!chatClient || !targetUserId || !authUser) {
        if (chatClient) setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const isGroup = targetUserId.startsWith("group_");
        const channelId = isGroup ? targetUserId : [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId,
          isGroup ? {} : { members: [authUser._id, targetUserId] }
        );
        await currChannel.watch();
        setChannel(currChannel);
      } catch (error) {
        toast.error("Could not load chat.");
      } finally {
        setLoading(false);
      }
    };
    initChannel();
  }, [chatClient, targetUserId, authUser]);

  const doSendMessageRequest = useCallback(async (channelObj, message) => {
    try {
      const res = await axiosInstance.post("/chat/send", {
        text: message.text,
        recipientId: targetUserId,
        channelId: channelObj.id
      });
      const enrichedMessage = {
        ...message,
        emotion: res.data.emotion,
        fontSize: fontSize,
        extra_data: { ...message.extra_data, fontSize: fontSize }
      };
      setFontSize(1);
      setShowShoutSlider(false);
      const result = await channelObj.sendMessage(enrichedMessage);

      // Push/Email notification (fire-and-forget, rate-limited on backend)
      if (targetUserId && !targetUserId.startsWith("group_") && targetUserId !== "system_announcement") {
        notifyMessage(targetUserId, message.text).catch(() => { });
      }

      return result;
    } catch (error) {
      return await channelObj.sendMessage({ ...message, fontSize, extra_data: { fontSize } });
    }
  }, [fontSize, targetUserId]);

  const handleVoiceSend = useCallback((data) => {
    if (channel) {
      channel.sendMessage({ ...data, isVoice: true, text: "Voice Message" });
      if (targetUserId && !targetUserId.startsWith("group_")) {
        notifyMessage(targetUserId, "🎤 Sent a voice message").catch(() => { });
      }
    }
  }, [channel, targetUserId]);

  const handleSmartReply = useCallback((text) => {
    if (channel) channel.sendMessage({ text, fontSize: 1 });
  }, [channel]);

  const MemoizedDateSeparator = useCallback(() => null, []);

  // Performance Optimization: Memoize the chat wrapper and message list separately
  const chatUI = useMemo(() => {
    if (!chatClient || !channel) return null;
    return (
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest} messageLimit={100}>
          <Window>
            <div className="flex flex-col h-full w-full relative z-10">
              <div className="flex-shrink-0 z-50 bg-base-100/90 backdrop-blur-md">
                <ChatHeader />
              </div>

              <div className="flex-1 relative flex flex-col min-h-0">
                <MessageList
                  Message={EmotionMessage}
                  DateSeparator={MemoizedDateSeparator}
                  virtualized
                  hideDeletedMessages
                  closeOnScroll
                />

                {targetUserId !== "system_announcement" && (
                  <div className="flex-shrink-0 px-2 z-20">
                    <SmartReply channel={channel} onSelect={handleSmartReply} />
                  </div>
                )}
              </div>

              <ChatInputArea
                targetUserId={targetUserId}
                fontSize={fontSize}
                setFontSize={setFontSize}
                showShoutSlider={showShoutSlider}
                setShowShoutSlider={setShowShoutSlider}
                handleSnapClick={handleSnapClick}
                handleVoiceSend={handleVoiceSend}
              />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          </Window>
        </Channel>
      </Chat>
    );
  }, [chatClient, channel, doSendMessageRequest, targetUserId, fontSize, showShoutSlider, handleSnapClick, handleVoiceSend, handleSmartReply, MemoizedDateSeparator]);

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div
      className="absolute inset-0 flex flex-col bg-base-100 overflow-hidden w-full"
      style={{
        height: `${viewportHeight}px`,
        top: window.visualViewport?.offsetTop || 0,
        contain: 'layout size style' // Optimized rendering hints
      }}
    >
      <div className="absolute inset-0 premium-chat-bg opacity-20 pointer-events-none z-0" />
      {chatUI}
      <Thread />
    </div>
  );
};

export default ChatPage;