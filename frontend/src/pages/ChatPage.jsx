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

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

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
        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = chatClient.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

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

  // Intercept message sends at Channel level for emotion detection
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
      };

      return await channelObj.sendMessage(enrichedMessage);
    } catch (error) {
      console.error("Emotion detection failed, sending plain message:", error);
      return await channelObj.sendMessage(message);
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[100dvh] flex flex-col bg-base-100 text-base-content relative">
      <Chat client={chatClient}>
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest}>
          <Window>
            <ChatHeader />
            <MessageList Message={EmotionMessage} />
            <div className="relative group/input">
              <MessageInput focus />
              <button
                onClick={handleSnapClick}
                disabled={isUploading}
                className="absolute right-14 bottom-3 btn btn-circle btn-sm btn-ghost hover:bg-primary/20 text-primary transition-all z-10"
                title="Send a Snap"
              >
                {isUploading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Camera className="size-5" />
                )}
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileChange}
              />
            </div>
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;