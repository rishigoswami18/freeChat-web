import { memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { Bell, LogOut, Pencil, Flame, MessageSquare } from "lucide-react";
import useNotificationCounts from "../hooks/useNotificationCounts";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import useLogout from "../hooks/useLogout";
import Logo from "./Logo";

// === PERFORMANCE OPTIMIZATION: Memoized Notification Badge ===
// Extracted to prevent inline JSX recreation and stabilize layout shifts 
// when notification counts update across the application.
const NavBadge = memo(({ count, maxCount = 9, colorClass, groupClass }) => {
  if (!count || count <= 0) return null;
  return (
    <span className={`absolute -top-1 -right-1 min-w-[16px] h-4 px-1 text-[10px] font-bold rounded-full flex items-center justify-center ring-2 transition-transform ${groupClass} ${colorClass}`}>
      {count > maxCount ? `${maxCount}+` : count}
    </span>
  );
});
NavBadge.displayName = "NavBadge";

// === MAIN COMPONENT: Navbar ===
// Wrapped in React.memo to prevent unnecessary cascading re-renders
// triggered by deep parent component state changes.
const Navbar = memo(() => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const { unreadMessages, notificationCount } = useNotificationCounts();

  // Simplified and stabilized routing check
  const isChatPage = location.pathname.startsWith("/chat");

  // Stable callback to prevent recreate of inline arrow functions
  const handleLogout = useCallback(() => {
    logoutMutation();
  }, [logoutMutation]);

  return (
    <nav className="sticky top-4 z-40 h-14 hidden lg:flex items-center glass-panel rounded-full px-4 border-white/20 luxe-shadow-pink ml-auto mb-6">
      <div className="flex items-center gap-2 w-full">
          {/* === DYNAMIC LOGO RENDERING === */}
          {/* Uses CSS transitions to prevent hard layout jumping when mounting/unmounting Logo on navigation */}
          <div className={`transition-all duration-300 ease-out flex items-center ${isChatPage ? "opacity-100 w-auto pl-5" : "opacity-0 w-0 overflow-hidden"}`}>
            {isChatPage && <Logo className="size-8 shrink-0" fontSize="text-2xl" />}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {authUser ? (
              <>
                {/* Streak Badge */}
                {authUser.streak > 0 && (
                  <div 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500/15 to-red-500/10 rounded-full border border-orange-500/20 text-orange-500 mr-1"
                    title={`${authUser.streak} Day Login Streak!`}
                  >
                    <Flame className="size-4 fill-current" />
                    <span className="font-bold text-sm tabular-nums">
                      {authUser.streak}
                    </span>
                  </div>
                )}

                {/* Notifications */}
                <Link to="/notifications" className="relative group/notif" aria-label="Notifications">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <Bell className="size-[18px] text-base-content/60" />
                  </button>
                  <NavBadge 
                    count={notificationCount} 
                    colorClass="bg-error text-error-content ring-base-100" 
                    groupClass="group-hover/notif:scale-110" 
                  />
                </Link>

                {/* Inbox */}
                <Link to="/inbox" className="relative group/inbox" aria-label="Inbox">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <MessageSquare className="size-[18px] text-base-content/60" />
                  </button>
                  <NavBadge 
                    count={unreadMessages} 
                    colorClass="bg-primary text-primary-content ring-base-100" 
                    groupClass="group-hover/inbox:scale-110" 
                  />
                </Link>

                <LanguageSelector />
                <ThemeSelector />

                {/* New Post */}
                <Link to="/posts" aria-label="Create Post">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <Pencil className="size-[18px] text-base-content/60" />
                  </button>
                </Link>

                {/* Avatar */}
                {/* Fixed layout shifting by adding a concrete background container matching image dimensions */}
                <Link to="/profile" className="avatar ml-1" aria-label="User Profile">
                  <div className="w-8 h-8 rounded-full ring-2 ring-primary/20 hover:ring-primary/50 transition-all duration-200 overflow-hidden bg-base-300 shrink-0 border border-base-200">
                    <img
                      src={authUser.profilePic || "/avatar.png"}
                      alt={authUser.fullName || "User Avatar"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                </Link>

                {/* Logout */}
                <button
                  className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error active:scale-90 transition-all duration-200 group"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  title="Logout"
                  aria-label="Logout"
                >
                  {isLoggingOut ? (
                    <span className="loading loading-spinner loading-xs text-error" />
                  ) : (
                    <LogOut className="size-[18px] opacity-70 group-hover:opacity-100 group-active:scale-90 transition-transform" />
                  )}
                </button>
              </>
            ) : (
              <>
                <LanguageSelector />
                <ThemeSelector />
              </>
            )}
          </div>
      </div>
    </nav>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;
