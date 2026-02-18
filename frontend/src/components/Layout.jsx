import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import MobileDrawer from "./MobileDrawer";

const Layout = ({ children, showSidebar = false }) => {
  return (
    <div className="min-h-screen">
      <MobileDrawer />
      <div className="flex">
        {showSidebar && <Sidebar />}

        <div className="flex-1 flex flex-col">
          <Navbar />

          {/* pt-14 on mobile for MobileDrawer top bar, pt-16 on desktop for Navbar */}
          {/* pb-16 on mobile for bottom tab bar */}
          <main className="pt-14 pb-16 lg:pt-16 lg:pb-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;