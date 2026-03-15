import React, { useMemo } from "react";
import Sidebar from "../Sidebar";
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
        <div className="min-h-screen bg-base-300 relative overflow-x-hidden transition-colors duration-500">
            {/* 1. Global Background (Optimized) */}
            {config.showBackground && <BackgroundEffects />}

            {/* 2. Navigation Utilities (Mobile & Global) */}
            <MobileDrawer />

            {/* 3. Global Sidebar (Fixed on Desktop) */}
            {config.showSidebar && (
                <div className="relative z-30">
                    <Sidebar />
                </div>
            )}

            {/* 4. Adaptive Content Container */}
            <div className={`flex flex-col min-h-screen relative z-10 transition-all duration-300 ${
                config.showSidebar ? "md:ml-[80px] xl:ml-[244px]" : ""
            }`}>
                <CurrentLayout config={config} sideNav={sideNav}>
                    {children}
                </CurrentLayout>

                {/* 5. Global Wide Footer */}
                {config.showFooter && <Footer />}
            </div>
        </div>
    );
};

export default AppLayout;
