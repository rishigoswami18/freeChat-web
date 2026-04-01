import React from "react";
import { AnimatePresence, motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

const SkeletonBlock = ({ className = "" }) => (
  <div className={`zyro-shimmer rounded-2xl bg-slate-800/80 ${className}`} />
);

/**
 * Reusable Zyro card surface.
 * Built for fantasy arena cards, leaderboards, and high-density fintech panels.
 */
const Card = ({
  children,
  isLoading = false,
  title,
  index = 0,
  onClick,
  className = "",
  headerSlot = null,
}) => {
  const interactive = typeof onClick === "function";

  return (
    <motion.article
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      onClick={onClick}
      className={[
        "zyro-glass-card relative overflow-hidden rounded-[24px] text-slate-100",
        interactive ? "cursor-pointer" : "",
        className,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.08),_transparent_28%)]" />

      <AnimatePresence mode="wait" initial={false}>
        {isLoading ? (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative space-y-4 p-5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <SkeletonBlock className="h-12 w-12 rounded-2xl" />
              <div className="flex-1 space-y-2">
                <SkeletonBlock className="h-4 w-32" />
                <SkeletonBlock className="h-3 w-24" />
              </div>
            </div>
            <SkeletonBlock className="h-28 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <SkeletonBlock className="h-14 w-full" />
              <SkeletonBlock className="h-14 w-full" />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative p-5 sm:p-6"
          >
            {title || headerSlot ? (
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  {title ? <h3 className="text-lg font-semibold tracking-tight text-slate-50">{title}</h3> : null}
                </div>
                {headerSlot}
              </div>
            ) : null}
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default Card;
