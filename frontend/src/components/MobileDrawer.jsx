import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  Menu,
  X,
  ShipWheel,
  LogOut,
  Pencil,
  Heart,
  Crown,
  Gamepad2,
  User,
  Search,
  Film,
  Flame,
  MessageSquare,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";
import CreateStoryModal from "./CreateStoryModal";

const MobileDrawer = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const { logoutMutation } = useLogout();

  const toggleDrawer = () => setIsOpen(!isOpen);

  const navItems = [
    { to: "/", icon: Home, label: "Feed" },
    { to: "/inbox", icon: MessageSquare, label: "Inbox" },
    { to: "/friends", icon: Users, label: "Friends" },
    { to: "/reels", icon: Film, label: "Reels" },
    { to: "/search", icon: Search, label: "Search" },
    { to: "/notifications", icon: Bell, label: "Notifications" },
    { to: "/posts", icon: Pencil, label: "Posts" },
    { to: "/couple", icon: Heart, label: "Couple" },
    { to: "/games", icon: Gamepad2, label: "Games" },
    { to: "/premium", icon: Crown, label: "Premium" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <>
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-200/95 backdrop-blur-sm border-b border-base-300 px-4 py-3 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-3">
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle">
            <Menu className="size-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="freeChat" className="size-6 object-contain" />
            <span className="text-lg font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              freeChat
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {authUser?.streak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-full border border-orange-500/30 text-orange-500 shadow-sm animate-pulse">
              <Flame className="size-4 fill-current" />
              <span className="font-bold text-xs tabular-nums">{authUser.streak}</span>
            </div>
          )}
          <ThemeSelector size="btn-sm" />
          <button onClick={logoutMutation} className="btn btn-ghost btn-sm btn-circle">
            <LogOut className="size-5 opacity-70" />
          </button>
          <div className="avatar ring-2 ring-primary/20 rounded-full p-0.5 ml-1">
            <div className="w-8 h-8 rounded-full">
              <img src={authUser?.profilePic || "/avatar.png"} alt="You" className="object-cover" />
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
            <img src="/logo.png" alt="freeChat" className="size-6 object-contain" />
            <h2 className="text-lg font-bold">freeChat</h2>
            {authUser?.streak > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 rounded-lg border border-orange-500/20 text-orange-500 animate-pulse ml-1">
                <Flame className="size-3.5 fill-current" />
                <span className="font-bold text-xs">{authUser.streak}</span>
              </div>
            )}
          </div>
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle">
            <X className="size-5" />
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

        {/* User Profile + Theme & Logout */}
        <div className="p-4 border-t border-base-300 space-y-4">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2">
                <img src={authUser?.profilePic || "/avatar.png"} alt="User Avatar" className="object-cover" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                Active Now
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => { toggleDrawer(); logoutMutation(); }}
              className="btn btn-ghost btn-sm bg-error/10 hover:bg-error/20 text-error rounded-xl gap-2 border border-error/20 w-full"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
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
          {[navItems[0], navItems[1], navItems[3], navItems[4], navItems[10]].map(({ to, icon: Icon, label }) => (
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
