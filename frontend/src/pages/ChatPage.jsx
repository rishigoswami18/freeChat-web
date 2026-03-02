import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import { emotionEmojiMap } from "../lib/emotion";
import { Camera, Loader2 } from "lucide-react";
import SnapViewer from "../components/SnapViewer";

import {
  Channel,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
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

  const handleSnapClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !channel) return;

    // Validate size
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

        const { url } = res.data;

        await channel.sendMessage({
          text: "Sent a snap",
          isSnap: true,
          mediaUrl: url,
          mediaType: type,
          isViewed: false,
        });

        toast.success("Snap sent! 📸");
      } catch (error) {
        console.error("Error sending snap:", error);
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
        const channelId = isGroup
          ? targetUserId
          : [authUser._id, targetUserId].sort().join("-");

        const currChannel = chatClient.channel("messaging", channelId,
          isGroup ? {} : { members: [authUser._id, targetUserId] }
        );

        await currChannel.watch();
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing channel:", error);
        toast.error("Could not load chat channel.");
      } finally {
        setLoading(false);
      }
    };

    initChannel();
  }, [chatClient, targetUserId, authUser]);

  const [fontSize, setFontSize] = useState(1);
  const [showShoutSlider, setShowShoutSlider] = useState(false);

  // Intercept message sends at Channel level for emotion detection and Allo features
  const doSendMessageRequest = async (channelObj, message) => {
    // If it's already a snap, skip emotion detection
    if (message.isSnap) {
      return await channelObj.sendMessage(message);
    }

    try {
      const res = await axiosInstance.post("/chat/send", {
        text: message.text,
      });

      const { emotion } = res.data;
      const emoji = emotionEmojiMap[emotion] || "😐";

      const enrichedMessage = {
        ...message,
        text: `${emoji} ${message.text}`,
        emotion: emotion,
        fontSize: fontSize, // Google Allo Whisper/Shout
        extra_data: {
          ...message.extra_data,
          fontSize: fontSize
        }
      };

      // Reset font size after sending
      setFontSize(1);
      setShowShoutSlider(false);

      return await channelObj.sendMessage(enrichedMessage);
    } catch (error) {
      console.error("Emotion detection failed, sending plain message:", error);
      const enrichedMessage = {
        ...message,
        fontSize: fontSize,
        extra_data: {
          ...message.extra_data,
          fontSize: fontSize
        }
      };
      setFontSize(1);
      setShowShoutSlider(false);
      return await channelObj.sendMessage(enrichedMessage);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-base-100 text-base-content relative overflow-hidden h-full">
      {/* Premium Wallpaper Overlay */}
      <div className="absolute inset-0 premium-chat-bg opacity-30 pointer-events-none" />

      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest}>
          <div className="flex-1 flex flex-col min-h-0 relative z-10 glass-panel border-0 rounded-none h-full max-w-full overflow-hidden">
            {/* Chat Header: Outside Window so it NEVER scrolls */}
            <div className="flex-shrink-0 z-[50] bg-base-100 border-b border-base-300/30">
              <ChatHeader />
            </div>

            {/* Window: Takes remaining space, has its own scroll */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <Window>
                <MessageList Message={EmotionMessage} />

                {/* Google Allo Smart Reply */}
                <div className="mx-auto w-full max-w-5xl px-2 sm:px-4">
                  <SmartReply
                    channel={channel}
                    onSelect={(text) => {
                      channel.sendMessage({ text, fontSize: 1 });
                    }}
                  />
                </div>

                {/* Premium Input Container */}
                <div className="safe-area-bottom chat-input-glass animate-in slide-in-from-bottom-5 duration-500">
                  <div className="flex flex-col gap-2 p-2 sm:p-3 max-w-5xl mx-auto">
                    {/* Whisper/Shout Slider - Google Allo Style */}
                    {showShoutSlider && (
                      <div className="flex items-center gap-4 bg-base-100/90 backdrop-blur-xl px-6 py-4 rounded-3xl border-2 border-primary/30 shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-primary/50 uppercase tracking-[0.2em]">Whisper</span>
                          <span className="text-xs opacity-50">i</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="2.5"
                          step="0.1"
                          value={fontSize}
                          onChange={(e) => setFontSize(parseFloat(e.target.value))}
                          className="range range-primary range-sm flex-1 accent-primary h-2 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Shout</span>
                          <span className="text-lg font-black text-primary">A</span>
                        </div>

                        {/* Live Scale Preview */}
                        <div className="divider divider-horizontal mx-1"></div>
                        <div
                          className="size-12 flex items-center justify-center font-black bg-primary text-primary-content rounded-2xl shadow-lg ring-4 ring-primary/20 transition-all duration-200 ease-out"
                          style={{ transform: `scale(${fontSize * 0.4 + 0.6})`, fontSize: `${fontSize}rem` }}
                        >
                          A
                        </div>
                      </div>
                    )}

                    <div className="flex items-end gap-2">
                      <div className="flex-1 min-w-0 bg-base-100/30 rounded-2xl border border-base-300/30 focus-within:border-primary/50 transition-all shadow-sm">
                        <MessageInput focus grow />
                      </div>

                      <div className="flex items-center gap-1.5 pb-1">
                        <div className="flex items-center gap-1 bg-base-300/30 p-1 rounded-full border border-base-300/20">
                          <button
                            onClick={() => setShowShoutSlider(!showShoutSlider)}
                            className={`btn btn-circle btn-sm btn-ghost transition-all flex items-center justify-center p-0 min-h-0 size-9 ${showShoutSlider ? 'bg-primary text-white' : 'text-primary hover:bg-primary/20'}`}
                            title="Whisper or Shout"
                          >
                            <span className="font-bold text-xs">A<span className="text-[10px]">A</span></span>
                          </button>

                          <VoiceRecorder
                            onSend={async (data) => {
                              if (!channel) return;
                              try {
                                await channel.sendMessage({
                                  text: "Sent a voice message",
                                  isVoice: true,
                                  mediaUrl: data.url,
                                  mediaType: "audio",
                                  duration: data.duration,
                                });
                              } catch (error) {
                                console.error("Error sending voice message:", error);
                                toast.error("Failed to send voice message");
                              }
                            }}
                          />

                          <button
                            onClick={handleSnapClick}
                            disabled={isUploading}
                            className="btn btn-circle btn-sm btn-ghost hover:bg-primary/20 text-primary transition-all flex items-center justify-center p-0 min-h-0 size-9 active:scale-90"
                            title="Send a Snap"
                          >
                            {isUploading ? (
                              <Loader2 className="size-4.5 animate-spin" />
                            ) : (
                              <Camera className="size-4.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                />
              </Window>
            </div>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;