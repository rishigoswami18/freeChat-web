import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import { notifyMessage } from "../lib/api";
import { Camera, Loader2, Smile, Image as ImageIcon, Sticker } from "lucide-react";

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
import InboxPage from "./InboxPage";

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
    <div className="flex-shrink-0 z-50 bg-black backdrop-blur-md pb-safe">
      <div className="flex flex-col gap-2 p-2 sm:p-3 max-w-4xl mx-auto w-full">
        {showShoutSlider && (
          <div className="flex items-center gap-4 bg-white/5 px-4 py-3 rounded-2xl shadow-xl mb-1 border border-white/10">
            <input
              type="range" min="0.5" max="2.5" step="0.1" value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
            />
            <span className="font-medium text-white text-[13px]">{(fontSize * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="flex w-full items-end justify-center px-1">
          <div className="instagram-input-container flex w-full">
            
            <button className="p-2.5 px-3 text-white/90 hover:text-white transition-colors shrink-0 outline-none mb-[2px]" title="Emoji">
              <Smile className="w-[26px] h-[26px]" strokeWidth={1.5} />
            </button>
            
            <div className="flex-1 min-w-0 min-h-[44px]">
               <MessageInput focus grow />
            </div>

            <div className="custom-action-icons flex items-center pr-2 gap-1.5 shrink-0 text-white/90 mb-[2px] z-10 transition-all duration-200">
               <div className="hover:text-white cursor-pointer transition-colors p-[6px] action-voice">
                 <VoiceRecorder onSend={handleVoiceSend} />
               </div>
               <button onClick={handleSnapClick} className="hover:text-white transition-colors p-[6px]" title="Image">
                 <ImageIcon className="w-[26px] h-[26px]" strokeWidth={1.5} />
               </button>
               <button className="hover:text-white transition-colors p-[6px]" title="Sticker">
                 <Sticker className="w-[26px] h-[26px]" strokeWidth={1.5} />
               </button>
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
  const [fontSize, setFontSize] = useState(1);
  const [showShoutSlider, setShowShoutSlider] = useState(false);
  const [isThinking, setIsThinking] = useState(false); // Added for AI delay
  const scrollRef = useRef(null);
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

        // Add timeout to watch to prevent infinite hang
        const watchPromise = currChannel.watch();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Stream Timeout")), 10000)
        );

        await Promise.race([watchPromise, timeoutPromise]);
        setChannel(currChannel);
      } catch (error) {
        console.error("Chat Init Error:", error);
        toast.error(error.message === "Stream Timeout" ? "Chat connecting slow..." : "Could not load chat.");
      } finally {
        setLoading(false);
      }
    };
    initChannel();
  }, [chatClient, targetUserId, authUser]);

  const doSendMessageRequest = useCallback(async (channelObj, message) => {
    try {
      if (targetUserId === "ai-user-id" || targetUserId === "ai-friend-id") {
        setIsThinking(true);
        // Step 1: Send user message to Stream first to guarantee correct order
        const result = await channelObj.sendMessage({
          ...message,
          fontSize: fontSize,
          extra_data: { ...message.extra_data, fontSize: fontSize }
        });

        // Reset UI state immediately
        setFontSize(1);
        setShowShoutSlider(false);

        // Step 2: Trigger AI response generation on backend
        await axiosInstance.post("/chat/send", {
          text: message.text,
          recipientId: targetUserId,
          channelId: channelObj.id
        });

        setIsThinking(false);
        return result;
      }

      // Standard flow for Human/Group chats
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

      if (targetUserId && !targetUserId.startsWith("group_") && targetUserId !== "system_announcement") {
        notifyMessage(targetUserId, message.text).catch(() => { });
      }

      return result;
    } catch (error) {
      setIsThinking(false);
      return await channelObj.sendMessage({ ...message, extra_data: { fontSize } });
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

  const MemoizedDateSeparator = useCallback(() => null, []);

  // Performance Optimization: Memoize the chat wrapper and message list separately
  const chatUI = useMemo(() => {
    if (!chatClient || !channel) return null;
    return (
      <Chat client={chatClient} theme="messaging dark">
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest} messageLimit={100}>
          <Window>
            <div className="flex flex-col h-full w-full relative z-10">
              <div className="flex-shrink-0 z-50 bg-black backdrop-blur-md border-b border-white/5">
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

                {isThinking && (
                  <div className="flex items-center gap-2 px-4 py-2 mb-4 stagger-item">
                    <div className="avatar size-7 sm:size-8">
                      <div className="bg-base-300 rounded-full flex items-center justify-center border border-primary/10">
                        <img 
                          src={targetUserId === "ai-friend-id" ? (authUser?.aiFriendPic || "/ai-bestfriend.png") : (authUser?.aiPartnerPic || "/ai-girlfriend.png")} 
                          alt="AI" 
                          className="rounded-full" 
                        />
                      </div>
                    </div>
                    <div className="bg-base-200/80 backdrop-blur-md px-4 py-3 rounded-[20px] rounded-tl-none flex items-center gap-1.5 shadow-sm border border-base-content/5">
                      <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <div className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <div className="size-1.5 bg-primary/40 rounded-full animate-bounce" />
                    </div>
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
  }, [chatClient, channel, doSendMessageRequest, targetUserId, fontSize, showShoutSlider, handleSnapClick, handleVoiceSend, MemoizedDateSeparator]);

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div
      className="absolute inset-0 flex bg-black text-white font-outfit overflow-hidden w-full lg:max-w-none sm:border-x border-white/10"
      style={{
        height: `${viewportHeight}px`,
        top: window.visualViewport?.offsetTop || 0,
        contain: 'layout size style'
      }}
    >
      {/* Inbox Panel (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden lg:block shrink-0 h-full border-r border-white/10 w-[350px]">
         <InboxPage isSideNav={true} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative w-full h-full min-w-0 bg-black">
        {/* Optional subtle noise / gradient for a premium black look, mostly solid black */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0a0a0a] pointer-events-none z-0" />
        {chatUI}
        <Thread />
      </div>
    </div>
  );
};

export default ChatPage;