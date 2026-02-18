import { MessageSimple, useMessageContext } from "stream-chat-react";

const emotionColors = {
  joy: "bg-yellow-200 text-yellow-900 border-yellow-400",
  love: "bg-pink-200 text-pink-900 border-pink-400",
  sadness: "bg-blue-200 text-blue-900 border-blue-400",
  anger: "bg-red-200 text-red-900 border-red-400",
  fear: "bg-purple-200 text-purple-900 border-purple-400",
  surprise: "bg-orange-200 text-orange-900 border-orange-400",
  neutral: "bg-gray-200 text-gray-900 border-gray-400",
};

const EmotionMessage = (props) => {
  const messageContext = useMessageContext();
  const message = messageContext?.message || props.message;
  const isMyMessage = messageContext?.isMyMessage
    ? messageContext.isMyMessage()
    : props.isMyMessage
      ? props.isMyMessage()
      : false;

  const emotion =
    message?.emotion ||
    message?.extra_data?.emotion ||
    message?.custom?.emotion;

  return (
    <div className="stream-message-wrapper relative">
      <MessageSimple {...props} />

      {emotion && emotionColors[emotion] && (
        <div
          className={`text-xs ${isMyMessage ? "text-right mr-12" : "text-left ml-12"
            } -mt-2 mb-1 relative z-10`}
        >
          <span
            className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${emotionColors[emotion]}`}
          >
            {emotion}
          </span>
        </div>
      )}
    </div>
  );
};

export default EmotionMessage;