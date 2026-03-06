import { useEffect, useState, useRef } from "react";
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

  const handleSnapClick = () => fileInputRef.current?.click();

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

  const doSendMessageRequest = async (channelObj, message) => {
    try {
      const res = await axiosInstance.post("/chat/send", { text: message.text });
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
  };


  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="fixed inset-0 flex flex-col bg-base-100 overflow-hidden h-[100dvh] w-full">
      {/* Background Wallpaper */}
      <div className="absolute inset-0 premium-chat-bg opacity-20 pointer-events-none z-0" />

      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest}>
          <Window>
            <div className="flex flex-col h-full w-full relative z-10">

              {/* FIXED HEADER */}
              <div className="flex-shrink-0 z-50 bg-base-100/90 backdrop-blur-md">
                <ChatHeader />
              </div>

              {/* SCROLLABLE CONTENT area */}
              <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                <MessageList Message={EmotionMessage} DateSeparator={() => null} />

                {/* Smart replies float above input */}
                {targetUserId !== "system_announcement" && (
                  <div className="flex-shrink-0 px-2 z-20">
                    <SmartReply channel={channel} onSelect={(text) => channel.sendMessage({ text, fontSize: 1 })} />
                  </div>
                )}
              </div>

              {/* FIXED INPUT AREA */}
              <div className="flex-shrink-0 z-50 chat-input-glass pb-safe">
                {targetUserId === "system_announcement" ? (
                  <div className="p-4 text-center">
                    <p className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic">
                      Official Announcement (Read-Only)
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-2 sm:p-3 max-w-5xl mx-auto w-full">
                    {showShoutSlider && (
                      <div className="flex items-center gap-4 bg-base-100/95 backdrop-blur-xl px-4 py-3 rounded-2xl border border-primary/20 shadow-2xl mb-2">
                        <input
                          type="range" min="0.5" max="2.5" step="0.1" value={fontSize}
                          onChange={(e) => setFontSize(parseFloat(e.target.value))}
                          className="range range-primary range-xs flex-1"
                        />
                        <span className="font-bold text-primary text-xs">{(fontSize * 100).toFixed(0)}%</span>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {/* Integrated Action Toolbar */}
                      <div className="flex items-center gap-4 px-2.5 pb-0.5">
                        <div className="flex items-center gap-3 opacity-40 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setShowShoutSlider(!showShoutSlider)}
                            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter ${showShoutSlider ? 'text-primary opacity-100' : ''}`}
                          >
                            <span className="text-xs">AA</span> Size
                          </button>
                          <button
                            onClick={handleSnapClick}
                            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter hover:text-primary transition-colors"
                          >
                            <Camera className="size-3" /> Snap
                          </button>
                        </div>
                        <div className="flex-1 h-[1px] bg-base-content/5" />
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-base-200/60 rounded-[28px] border border-base-content/5 shadow-inner focus-within:bg-base-100 focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                          <MessageInput focus grow />
                        </div>
                        <div className="flex-shrink-0">
                          <VoiceRecorder onSend={(data) => {
                            channel.sendMessage({ ...data, isVoice: true, text: "Voice Message" });
                            if (targetUserId && !targetUserId.startsWith("group_")) {
                              notifyMessage(targetUserId, "🎤 Sent a voice message").catch(() => { });
                            }
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
          </Window>
        </Channel>
      </Chat>
      <Thread />
    </div>
  );
};

export default ChatPage;