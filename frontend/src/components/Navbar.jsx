import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { Bell, LogOut, ShipWheel, Pencil, Flame } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import useLogout from "../hooks/useLogout";

const Navbar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const isChatPage = location.pathname?.startsWith("/chat");

  const { logoutMutation } = useLogout();

  return (
    <nav className="bg-base-200 border-b border-base-300 sticky top-0 z-30 h-16 hidden lg:flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-end w-full">
          {/* LOGO - ONLY IN THE CHAT PAGE */}
          {isChatPage && (
            <div className="pl-5">
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="freeChat" className="size-9 object-contain" />
                <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                  freeChat
                </span>
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {authUser?.streak > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 rounded-full border border-orange-500/20 text-orange-500 animate-pulse transition-all mr-2">
                <Flame className="size-5 fill-current" />
                <span className="font-bold text-sm">{authUser.streak}</span>
              </div>
            )}
            <Link to={"/notifications"}>
              <button className="btn btn-ghost btn-circle">
                <Bell className="h-6 w-6 text-base-content opacity-70" />
              </button>
            </Link>
          </div>

          <ThemeSelector />

          <Link to="/posts">
            <button className="btn btn-ghost btn-circle">
              <Pencil className="font-semibold text-base text-base-content" />
            </button>
          </Link>

          <Link to="/profile" className="avatar">
            <div className="w-9 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1 hover:scale-110 transition-transform">
              <img src={authUser?.profilePic} alt="User Avatar" rel="noreferrer" />
            </div>
          </Link>

          {/* Logout button */}
          <button className="btn btn-ghost btn-circle" onClick={logoutMutation}>
            <LogOut className="h-6 w-6 text-base-content opacity-70" />
          </button>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;