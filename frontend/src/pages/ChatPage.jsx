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

import ChatLoader from "../components/ChatLoader";
import ChatHeader from "../components/ChatHeader";
import EmotionMessage from "../components/EmotionMessage";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  const { authUser } = useAuthUser();

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;

      try {
        console.log("Initializing stream chat client...");

        const client = StreamChat.getInstance(STREAM_API_KEY);

        if (client.userID === authUser._id) {
          // already connected
        } else {
          if (client.userID) await client.disconnectUser();
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
            },
            tokenData.token
          );
        }

        const channelId = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

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
    <div className="h-[85vh] lg:h-[100dvh] pb-4 flex flex-col mb-16 lg:mb-0">
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