import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { axiosInstance } from "../lib/axios";
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
      return await channelObj.sendMessage(enrichedMessage);
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

                    <div className="flex flex-col gap-2">
                      {/* Action Toolbar - Now above the input for more typing space */}
                      <div className="flex items-center gap-2 px-1">
                        <div className="flex items-center gap-1.5 p-1 bg-base-200/30 rounded-2xl border border-base-300/30">
                          <button
                            onClick={() => setShowShoutSlider(!showShoutSlider)}
                            className={`btn btn-circle btn-xs size-8 border-none transition-all ${showShoutSlider ? 'bg-primary text-white shadow-md' : 'btn-ghost text-primary opacity-70 hover:opacity-100'}`}
                            title="Text size"
                          >
                            <span className="font-bold text-[10px]">AA</span>
                          </button>

                          <div className="w-[1px] h-4 bg-base-300/50 mx-0.5" />

                          <VoiceRecorder onSend={(data) => channel.sendMessage({ ...data, isVoice: true, text: "Voice Message" })} />

                          <button
                            onClick={handleSnapClick}
                            className="btn btn-circle btn-xs btn-ghost text-primary opacity-70 hover:opacity-100 size-8 transition-all"
                            title="Send snap"
                          >
                            <Camera className="size-4" />
                          </button>
                        </div>

                        {/* Optional: Add a placeholder for more tools if needed */}
                        <div className="flex-1" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0 bg-base-100/50 rounded-2xl border border-base-300/50 px-1 shadow-inner focus-within:border-primary/30 transition-all">
                          <MessageInput focus grow />
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