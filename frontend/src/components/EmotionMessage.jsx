import React, { memo, useMemo } from "react";
import { MessageSimple, useMessageContext } from "stream-chat-react";
import { motion } from "framer-motion";
import SnapViewer from "./SnapViewer";

/**
 * Zyro — Premium Emotion Message Component
 * Optimized for High Performance & Dark Mode Readability.
 */

const AI_USERS = ["ai-user-id", "ai-friend-id", "ai-coach-id", "Aria", "Bond"];
const isAi = (id) => AI_USERS.includes(id);

const EmotionMessage = memo((props) => {
  const { message, isMyMessage } = useMessageContext();

  const extra = message?.extra_data || {};
  const isMyMsg = isMyMessage();
  const isAiMsg = !isMyMsg && isAi(message?.user?.id);

  // Handle media-only messages (Snaps/Voice)
  // These should not be wrapped in standard text bubbles to prevent layout shifts.
  if (extra.isSnap) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 5 }} 
        animate={{ opacity: 1, y: 0 }}
        className={`flex w-full ${isMyMsg ? "justify-end pr-2" : "justify-start pl-2"} my-2`}
      >
        <SnapViewer snap={extra} isMyMessage={isMyMsg} />
      </motion.div>
    );
  }

  // --- STANDARD TEXT MESSAGE ---
  // We avoid high-specificity wrappers that cause "Double Bubble" issues.
  // Instead, we pass dynamic classes down to the existing Stream Chat hierarchy.
  
  const additionalClasses = useMemo(() => {
    let classes = "";
    if (isAiMsg) classes += " ai-message-bubble ";
    if (extra.emotion && extra.emotion !== 'neutral') classes += ` emotion-${extra.emotion} `;
    return classes;
  }, [isAiMsg, extra.emotion]);

  const fontSizeStyle = useMemo(() => {
    const size = message?.fontSize || extra?.fontSize;
    if (size && size !== 1) {
       // Apply scalar variable down to stream chat
       return { '--shout-factor': size };
    }
    return {};
  }, [message?.fontSize, extra?.fontSize]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message-wrapper-bond ${isMyMsg ? "me" : "others"}`}
      style={fontSizeStyle}
    >
      <MessageSimple
        {...props}
        className={additionalClasses}
        // These are nullified because we use our proprietary Zyro Header/Footer logic
        MessageHeader={() => null}
        MessageTimestamp={() => null}
        MessageStatus={() => null}
        MessageFooter={() => null}
      />
    </motion.div>
  );
});

EmotionMessage.displayName = "EmotionMessage";

export default EmotionMessage;
