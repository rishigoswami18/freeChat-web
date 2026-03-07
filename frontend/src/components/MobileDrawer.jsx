import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  ShieldAlert,
  BadgeCheck,
  Gem,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import useNotificationCounts from "../hooks/useNotificationCounts";
import ThemeSelector from "./ThemeSelector";
import CreateStoryModal from "./CreateStoryModal";
import Logo from "./Logo";
import ProfilePhotoViewer from "./ProfilePhotoViewer";

const MobileDrawer = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);
  const navigate = useNavigate();
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const { unreadMessages, notificationCount } = useNotificationCounts();

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
    { to: "/gem-shop", icon: Gem, label: "Gem Shop" },
    { to: "/membership", icon: Crown, label: "Premium" },
    { to: "/profile", icon: User, label: "Profile" },
  ];

  const bottomTabs = [navItems[0], navItems[1], navItems[3], navItems[4], navItems[11]];

  return (
    <>
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={() => setIsStoryModalOpen(false)} />

      {/* Mobile Top Bar */}
      <div className={`lg:hidden sticky top-0 left-0 right-0 z-50 glass-panel-solid border-b border-base-300/50 px-3 py-3.5 flex items-center justify-between safe-area-top ${location.pathname.startsWith("/chat") || location.pathname.startsWith("/reels") ? "hidden" : ""
        }`}>
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
            className="btn btn-ghost btn-xs btn-circle active:scale-95 transition-all duration-200 hover:bg-error/10 hover:text-error group"
            title="Logout"
          >
            {isLoggingOut ? (
              <span className="loading loading-spinner loading-[10px]" />
            ) : (
              <LogOut className="size-4 opacity-70 group-hover:opacity-100 group-active:scale-90 transition-transform" />
            )}
          </button>
          <div
            className="avatar ring-2 ring-primary/20 rounded-full p-0.5 cursor-pointer"
            onClick={() => setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName })}
          >
            <div className="w-7 h-7 rounded-full overflow-hidden">
              <img src={authUser?.profilePic || "/avatar.png"} alt="You" className="object-cover w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Slide-out Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 bg-base-100 border-r border-base-300 z-[60] transform ${isOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col`}
      >
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <Logo className="size-6" fontSize="text-lg" />
          <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform">
            <X className="size-5" />
          </button>
        </div>

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
              <div className="relative">
                <Icon className="size-5" />
                {label === "Inbox" && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-primary">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
                {label === "Notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              {label}
            </Link>
          ))}



          <a
            href={`${window.location.origin}/api/apk/download/latest`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={toggleDrawer}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-accent transition-all duration-200 active:scale-[0.98] hover:bg-accent/10 mt-4 border border-dashed border-accent/30 bg-accent/5"
            download="BondBeyond_app.apk"
          >
            <Smartphone className="size-5" />
            Download Android App
          </a>

          {authUser?.role === "admin" && (
            <Link
              to="/admin"
              onClick={toggleDrawer}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 mt-4 border border-primary/20 bg-primary/5 ${location.pathname === "/admin"
                ? "bg-primary text-primary-content"
                : "text-primary hover:bg-primary/10"
                }`}
            >
              <ShieldAlert className="size-5" />
              Admin Command
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-base-300 space-y-3">
          <div className="flex items-center gap-3">
            <div
              className="avatar cursor-pointer active:scale-95 transition-transform"
              onClick={() => setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName })}
            >
              <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img src={authUser?.profilePic || "/avatar.png"} alt="User Avatar" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-base truncate flex items-center gap-1">
                {authUser?.fullName}
                {(authUser?.role === "admin" || authUser?.isVerified) && (
                  <BadgeCheck className="size-4 text-amber-500 fill-amber-500/10" />
                )}
              </p>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                Active Now
              </p>
            </div>
          </div>

          <button
            onClick={() => { toggleDrawer(); logoutMutation(); }}
            disabled={isLoggingOut}
            className="btn btn-error btn-outline btn-sm rounded-xl gap-2 w-full active:scale-[0.96] transition-all duration-200 h-10 border-error/20 hover:bg-error hover:border-error group font-bold"
          >
            {isLoggingOut ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <LogOut className="size-4 group-hover:rotate-6 transition-transform" />
            )}
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

      {/* Bottom Tab Bar */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] glass-panel-solid border-t border-base-300/50 safe-area-bottom ${location.pathname.startsWith("/chat") || location.pathname.startsWith("/reels") || location.pathname.startsWith("/call") ? "hidden" : ""
        }`}>
        <div className="flex items-center justify-around py-1.5 px-1">
          {bottomTabs.map(({ to, icon: Icon, label }) => {
            const isActive = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-200 active:scale-90 ${isActive ? "text-primary bg-primary/8" : "text-base-content/40"
                  }`}
              >
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-7 h-1 bg-primary rounded-full shadow-sm shadow-primary/40" />
                )}
                <div className="relative">
                  <Icon className={`size-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  {label === "Inbox" && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-primary text-primary-content text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-base-100">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                  {label === "Notifications" && notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-error text-error-content text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-base-100">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "font-bold" : ""}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          onClose={() => setViewingDP(null)}
        />
      )}
    </>
  );
};

export default MobileDrawer;
