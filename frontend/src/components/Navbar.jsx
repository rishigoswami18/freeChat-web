import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { Bell, LogOut, Pencil, Flame } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";
import Logo from "./Logo";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation, isPending: isLoggingOut } = useLogout();

  return (
    <nav className="glass-panel-solid border-b border-base-300/50 sticky top-0 z-30 h-14 hidden lg:flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
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
                <Link to="/notifications">
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-base-300/60 transition-colors">
                    <Bell className="size-[18px] text-base-content/60" />
                  </button>
                </Link>

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
                  className="btn btn-ghost btn-circle btn-sm hover:bg-error/10 hover:text-error transition-colors"
                  onClick={() => logoutMutation()}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? <span className="loading loading-spinner loading-xs" /> : <LogOut className="size-[18px] opacity-60" />}
                </button>
              </>
            )}
            {!authUser && <ThemeSelector />}
          </div>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;