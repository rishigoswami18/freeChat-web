import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true, showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-base-100 relative overflow-x-hidden">
      {/* Mesh Gradient Background */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--p),0.05),transparent_50%)] pointer-events-none" />
      
      <MobileDrawer />

      {/* Fixed sidebar on desktop */}
      {showSidebar && <Sidebar />}

      {/* Main content area — pushed right by sidebar width on desktop */}
      <div className={`flex flex-col min-h-screen relative z-10 ${showSidebar ? "lg:ml-[292px] lg:mr-4 lg:my-4 rounded-[32px] overflow-hidden" : ""}`}>
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
  );
};
export default Layout;