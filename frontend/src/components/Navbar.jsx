import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { Bell, LogOut, Pencil, Flame, MessageSquare } from "lucide-react";
import useNotificationCounts from "../hooks/useNotificationCounts";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import useLogout from "../hooks/useLogout";
import Logo from "./Logo";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const { unreadMessages, notificationCount } = useNotificationCounts();

  return (
    <nav className="sticky top-4 z-40 h-14 hidden lg:flex items-center glass-panel rounded-full px-4 border-white/20 luxe-shadow-pink ml-auto mb-6">
      <div className="flex items-center gap-2">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Logo className="size-8" fontSize="text-2xl" />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {authUser && (
              <>
                {/* Streak Badge */}
                {authUser?.streak > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/15 to-red-500/10 rounded-full border border-orange-500/20 text-orange-500 mr-1">
                    <Flame className="size-4 fill-current" />
                    <span className="font-bold text-sm tabular-nums">
                      {authUser.streak}
                    </span>
                  </div>
                )}

                {/* Notifications */}
                <Link to="/notifications" className="relative group/notif">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <Bell className="size-[18px] text-base-content/60" />
                  </button>
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-error text-error-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100 group-hover/notif:scale-110 transition-transform">
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  )}
                </Link>

                {/* Inbox */}
                <Link to="/inbox" className="relative group/inbox">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <MessageSquare className="size-[18px] text-base-content/60" />
                  </button>
                  {unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100 group-hover/inbox:scale-110 transition-transform">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </Link>

                <LanguageSelector />
                <ThemeSelector />

                {/* New Post */}
                <Link to="/posts">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <Pencil className="size-[18px] text-base-content/60" />
                  </button>
                </Link>

                {/* Avatar */}
                <Link to="/profile" className="avatar ml-1">
                  <div className="w-8 h-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-200 overflow-hidden">
                    <img
                      src={authUser?.profilePic || "/avatar.png"}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Logout */}
                <button
                  className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error active:scale-90 transition-all duration-200 group"
                  onClick={() => logoutMutation()}
                  disabled={isLoggingOut}
                  title="Logout"
                >
                  {isLoggingOut ? (
                    <span className="loading loading-spinner loading-xs text-error" />
                  ) : (
                    <LogOut className="size-[18px] opacity-70 group-hover:opacity-100 group-active:scale-90 transition-transform" />
                  )}
                </button>
              </>
            )}
            {!authUser && (
              <>
                <LanguageSelector />
                <ThemeSelector />
              </>
            )}
          </div>
      </div>
    </nav>
  );
};
export default Navbar;