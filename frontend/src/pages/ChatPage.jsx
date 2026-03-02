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

  useEffect(() => {
    // Lock body scroll when entering chat page using a reliable class
    document.body.classList.add("is-chat-active");

    return () => {
      // Re-enable body scroll when leaving chat page
      document.body.classList.remove("is-chat-active");
    };
  }, []);

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

              {/* SCROLLABLE CONTENT */}
              <div className="flex-1 overflow-hidden relative flex flex-col">
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  <MessageList Message={EmotionMessage} DateSeparator={() => null} />
                </div>

                {/* Smart replies float above input but move with scroll if needed, 
                    actually better to keep them just above the input pinned area */}
                <div className="flex-shrink-0 px-2">
                  <SmartReply channel={channel} onSelect={(text) => channel.sendMessage({ text, fontSize: 1 })} />
                </div>
              </div>

              {/* FIXED INPUT AREA */}
              <div className="flex-shrink-0 z-50 chat-input-glass pb-safe">
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

                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0 bg-base-100/50 rounded-2xl border border-base-300/50 px-1 shadow-inner">
                      <MessageInput focus grow />
                    </div>
                    <div className="flex items-center gap-1 bg-primary/5 p-1 rounded-full border border-primary/10">
                      <button onClick={() => setShowShoutSlider(!showShoutSlider)} className={`btn btn-circle btn-sm size-9 border-none ${showShoutSlider ? 'bg-primary text-white' : 'btn-ghost text-primary'}`}>
                        AA
                      </button>
                      <VoiceRecorder onSend={(data) => channel.sendMessage({ ...data, isVoice: true, text: "Voice Message" })} />
                      <button onClick={handleSnapClick} className="btn btn-circle btn-sm btn-ghost text-primary size-9">
                        <Camera className="size-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
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