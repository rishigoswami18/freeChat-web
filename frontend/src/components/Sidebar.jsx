import { Link, useLocation } from "react-router-dom";
import useAuthUser from "../hooks/useAuthUser";
import { BellIcon, HomeIcon, ShipWheelIcon, UsersIcon, HeartIcon, CrownIcon, Gamepad2 } from "lucide-react";

const Sidebar = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className="w-64 bg-base-200 border-r border-base-300 hidden lg:flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2.5">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary  tracking-wider">
            freeChat
          </span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link
          to="/"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/" ? "btn-active" : ""
            }`}
        >
          <HomeIcon className="size-5 text-base-content opacity-70" />
          <span>Home</span>
        </Link>

        <Link
          to="/friends"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/friends" ? "btn-active" : ""
            }`}
        >
          <UsersIcon className="size-5 text-base-content opacity-70" />
          <span>Friends</span>
        </Link>

        <Link
          to="/notifications"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/notifications" ? "btn-active" : ""
            }`}
        >
          <BellIcon className="size-5 text-base-content opacity-70" />
          <span>Notifications</span>
        </Link>

        <Link
          to="/couple"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/couple" ? "btn-active" : ""
            }`}
        >
          <HeartIcon className="size-5 text-pink-500 opacity-70" />
          <span>Couple</span>
        </Link>

        <Link
          to="/games"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/games" ? "btn-active" : ""
            }`}
        >
          <Gamepad2 className="size-5 text-primary opacity-70" />
          <span>Games</span>
        </Link>

        <Link
          to="/membership"
          className={`btn btn-ghost justify-start w-full gap-3 px-3 normal-case ${currentPath === "/membership" ? "btn-active" : ""
            }`}
        >
          <CrownIcon className="size-5 text-amber-500 opacity-70" />
          <span>Premium</span>
        </Link>
      </nav>

      {/* USER PROFILE SECTION */}
      <div className="p-4 border-t border-base-300">
        <Link to="/profile" className="flex items-center gap-3 p-2 hover:bg-base-300 rounded-xl transition-colors">
          <img
            src={authUser?.profilePic || "/avatar.png"}
            alt="User Avatar"
            className="size-10 rounded-full object-cover border-2 border-primary"
          />
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold truncate">{authUser?.fullName}</h3>
            <p className="text-xs opacity-50 truncate">Update Profile</p>
          </div>
        </Link>
      </div>
    </aside>
  );
};
export default Sidebar;