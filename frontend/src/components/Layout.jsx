import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";
import Footer from "./Footer";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <MobileDrawer />
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* pt-14 on mobile for MobileDrawer top bar, pt-16 on desktop for Navbar */}
          {/* pb-20 on mobile to clear bottom tab bar + safe area */}
          <main className="pt-14 pb-20 lg:pt-16 lg:pb-0 flex-1">{children}</main>
          <Footer />
        </div>
      </div>
    </div>
  );
};
export default Layout;