import { useState, useMemo, useCallback, memo } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateProfile, getCoupleStatus, claimDailyReward } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Users, Bell, Menu, X, LogOut, Pencil, Heart, Crown, Gamepad2, User, Search, Film, Flame, MessageSquare, Smartphone, ShieldAlert, BadgeCheck, Gem, Sparkles, Newspaper,
} from "lucide-react";

import useAuthUser from "../hooks/useAuthUser";
import useLogout from "../hooks/useLogout";
import useNotificationCounts from "../hooks/useNotificationCounts";
import ThemeSelector from "./ThemeSelector";
import LanguageSelector from "./LanguageSelector";
import CreateStoryModal from "./CreateStoryModal";
import Logo from "./Logo";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import { motion, AnimatePresence } from "framer-motion";

// === PERFORMANCE OPTIMIZATION: Memoized Sub-components ===
// Extracted the computationally heavy Daily Reward card logic to prevent it 
// from re-rendering every time the user clicks a tab or scrolls.
const DailyRewardCard = memo(({ authUser, onClaim }) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastClaimDate = authUser.lastRewardClaimDate ? new Date(authUser.lastRewardClaimDate) : null;
  const lastClaimStr = lastClaimDate ? lastClaimDate.toISOString().split('T')[0] : null;
  const hasClaimedToday = lastClaimStr === todayStr;

  if (hasClaimedToday) return null;

  const progress = (authUser.streak % 7) / 7 * 100;

  return (
    <div className="px-3 pt-4 pb-2">
      <motion.div
        whileTap={{ scale: 0.98 }}
        onClick={onClaim}
        className="p-4 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 border-t border-white/20 relative overflow-hidden group cursor-pointer"
      >
        <div className="absolute top-0 right-0 p-2 opacity-10 -rotate-12">
          <Gem className="size-16 text-white" />
        </div>
        <div className="relative z-10 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-white/80 uppercase tracking-widest">Gem Drop</span>
            <div className="flex items-center gap-1 bg-black/20 px-1.5 py-0.5 rounded-full">
              <Flame className="size-2.5 text-white fill-current" />
              <span className="text-[9px] font-black text-white">{authUser.streak}d</span>
            </div>
          </div>
          <h4 className="text-base font-black italic text-white tracking-tight uppercase">Ready to Claim</h4>
          <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden mt-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
});

DailyRewardCard.displayName = "DailyRewardCard";


// === MAIN DRAWER MODULE ===
const MobileDrawer = memo(() => {
  const { authUser } = useAuthUser();
  const { t } = useTranslation();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  
  const { logoutMutation, isPending: isLoggingOut } = useLogout();
  const { unreadMessages, notificationCount } = useNotificationCounts();
  const queryClient = useQueryClient();

  // Stable callbacks using useCallback to ensure child components like the ProfileViewer
  // do not tear down and rebuild their hooks repeatedly.
  const toggleDrawer = useCallback(() => setIsOpen(prev => !prev), []);
  const closeStoryModal = useCallback(() => setIsStoryModalOpen(false), []);
  const closeDPViewer = useCallback(() => setViewingDP(null), []);

  const handleDownload = useCallback((e) => {
    e.preventDefault();
    downloadFile(`${APK_DOWNLOAD_URL}/latest`, "BondBeyond_app.apk");
  }, []);

  const handleCreatePost = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast("Create post is at the top of your feed!", { icon: "✨" });
  }, []);

  const { mutate: doUpdate } = useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      toast.success("Profile photo updated! ✨");
      queryClient.setQueryData(["authUser"], data.user);
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update photo");
    }
  });

  const handleDPUpdate = useCallback(async (base64) => {
    await doUpdate({ profilePic: base64 });
    setViewingDP(null);
  }, [doUpdate]);

  const { data: coupleData } = useQuery({
    queryKey: ["coupleStatus"],
    queryFn: getCoupleStatus,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 10
  });

  const isCoupled = coupleData?.coupleStatus === "coupled";
  const partnerId = coupleData?.partner?._id;
  const partnerName = coupleData?.partner?.fullName?.split(' ')[0] || "Partner";

  // === DATA OPTIMIZATION: Memoized Navigation ===
  // In highly interactive mobile apps, recreating this 15-item array with nested SVG icons
  // on every scroll/touch event drains battery. Locked down inside useMemo.
  const dynamicNavItems = useMemo(() => {
    const baseItems = [
      { to: "/", icon: Home, labelKey: "Home" },
      { to: "/feed", icon: Newspaper, labelKey: "feed" },
      { to: "/inbox", icon: MessageSquare, labelKey: "inbox" },
      { to: "/friends", icon: Users, label: "Community" },
      { to: "/reels", icon: Film, labelKey: "reels" },
      { to: "/search", icon: Search, labelKey: "explore" },
      { to: "/notifications", icon: Bell, labelKey: "notifications" },
      { to: "/posts", icon: Pencil, labelKey: "post" },
      { to: "/chat/ai-coach-id", icon: Sparkles, label: "DR. BOND (AI Coach)", isSacred: true },
      { to: "/games", icon: Gamepad2, labelKey: "games" },
      {to: "/gem-shop", icon: Gem, labelKey: "gem_shop" },
      { to: "/membership", icon: Crown, labelKey: "premium" },
      { to: "/profile", icon: User, labelKey: "profile" },
    ];

    // Relationship features disabled
    return baseItems;
  }, [isCoupled, partnerId, partnerName]);

  const bottomTabs = useMemo(() => [
    dynamicNavItems[0], // Home
    dynamicNavItems.find(item => item.to === "/reels") || dynamicNavItems[3], // Reels
    dynamicNavItems.find(item => item.to === "/inbox") || dynamicNavItems[1], // Inbox
    dynamicNavItems.find(item => item.to === "/search") || dynamicNavItems[4], // Search
    dynamicNavItems.find(item => item.to === "/profile") || dynamicNavItems[12] // Profile
  ], [dynamicNavItems]);

  const claimReward = useCallback(async () => {
    try {
      if (window.AndroidBridge) window.AndroidBridge.vibrate(50);
      const res = await claimDailyReward();
      toast.success(res.message, { icon: '💎' });
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      setIsOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Wait for tomorrow!");
    }
  }, [queryClient]);

  const handleLogout = useCallback(() => {
    setIsOpen(false);
    logoutMutation();
  }, [logoutMutation]);

  // Derived check indicating high-intensity native apps (hides basic mobile UI elements)
  const isHiddenRoute = location.pathname.startsWith("/chat") || location.pathname.startsWith("/reels") || location.pathname.startsWith("/call");

  return (
    <>
      <CreateStoryModal isOpen={isStoryModalOpen} onClose={closeStoryModal} />

      {/* === MOBILE TOP BAR === */}
      <div className={`lg:hidden sticky top-0 left-0 right-0 z-50 glass-panel-solid border-b border-white/5 px-4 py-3 flex items-center justify-between safe-area-top ${isHiddenRoute ? "hidden" : ""}`}>
        <div className="flex items-center">
           <button onClick={handleCreatePost} className="p-1 hover:opacity-60 active:scale-90 transition-all text-base-content" aria-label="Create Post">
             <Pencil className="size-[22px]" strokeWidth={2.5} />
           </button>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
           <span className="text-xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
             BondBeyond
           </span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative p-1 hover:opacity-60 active:scale-90 transition-all" aria-label="Notifications">
            <Heart className="size-[22px] text-base-content" strokeWidth={2.5} />
            {notificationCount > 0 && (
              <span className="absolute top-0.5 right-0.5 size-2 bg-error rounded-full ring-2 ring-base-100" />
            )}
          </Link>
          
          <button onClick={toggleDrawer} className="p-1 hover:opacity-60 active:scale-90 transition-all text-base-content" aria-label="Open Menu">
            <Menu className="size-[22px]" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* === SLIDE-OUT DRAWER === */}
      {/* Optimized transform animation preventing CSS layout thrashing */}
      <div className={`fixed inset-y-0 left-0 w-72 bg-base-100 border-r border-base-300 z-[60] transform ${isOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col`}>
        <div className="p-4 flex justify-between items-center border-b border-base-300">
          <Logo className="size-6" fontSize="text-lg" />
          <div className="flex items-center gap-1">
            <LanguageSelector />
            <ThemeSelector />
            <button onClick={toggleDrawer} className="btn btn-ghost btn-sm btn-circle active:scale-90 transition-transform ml-1">
              <X className="size-5" />
            </button>
          </div>
        </div>

        {authUser ? <DailyRewardCard authUser={authUser} onClaim={claimReward} /> : null}

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto no-scrollbar overscroll-contain">
          {dynamicNavItems.map(({ to, icon: Icon, labelKey, isSacred, label: customLabel }) => (
            <Link
              key={to}
              to={to}
              onClick={toggleDrawer}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                location.pathname === to
                ? (isSacred || (to === "/couple" && isCoupled)) ? "bg-pink-500 text-white shadow-md shadow-pink-500/20" : "bg-primary text-primary-content shadow-md shadow-primary/20"
                : (isSacred || (to === "/couple" && isCoupled)) ? "text-pink-500 hover:bg-pink-500/5" : "hover:bg-base-200 active:bg-base-300"
              }`}
            >
              <div className="relative">
                {((to === "/couple" || isSacred) && isCoupled) ? (
                  <Heart className={`size-5 ${location.pathname === to ? "fill-white/20" : "fill-pink-500/10"}`} />
                ) : (
                  <Icon className="size-5" />
                )}
                {labelKey === "inbox" && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-primary">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
                {labelKey === "notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              {customLabel || t(labelKey)}
            </Link>
          ))}

          <a href={`${APK_DOWNLOAD_URL}/latest`} onClick={(e) => { toggleDrawer(); handleDownload(e); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-accent transition-all duration-200 active:scale-[0.98] hover:bg-accent/10 mt-4 border border-dashed border-accent/30 bg-accent/5">
            <Smartphone className="size-5" />
            Download Android App
          </a>

          {authUser?.role === "admin" && (
            <Link to="/admin" onClick={toggleDrawer} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 mt-4 border border-primary/20 bg-primary/5 ${location.pathname === "/admin" ? "bg-primary text-primary-content" : "text-primary hover:bg-primary/10"}`}>
              <ShieldAlert className="size-5" />
              Admin Command
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-base-300 space-y-3">
          <div className="flex items-center gap-3">
            <div className="avatar cursor-pointer active:scale-95 transition-transform" onClick={() => setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName, isVerified: authUser?.isVerified || authUser?.role === "admin" })}>
              <div className="w-12 h-12 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
                <img src={authUser?.profilePic || "/avatar.png"} alt="User Avatar" className="object-cover w-full h-full" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-base truncate flex items-center gap-1">
                {authUser?.fullName}
                {(authUser?.role === "admin" || authUser?.isVerified) && (
                  <div className="flex items-center justify-center shrink-0" title="Verified Professional">
                    <BadgeCheck className="size-4 text-white fill-[#1d9bf0]" strokeWidth={1.5} />
                  </div>
                )}
              </div>
              <p className="text-xs text-success flex items-center gap-1 font-medium">
                <span className="size-2 rounded-full bg-success animate-pulse" />
                Active Now
              </p>
            </div>
          </div>

          <button onClick={handleLogout} disabled={isLoggingOut} className="btn btn-error btn-outline btn-sm rounded-xl gap-2 w-full active:scale-[0.96] transition-all duration-200 h-10 border-error/20 hover:bg-error hover:border-error group font-bold">
            {isLoggingOut ? <span className="loading loading-spinner loading-xs" /> : <LogOut className="size-4 group-hover:rotate-6 transition-transform" />}
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </div>

      {/* OVERLAY: Framer Motion allows precise teardown of the blurred background */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
            onClick={toggleDrawer}
          />
        )}
      </AnimatePresence>

      {/* === BOTTOM TAB BAR === */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-[60] glass-panel-solid border-t border-base-300/50 safe-area-bottom ${isHiddenRoute ? "hidden" : ""}`}>
        <div className="flex items-center justify-around py-1.5 px-1">
          {bottomTabs.map(({ to, icon: Icon, labelKey, label }) => {
            const isActive = location.pathname === to;
            const isProfile = to === "/profile";
            
            return (
              <Link key={to} to={to} className={`relative flex flex-col items-center gap-0.5 py-2 px-3 rounded-2xl transition-all duration-200 active:scale-90 ${isActive ? "text-primary" : "text-base-content/60"}`}>
                <div className="relative">
                  {isProfile ? (
                    <div className={`size-6 rounded-full overflow-hidden border-2 transition-all ${isActive ? "border-primary scale-110" : "border-transparent"}`}>
                       <img src={authUser?.profilePic || "/avatar.png"} alt="Me" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <Icon className={`size-[26px] transition-transform ${isActive ? "scale-110" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                  )}
                  
                  {labelKey === "inbox" && unreadMessages > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[14px] h-3.5 px-0.5 bg-error text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-1 ring-base-100">
                      {unreadMessages > 9 ? "9+" : unreadMessages}
                    </span>
                  )}
                </div>
                <span className={`text-[9px] font-bold tracking-tighter uppercase transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}>
                  {label || t(labelKey)}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Modals outside regular UI flow */}
      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          isVerified={viewingDP.isVerified}
          onClose={closeDPViewer}
          onUpdate={handleDPUpdate}
        />
      )}
    </>
  );
});

MobileDrawer.displayName = "MobileDrawer";
export default MobileDrawer;
