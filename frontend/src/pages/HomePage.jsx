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

import { capitialize } from "../lib/utils";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import NoFriendsFound from "../components/NoFriendsFound";

// === SUBCOMPONENT: Recommended User Card ===
// Memoized to perfectly shield rendering engines against sibling invalidation strokes
const RecommendedUserCard = memo(({ user, hasRequestBeenSent, onSendRequest, isPending }) => {
  const { t } = useTranslation();

  // Mathematical caching against redundant capitalization hashes per render
  const nativeLanguageFormatted = useMemo(() => capitialize(user.nativeLanguage), [user.nativeLanguage]);
  const learningLanguageFormatted = useMemo(() => capitialize(user.learningLanguage), [user.learningLanguage]);
  const nativeFlag = useMemo(() => getLanguageFlag(user.nativeLanguage), [user.nativeLanguage]);
  const learningFlag = useMemo(() => getLanguageFlag(user.learningLanguage), [user.learningLanguage]);

  return (
    <div className="card bg-base-200 hover:shadow-lg transition-all duration-300 stagger-item border border-transparent hover:border-primary/10">
      <div className="card-body p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="avatar size-16 rounded-full">
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
          <span className="badge badge-secondary">
            {nativeFlag} Native: {nativeLanguageFormatted}
          </span>
          <span className="badge badge-outline">
            {learningFlag} Learning: {learningLanguageFormatted}
          </span>
        </div>

        {user.bio && <p className="text-sm opacity-70">{user.bio}</p>}

        {/* Action button */}
        <button
          className={`btn w-full mt-2 ${hasRequestBeenSent ? "btn-disabled" : "btn-primary"} `}
          onClick={() => onSendRequest(user._id)}
          disabled={hasRequestBeenSent || isPending}
        >
          {hasRequestBeenSent ? (
            <>
              <BadgeCheck className="size-4 mr-2" />
              {t('request_sent')}
            </>
          ) : (
            <>
              <UserPlus className="size-4 mr-2" />
              {t('send_request')}
            </>
          )}
        </button>
      </div>
    </div>
  );
});
RecommendedUserCard.displayName = "RecommendedUserCard";


// === SUBCOMPONENT: Friends Section ===
const FriendsSection = memo(({ friends, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (friends.length === 0) {
    return <NoFriendsFound />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {friends.map((friend) => (
        <div key={friend._id} className="stagger-item flex">
          {/* Flex wrapper ensures dynamic grid heights normalize internally */}
          <FriendCard friend={friend} />
        </div>
      ))}
    </div>
  );
});
FriendsSection.displayName = "FriendsSection";


// === SUBCOMPONENT: Recommendations Section ===
const RecommendationsSection = memo(({ users, loading, outgoingRequestsIds, onSendRequest, isPending }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="card bg-base-200 p-6 text-center">
        <h3 className="font-semibold text-lg mb-2">{t('no_recommendations')}</h3>
        <p className="text-base-content opacity-70">
          {t('check_back')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {users.map((user) => (
        <RecommendedUserCard
          key={user._id}
          user={user}
          hasRequestBeenSent={outgoingRequestsIds.has(user._id)}
          onSendRequest={onSendRequest}
          isPending={isPending}
        />
      ))}
    </div>
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
    staleTime: 5 * 60 * 1000, // 5 min cache hold prevents erratic background shifting
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

  // === STATE DERIVATIONS (REPLACING STATE DUPLICATION) ===
  // O(N) operation runs strictly when array updates, entirely eradicating `useEffect` component trashing
  const outgoingRequestsIds = useMemo(() => {
    const ids = new Set();
    if (outgoingFriendReqs.length > 0) {
      outgoingFriendReqs.forEach((req) => {
        ids.add(req.recipient._id);
      });
    }
    return ids;
  }, [outgoingFriendReqs]);

  // === MUTATION LOGIC ===
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      // Precise invalidation preventing mass layout reload
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"], exact: true });
    },
  });

  // Stablized reference ensuring child components don't reconstruct inline functions endlessly
  const handleSendRequest = useCallback((userId) => {
    sendRequestMutation(userId);
  }, [sendRequestMutation]);


  // === RENDER PIPELINE ===
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto space-y-10">
        
        {/* === SECTION 1: HEADER === */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {t('welcome')} <span className="opacity-80">👋</span>
            </h1>
            <p className="text-sm opacity-50 mt-1">{t('see_happening')}</p>
          </div>
          <Link to="/notifications" className="btn btn-outline btn-sm rounded-xl gap-2 hover:scale-[1.02] transition-transform">
            <Users className="size-4" />
            {t('notifications')}
          </Link>
        </div>

        {/* === SECTION 2: CURRENT FRIENDS === */}
        <div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight section-heading mb-6">{t('your_friends')}</h2>
          </div>
          
          <FriendsSection 
             friends={friends} 
             loading={loadingFriends} 
          />
        </div>

        {/* === SECTION 3: RECOMMENDATIONS === */}
        <section>
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight section-heading">{t('meet_new')}</h2>
                <p className="opacity-60 text-sm mt-4">
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
        </section>

      </div>
    </div>
  );
};

export default HomePage;