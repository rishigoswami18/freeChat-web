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

          
          <main className="pt-16">{children}</main>
        </div>
      </div>
    </div>
  );
};
export default Layout;