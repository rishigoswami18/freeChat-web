import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Bell,
  Menu,
  X,
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
  Smartphone,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import ThemeSelector from "./ThemeSelector";
import CreateStoryModal from "./CreateStoryModal";
import Logo from "./Logo";

const MobileDrawer = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const { logoutMutation, isPending: isLoggingOut } = useLogout();

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
    { to: "/membership", icon: Crown, label: "Premium" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  // Bottom tab items: Feed, Inbox, Reels, Search, Profile
  const bottomTabs = [navItems[0], navItems[1], navItems[3], navItems[4], navItems[10]];

  return (
    <>
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass-panel-solid border-b border-base-300/50 px-3 py-2.5 flex items-center justify-between safe-area-top">
        <div className="flex items-center gap-2">
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform">
            <Menu className="size-5" />
          </button>
          <Logo className="size-6" fontSize="text-lg" />
        </div>

        <div className="flex items-center gap-1.5">
          {authUser?.streak > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/10 rounded-full border border-orange-500/30 text-orange-500">
              <Flame className="size-3.5 fill-current" />
              <span className="font-bold text-[11px] tabular-nums">{authUser.streak}</span>
            </div>
          )}
          <ThemeSelector size="btn-sm" />
          <button
            onClick={() => logoutMutation()}
            disabled={isLoggingOut}
            className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform"
          >
            {isLoggingOut ? <span className="loading loading-spinner loading-xs" /> : <LogOut className="size-4.5 opacity-70" />}
          </button>
          <Link to="/profile" className="avatar ring-2 ring-primary/20 rounded-full p-0.5">
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src={authUser?.profilePic || "/avatar.png"} alt="You" className="object-cover w-full h-full" />
            </div>
          </Link>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-base-100 border-r border-base-300 z-[60] transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col`}
      >
        {/* Drawer Header */}
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <Logo className="size-6" fontSize="text-lg" streak={authUser?.streak} />
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform">
            <X className="size-5" />
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar overscroll-contain">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              onClick={toggleDrawer}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${location.pathname === to
                ? "bg-primary text-primary-content shadow-md shadow-primary/20"
                : "hover:bg-base-200 active:bg-base-300"
                }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}

          {/* Download APK Link */}
          <a
            href="/freechat.apk"
            download
            onClick={toggleDrawer}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-accent transition-all duration-200 active:scale-[0.98] hover:bg-accent/10 mt-4 border border-dashed border-accent/30 bg-accent/5"
          >
            <Smartphone className="size-5" />
            Download Android App
          </a>
        </nav>

        {/* User Profile + Logout */}
        <div className="p-4 border-t border-base-300 space-y-3">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img src={authUser?.profilePic || "/avatar.png"} alt="User Avatar" className="object-cover w-full h-full" />
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

          <button
            onClick={() => { toggleDrawer(); logoutMutation(); }}
            disabled={isLoggingOut}
            className="btn btn-ghost btn-sm bg-error/10 hover:bg-error/20 text-error rounded-xl gap-2 border border-error/20 w-full active:scale-[0.97] transition-transform"
          >
            {isLoggingOut ? <span className="loading loading-spinner loading-xs" /> : <LogOut className="size-4" />}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] animate-fade-in"
          onClick={toggleDrawer}
        />
      )}

      {/* Bottom Tab Bar with improved mobile UX */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] glass-panel-solid border-t border-base-300/50 safe-area-bottom ${location.pathname.startsWith("/chat") || location.pathname.startsWith("/reels") ? "hidden" : ""}`}>
        <div className="flex items-center justify-around py-1.5 px-1">
          {bottomTabs.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-col items-center gap-0.5 py-1.5 px-4 rounded-xl transition-all duration-200 active:scale-90 ${isActive
                  ? "text-primary"
                  : "text-base-content/40"
                  }`}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-primary rounded-full" />
                )}
                <Icon className={`size-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                <span className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default MobileDrawer;
