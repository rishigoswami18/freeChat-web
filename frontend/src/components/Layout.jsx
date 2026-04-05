import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import AppLayout from "./layout/AppLayout";

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 6,
    transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] },
  },
};

/**
 * FreeChat Shell Layout
 * Professional route-aware wrapper with elegant page transitions.
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

  const legacyConfig = {
    showSidebar,
    showRightSidebar: showRightSidebar !== undefined ? showRightSidebar : showSidebar,
    showFooter,
    showNavbar,
    showBackground: false,
  };

  return (
    <div className="zyro-shell-bg min-h-screen text-slate-100">
      {/* Ambient background effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.06),_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(168,85,247,0.04),_transparent_50%)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`${layoutMode}-${location.pathname}`}
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
