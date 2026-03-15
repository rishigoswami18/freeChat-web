import React from "react";
import AppLayout from "./layout/AppLayout";

/**
 * LEGACY WRAPPER: Matches old Layout.jsx signature to prevent breaking existing code
 * while routing all logic through the new high-performance Layout System.
 */
const Layout = ({ 
    children, 
    showSidebar = false, 
    showRightSidebar, 
    showFooter = true, 
    showNavbar = true, 
    isFluid = false 
}) => {
    // Map old props to new Layout Configuration
    const legacyConfig = {
        showSidebar: showSidebar,
        showRightSidebar: showRightSidebar !== undefined ? showRightSidebar : showSidebar,
        showFooter: showFooter,
        showNavbar: showNavbar,
        showBackground: true
    };

    // Determine mode based on fluid/sidebar status
    // If it's fluid or sidebars are disabled, it's likely a "fullscreen-style" view
    const mode = (isFluid || !showSidebar) ? "fullscreen" : "feed";

    return (
        <AppLayout mode={mode} layoutConfig={legacyConfig}>
            {children}
        </AppLayout>
    );
};

export default Layout;