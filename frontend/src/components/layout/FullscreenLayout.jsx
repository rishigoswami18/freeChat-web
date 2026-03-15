import React from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

/**
 * FullscreenLayout
 * Designed for immersive experiences: Reels, Video Calls, and Chat rooms.
 * Removes sidebars and constraints to allow 100% viewport coverage.
 */
const FullscreenLayout = ({ children, config }) => {
    const { showNavbar = false } = config;

    return (
        <div className="flex-1 flex flex-col w-full h-screen overflow-hidden relative z-10">
            {showNavbar && <Navbar />}
            
            <motion.main
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex-1 w-full h-full relative"
            >
                {children}
            </motion.main>
        </div>
    );
};

export default FullscreenLayout;
