import { useState } from "react";
import { MessageSimple, useMessageContext } from "stream-chat-react";
import { Languages, Loader2, Star } from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import { translateText } from "../lib/api";
import toast from "react-hot-toast";

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

  const { authUser } = useAuthUser();
  const isPremium = authUser?.isMember || authUser?.role === "admin";

  const [translatedText, setTranslatedText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  const emotion =
    message?.emotion ||
    message?.extra_data?.emotion ||
    message?.custom?.emotion;

  const handleTranslate = async () => {
    if (!isPremium) {
      toast.error("Translation is a premium feature. Please upgrade!");
      return;
    }

    if (translatedText) {
      setTranslatedText(""); // Toggle off
      return;
    }

    setIsTranslating(true);
    try {
      const targetLang = authUser?.nativeLanguage || "en";
      const res = await translateText(message.text, targetLang);
      setTranslatedText(res.translatedText);
    } catch (err) {
      toast.error("Translation failed. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="stream-message-wrapper relative group">
      <MessageSimple {...props} />

      <div className={`flex flex-col ${isMyMessage ? "items-end mr-12" : "items-start ml-12"} -mt-2 mb-1`}>
        {/* Emotion Badge */}
        {emotion && emotionColors[emotion] && (
          <div className="z-10 mb-1">
            <span
              className={`inline-block text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md border ${emotionColors[emotion]}`}
            >
              {emotion}
            </span>
          </div>
        )}

        {/* Translation Link/Result */}
        {message.text && (
          <div className="flex flex-col items-start gap-1">
            {!translatedText ? (
              <button
                onClick={handleTranslate}
                className="text-[10px] flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity text-primary font-medium"
                disabled={isTranslating}
              >
                {isTranslating ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <>
                    <Languages className="size-3" />
                    Translate to {authUser?.nativeLanguage || "English"}
                    {!isPremium && <Star className="size-2 text-warning fill-warning" />}
                  </>
                )}
              </button>
            ) : (
              <div className="bg-base-200/50 p-2 rounded-lg border border-base-300 max-w-[250px] animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-[11px] italic text-base-content/80 leading-tight">
                  <Languages className="size-3 inline mr-1 mb-0.5" />
                  {translatedText}
                </p>
                <button
                  onClick={() => setTranslatedText("")}
                  className="text-[9px] text-primary hover:underline mt-1"
                >
                  Hide Original
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmotionMessage;