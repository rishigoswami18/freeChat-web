import { useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { updateProfile, getCoupleStatus, claimDailyReward } from "../lib/api";
import { BASE_URL, APK_DOWNLOAD_URL, downloadFile } from "../lib/axios";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import useNotificationCounts from "../hooks/useNotificationCounts";
import { useState, useEffect } from "react";
import useAuthUser from "../hooks/useAuthUser";
import {
  Home,
  Users,
  Bell,
  HeartHandshake,
  Crown,
  Gamepad2,
  User,
  Search,
  Film,
  MessageSquare,
  Smartphone,
  ShieldAlert,
  BadgeCheck,
  Gem,
  Heart,
  Flame,
  Sparkles,
  Shield,
  Zap,
} from "lucide-react";

import CreateStoryModal from "./CreateStoryModal";
import ProfilePhotoViewer from "./ProfilePhotoViewer";
import Logo from "./Logo";

const navItems = [
  { to: "/", icon: Home, labelKey: "feed" },
  { to: "/inbox", icon: MessageSquare, label: "Messages" },
  { to: "/profile", icon: User, labelKey: "profile" },
  { to: "/friends", icon: Users, label: "Community" },
  { to: "/search", icon: Search, labelKey: "explore" },
  { to: "/reels", icon: Film, labelKey: "reels" },
  { to: "/notifications", icon: Bell, labelKey: "notifications" },
  { to: "/couple", icon: HeartHandshake, label: "Soul Bond" },
  { to: "/games", icon: Gamepad2, labelKey: "games" },
  { to: "/gem-shop", icon: Gem, labelKey: "gem_shop" },
  { to: "/membership", icon: Crown, labelKey: "premium" },
];

const Sidebar = () => {
  const { authUser } = useAuthUser();
  // Dynamic Tab Title (Retention Hook)
  useEffect(() => {
    const initialTitle = "BondBeyond | Connect & Play";
    document.title = initialTitle; // Set initial title

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const hooks = [
          "Don't break your streak! 🔥",
          "New Reels for you! 🍿",
          "Your partner is waiting... ❤️",
          "Claim your daily gems! 💎"
        ];
        document.title = hooks[Math.floor(Math.random() * hooks.length)];
      } else {
        document.title = initialTitle;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [!!authUser]); // Dependency on authUser presence

  const location = useLocation();
  const queryClient = useQueryClient();
  const currentPath = location.pathname;
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [viewingDP, setViewingDP] = useState(null);
  const { notificationCount, unreadMessages } = useNotificationCounts();
  const { t } = useTranslation();
  const [showConfetti, setShowConfetti] = useState(false); // State for confetti

  const handleDownload = (e) => {
    e.preventDefault();
    downloadFile(`${APK_DOWNLOAD_URL}/latest`, "BondBeyond_app.apk");
  };

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

  const navigate = useNavigate();

  const { data: coupleData } = useQuery({
    queryKey: ["coupleStatus"],
    queryFn: getCoupleStatus,
    enabled: !!authUser,
    staleTime: 1000 * 60 * 10
  });

  const isCoupled = coupleData?.coupleStatus === "coupled";
  const partnerId = coupleData?.partner?._id;
  const partnerName = coupleData?.partner?.fullName?.split(' ')[0] || "Partner";

  const dynamicNavItems = [...navItems];
  if (isCoupled) {
    // Insert Sacred Chat after Inbox
    const inboxIndex = dynamicNavItems.findIndex(item => item.to === "/inbox");
    if (inboxIndex !== -1) {
      dynamicNavItems.splice(inboxIndex + 1, 0, {
        to: `/chat/${partnerId || 'ai-user-id'}`,
        icon: Sparkles,
        label: `Chat with ${partnerName}`,
        isSacred: true
      });
    }
  }

  return (
    <aside className="w-[260px] glass-panel hidden lg:flex flex-col h-[calc(100vh-2rem)] fixed top-4 left-4 font-outfit z-40 rounded-[32px] overflow-hidden border-white/20 luxe-shadow-pink">
      {/* Brand area */}
      <div className="px-6 py-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
        <Logo className="size-10" fontSize="text-2xl" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
        {dynamicNavItems.map((item) => {
          const { to, icon: Icon, labelKey, isSacred, label: directLabel } = item;
          const isActive = currentPath === to;
          const label = isSacred || directLabel ? (directLabel || item.label) : t(labelKey);
          const isBond = labelKey === "bond_dashboard" || directLabel === "Soul Bond";
          const useRomanticStyle = (isBond || isSacred) && isCoupled;

          return (
            <Link
              key={to}
              to={to}
              className={`sidebar-link flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 group/navlink
                ${isActive
                  ? useRomanticStyle
                    ? "romantic-gradient-bg text-white font-extrabold shadow-xl shadow-pink-500/25 border-none"
                    : "brand-gradient-bg text-white font-bold shadow-xl shadow-primary/25 border-none"
                  : useRomanticStyle
                    ? "text-pink-500/80 hover:text-pink-500 hover:bg-pink-500/10"
                    : "text-base-content/60 hover:text-base-content hover:bg-white/5 hover:translate-x-1"
                }`}
            >
              <div className="relative">
                {useRomanticStyle ? (
                  <Heart
                    className={`size-[20px] flex-shrink-0 ${isActive ? "text-white fill-white/20 animate-pulse" : "text-pink-500 opacity-60"
                      }`}
                  />
                ) : (
                  <Icon
                    className={`size-[20px] flex-shrink-0 ${isActive ? "text-white" : "opacity-60"
                      }`}
                  />
                )}
                {labelKey === "inbox" && unreadMessages > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-primary text-primary-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-200">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
                {labelKey === "notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-error text-error-content text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-base-200">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </div>
              <span className="group-hover/navlink:translate-x-0.5 transition-transform duration-200">{label}</span>
              {isActive && (
                <div className={`ml-auto w-1.5 h-1.5 rounded-full ${useRomanticStyle ? "bg-pink-500" : "bg-primary"}`} />
              )}
            </Link>
          );
        })}

        {/* Admin Link if role is admin */}
        {authUser?.role === "admin" && (
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 mt-6 border border-primary/20 bg-primary/5
              ${currentPath === "/admin"
                ? "bg-primary text-primary-content"
                : "text-primary hover:bg-primary/10"
              }`}
          >
            <ShieldAlert className="size-[18px]" />
            <span>{t('admin_command')}</span>
          </Link>
        )}
      </nav>

      {/* DAILY REWARDS (ADDICTIVE ELEMENT) */}
      {authUser && (() => {
        const todayStr = new Date().toISOString().split('T')[0];
        const lastClaimDate = authUser.lastRewardClaimDate ? new Date(authUser.lastRewardClaimDate) : null;
        const lastClaimStr = lastClaimDate ? lastClaimDate.toISOString().split('T')[0] : null;

        const hasClaimedToday = lastClaimStr === todayStr;

        if (!hasClaimedToday) {
          // Milestone Progress (Next reward boost at every 7 days)
          const nextMilestone = Math.ceil((authUser.streak + 1) / 7) * 7;
          const progress = (authUser.streak % 7) / 7 * 100;

          return (
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mx-3 mb-4 p-5 rounded-[28px] bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-700 shadow-2xl shadow-amber-500/30 border-t border-white/30 relative overflow-hidden group cursor-pointer"
              onClick={async () => {
                try {
                  const res = await claimDailyReward();
                  toast.success(res.message, {
                    icon: '✨',
                    style: {
                      borderRadius: '20px',
                      background: '#1a1a1a',
                      color: '#fff',
                      border: '1px solid #f59e0b'
                    }
                  });
                  queryClient.invalidateQueries({ queryKey: ["authUser"] });
                  setShowConfetti(true); // Trigger confetti
                  setTimeout(() => setShowConfetti(false), 1000); // Hide confetti after 1 second
                } catch (err) {
                  toast.error(err.response?.data?.message || "Wait for tomorrow!");
                }
              }}
            >
              {/* Confetti Effect */}
              {showConfetti && (
                <>
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0, y: -100, scale: 1.5, rotate: 360 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-10 bg-white rounded-full pointer-events-none"
                  />
                  <motion.div
                    initial={{ opacity: 1, y: 0, x: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0, y: -120, x: -50, scale: 1.2, rotate: -270 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-6 bg-yellow-300 rounded-full pointer-events-none"
                  />
                  <motion.div
                    initial={{ opacity: 1, y: 0, x: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0, y: -80, x: 60, scale: 1.8, rotate: 180 }}
                    transition={{ duration: 1.1, ease: "easeOut", delay: 0.2 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-8 bg-amber-500 rounded-full pointer-events-none"
                  />
                  <motion.div
                    initial={{ opacity: 1, y: 0, x: 0, scale: 0.5, rotate: 0 }}
                    animate={{ opacity: 0, y: -150, x: 20, scale: 1.3, rotate: 45 }}
                    transition={{ duration: 1.3, ease: "easeOut", delay: 0.3 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-7 bg-white rounded-full pointer-events-none"
                  />
                </>
              )}

              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-30 transition-all group-hover:rotate-12 group-hover:scale-110 pointer-events-none">
                <Gem className="size-20 -rotate-12 text-white" />
              </div>

              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-white/80 uppercase tracking-[0.3em] pl-0.5">Gem Drop</span>
                  <div className="flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-full">
                    <Flame className="size-3 text-white" />
                    <span className="text-[10px] font-black text-white">{authUser.streak}d</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-xl font-black italic text-white tracking-tighter uppercase drop-shadow-sm">Ready to Claim</h4>
                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-widest leading-none">Tap for daily dopamine boost</p>
                </div>

                {/* Streak Progress Bar */}
                <div className="mt-2 space-y-1">
                  <div className="h-1.5 w-full bg-black/20 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    />
                  </div>
                  <div className="flex justify-between items-center text-[8px] font-black text-white/50 uppercase tracking-tighter">
                    <span>Milestone</span>
                    <span>Day {nextMilestone}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        }
        return null;
      })()}

      <div className="px-3 py-2 space-y-2">


        <a
          href={`${APK_DOWNLOAD_URL}/latest`}
          onClick={handleDownload}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/20 hover:bg-secondary/20 transition-all duration-200 active:scale-95 group/apk"
        >
          <div className="size-6 rounded-lg bg-secondary/20 flex items-center justify-center group-hover/apk:rotate-12 transition-transform">
            <Smartphone className="size-3.5" />
          </div>
          {t('download_apk')}
        </a>
      </div>

      <CreateStoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />

      {/* User Profile Section */}
      <div className="p-3 border-t border-base-300/50">
        <Link
          to="/profile"
          className="flex items-center gap-3 p-2.5 hover:bg-base-300/50 rounded-xl transition-all duration-200 group"
        >
          <div className="relative" onClick={() => {
            setViewingDP({ url: authUser?.profilePic || "/avatar.png", name: authUser?.fullName });
          }}>
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt="Profile"
              className="size-10 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all cursor-pointer"
            />
            <div className="absolute -top-1 -right-1 bg-gradient-to-tr from-amber-400 to-amber-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded-full border border-white/20 shadow-lg luxe-shadow-gold">
              {authUser?.gems || 0}💎
            </div>
            <div className="absolute bottom-0 right-0 size-3 bg-success rounded-full border-2 border-base-100" />
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="font-semibold text-sm truncate flex items-center gap-1">
              {authUser?.fullName}
              {(authUser?.role === "admin" || authUser?.isVerified) && (
                <BadgeCheck className="size-3.5 text-amber-500 fill-amber-500/10" />
              )}
              {(authUser?.streak || 0) > 0 && (
                <div className="flex flex-col gap-1 items-end ml-auto">
                  <div className="flex items-center gap-0.5 px-2 py-1 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.2)] animate-pulse">
                    <Flame className="size-3.5 text-orange-500 fill-orange-500" />
                    <span className="text-[11px] font-black text-orange-600 italic tracking-tighter">
                      {authUser.streak}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toast("Streak Insurance is a Premium feature! 🛡️", {
                        icon: '🛡️',
                        style: { borderRadius: '15px', background: '#2563eb', color: '#fff' }
                      });
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 hover:bg-blue-500/20 rounded-md border border-blue-500/20 text-[6px] font-black text-blue-500 uppercase tracking-[0.2em] transition-all hover:scale-105"
                  >
                    <Shield className="size-2" />
                    Protect
                  </button>
                </div>
              )}
            </h3>
            <p className="text-[11px] text-success font-medium">Online</p>
          </div>
        </Link>
      </div>

      <div className="px-3 pb-4">
        <div className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 text-center">
          Powered by freechatweb.in
        </div>
      </div>

      {viewingDP && (
        <ProfilePhotoViewer
          imageUrl={viewingDP.url}
          fullName={viewingDP.name}
          onClose={() => setViewingDP(null)}
          onUpdate={async (base64) => {
            await doUpdate({ profilePic: base64 });
            setViewingDP(null);
          }}
        />
      )}
    </aside>
  );
};
export default Sidebar;