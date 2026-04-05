import React, { lazy, Suspense } from "react";
import { motion } from "framer-motion";
import PremiumNavbar from "./PremiumNavbar";

const RightSidebar = lazy(() => import("../RightSidebar"));

/**
 * FeedLayout
 * Specifically designed for the main social feed, user profiles, and content-rich pages.
 * Supports a centered content column with an optional right sidebar.
 */
const FeedLayout = ({ children, config }) => {
    const { showNavbar = true, showFooter = true, showRightSidebar = true } = config;

    return (
        <section className={`flex-1 flex w-full max-w-[1440px] px-0 sm:px-4 xl:px-0 xl:gap-8 2xl:gap-12 justify-center mx-auto relative z-10`}>
            {/* Main Content Column */}
            <div className={`flex flex-col w-full ${showRightSidebar ? "max-w-[630px]" : "max-w-[840px]"} relative transition-all duration-500`}>
                {showNavbar && <PremiumNavbar />}
                
                <motion.main
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className={`flex-1 flex flex-col ${showNavbar ? "pt-4" : ""} ${showFooter ? "pb-20 lg:pb-0" : ""}`}
                >
                    {children}
                </motion.main>
            </div>

            {/* Right Sidebar (Lazy Loaded high-resource component) */}
            {showRightSidebar && (
                <aside className="hidden lg:block relative z-20 w-[320px] shrink-0">
                    <Suspense fallback={<div className="w-full h-screen animate-pulse bg-white/5 rounded-3xl" />}>
                        <div className="sticky top-20">
                            <RightSidebar />
                        </div>
                    </Suspense>
                </aside>
            )}
        </section>
    );
};

export default FeedLayout;
