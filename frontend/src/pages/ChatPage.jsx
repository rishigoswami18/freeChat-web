import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
import { notifyMessage } from "../lib/api";
import { Camera, Loader2, Image as ImageIcon, Type } from "lucide-react";

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
import EmpathyRadarView from "../components/EmpathyRadarView";

// --- Utility Helpers ---
const isAiUser = (id) => ["ai-user-id", "ai-friend-id", "ai-coach-id"].includes(id);
const isGroupChat = (id) => id?.startsWith("group_");

// --- Components ---
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
    <div className="flex-shrink-0 z-50 bg-[#020617] pb-safe">
      <div className="flex flex-col gap-2 p-2 sm:p-4 max-w-4xl mx-auto w-full">
        {showShoutSlider && (
          <div className="flex items-center gap-4 bg-base-200/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg mb-1 border border-base-content/10 transition-all animate-in fade-in slide-in-from-bottom-2">
            <Type className="size-4 opacity-50" />
            <input
              type="range" min="0.5" max="2.5" step="0.1" value={fontSize}
              onChange={(e) => setFontSize(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-base-content/10 hover:bg-base-content/20 rounded-lg appearance-none cursor-pointer accent-info"
            />
            <Type className="size-6 opacity-80" />
            <span className="font-bold text-[12px] opacity-60 text-base-content w-10 text-right">{(fontSize * 100).toFixed(0)}%</span>
          </div>
        )}

        <div className="flex w-full items-end gap-2 px-1 group/input">
          {/* Instagram-style outside camera button */}
          <button 
            onClick={handleSnapClick} 
            className="p-3 mb-0.5 bg-primary text-white rounded-2xl hover:scale-105 transition-all active:scale-95 shrink-0 shadow-lg shadow-primary/20 group-has-[textarea:not(:placeholder-shown)]/input:hidden" 
            title="Camera"
          >
            <Camera className="size-[20px]" strokeWidth={2.5} />
          </button>
          
          {/* Main Input Pill */}
          <div className="flex-1 flex items-end bg-white/5 border border-white/5 rounded-[28px] min-h-[52px] transition-all has-[:focus]:bg-white/[0.08] has-[:focus]:border-primary/40 shadow-sm px-2 py-1.5 backdrop-blur-3xl">
            
            <div className="flex-1 min-w-0 pl-3 py-1 flex items-center w-full max-w-full overflow-hidden text-white">
               <MessageInput 
                 focus 
                 grow 
                 placeholder="Message..." 
                 additionalTextareaProps={{
                   placeholder: "Message...",
                   className: "w-full focus:outline-none !bg-transparent text-[15px] border-none",
                   rows: 1
                 }}
               />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-0.5 shrink-0 text-base-content/60 pb-0.5 pr-1 transition-all group-has-[textarea:not(:placeholder-shown)]/input:hidden">
               <div className="hover:text-base-content cursor-pointer transition-colors p-[6px] action-voice rounded-full hover:bg-base-content/5">
                 <VoiceRecorder onSend={handleVoiceSend} />
               </div>
               <button onClick={handleSnapClick} className="hover:text-base-content transition-colors p-[6px] rounded-full hover:bg-base-content/5 hidden sm:flex" title="Gallery">
                 <ImageIcon className="size-5" strokeWidth={1.5} />
               </button>
               {/* Replace Sticker with Shout/Whisper text scaler toggle */}
               <button 
                 onClick={() => setShowShoutSlider(!showShoutSlider)}
                 className={`transition-colors p-[6px] rounded-full hover:bg-base-content/5 ${showShoutSlider ? 'text-info bg-info/10' : 'hover:text-base-content'}`} 
                 title="Shout / Whisper"
               >
                 <Type className="size-5" strokeWidth={showShoutSlider ? 2.5 : 1.5} />
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ChatInputArea.displayName = "ChatInputArea";

// Extracted AI Feedback UI to prevent inline JSX allocation
const AiThinkingIndicator = memo(({ targetUserId, authUser }) => {
  const avatarSrc = useMemo(() => {
    if (targetUserId === "ai-coach-id") return "https://res.cloudinary.com/dqvu0bjyp/image/upload/v1773500620/dr_bond_avatar.png";
    if (targetUserId === "ai-friend-id") return authUser?.aiFriendPic || "/ai-bestfriend.png";
    return authUser?.aiPartnerPic || "/ai-girlfriend.png";
  }, [targetUserId, authUser]);

  return (
    <div className="flex items-center gap-2 px-6 py-2 mb-4 stagger-item">
      <div className="size-8 rounded-full overflow-hidden shrink-0">
        <img src={avatarSrc} alt="AI" className="size-full object-cover" />
      </div>
      <div className="bg-white/5 px-5 py-3.5 rounded-[24px] rounded-tl-none flex items-center gap-1.5 border border-white/10 backdrop-blur-md">
        <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="size-1.5 bg-primary rounded-full animate-bounce" />
      </div>
    </div>
  );
});
AiThinkingIndicator.displayName = "AiThinkingIndicator";

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const chatClient = useChatClient();
  const { authUser } = useAuthUser();
  
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(!chatClient);
  const [fontSize, setFontSize] = useState(1);
  const [showShoutSlider, setShowShoutSlider] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight || 800);

  const fileInputRef = useRef(null);

  // Optimized viewport handling for smooth mobile typing
  useEffect(() => {
    if (!window.visualViewport) return;

    let timeoutId;
    const handleViewportChange = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setViewportHeight(window.visualViewport.height);
        if (window.visualViewport.height < window.innerHeight) {
          window.scrollTo(0, 0);
        }
      }, 33);
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

  const handleSnapClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Channel Initialization with Mount Guard
  useEffect(() => {
    let isMounted = true;

    const initChannel = async () => {
      if (!chatClient || !targetUserId || !authUser?._id) {
        if (chatClient && isMounted) setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const isGroup = isGroupChat(targetUserId);
        const channelId = isGroup ? targetUserId : [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId,
          isGroup ? {} : { members: [authUser._id, targetUserId] }
        );

        const watchPromise = currChannel.watch();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Stream Timeout")), 10000)
        );

        await Promise.race([watchPromise, timeoutPromise]);
        
        if (isMounted) setChannel(currChannel);
      } catch (error) {
        console.error("Chat Init Error:", error);
        toast.error(error.message === "Stream Timeout" ? "Chat connecting slow..." : "Could not load chat.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    initChannel();

    return () => { isMounted = false; };
  }, [chatClient, targetUserId, authUser?._id]);

  // Message Sender (Memoized logic)
  const doSendMessageRequest = useCallback(async (chanId, message) => {
    if (!channel) return;
    const isAi = isAiUser(targetUserId);
    
    try {
      const enrichedMessage = {
        ...message,
        fontSize: fontSize,
        extra_data: { ...message.extra_data, fontSize: fontSize }
      };

      if (isAi) {
        setIsThinking(true);
        const result = await channel.sendMessage(enrichedMessage);

        await axiosInstance.post("/chat/send", {
          messageId: result.message.id,
          text: result.message.text,
          recipientId: targetUserId,
          channelId: channel.id,
          attachments: result.message.attachments,
          isVoice: result.message.isVoice,
          voiceUrl: result.message.url || result.message.voiceUrl,
          isSnap: result.message.isSnap,
          mediaUrl: result.message.mediaUrl,
          mediaType: result.message.mediaType
        });

        setFontSize(1);
        setShowShoutSlider(false);
        setIsThinking(false);
        return result;
      }

      // Standard Human Chat
      const res = await axiosInstance.post("/chat/send", {
        text: message.text,
        recipientId: targetUserId,
        channelId: channel.id
      });

      enrichedMessage.emotion = res.data?.emotion || 'neutral';
      setFontSize(1);
      setShowShoutSlider(false);
      
      const result = await channel.sendMessage(enrichedMessage);

      // Notification logic
      if (!isGroupChat(targetUserId) && targetUserId !== "system_announcement") {
        notifyMessage(targetUserId, message.text).catch(console.error);
      }

      return result;
    } catch (error) {
      console.error("Error sending message:", error);
      setIsThinking(false);
      // Fallback local send if backend fails
      return await channel.sendMessage({ ...message, extra_data: { fontSize } });
    }
  }, [channel, targetUserId, fontSize]);

  const handleVoiceSend = useCallback(async (data) => {
    if (!channel) return;
    
    try {
      const isAi = isAiUser(targetUserId);
      if (isAi) setIsThinking(true);

      const messageObj = { ...data, type: "regular", text: "Voice Message" };
      await channel.sendMessage(messageObj);

      if (isAi) {
        await axiosInstance.post("/chat/send", {
          text: "Voice Message",
          recipientId: targetUserId,
          channelId: channel.id,
          isVoice: true,
          voiceUrl: data.url
        });
        setIsThinking(false);
      } else if (!isGroupChat(targetUserId)) {
        notifyMessage(targetUserId, "🎤 Sent a voice message").catch(console.error);
      }
    } catch (error) {
      console.error("Voice send error:", error);
      setIsThinking(false);
    }
  }, [channel, targetUserId]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;
    
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Snap must be under 20MB");
      return;
    }

    const isAi = isAiUser(targetUserId);
    const reader = new FileReader();
    
    reader.onloadend = async () => {
      try {
        if(isAi) setIsThinking(true);
        const type = file.type.startsWith("video") ? "video" : "image";
        
        // Base64 upload to server (Memory handled per file context)
        const res = await axiosInstance.post("/chat/upload-media", {
          media: reader.result,
          mediaType: type,
        });

        const messageObj = {
          text: "Sent a snap",
          type: "regular",
          attachments: [{
            type: type,
            thumb_url: res.data.url,
            asset_url: res.data.url
          }],
          mediaUrl: res.data.url,
          mediaType: type,
          isViewed: false,
          isSnap: true
        };

        await channel.sendMessage(messageObj);

        if (isAi) {
          await axiosInstance.post("/chat/send", {
            text: "Sent a snap",
            recipientId: targetUserId,
            channelId: channel.id,
            isSnap: true,
            mediaUrl: res.data.url,
            mediaType: type
          });
          setIsThinking(false);
        } else if (!isGroupChat(targetUserId)) {
          notifyMessage(targetUserId, `📸 Sent a ${type} snap`).catch(console.error);
        }

        toast.success("Snap sent! 📸");
      } catch (error) {
        console.error("Snap send error:", error);
        setIsThinking(false);
        toast.error("Failed to send snap");
      }
      
      // Cleanup ref
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  }, [channel, targetUserId]);

  // Static components to avoid unnecessary re-renders in MessageList
  const MemoizedDateSeparator = useCallback(() => null, []);

  const chatUI = useMemo(() => {
    if (!chatClient || !channel) return null;
    return (
      <Chat client={chatClient} theme="messaging">
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest} messageLimit={100}>
          <Window>
            <div className="flex flex-col h-full w-full relative z-10">
              <div className="flex-shrink-0 z-50 bg-base-100 border-b border-base-content/5">
                <ChatHeader />
              </div>

              <div className="flex-1 relative flex flex-col min-h-0">
                {/* AI Empathy Radar — Floating Intelligence Layer */}
                {!isGroupChat(targetUserId) && targetUserId !== "system_announcement" && (
                  <div className="absolute top-2 left-0 right-0 z-30 px-4 pointer-events-none">
                    <div className="max-w-lg mx-auto pointer-events-auto">
                      <EmpathyRadarView channelId={channel.id} />
                    </div>
                  </div>
                )}

                <MessageList
                  Message={EmotionMessage}
                  DateSeparator={MemoizedDateSeparator}
                  virtualized
                  hideDeletedMessages
                  closeOnScroll
                />

                {isThinking && <AiThinkingIndicator targetUserId={targetUserId} authUser={authUser} />}
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
              <Thread />
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          </Window>
        </Channel>
      </Chat>
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatClient, channel, doSendMessageRequest, targetUserId, fontSize, showShoutSlider, handleSnapClick, handleVoiceSend, handleFileChange, MemoizedDateSeparator, isThinking, authUser?._id]);

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div
      className="absolute inset-0 flex bg-[#020617] text-white font-outfit overflow-hidden w-full lg:max-w-none sm:border-x border-white/5"
      style={{
        height: `${viewportHeight}px`,
        top: window.visualViewport?.offsetTop || 0,
        contain: 'layout size style'
      }}
    >
      <div className="hidden lg:block shrink-0 h-full border-r border-white/5 w-[380px] bg-[#020617]/50">
         <InboxPage isSideNav={true} />
      </div>

      <div className="flex-1 flex flex-col relative w-full h-full min-w-0 bg-[#020617]">
        {chatUI}
      </div>
    </div>
  );
};

export default ChatPage;
