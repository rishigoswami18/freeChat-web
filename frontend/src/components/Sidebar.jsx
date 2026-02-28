import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import useAuthUser from "../hooks/useAuthUser";
import {
  Home,
  Users,
  Bell,
  Heart,
  Crown,
  Gamepad2,
  User,
  Search,
  Film,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import CreateStoryModal from "./CreateStoryModal";
import Logo from "./Logo";

const navItems = [
  { to: "/", icon: Home, label: "Feed" },
  { to: "/inbox", icon: MessageSquare, label: "Inbox" },
  { to: "/profile", icon: User, label: "Profile" },
  { to: "/friends", icon: Users, label: "Friends" },
  { to: "/search", icon: Search, label: "Explore" },
  { to: "/reels", icon: Film, label: "Reels" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
  { to: "/couple", icon: Heart, label: "Couple" },
  { to: "/games", icon: Gamepad2, label: "Games" },
  { to: "/membership", icon: Crown, label: "Premium" },
];

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  return (
    <aside className="w-[260px] bg-base-200/80 backdrop-blur-xl border-r border-base-300/50 hidden lg:flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-base-300/50">
        <Logo className="size-9" fontSize="text-2xl" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto no-scrollbar">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = currentPath === to;
          return (
            <Link
              key={to}
              to={to}
              className={`sidebar-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? "sidebar-link-active bg-primary/10 text-primary font-semibold"
                  : "text-base-content/70 hover:text-base-content hover:bg-base-300/50"
                }`}
            >
              <Icon
                className={`size-[18px] flex-shrink-0 ${isActive ? "text-primary" : "opacity-60"
                  }`}
              />
              <span>{label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-2">
        <a
          href="/freechat.apk"
          download
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
          <div className="relative">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="User Avatar"
              className="size-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success rounded-full border-2 border-base-200 dot-pulse" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-sm truncate">
              {authUser?.fullName}
            </h3>
            <p className="text-[11px] text-success font-medium">Online</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;