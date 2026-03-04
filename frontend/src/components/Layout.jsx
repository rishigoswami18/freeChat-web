import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true, showNavbar = true }) => {
  return (
    <div className="min-h-screen">
      <MobileDrawer />

      {/* Fixed sidebar on desktop */}
      {showSidebar && <Sidebar />}

      {/* Main content area — pushed right by sidebar width on desktop */}
      <div className={`flex flex-col min-h-screen ${showSidebar ? "lg:ml-[260px]" : ""}`}>
        {showNavbar && <Navbar />}

        {/* If navbar is hidden, remove top padding to allow full-screen content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`flex-1 flex flex-col pt-14 lg:pt-0 ${showFooter ? "pb-20 lg:pb-0" : ""}`}
        >
          {children}
        </motion.main>
        {showFooter && <Footer />}
      </div>
    </div>
  );
};
export default Layout;