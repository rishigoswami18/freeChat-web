import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  UsersIcon,
  BellIcon,
  MenuIcon,
  XIcon,
  ShipWheelIcon,
} from "lucide-react";
import useAuthUser from "../hooks/useAuthUser";

const MobileDrawer = () => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-base-200 border-b border-base-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={toggleDrawer}>
            <MenuIcon className="size-6" />
          </button>
          <span className="text-xl font-bold tracking-wide">freeChat</span>
        </div>
        <ShipWheelIcon className="size-6 text-primary" />
      </div>

      <div
        className={`fixed inset-y-0 left-0 w-64 bg-base-100 border-r border-base-300 z-50 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button onClick={toggleDrawer}>
            <XIcon className="size-5" />
          </button>
        </div>

        <nav className="p-4 space-y-3">
          <Link
            to="/"
            onClick={toggleDrawer}
            className={`flex items-center gap-3 p-2 rounded ${
              location.pathname === "/" ? "bg-primary text-white" : ""
            }`}
          >
            <HomeIcon className="size-4" />
            Home
          </Link>

          <Link
            to="/friends"
            onClick={toggleDrawer}
            className={`flex items-center gap-3 p-2 rounded ${
              location.pathname === "/friends" ? "bg-primary text-white" : ""
            }`}
          >
            <UsersIcon className="size-4" />
            Friends
          </Link>

          <Link
            to="/notifications"
            onClick={toggleDrawer}
            className={`flex items-center gap-3 p-2 rounded ${
              location.pathname === "/notifications" ? "bg-primary text-white" : ""
            }`}
          >
            <BellIcon className="size-4" />
            Notifications
          </Link>
        </nav>

        <div className="mt-auto p-4 border-t border-base-300">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="w-10 rounded-full">
                <img src={authUser?.profilePic} alt="User Avatar" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="size-2 rounded-full bg-success inline-block" />
                Online
              </p>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={toggleDrawer}
        />
      )}
    </>
  );
};

export default MobileDrawer;
