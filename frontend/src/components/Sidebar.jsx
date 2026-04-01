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
  { to: "/", icon: Home, labelKey: "Home" },
  { to: "/search", icon: Search, labelKey: "Search" },
  { to: "/friends", icon: Compass, labelKey: "Explore" },
  { to: "/communities", icon: Users, labelKey: "Communities" },
  { to: "/reels", icon: Film, labelKey: "Reels" },
  { to: "/inbox", icon: MessageSquare, labelKey: "inbox" },
  { to: "/notifications", icon: Heart, labelKey: "notifications" },
  { to: "/games", icon: Gamepad2, labelKey: "Games" },
  { to: "/gem-shop", icon: Crown, labelKey: "Premium" },
  { to: "/prize-vault", icon: Gift, label: "Prize Vault" },
];

const mobileNavItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/search", icon: Search, label: "Search" },
  { to: "/reels", icon: Film, label: "Reels" },
];

const buttonMotion = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

const NavBadge = memo(({ count }) => {
  if (!count || count < 1) return null;

  return (
    <span className="absolute -right-1 -top-1 inline-flex min-w-[18px] items-center justify-center rounded-full border border-slate-900 bg-orange-500 px-1 text-[10px] font-bold leading-none text-white">
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

    const initialTitle = "Zyro | Professional Social Platform";

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const hooks = [
          "Zyro | Your feed is moving",
          "Zyro | New creator updates waiting",
          "Zyro | Claim your daily reward",
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
    downloadFile(`${APK_DOWNLOAD_URL}/latest`, "Zyro_app.apk");
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
        id: `zyro-nav-${item.labelKey?.toLowerCase() || item.label?.toLowerCase().replace(/\s+/g, "-")}`,
      })),
    []
  );

  const renderLabel = (item) => item.label || t(item.labelKey) || item.labelKey;

  const actionButtonClass = (active = false, collapsed = false) =>
    [
      "group relative flex w-full items-center rounded-2xl border px-3 text-sm font-medium transition-colors",
      "zyro-touch-target min-h-[48px]",
      collapsed ? "justify-center" : "gap-3",
      active
        ? "border-orange-500/30 bg-orange-500/10 text-orange-300"
        : "border-transparent text-slate-400 hover:border-slate-800 hover:bg-slate-900/80 hover:text-slate-100",
    ].join(" ");

  return (
    <>
      <aside
        className="zyro-shell-panel fixed inset-y-4 left-4 z-50 hidden md:flex flex-col rounded-[28px] px-3 py-4 text-slate-100"
        style={{ width: "var(--zyro-sidebar-width)" }}
      >
        <div className={`flex ${isCollapsed ? "flex-col items-center gap-3" : "items-center justify-between gap-3"} border-b border-slate-800 px-2 pb-4`}>
          <div className={`${isCollapsed ? "" : "min-w-0 flex-1"}`}>
            <Logo showText={!isCollapsed} fontSize="text-xl" />
          </div>

          <motion.button
            type="button"
            {...buttonMotion}
            onClick={() => setIsCollapsed((current) => !current)}
            className="zyro-touch-target inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-2xl border border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="size-4" strokeWidth={2} /> : <ChevronLeft className="size-4" strokeWidth={2} />}
          </motion.button>
        </div>

        <nav className="custom-scrollbar flex-1 space-y-1 overflow-y-auto px-1 py-4">
          <div className="space-y-1">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActivePath(location.pathname, item.to);
              const label = renderLabel(item);

              return (
                <motion.div key={item.to} {...buttonMotion}>
                  <Link id={item.id} to={item.to} className={actionButtonClass(active, isCollapsed)} title={label}>
                    {active ? (
                      <motion.span
                        layoutId="zyro-sidebar-active-pill"
                        className="absolute left-1 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-orange-500"
                      />
                    ) : null}

                    <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80">
                      <Icon className="size-[18px]" strokeWidth={2} />
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
              className={`${actionButtonClass(false, isCollapsed)} border-orange-500/35 bg-orange-500 text-white hover:bg-orange-600`}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                <PlusCircle className="size-[18px]" strokeWidth={2} />
              </div>

              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                    Create Post
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>
          </div>
        </nav>

        <div className="space-y-2 border-t border-slate-800 px-1 pt-4">
          {authUser ? (
            <motion.button
              type="button"
              {...buttonMotion}
              onClick={claimReward}
              className={actionButtonClass(false, isCollapsed)}
            >
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300">
                <Gem className="size-[18px]" strokeWidth={2} />
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
            className={actionButtonClass(false, isCollapsed)}
            title="Focus Mode"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80">
              <Zap className="size-[18px]" strokeWidth={2} />
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
            className={actionButtonClass(false, isCollapsed)}
            title="Download App"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80">
              <Smartphone className="size-[18px]" strokeWidth={2} />
            </div>
            <AnimatePresence initial={false}>
              {!isCollapsed ? (
                <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                  Download App
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.a>

          <div className="dropdown dropdown-top dropdown-end w-full">
            <motion.button
              type="button"
              {...buttonMotion}
              tabIndex={0}
              className={actionButtonClass(false, isCollapsed)}
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80">
                <Menu className="size-[18px]" strokeWidth={2} />
              </div>
              <AnimatePresence initial={false}>
                {!isCollapsed ? (
                  <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }}>
                    More
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </motion.button>

            <ul className="dropdown-content zyro-shell-panel z-[70] mb-3 w-64 space-y-1 rounded-[24px] p-2 text-sm">
              <li className="px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Creator Ops</li>

              <li>
                <Link to="/creator-center" className="flex min-h-[44px] items-center gap-3 rounded-2xl px-3 py-2 text-slate-200 transition-colors hover:bg-slate-900/80 hover:text-white">
                  <DollarSign className="size-4 text-orange-400" strokeWidth={2} />
                  Creator Monetization
                </Link>
              </li>

              <li>
                <Link to="/antigravity-engine" className="flex min-h-[44px] items-center gap-3 rounded-2xl px-3 py-2 text-slate-200 transition-colors hover:bg-slate-900/80 hover:text-white">
                  <Globe className="size-4 text-orange-400" strokeWidth={2} />
                  Antigravity Engine
                </Link>
              </li>

              {authUser?.role === "admin" ? (
                <li>
                  <Link to="/admin" className="flex min-h-[44px] items-center gap-3 rounded-2xl px-3 py-2 text-slate-200 transition-colors hover:bg-slate-900/80 hover:text-white">
                    <ShieldAlert className="size-4 text-orange-400" strokeWidth={2} />
                    Admin Console
                  </Link>
                </li>
              ) : null}

              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex min-h-[44px] w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200"
                >
                  <PanelTopOpen className="size-4" strokeWidth={2} />
                  Logout
                </button>
              </li>
            </ul>
          </div>

          <motion.div {...buttonMotion}>
            <Link
              to="/profile"
              className={`${actionButtonClass(isActivePath(location.pathname, "/profile"), isCollapsed)} overflow-hidden`}
              title="Profile"
            >
              {isActivePath(location.pathname, "/profile") ? (
                <motion.span
                  layoutId="zyro-sidebar-active-pill"
                  className="absolute left-1 top-1/2 h-7 w-1 -translate-y-1/2 rounded-full bg-orange-500"
                />
              ) : null}

              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900/80">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt="Profile"
                  className="size-8 rounded-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
                {authUser?.isVerified || authUser?.role === "admin" ? (
                  <div className="absolute -bottom-1 -right-1 rounded-full bg-slate-950 p-[2px]">
                    <BadgeCheck className="size-3.5 fill-sky-500 text-white" strokeWidth={2} />
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
                    <p className="truncate text-sm font-medium text-slate-100">{authUser?.fullName || "Profile"}</p>
                    <p className="truncate text-xs text-slate-500">@{authUser?.username || "zyro-user"}</p>
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
        className="zyro-shell-panel fixed inset-x-3 bottom-3 z-[100] flex items-center justify-between rounded-[24px] px-2 py-2 md:hidden"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActivePath(location.pathname, item.to);

          return (
            <motion.div key={item.to} className="flex-1" {...buttonMotion}>
              <Link
                to={item.to}
                onClick={triggerHaptic}
                className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] font-medium ${
                  active ? "bg-orange-500/10 text-orange-300" : "text-slate-400"
                }`}
              >
                {active ? <span className="absolute left-1/2 top-1 h-1 w-7 -translate-x-1/2 rounded-full bg-orange-500" /> : null}
                <Icon className="size-[18px]" strokeWidth={2} />
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
            className="mx-auto flex min-h-[52px] min-w-[52px] items-center justify-center rounded-2xl bg-orange-500 text-white zyro-soft-shadow"
          >
            <PlusCircle className="size-[20px]" strokeWidth={2} />
          </button>
        </motion.div>

        <motion.div className="flex-1" {...buttonMotion}>
          <Link
            to="/profile"
            onClick={triggerHaptic}
            className={`relative flex min-h-[48px] flex-col items-center justify-center rounded-2xl px-3 py-2 text-[11px] font-medium ${
              isActivePath(location.pathname, "/profile") ? "bg-orange-500/10 text-orange-300" : "text-slate-400"
            }`}
          >
            {isActivePath(location.pathname, "/profile") ? (
              <span className="absolute left-1/2 top-1 h-1 w-7 -translate-x-1/2 rounded-full bg-orange-500" />
            ) : null}
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
                className="absolute -top-12 right-0 inline-flex min-h-[44px] items-center rounded-full border border-slate-700 bg-slate-950/90 px-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
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
