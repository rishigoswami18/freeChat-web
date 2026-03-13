import Sidebar from "./Sidebar";
import RightSidebar from "./RightSidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-base-300 relative overflow-x-hidden">
      {/* Premium ambient animated background (Global) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        {/* Subtle dark ambient glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse max-w-[800px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] animate-pulse max-w-[800px] delay-1000" />
      </div>

      <MobileDrawer />

      {/* Fixed sidebar on desktop */}
      {showSidebar && <div className="relative z-20"><Sidebar /></div>}

      {/* Main content area — pushed right by sidebar width on desktop */}
      <div className={`flex flex-col min-h-screen relative z-10 ${showSidebar ? "md:ml-[80px] xl:ml-[244px]" : ""}`}>
        
        {/* Feed & Right Sidebar Master Container */}
        <div className="flex-1 flex w-full max-w-[1000px] xl:gap-8 2xl:gap-12 justify-center px-4 xl:px-0 mx-auto">
            
          {/* Center Content Area */}
          <div className="flex flex-col w-full max-w-[630px]">
            {showNavbar && <Navbar />}

            {/* If navbar is hidden, remove top padding to allow full-screen content */}
            <motion.main
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`flex-1 flex flex-col ${showNavbar ? "lg:pt-0" : ""} ${showFooter ? "pb-20 lg:pb-0" : ""}`}
            >
              {children}
            </motion.main>
          </div>

          {/* Right Sidebar (Suggestions & Footer) */}
          {showSidebar && (
            <div className="hidden lg:block relative z-20 w-[320px] shrink-0">
              <RightSidebar />
            </div>
          )}

        </div>
        
        {/* Full-width footer at the bottom of the content area */}
        {showFooter && <Footer />}
      </div>
    </div>
  );
};
export default Layout;