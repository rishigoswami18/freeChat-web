import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
} from "../lib/api";
import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, UserPlus, Users, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

// === SUBCOMPONENT: Recommended User Card ===
const RecommendedUserCard = memo(({ user, hasRequestBeenSent, onSendRequest, isPending }) => {
  const { t } = useTranslation();

  const nativeLanguageFormatted = useMemo(() => capitialize(user.nativeLanguage), [user.nativeLanguage]);
  const learningLanguageFormatted = useMemo(() => capitialize(user.learningLanguage), [user.learningLanguage]);
  const nativeFlag = useMemo(() => getLanguageFlag(user.nativeLanguage), [user.nativeLanguage]);
  const learningFlag = useMemo(() => getLanguageFlag(user.learningLanguage), [user.learningLanguage]);

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="card bg-base-200 shadow-sm hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-primary/20 backdrop-blur-sm"
    >
      <div className="card-body p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="avatar size-16 rounded-full ring ring-primary/20 ring-offset-base-100 ring-offset-2">
            <img src={user.profilePic} alt={user.fullName} loading="lazy" decoding="async" />
          </div>

          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              {user.fullName}
              {user.isBoosted && (
                <div className="badge badge-success badge-xs gap-1 font-black uppercase tracking-tighter py-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-2.5" /> Featured
                </div>
              )}
            </h3>
            {user.location && (
              <div className="flex items-center text-xs opacity-70 mt-1">
                <MapPin className="size-3 mr-1" />
                {user.location}
              </div>
            )}
          </div>
        </div>

        {/* Languages with flags */}
        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-secondary gap-1 shadow-sm font-medium">
            {nativeFlag} Native: {nativeLanguageFormatted}
          </span>
          <span className="badge badge-outline gap-1 shadow-sm border-base-content/20 font-medium">
            {learningFlag} Learning: {learningLanguageFormatted}
          </span>
        </div>

        {user.bio && <p className="text-sm opacity-70 line-clamp-2 leading-relaxed">{user.bio}</p>}

        {/* Action button */}
        <button
          className={`btn w-full mt-2 group overflow-hidden relative ${hasRequestBeenSent ? "btn-disabled bg-base-300 text-base-content/50" : "btn-primary shadow-lg shadow-primary/20"}`}
          onClick={() => onSendRequest(user._id)}
          disabled={hasRequestBeenSent || isPending}
        >
          {hasRequestBeenSent ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center">
              <BadgeCheck className="size-4 mr-2 text-emerald-500" />
              {t('request_sent')}
            </motion.div>
          ) : (
            <div className="flex items-center">
              <UserPlus className="size-4 mr-2 group-hover:scale-110 transition-transform" />
              {t('send_request')}
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
});
RecommendedUserCard.displayName = "RecommendedUserCard";


// === SUBCOMPONENT: Friends Section ===
const FriendsSection = memo(({ friends, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner text-primary loading-lg" />
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <NoFriendsFound />
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <AnimatePresence>
        {friends.map((friend) => (
          <motion.div 
            key={friend._id} 
            variants={itemVariants} 
            layout 
            className="flex h-full"
          >
            <FriendCard friend={friend} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});
FriendsSection.displayName = "FriendsSection";


// === SUBCOMPONENT: Recommendations Section ===
const RecommendationsSection = memo(({ users, loading, outgoingRequestsIds, onSendRequest, isPending }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner text-primary loading-lg" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-200 p-8 text-center border border-base-content/5 shadow-sm"
      >
        <div className="bg-base-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Users className="size-8 opacity-40" />
        </div>
        <h3 className="font-semibold text-xl mb-2">{t('no_recommendations')}</h3>
        <p className="text-base-content opacity-60 max-w-sm mx-auto">
          {t('check_back')}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {users.map((user) => (
        <RecommendedUserCard
          key={user._id}
          user={user}
          hasRequestBeenSent={outgoingRequestsIds.has(user._id)}
          onSendRequest={onSendRequest}
          isPending={isPending}
        />
      ))}
    </motion.div>
  );
});
RecommendationsSection.displayName = "RecommendationsSection";


// === MAIN PAGE ARCHITECTURE ===
const HomePage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // === DATA FETCHING LOGIC (OPTIMIZED) ===
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    staleTime: 5 * 60 * 1000, // 5 min cache
    refetchOnWindowFocus: false,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // === DERIVED STATE ===
  const outgoingRequestsIds = useMemo(() => {
    const ids = new Set();
    if (outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => ids.add(req.recipient._id));
    }
    return ids;
  }, [outgoingFriendReqs]);

  // === MUTATION LOGIC ===
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"], exact: true });
    },
  });

  const handleSendRequest = useCallback((userId) => {
    sendRequestMutation(userId);
  }, [sendRequestMutation]);

  // === RENDER PIPELINE ===
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="p-4 sm:p-6 lg:p-8 min-h-screen"
    >
      <div className="container mx-auto space-y-12">
        
        {/* === SECTION 1: HEADER === */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-base-100 p-8 rounded-[2rem] border border-base-content/5 shadow-lg shadow-base-content/5"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
              {t('welcome')} 👋
            </h1>
            <p className="text-sm font-medium opacity-60 mt-2">{t('see_happening')}</p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-sm sm:btn-md rounded-xl gap-2 hover:bg-primary hover:text-primary-content hover:border-primary transition-all shadow-sm">
            <Users className="size-4" />
            {t('notifications')}
          </Link>
        </motion.div>

        {/* === SECTION 2: CURRENT FRIENDS === */}
        <motion.div
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, margin: "-100px" }}
        >
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('your_friends')}</h2>
            <div className="badge badge-primary badge-outline font-bold shadow-sm py-3 px-4 rounded-xl">{friends.length} Network Connections</div>
          </div>
          
          <FriendsSection 
             friends={friends} 
             loading={loadingFriends} 
          />
        </motion.div>

        {/* === SECTION 3: RECOMMENDATIONS === */}
        <motion.section
           initial={{ opacity: 0 }}
           whileInView={{ opacity: 1 }}
           viewport={{ once: true, margin: "-100px" }}
           className="relative"
        >
          {/* Subtle background glow for premium feel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none -z-10" />

          <div className="mb-8 px-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{t('meet_new')}</h2>
                <p className="opacity-60 text-sm mt-3 font-medium">
                  {t('discover_partners')}
                </p>
              </div>
            </div>
          </div>

          <RecommendationsSection 
             users={recommendedUsers} 
             loading={loadingUsers} 
             outgoingRequestsIds={outgoingRequestsIds} 
             onSendRequest={handleSendRequest} 
             isPending={isPending} 
          />
        </motion.section>

      </div>
    </motion.div>
  );
};

export default HomePage;