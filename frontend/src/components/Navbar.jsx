import { memo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useAuthUser from "../hooks/useAuthUser";
import { LogOut, Pencil, Flame } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import useLogout from "../hooks/useLogout";
import Logo from "./Logo";

// === MAIN COMPONENT: Navbar ===
// Simplified for Desktop to avoid redundancy with the Sidebar
const Navbar = memo(() => {
  const { authUser } = useAuthUser();
  const { t } = useTranslation();
  const location = useLocation();
  const { logoutMutation, isPending: isLoggingOut } = useLogout();

  // Simplified routing check
  const isChatPage = location.pathname.startsWith("/chat");

  return (
    <nav className="sticky top-4 z-40 ml-auto mb-6 hidden h-16 items-center rounded-full border border-slate-200 bg-white/80 px-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-2 w-full">
          {/* === DYNAMIC LOGO RENDERING === */}
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

                <LanguageSelector />
                <ThemeSelector />

                {/* New Post - Primary Action */}
                <Link to="/posts" aria-label={t('post')}>
                  <button className="btn btn-ghost btn-circle btn-sm hover:bg-slate-100 transition-colors">
                    <Pencil className="size-[18px] text-slate-600" />
                  </button>
                </Link>
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
