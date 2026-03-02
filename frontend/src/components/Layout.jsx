import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";
import { motion } from "framer-motion";

const Layout = ({ children, showSidebar = false, showFooter = true }) => {
  return (
    <div className="min-h-screen">
      <MobileDrawer />
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* pt-14 on mobile for MobileDrawer top bar, pt-16 on desktop for Navbar */}
          {/* pb-20 on mobile to clear bottom tab bar + safe area */}
          <motion.main
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pt-14 pb-20 lg:pt-16 lg:pb-0 flex-1"
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