import React from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

/**
 * SidebarLayout
 * Designed for pages with local side-navigation (e.g., Settings, Admin Panel).
 * Features a fixed-width local navigation column and an elastic content area.
 */
const SidebarLayout = ({ children, config, sideNav }) => {
    const { showNavbar = true, showFooter = true } = config;

    return (
        <div className="flex-1 flex flex-col md:flex-row w-full max-w-[1200px] mx-auto relative z-10 px-4 xl:px-0">
            {/* Local Side Navigation */}
            <aside className="w-full md:w-[280px] shrink-0 md:sticky md:top-4 h-fit py-4">
                {sideNav}
            </aside>

            {/* Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 md:pl-8 lg:pl-12`}>
                {showNavbar && <Navbar />}

                <motion.main
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex-1 flex flex-col ${showNavbar ? "lg:pt-0" : ""} ${showFooter ? "pb-20 lg:pb-0" : ""}`}
                >
                    {children}
                </motion.main>
            </div>
        </div>
    );
};

export default SidebarLayout;
