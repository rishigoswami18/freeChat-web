import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  ShipWheelIcon,
  LogOutIcon,
  PencilIcon,
  HeartIcon,
  CrownIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";

const MobileDrawer = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const { logoutMutation } = useLogout();

  const toggleDrawer = () => setIsOpen(!isOpen);

  const navItems = [
    { to: "/", icon: HomeIcon, label: "Feed" },
    { to: "/friends", icon: UsersIcon, label: "Friends" },
    { to: "/notifications", icon: BellIcon, label: "Notifications" },
    { to: "/posts", icon: PencilIcon, label: "Posts" },
    { to: "/couple", icon: HeartIcon, label: "Couple" },
    { to: "/membership", icon: CrownIcon, label: "Premium" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-200/95 backdrop-blur-sm border-b border-base-300 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle">
            <MenuIcon className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <ShipWheelIcon className="size-6 text-primary" />
            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              freeChat
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1">
          <ThemeSelector size="btn-sm" />
          <Link to="/notifications" className="btn btn-ghost btn-sm btn-circle">
            <BellIcon className="size-4" />
          </Link>
          <div className="avatar">
            <div className="w-8 rounded-full">
              <img src={authUser?.profilePic} alt="You" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-base-100 border-r border-base-300 z-[60] transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <div className="flex items-center gap-2">
            <ShipWheelIcon className="size-6 text-primary" />
            <h2 className="text-lg font-bold">freeChat</h2>
          </div>
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle">
            <XIcon className="size-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={toggleDrawer}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${location.pathname === to
                ? "bg-primary text-primary-content"
                : "hover:bg-base-200"
                }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>

        {/* User Profile + Logout */}
        <div className="p-4 border-t border-base-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="avatar">
              <div className="w-10 rounded-full ring ring-primary/20">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
          <button
            onClick={() => { toggleDrawer(); logoutMutation(); }}
            className="btn btn-ghost btn-sm w-full justify-start gap-2 text-error"
          >
            <LogOutIcon className="size-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          onClick={toggleDrawer}
        />
      )}

      {/* Bottom Tab Bar for quick navigation - Hide on Chat Page */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-base-200/95 backdrop-blur-sm border-t border-base-300 safe-area-bottom ${location.pathname.startsWith("/chat") ? "hidden" : ""}`}>
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${location.pathname === to
                ? "text-primary"
                : "text-base-content/50"
                }`}
            >
              <Icon className="size-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
