import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { axiosInstance } from "../lib/axios";
import { emotionEmojiMap } from "../lib/emotion";

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
    <div className="h-[100dvh] flex flex-col">
      <Chat client={chatClient}>
        <Channel channel={channel} doSendMessageRequest={doSendMessageRequest}>
          <Window>
            <ChatHeader />
            <MessageList Message={EmotionMessage} />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};
export default ChatPage;