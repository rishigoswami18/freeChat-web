import React, { useMemo } from "react";
import PremiumSidebar from "./PremiumSidebar";
import PremiumNavbar from "./PremiumNavbar";
import MobileDrawer from "../MobileDrawer";
import BackgroundEffects from "./BackgroundEffects";
import FeedLayout from "./FeedLayout";
import FullscreenLayout from "./FullscreenLayout";
import SidebarLayout from "./SidebarLayout";
import Footer from "../Footer";

/**
 * AppLayout — The Global Social Platform Layout System.
 * Transitions between "feed", "fullscreen", and "sidebar" modes.
 * Uses a configuration object to manage granular visibility of UI elements.
 */
const AppLayout = ({
    children,
    mode = "feed", // feed | fullscreen | sidebar
    layoutConfig = {},
    sideNav = null // Only used in "sidebar" mode
}) => {
    // Default Configuration
    const config = useMemo(() => ({
        showSidebar: true,
        showNavbar: true,
        showFooter: true,
        showRightSidebar: mode === "feed",
        showBackground: true,
        ...layoutConfig
    }), [mode, layoutConfig]);

    // Choose the specific sub-layout based on mode
    const layoutMap = {
        feed: FeedLayout,
        fullscreen: FullscreenLayout,
        sidebar: SidebarLayout
    };
    const CurrentLayout = layoutMap[mode] || FeedLayout;

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-transparent transition-colors duration-300">
            {/* 1. Global Background (Optimized) */}
            {config.showBackground && <BackgroundEffects />}

            {/* 2. Navigation Utilities (Mobile & Global) */}
            <MobileDrawer />

            {/* 3. Global Sidebar (Fixed on Desktop) */}
            {config.showSidebar && (
                <div className="relative z-30">
                    <PremiumSidebar />
                </div>
            )}

            {/* 4. Adaptive Content Container */}
            <div className={`relative z-10 flex min-h-screen flex-col transition-[padding] duration-500 ease-in-out ${
                config.showSidebar ? "md:pl-[var(--zyro-sidebar-width,280px)]" : ""
            }`}>
                <CurrentLayout config={config} sideNav={sideNav}>
                    {children}
                </CurrentLayout>
                {config.showFooter && <Footer />}
            </div>
        </div>
    );
};

export default AppLayout;
