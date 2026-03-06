import { useNavigate, Link, useLocation } from "react-router-dom";
import useNotificationCounts from "../hooks/useNotificationCounts";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import {
  Home,
  Users,
  Bell,
  HeartHandshake,
  Crown,
  Gamepad2,
  User,
  Search,
  Film,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  BadgeCheck,
  Gem,
} from "lucide-react";

import CreateStoryModal from "./CreateStoryModal";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import Logo from "./Logo";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/inbox", icon: MessageSquare, label: "Inbox" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/search", icon: Search, label: "Explore" },
  { to: "/reels", icon: Film, label: "Reels" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/couple", icon: HeartHandshake, label: "Bond Dashboard" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/gem-shop", icon: Gem, label: "Gem Shop" },
  { to: "/membership", icon: Crown, label: "Premium" },
];

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);
  const { unreadMessages, notificationCount } = useNotificationCounts();

  const navigate = useNavigate();

  return (
    <aside className="w-[260px] bg-base-200/80 backdrop-blur-xl border-r border-base-300/50 hidden lg:flex flex-col h-screen fixed top-0 left-0 font-outfit z-40">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-base-300/50">
        <Logo className="size-9" fontSize="text-2xl" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group/navlink
                ${isActive
                  ? "sidebar-link-active bg-primary/10 text-primary font-semibold shadow-sm shadow-primary/5"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/50 hover:translate-x-0.5"
                }`}
            >
              <div className="relative">
                <Icon
                  className={`size-[18px] flex-shrink-0 ${isActive ? "text-primary" : "opacity-60"
                    }`}
                />
                {label === "Inbox" && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-200">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
                {label === "Notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-error text-error-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-200">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              <span className="group-hover/navlink:translate-x-0.5 transition-transform duration-200">{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}

        {/* Admin Link if role is admin */}
        {authUser?.role === "admin" && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mt-6 border border-primary/20 bg-primary/5
              ${currentPath === "/admin"
                ? "bg-primary text-primary-content"
                : "text-primary hover:bg-primary/10"
              }`}
          >
            <ShieldAlert className="size-[18px]" />
            <span>Admin Command</span>
          </Link>
        )}
      </nav>

      <div className="px-3 py-2 space-y-2">


        <a
          href="https://docs.google.com/uc?export=download&id=1fPRmdfcbsSOhHp58blp3NKBozp4LEoIy"

          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-all duration-200 active:scale-95 group/apk"
        >
          <div className="size-6 rounded-lg bg-secondary/20 flex items-center justify-center group-hover/apk:rotate-12 transition-transform">
            <Smartphone className="size-3.5" />
          </div>
          Download App (APK)
        </a>
      </div>

      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* User Profile Section */}
      <div className="p-3 border-t border-base-300/50">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-2.5 hover:bg-base-300/50 rounded-xl transition-all duration-200 group"
        >
          <div className="relative" onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName });
          }}>
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all cursor-pointer"
            />
            <div className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-base-100" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-sm truncate flex items-center gap-1">
              {authUser?.fullName}
              {(authUser?.role === "admin" || authUser?.isVerified) && (
                <BadgeCheck className="size-3.5 text-amber-500 fill-amber-500/10" />
              )}
            </h3>
            <p className="text-[11px] text-success font-medium">Online</p>
          </div>
        </Link>
      </div>

      <div className="px-3 pb-4">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 text-center">
          Powered by freechatweb.in
        </div>
      </div>

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          onClose={() => setViewingDP(null)}
        />
      )}
    </aside>
  );
};
export default Sidebar;