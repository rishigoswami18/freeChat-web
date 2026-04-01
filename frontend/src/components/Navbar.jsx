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
    <nav className="sticky top-4 z-40 ml-auto mb-6 hidden h-16 items-center rounded-full border border-slate-200 bg-white/80 px-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex">
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
                    className="mr-1 flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-orange-600"
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
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-slate-100 transition-colors">
                    <Bell className="size-[18px] text-slate-600" />
                  </button>
                  <NavBadge 
                    count={notificationCount} 
                    colorClass="bg-error text-error-content ring-base-100" 
                    groupClass="group-hover/notif:scale-110" 
                  />
                </Link>

                {/* Inbox */}
                <Link to="/inbox" className="relative group/inbox" aria-label="Inbox">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-slate-100 transition-colors">
                    <MessageSquare className="size-[18px] text-slate-600" />
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
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-slate-100 transition-colors">
                    <Pencil className="size-[18px] text-slate-600" />
                  </button>
                </Link>

                {/* Avatar */}
                {/* Fixed layout shifting by adding a concrete background container matching image dimensions */}
                <Link to="/profile" className="avatar ml-1" aria-label="User Profile">
                  <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-base-300 ring-2 ring-slate-200 transition-all duration-200 hover:ring-slate-300">
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
                  className="btn btn-ghost btn-circle btn-sm group transition-all duration-200 hover:bg-red-50 hover:text-red-600 active:scale-90"
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
