import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true, showNavbar = true }) => {
  return (
    <div className="min-h-screen">
      <MobileDrawer />
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col min-h-screen">
          {showNavbar && <Navbar />}

          {/* If navbar is hidden, remove top padding to allow full-screen content */}
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`flex-1 flex flex-col ${showNavbar ? "pt-14 lg:pt-16" : "pt-0"} ${showFooter ? "pb-20 lg:pb-0" : ""}`}
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