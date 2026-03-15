import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import Navbar from "../Navbar";

const RightSidebar = lazy(() => import("../RightSidebar"));

/**
 * FeedLayout
 * Specifically designed for the main social feed, user profiles, and content-rich pages.
 * Supports a centered content column with an optional right sidebar.
 */
const FeedLayout = ({ children, config }) => {
    const { showNavbar = true, showFooter = true, showRightSidebar = true } = config;

    return (
        <section className={`flex-1 flex w-full max-w-[1000px] px-0 sm:px-4 xl:px-0 xl:gap-8 2xl:gap-12 justify-center mx-auto relative z-10`}>
            {/* Main Content Column */}
            <div className="flex flex-col w-full max-w-[630px]">
                {showNavbar && <Navbar />}
                
                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex-1 flex flex-col ${showNavbar ? "lg:pt-0" : ""} ${showFooter ? "pb-20 lg:pb-0" : ""}`}
                >
                    {children}
                </motion.main>
            </div>

            {/* Right Sidebar (Lazy Loaded high-resource component) */}
            {showRightSidebar && (
                <aside className="hidden lg:block relative z-20 w-[320px] shrink-0">
                    <Suspense fallback={<div className="w-full h-screen animate-pulse bg-base-200/50 rounded-2xl" />}>
                        <div className="sticky top-4">
                            <RightSidebar />
                        </div>
                    </Suspense>
                </aside>
            )}
        </section>
    );
};

export default FeedLayout;
