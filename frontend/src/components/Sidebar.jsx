import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Compass,
  Crown,
  DollarSign,
  Film,
  Gamepad2,
  Gem,
  Gift,
  Globe,
  Heart,
  Home,
  Menu,
  MessageSquare,
  PanelTopOpen,
  PlusCircle,
  Search,
  ShieldAlert,
  Smartphone,
  Sparkles,
  Target,
  Users,
  Zap,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useNotificationCounts from "../hooks/useNotificationCounts";
import { claimDailyReward, logout, updateProfile } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import FocusModeView from "./FocusModeView";
import Logo from "./Logo";
import ProfilePhotoViewer from "./ProfilePhotoViewer";

const primaryNavItems = [
  { to: "/", icon: Home, labelKey: "home" },
  { to: "/search", icon: Search, labelKey: "search" },
  { to: "/friends", icon: Compass, labelKey: "explore" },
  { to: "/communities", icon: Users, labelKey: "communities" },
  { to: "/reels", icon: Film, labelKey: "reels" },
  { to: "/inbox", icon: MessageSquare, labelKey: "inbox" },
  { to: "/professional-hub", icon: Zap, labelKey: "desi_arena" },
  { to: "/notifications", icon: Heart, labelKey: "notifications" },
  { to: "/games", icon: Gamepad2, labelKey: "games" },
  { to: "/mini-games", icon: Sparkles, labelKey: "mini_games" },
  { to: "/gem-shop", icon: Crown, labelKey: "premium" },
  { to: "/prize-vault", icon: Gift, labelKey: "rewards" },
];

const mobileNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/mini-games", icon: Zap, label: "Play" },
  { to: "/reels", icon: Film, label: "Reels" },
];

const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

const NavBadge = memo(({ count }) => {
  if (!count || count < 1) return null;

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full border border-slate-900 bg-rose-500 px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? "9+" : count}
    </span>
  );
});

NavBadge.displayName = "NavBadge";

const triggerHaptic = () => {
  if (typeof window === "undefined") return;
  window.navigator?.vibrate?.(14);
  window.AndroidBridge?.vibrate?.(14);
};

const isActivePath = (pathname, target) => {
  if (target === "/") return pathname === "/";
  return pathname.startsWith(target);
};

const Sidebar = memo(() => {
  const { authUser } = useAuthUser();
  const { t } = useTranslation();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { unreadMessages, notificationCount } = useNotificationCounts();

  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("zyro-sidebar-collapsed");
    if (stored !== null) return stored === "true";
    return window.innerWidth < 1440;
  });

  useEffect(() => {
    const sidebarWidth = isCollapsed ? "92px" : "264px";
    const sidebarOffset = isCollapsed ? "116px" : "288px";
    document.documentElement.style.setProperty("--zyro-sidebar-width", sidebarWidth);
    document.documentElement.style.setProperty("--zyro-sidebar-offset", sidebarOffset);
    window.localStorage.setItem("zyro-sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  useEffect(() => {
    if (!authUser?._id) return;
    const initialTitle = "FreeChat — Connect, Create, Grow";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const hooks = [
          "FreeChat — Your feed is waiting",
          "FreeChat — New updates from friends",
          "FreeChat — Claim your daily reward",
        ];
        document.title = hooks[Math.floor(Math.random() * hooks.length)];
      } else {
        document.title = initialTitle;
      }
    };

    document.title = initialTitle;
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [authUser?._id]);

  const handleDownload = useCallback((event) => {
    event.preventDefault();
    triggerHaptic();
    downloadFile(`${APK_DOWNLOAD_URL}/latest`, "FreeChat_app.apk");
  }, []);

  const handleCreatePost = useCallback(() => {
    triggerHaptic();
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Create post is at the top of your feed.", { icon: "✦" });
  }, []);

  const claimReward = useCallback(async () => {
    try {
      triggerHaptic();
      const response = await claimDailyReward();
      toast.success(response.message, { icon: "💎" });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (error) {
      toast.error(error.response?.data?.message || "Reward already claimed.");
    }
  }, [queryClient]);

  const { mutateAsync: mutateProfile } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(["authUser"], data.user);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      toast.success("Profile updated.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Could not update profile.");
    },
  });

  const handleDPUpdate = useCallback(
    async (base64) => {
      await mutateProfile({ profilePic: base64 });
      setViewingDP(null);
    },
    [mutateProfile]
  );

  const handleLogout = useCallback(async () => {
    try {
      triggerHaptic();
      await logout();
      queryClient.setQueryData(["authUser"], null);
      window.location.href = "/login";
    } catch {
      toast.error("Logout failed. Please try again.");
    }
  }, [queryClient]);

  const desktopNavItems = useMemo(
    () =>
      primaryNavItems.map((item) => ({
        ...item,
        id: `nav-${item.labelKey?.toLowerCase() || item.label?.toLowerCase().replace(/\s+/g, "-")}`,
      })),
    []
  );

  const renderLabel = (item) => item.label || t(item.labelKey) || item.labelKey;

  const navLinkClass = (active = false, collapsed = false) =>
    [
      "group relative flex w-full items-center rounded-2xl px-3 text-sm font-medium transition-all duration-200",
      "zyro-touch-target min-h-[48px]",
      collapsed ? "justify-center" : "gap-3",
      active
        ? "text-white bg-white/[0.06]"
        : "text-white/40 hover:bg-white/[0.03] hover:text-white/70",
    ].join(" ");

  return (
    <>
      <aside
        className="nexus-surface fixed inset-y-3 left-3 z-50 hidden md:flex flex-col rounded-3xl px-3 py-5"
        style={{ width: "var(--zyro-sidebar-width)" }}
      >
        <div className={`flex ${isCollapsed ? "flex-col items-center gap-4" : "items-center justify-between gap-3"} border-b border-white/5 px-2 pb-5 mb-2`}>
          <div className={`${isCollapsed ? "" : "min-w-0 flex-1 ml-1"}`}>
            <Logo showText={!isCollapsed} fontSize="text-xl" />
          </div>

          <motion.button
            type="button"
            {...buttonMotion}
            onClick={() => setIsCollapsed((current) => !current)}
            className="zyro-touch-target inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-xl bg-white/[0.03] text-white/30 hover:bg-white/[0.06] hover:text-white/60 transition-all"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
          </motion.button>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-1 py-3">
          <div className="space-y-0.5">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.to);
              const label = renderLabel(item);

              return (
                <motion.div key={item.to} {...buttonMotion}>
                  <Link id={item.id} to={item.to} className={navLinkClass(active, isCollapsed)} title={label}>
                    {active && (
                      <motion.span
                        layoutId="sidebar-active-pill"
                        className="absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-indigo-500"
                      />
                    )}

                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors">
                      <Icon className={`size-[19px] transition-all duration-300 ${active ? 'text-indigo-400' : ''}`} strokeWidth={active ? 2.2 : 1.8} />
                      {item.to === "/inbox" ? <NavBadge count={unreadMessages} /> : null}
                      {item.to === "/notifications" ? <NavBadge count={notificationCount} /> : null}
                    </div>

                    <AnimatePresence initial={false}>
                      {!isCollapsed ? (
                        <motion.span
                          initial={{ opacity: 0, x: -6 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -6 }}
                          className="truncate"
                        >
                          {label}
                        </motion.span>
                      ) : null}
                    </AnimatePresence>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="pt-4">
            <motion.button
              type="button"
              {...buttonMotion}
              onClick={handleCreatePost}
              className="w-full h-[52px] rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white flex items-center justify-center gap-2.5 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
            >
              <PlusCircle className="size-[20px]" />
              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.span 
                    initial={{ opacity: 0, x: -6 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    exit={{ opacity: 0, x: -6 }}
                    className="font-semibold text-sm"
                  >
                    Create Post
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        <div className="space-y-1 border-t border-white/5 px-1 pt-3">
          {authUser ? (
            <motion.button
              type="button"
              {...buttonMotion}
              onClick={claimReward}
              className={navLinkClass(false, isCollapsed)}
            >
              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <Gem className="size-[17px]" />
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                    Daily Reward
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          ) : null}

          <motion.button
            type="button"
            {...buttonMotion}
            onClick={() => {
              triggerHaptic();
              setIsFocusModalOpen(true);
            }}
            className={navLinkClass(false, isCollapsed)}
            title="Focus Mode"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
              <Zap className="size-[17px]" />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                  Focus Mode
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.button>

          <motion.a
            href={`${APK_DOWNLOAD_URL}/latest`}
            {...buttonMotion}
            onClick={handleDownload}
            className={navLinkClass(false, isCollapsed)}
            title="Download App"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
              <Smartphone className="size-[17px]" />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                  Get the App
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.a>

          <div className="dropdown dropdown-top dropdown-end w-full">
            <motion.button
              type="button"
              {...buttonMotion}
              tabIndex={0}
              className={navLinkClass(false, isCollapsed)}
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
                <Menu className="size-[17px]" />
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                    More
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>

            <ul className="dropdown-content z-[70] mb-3 w-60 space-y-0.5 rounded-2xl p-2 text-sm bg-[#0c1020]/95 backdrop-blur-xl border border-white/5 shadow-2xl">
              <li className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white/30">Professional Tools</li>

              <li>
                <Link to="/creator-center" className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white">
                  <DollarSign className="size-4 text-emerald-400" />
                  Monetization
                </Link>
              </li>

              <li>
                <Link to="/business-insights" className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white">
                  <Globe className="size-4 text-indigo-400" />
                  Business Insights
                </Link>
              </li>

              {authUser?.role === "admin" ? (
                <li>
                  <Link to="/admin" className="flex min-h-[42px] items-center gap-3 rounded-xl px-3 py-2 text-white/60 transition-colors hover:bg-white/[0.04] hover:text-white">
                    <ShieldAlert className="size-4 text-amber-400" />
                    Admin Console
                  </Link>
                </li>
              ) : null}

              <li className="pt-1 border-t border-white/5">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-[42px] w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-rose-400 transition-colors hover:bg-rose-500/10"
                >
                  <PanelTopOpen className="size-4" />
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <motion.div {...buttonMotion}>
            <Link
              to="/profile"
              className={`${navLinkClass(isActivePath(location.pathname, "/profile"), isCollapsed)} overflow-hidden`}
              title="Profile"
            >
              {isActivePath(location.pathname, "/profile") && (
                <motion.span
                  layoutId="sidebar-active-pill"
                  className="absolute left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-full bg-indigo-500"
                />
              )}

              <div className="relative flex size-9 shrink-0 items-center justify-center rounded-xl">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-8 rounded-full object-cover ring-1 ring-white/10"
                  loading="lazy"
                  decoding="async"
                />
                {authUser?.isVerified || authUser?.role === "admin" ? (
                  <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#020617] p-[2px]">
                    <BadgeCheck className="size-3 fill-sky-400 text-white" />
                  </div>
                ) : null}
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.div
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -6 }}
                    className="min-w-0"
                  >
                    <p className="truncate text-sm font-medium text-white/80">{authUser?.fullName || "Profile"}</p>
                    <p className="truncate text-[11px] text-white/30">@{authUser?.username || "user"}</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Link>
          </motion.div>
        </div>
      </aside>

      <motion.nav
        initial={{ y: 16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed inset-x-3 bottom-3 z-[100] flex items-center justify-between rounded-2xl px-2 py-2 md:hidden bg-[#0c1020]/90 backdrop-blur-xl border border-white/5 shadow-2xl"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(location.pathname, item.to);

          return (
            <motion.div key={item.to} className="flex-1" {...buttonMotion}>
              <Link
                to={item.to}
                onClick={triggerHaptic}
                className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-xl px-3 py-2 text-[10px] font-medium ${
                  active ? "text-indigo-400" : "text-white/40"
                }`}
              >
                {active && <span className="absolute left-1/2 top-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-500" />}
                <Icon className="size-[18px]" strokeWidth={active ? 2.2 : 1.8} />
                <span className="mt-1">{item.label}</span>
                {item.to === "/inbox" ? <NavBadge count={unreadMessages} /> : null}
              </Link>
            </motion.div>
          );
        })}

        <motion.div className="flex-1" {...buttonMotion}>
          <button
            type="button"
            onClick={handleCreatePost}
            className="mx-auto flex min-h-[48px] min-w-[48px] items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/25"
          >
            <PlusCircle className="size-[20px]" />
          </button>
        </motion.div>

        <motion.div className="flex-1" {...buttonMotion}>
          <Link
            to="/profile"
            onClick={triggerHaptic}
            className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-xl px-3 py-2 text-[10px] font-medium ${
              isActivePath(location.pathname, "/profile") ? "text-indigo-400" : "text-white/40"
            }`}
          >
            {isActivePath(location.pathname, "/profile") && (
              <span className="absolute left-1/2 top-1 h-0.5 w-6 -translate-x-1/2 rounded-full bg-indigo-500" />
            )}
            <img src={authUser?.profilePic || "/avatar.png"} alt="Profile" className="size-5 rounded-full object-cover" />
            <span className="mt-1">Profile</span>
          </Link>
        </motion.div>
      </motion.nav>

      <AnimatePresence>
        {isFocusModalOpen ? (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-xl"
            >
              <button
                type="button"
                onClick={() => setIsFocusModalOpen(false)}
                className="absolute -top-12 right-0 inline-flex min-h-[40px] items-center rounded-full bg-white/10 backdrop-blur-xl px-4 text-xs font-medium text-white/60 hover:text-white transition-colors"
              >
                Close
              </button>
              <FocusModeView />
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      {viewingDP ? (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          isVerified={authUser?.isVerified || authUser?.role === "admin"}
          onClose={() => setViewingDP(null)}
          onUpdate={handleDPUpdate}
        />
      ) : null}
    </>
  );
});

Sidebar.displayName = "Sidebar";

export default Sidebar;
