import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-base-300 relative overflow-x-hidden">
      {/* Premium ambient animated background (Global) */}
      <div className="fixed inset-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] animate-pulse max-w-[800px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[120px] animate-pulse max-w-[800px] delay-1000" />
        <div className="absolute top-[40%] left-[30%] w-[30%] h-[30%] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-500" />
      </div>

      <MobileDrawer />

      {/* Fixed sidebar on desktop */}
      {showSidebar && <div className="relative z-20"><Sidebar /></div>}

      {/* Main content area — pushed right by sidebar width on desktop */}
      <div className={`flex flex-col min-h-screen relative z-10 ${showSidebar ? "lg:ml-[292px] lg:mr-4 lg:my-4 glass-panel-heavy rounded-[32px] overflow-hidden shadow-[0_8px_32px_0_oklch(0_0_0/0.3)] border-white/5" : ""}`}>
        {/* Subtle noise texture over the glass main area */}
        {showSidebar && <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay z-0"></div>}
        
        <div className="relative z-10 flex flex-col h-full flex-1">
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
          {showFooter && <Footer />}
        </div>
      </div>
    </div>
  );
};
export default Layout;