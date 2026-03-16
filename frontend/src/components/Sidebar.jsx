import { memo, useState, useEffect, useMemo, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateProfile, getCoupleStatus, claimDailyReward } from "../lib/api";
import { APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useNotificationCounts from "../hooks/useNotificationCounts";
import useAuthUser from "../hooks/useAuthUser";
import {
  Home, Users, HeartHandshake, Crown, Gamepad2, Search, Film, 
  MessageSquare, Smartphone, ShieldAlert, BadgeCheck, Gem, 
  Heart, Sparkles, PlusCircle, Compass, Menu, Zap, DollarSign, Globe, Newspaper, Gift
} from "lucide-react";

import CreateStoryModal from "./CreateStoryModal";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import FocusModeView from "./FocusModeView";
import Logo from "./Logo";
import { logout } from "../lib/api";

// === STATIC CONFIGURATION ===
const staticNavItems = [
  { to: "/", icon: Home, labelKey: "Home" },
  { to: "/ipl-dashboard", icon: Zap, label: "IPL Exclusive", isSacred: true },
  { to: "/feed", icon: Newspaper, labelKey: "feed" },
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

// === PERFORMANCE OPTIMIZATION: Memoized Sub-Components ===
// Extracted pure UI components to prevent the entire sidebar from rendering
// when internal counters or dates tick.
const NavBadge = memo(({ count, maxCount = 9 }) => {
  if (!count || count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-error text-white text-[11px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-100">
      {count > maxCount ? `${maxCount}+` : count}
    </span>
  );
});
NavBadge.displayName = "NavBadge";

const DailyRewardButton = memo(({ authUser, onClaim }) => {
  if (!authUser) return null;
  const todayStr = new Date().toISOString().split('T')[0];
  const lastClaimDate = authUser.lastRewardClaimDate ? new Date(authUser.lastRewardClaimDate) : null;
  const lastClaimStr = lastClaimDate ? lastClaimDate.toISOString().split('T')[0] : null;

  if (lastClaimStr === todayStr) return null;

  return (
    <button
      className="w-full flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-purple-500 hover:bg-purple-500/10 group/nav"
      title="Claim Reward"
      onClick={onClaim}
    >
      <div className="relative shrink-0 flex items-center justify-center w-8">
        <div className="absolute inset-0 bg-purple-500/20 rounded-full animate-ping opacity-50"></div>
        <Gem className="size-[26px] stroke-2 group-hover/nav:scale-110 transition-transform" />
      </div>
      <span className="hidden xl:block text-[16px] font-semibold tracking-tight truncate">
        Claim Gems
      </span>
    </button>
  );
});
DailyRewardButton.displayName = "DailyRewardButton";


// === MAIN COMPONENT ===
const Sidebar = memo(() => {
  const { authUser } = useAuthUser();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { notificationCount, unreadMessages } = useNotificationCounts();
  
  const currentPath = location.pathname;
  
  // Modals state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);

  // === RETENTION HOOK: Tab Title Optimization ===
  useEffect(() => {
    if (!authUser?._id) return;

    const initialTitle = "BondBeyond | Connect & Play";
    document.title = initialTitle;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const hooks = [
          "Don't break your streak! 🔥",
          "New Reels for you! 🍿",
          "Claim your daily gems! 💎"
        ];
        document.title = hooks[Math.floor(Math.random() * hooks.length)];
      } else {
        document.title = initialTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  // Bound to scalar ID rather than auth object to prevent infinite teardown loops
  }, [authUser?._id]);

  // === STABLE CALLBACKS ===
  const handleDownload = useCallback((e) => {
    e.preventDefault();
    downloadFile(`${APK_DOWNLOAD_URL}/latest`, "BondBeyond_app.apk");
  }, []);

  const handleCreatePost = useCallback(() => {
     window.scrollTo({ top: 0, behavior: 'smooth' });
     toast("Create post is at the top of your feed!", { icon: "✨" });
  }, []);

  const claimReward = useCallback(async () => {
    try {
      const res = await claimDailyReward();
      toast.success(res.message, { icon: '💎' });
      // Single targeted invalidation avoids crashing the query stack
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    } catch (err) {
      toast.error(err.response?.data?.message || "Wait for tomorrow!");
    }
  }, [queryClient]);

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

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      queryClient.setQueryData(["authUser"], null);
      window.location.href = "/login";
    } catch (err) {
      toast.error("Logout failed. Try clearing cache.");
    }
  }, [queryClient]);

  const handleDPUpdate = useCallback(async (base64) => {
    await doUpdate({ profilePic: base64 });
    setViewingDP(null);
  }, [doUpdate]);

  // Couple Relationship status stream
  const { data: coupleData } = useQuery({
    queryKey: ["coupleStatus"],
    queryFn: getCoupleStatus,
    enabled: !!authUser?._id,
    staleTime: 1000 * 60 * 10
  });

  const isCoupled = coupleData?.coupleStatus === "coupled";
  const partnerId = coupleData?.partner?._id;

  // === DATA MEMOIZATION ===
  // Prevents recreation of 14 complex Nav Objects containing Lucide SVG bindings on every scroll/keystroke.
  const dynamicNavItems = useMemo(() => {
    const items = staticNavItems.map(item => ({
      ...item,
      id: `tour-${item.labelKey?.toLowerCase() || item.label?.toLowerCase().replace(/\s+/g, '-')}`
    }));

    // Couple feature disabled for now
    return items;
  }, [isCoupled, partnerId]);

  return (
    <aside className="w-[80px] xl:w-[244px] hidden md:flex flex-col h-screen fixed top-0 left-0 border-r border-base-content/10 bg-base-100 z-50 overflow-hidden transition-all duration-300">
      
      {/* Brand area */}
      <div className="pt-8 pb-6 px-4 xl:px-6">
        <Link to="/" className="flex items-center gap-4 group/logo focus:outline-none">
           <div className="size-10 bg-gradient-to-tr from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg group-hover/logo:scale-105 transition-transform shrink-0">
             <Heart className="size-6 text-white fill-white" />
           </div>
           <span className="hidden xl:block text-2xl font-black tracking-tight font-outfit truncate">
             BondBeyond
           </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
        {dynamicNavItems.map(({ to, icon: Icon, labelKey, isSacred, label: directLabel, id }) => {
          const isActive = currentPath === to;
          const displayLabel = isSacred || directLabel ? (directLabel) : t(labelKey) || labelKey;

          return (
            <Link
              key={to}
              to={to}
              id={id}
              className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group/nav ${
                isActive ? "font-bold text-base-content bg-base-content/5" : "text-base-content hover:bg-base-content/5"
              }`}
              title={displayLabel}
            >
              <div className="relative shrink-0 flex items-center justify-center w-8">
                <Icon
                  className={`size-[26px] transition-transform duration-200 group-hover/nav:scale-105 ${
                    isActive && labelKey !== "Search" ? "stroke-[2.5px]" : "stroke-2 opacity-90"
                  } ${isSacred ? "text-pink-500" : ""}`}
                  // Optimization: Directly binding fill to currentColor eliminates expensive CSS specificity overwrites
                  fill={isActive && labelKey !== "Search" && labelKey !== "Explore" ? "currentColor" : "none"}
                />
                
                {labelKey === "inbox" && <NavBadge count={unreadMessages} />}
                {labelKey === "notifications" && <NavBadge count={notificationCount} />}
              </div>
              <span className={`hidden xl:block text-[16px] tracking-tight truncate ${isActive ? "" : "opacity-90"} ${isSacred ? "text-pink-500 font-semibold" : ""}`}>
                {displayLabel}
              </span>
            </Link>
          );
        })}

        {/* Create Post Button */}
        <button
          onClick={handleCreatePost}
          id="tour-create"
          className="flex w-full items-center gap-4 p-3 rounded-lg transition-all duration-200 text-base-content hover:bg-base-content/5 group/nav"
          title="Create"
        >
          <div className="relative shrink-0 flex items-center justify-center w-8">
            <PlusCircle className="size-[26px] stroke-2 opacity-90 transition-transform duration-200 group-hover/nav:scale-105" />
          </div>
          <span className="hidden xl:block text-[16px] tracking-tight truncate opacity-90">
            Create
          </span>
        </button>

        {/* Profile Link */}
        <Link
          to="/profile"
          id="tour-profile"
          className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group/nav ${
            currentPath === "/profile" ? "font-bold text-base-content bg-base-content/5" : "text-base-content hover:bg-base-content/5"
          }`}
          title="Profile"
        >
          <div className="relative shrink-0 flex items-center justify-center w-8">
             <div className={`size-7 rounded-full overflow-hidden shrink-0 bg-base-300 transition-transform duration-200 group-hover/nav:scale-105 ${
               currentPath === "/profile" ? "ring-2 ring-base-content ring-offset-2 ring-offset-base-100" : ""
             }`}>
                 <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                 />
             </div>
             {(authUser?.isVerified || authUser?.role === "admin") && (
                <div className="absolute -bottom-1 -right-1 size-3.5 bg-white rounded-full flex items-center justify-center p-[1px] shadow-sm ring-1 ring-base-content/5 overflow-hidden">
                   <BadgeCheck className="size-full text-white fill-[#1d9bf0]" strokeWidth={2} />
                </div>
             )}
          </div>
          <span className={`hidden xl:block text-[16px] tracking-tight truncate ${currentPath === "/profile" ? "" : "opacity-90"}`}>
            Profile
          </span>
        </Link>
        
        {/* Admin Link */}
        {authUser?.role === "admin" && (
          <Link
            to="/admin"
            className={`flex items-center gap-4 p-3 rounded-lg transition-all duration-200 group/nav mt-4 bg-primary/10 ${
              currentPath === "/admin" ? "font-bold text-primary" : "text-primary hover:bg-primary/20"
            }`}
            title="Admin"
          >
            <div className="relative shrink-0 flex items-center justify-center w-8">
              <ShieldAlert className="size-[24px] stroke-2 transition-transform duration-200 group-hover/nav:scale-105" />
            </div>
            <span className="hidden xl:block text-[16px] tracking-tight truncate">
              {t('admin_command') || "Admin"}
            </span>
          </Link>
        )}
      </nav>

      {/* DAILY REWARDS & BOTTOM ACTIONS */}
      <div className="px-3 pb-6 pt-2 space-y-2 mt-auto">
      
        {/* Memoized Daily Reward Integration */}
        {authUser && <DailyRewardButton authUser={authUser} onClaim={claimReward} />}

        {/* Watch Tutorial */}
        <button
          onClick={() => window.dispatchEvent(new CustomEvent("bondbeyond_start_tutorial"))}
          className="flex w-full items-center gap-4 p-3 rounded-lg transition-all duration-200 text-base-content opacity-70 hover:opacity-100 hover:bg-base-content/5 group/nav"
          title="Watch Tutorial"
        >
          <div className="relative shrink-0 flex items-center justify-center w-8">
            <Sparkles className="size-[26px] stroke-2 text-primary group-hover/nav:scale-105 transition-transform" />
          </div>
          <span className="hidden xl:block text-[16px] tracking-tight truncate">
            Help & Tutorial
          </span>
        </button>

        {/* Download App */}
        <a
          href={`${APK_DOWNLOAD_URL}/latest`}
          onClick={handleDownload}
          className="flex items-center gap-4 p-3 rounded-lg transition-all duration-200 text-base-content opacity-70 hover:opacity-100 hover:bg-base-content/5 group/nav"
          title="Download App"
        >
          <div className="relative shrink-0 flex items-center justify-center w-8">
            <Smartphone className="size-[26px] stroke-2 group-hover/nav:scale-105 transition-transform" />
          </div>
          <span className="hidden xl:block text-[16px] tracking-tight truncate">
            Get App
          </span>
        </a>

        {/* Menu (More) — Optimized with Premium Dropdown */}
        <div className="dropdown dropdown-top dropdown-end w-full">
          <label 
            tabIndex={0} 
            className="flex w-full items-center gap-4 p-3 rounded-lg transition-all duration-200 text-base-content hover:bg-base-content/5 group/nav cursor-pointer"
          >
            <div className="relative shrink-0 flex items-center justify-center w-8">
              <Menu className="size-[26px] stroke-2 opacity-90 transition-transform duration-200 group-hover/nav:scale-105" />
            </div>
            <span className="hidden xl:block text-[16px] tracking-tight truncate opacity-90 font-medium">
              More
            </span>
          </label>
          <ul tabIndex={0} className="dropdown-content z-[60] menu p-2 shadow-2xl bg-base-100 border border-base-content/10 rounded-2xl w-64 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <li className="menu-title px-4 py-2 opacity-40 text-[10px] uppercase font-black tracking-widest">Bond OS Menu</li>
            
            <li>
              <Link to="/creator-center" className="flex items-center gap-3 p-3 rounded-xl hover:bg-emerald-500/10 text-emerald-500 font-bold">
                <DollarSign className="size-5 fill-emerald-500/20" />
                Creator Monetization
              </Link>
            </li>
            
            <li>
              <Link to="/ipl-arena" className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-500/10 text-orange-500 font-bold">
                <Zap className="size-5 fill-orange-500/20" />
                IPL Live Arena
              </Link>
            </li>

            <li>
              <Link to="/antigravity-engine" className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-500/10 text-blue-500 font-bold">
                <Globe className="size-5 fill-blue-500/20" />
                Antigravity Engine
              </Link>
            </li>

            <li>
              <button 
                onClick={() => setIsFocusModalOpen(true)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 text-primary font-bold"
              >
                <Zap className="size-5 fill-primary/20" />
                AI Career Focus Mode
              </button>
            </li>

            <li>
              <Link to="/settings" className="flex items-center gap-3 p-3 rounded-xl">
                 <BadgeCheck className="size-5 text-info" />
                 Verification & Settings
              </Link>
            </li>

            <div className="divider my-0 opacity-5"></div>

            <li>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-xl text-error hover:bg-error/10"
              >
                Logout Account
              </button>
            </li>
          </ul>
        </div>
      </div>

      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* AI Career Focus Mode Modal */}
      <AnimatePresence>
        {isFocusModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFocusModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl z-10"
            >
               <button 
                 onClick={() => setIsFocusModalOpen(false)}
                 className="absolute -top-12 right-0 text-white opacity-50 hover:opacity-100 font-bold bg-white/10 px-4 py-2 rounded-full"
               >
                 Close Esc
               </button>
               <FocusModeView />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          isVerified={authUser?.isVerified || authUser?.role === "admin"}
          onClose={() => setViewingDP(null)}
          onUpdate={handleDPUpdate}
        />
      )}
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;