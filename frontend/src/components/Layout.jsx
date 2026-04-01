import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Orbit, Trophy } from "lucide-react";
import AppLayout from "./layout/AppLayout";

const KINETIC_PREFIXES = ["/games", "/game", "/prize-vault", "/redeem-cash"];

const shellModes = {
  nexus: {
    label: "Nexus",
    caption: "Social",
    icon: Orbit,
    accent: "rgba(249, 115, 22, 0.14)",
    border: "rgba(249, 115, 22, 0.26)",
    iconClass: "text-orange-400",
  },
  kinetic: {
    label: "Kinetic",
    caption: "Fantasy",
    icon: Trophy,
    accent: "rgba(249, 115, 22, 0.2)",
    border: "rgba(249, 115, 22, 0.34)",
    iconClass: "text-orange-300",
  },
};

const pageTransition = {
  initial: { opacity: 0, y: 12, scale: 0.99 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 10,
    scale: 0.995,
    transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * Zyro Shell Layout
 * Route-aware wrapper that applies the professional fintech/gaming shell and
 * morphs between Nexus (social) and Kinetic (fantasy) contexts.
 */
const Layout = ({
  children,
  showSidebar = false,
  showRightSidebar,
  showFooter = true,
  showNavbar = true,
  isFluid = false,
}) => {
  const location = useLocation();

  const layoutMode = isFluid || !showSidebar ? "fullscreen" : "feed";
  const shellModeKey = useMemo(
    () =>
      KINETIC_PREFIXES.some((prefix) => location.pathname.startsWith(prefix))
        ? "kinetic"
        : "nexus",
    [location.pathname]
  );
  const shellMode = shellModes[shellModeKey];
  const ShellIcon = shellMode.icon;

  const legacyConfig = {
    showSidebar,
    showRightSidebar: showRightSidebar !== undefined ? showRightSidebar : showSidebar,
    showFooter,
    showNavbar,
    showBackground: false,
  };

  return (
    <div className="zyro-shell-bg min-h-screen text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(249,115,22,0.09),_transparent_24%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/25 to-transparent" />
      </div>

      <div className="pointer-events-none fixed right-4 top-4 z-40 hidden md:block">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
          className="flex items-center gap-3 rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] text-slate-200 zyro-soft-shadow"
          style={{
            backgroundColor: shellMode.accent,
            borderColor: shellMode.border,
          }}
        >
          <ShellIcon className={`size-4 ${shellMode.iconClass}`} strokeWidth={2} />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-100">{shellMode.label}</span>
            <span className="text-slate-400">{shellMode.caption}</span>
          </div>
        </motion.div>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${layoutMode}-${shellModeKey}-${location.pathname}`}
          variants={pageTransition}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative min-h-screen"
        >
          <AppLayout mode={layoutMode} layoutConfig={legacyConfig}>
            {children}
          </AppLayout>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Layout;
