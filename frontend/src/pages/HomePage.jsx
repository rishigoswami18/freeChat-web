import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useCallback, memo, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Radio,
  UserPlus,
  BadgeCheck,
  Loader2,
  ArrowUpRight,
  Clapperboard,
  Users,
  RefreshCw,
  PlusCircle,
  Flame,
  Globe,
  Ghost,
  Target,
  Wallet,
  Zap,
  ArrowRight,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getPosts,
} from "../lib/api";
import { capitialize } from "../lib/utils";
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

import PostsFeed from "../components/PostsFeed";
import CreatePost from "../components/CreatePost";
import FeedStories from "../components/feed/FeedStories";
import { WidgetSkeleton, PostSkeleton, BusinessCardSkeleton } from "../components/Skeletons";
import { EmptyFeedState } from "../components/EmptyStates";

/**
 * Wallet & Goals Widget — Clean SaaS card
 */
const WalletGoalWidget = memo(({ balance, activeGoals, bestStreak }) => {
    const { t } = useTranslation();

    return (
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-white/[0.02] -rotate-12 scale-125 group-hover:scale-110 transition-transform duration-700">
                <Target size={100} />
            </div>
            
            <div className="space-y-3 relative z-10">
                <div className="flex items-center gap-2">
                    <Wallet size={14} className="text-indigo-400" />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">{t('wallet_balance')}</span>
                </div>
                <h3 className="text-3xl font-bold tracking-tight">₹{balance.toLocaleString('en-IN')}</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                    <span className="text-[9px] font-medium uppercase text-white/30 tracking-wider block mb-1">{t('active_goals')}</span>
                    <span className="text-sm font-bold">{activeGoals}</span>
                </div>
                <div className="p-3 bg-white/[0.03] rounded-2xl border border-white/5">
                    <span className="text-[9px] font-medium uppercase text-white/30 tracking-wider block mb-1">{t('best_streak')}</span>
                    <span className="text-sm font-bold text-orange-400">{bestStreak}d <Flame size={12} className="inline mb-0.5 fill-orange-400 text-orange-400" /></span>
                </div>
            </div>


        </div>
    );
});

/**
 * Goal Activity Feed — Action-focused engagement
 */
const GoalActivityFeed = memo(() => {
    const { t } = useTranslation();

    const mockActivities = [
        { id: 1, user: "Elena", action: "completed Day 12 of 30", goal: "No social media", streak: 12, avatar: "https://i.pravatar.cc/150?u=elena" },
        { id: 2, user: "Marcus", action: "started a new goal", goal: "Deep Work: 4hrs/day", streak: 1, avatar: "https://i.pravatar.cc/150?u=marcus" },
        { id: 3, user: "Sarah", action: "reached a milestone", goal: "Mastering Rust Architecture", streak: 21, avatar: "https://i.pravatar.cc/150?u=sarah" },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        {t('goal_updates')} <Target size={16} className="text-indigo-400" />
                    </h2>
                    <p className="text-[11px] text-white/30 font-medium">{t('goal_updates_desc')}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
                {mockActivities.map((activity, i) => (
                    <motion.div 
                        key={activity.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <img src={activity.avatar} className="size-10 rounded-xl object-cover ring-1 ring-white/10" alt="" />
                            <div className="text-left">
                                <p className="text-[13px] font-semibold">
                                    {activity.user} <span className="text-white/40 font-normal">{activity.action}</span>
                                </p>
                                <p className="text-[10px] text-indigo-400 font-medium mt-0.5">{activity.goal}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <Flame size={12} className="text-orange-400 fill-orange-400" />
                            <span className="text-[10px] font-bold text-orange-400">{activity.streak}d</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
});

const RecommendedUserCard = memo(({ user, hasRequestBeenSent, onSendRequest, isPending }) => {
  return (
    <div className="bg-white/[0.02] border border-white/5 flex items-center justify-between gap-4 rounded-2xl p-3.5 group hover:bg-white/[0.04] transition-all duration-300">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={`/user/${user._id}`}
          className="relative size-11 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/10 group-hover:ring-indigo-500/30 transition-all"
        >
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-white">{user.fullName}</p>
            {(user.isVerified || user.role === "admin") && (
              <BadgeCheck className="size-3.5 shrink-0 text-sky-400 fill-sky-400/10" />
            )}
          </div>
          <p className="truncate text-[11px] text-white/30 font-medium">
            {capitialize(user.nativeLanguage)}
          </p>
        </div>
      </div>

      <button
        className={`size-9 rounded-xl flex items-center justify-center transition-all ${
          hasRequestBeenSent
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-indigo-500 text-white hover:bg-indigo-400 active:scale-95"
        }`}
        onClick={() => onSendRequest(user._id)}
        disabled={hasRequestBeenSent || isPending}
      >
        {hasRequestBeenSent ? <BadgeCheck className="size-4" /> : (isPending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />)}
      </button>
    </div>
  );
});

RecommendedUserCard.displayName = "RecommendedUserCard";

const HomePage = () => {
  const { t } = useTranslation();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [localPosts, setLocalPosts] = useState([]);
  const [pendingRequestIds, setPendingRequestIds] = useState(new Set());

  const friendIds = useMemo(
    () => (authUser?.friends || []).join(","),
    [authUser?.friends]
  );

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
    isError: feedError,
    refetch: refetchFeed
  } = useInfiniteQuery({
    queryKey: ["homeFeed", friendIds],
    queryFn: ({ pageParam }) => getPosts({
        userId: authUser?._id,
        friends: friendIds,
        lastId: pageParam,
        limit: 10
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authUser?._id,
    staleTime: 60000,
  });

  const allPosts = useMemo(() => {
    const serverPosts = feedData?.pages.flatMap((page) => page.posts) || [];
    const merged = [...localPosts, ...serverPosts];
    const seen = new Set();
    return merged.filter((post) => {
      if (!post?._id || seen.has(post._id)) return false;
      seen.add(post._id);
      return true;
    });
  }, [feedData, localPosts]);

  const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: () => getRecommendedUsers(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    staleTime: 5 * 60 * 1000,
  });

  const outgoingRequestsIds = useMemo(
    () => new Set((outgoingFriendReqs || []).map((request) => request.recipient?._id).filter(Boolean)),
    [outgoingFriendReqs]
  );

  const { mutate: sendRequestMutation } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const handleSendRequest = useCallback((userId) => {
    setPendingRequestIds(prev => new Set([...prev, userId]));
    sendRequestMutation(userId, {
      onSettled: () => setPendingRequestIds(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      })
    });
  }, [sendRequestMutation]);

  const handleNewPost = useCallback(
    (post) => {
      setLocalPosts((prev) => [post, ...prev]);
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["homeFeed"] }), 5000);
    },
    [queryClient]
  );

  const activeGoalsCount = authUser?.activeGoalsCount || 0;
  const currentWalletBalance = authUser?.walletBalance || 2450;
  const bestStreak = authUser?.bestStreak || 0;

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 px-4 sm:px-8 lg:px-12 py-8">
        
        {/* Hero Banner — Goal Status */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 sm:p-12 bg-gradient-to-br from-indigo-500/15 via-indigo-500/5 to-transparent border border-white/5 rounded-3xl overflow-hidden relative"
          >
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 relative z-10">
                <div className="space-y-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                        <Zap size={12} /> {t('your_dashboard')}
                    </span>
                    
                    {activeGoalsCount > 0 ? (
                        <div className="space-y-4">
                            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
                                Keep going,<br />
                                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">you're on fire.</span>
                            </h1>
                            <div className="flex items-center gap-5 pt-1">
                                <div className="flex items-center gap-2 text-white/60">
                                    <Zap size={18} className="text-orange-400 fill-orange-400" />
                                    <span className="text-lg font-semibold">{bestStreak}d streak</span>
                                </div>
                                <div className="h-4 w-px bg-white/10" />
                                <div className="flex items-center gap-2 text-white/60">
                                    <Wallet size={18} className="text-indigo-400" />
                                    <span className="text-lg font-semibold">₹{currentWalletBalance.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-[1.1]">
                                {t('set_first_goal')}<br />
                                <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{t('start_building_habits')}</span>
                            </h1>
                            <p className="text-sm text-white/40 max-w-sm leading-relaxed">
                                {t('goal_desc')}
                            </p>
                            <Link to="/goals" className="inline-flex h-12 px-8 items-center justify-center gap-2 rounded-2xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98] group">
                                {t('start_goal')} <ArrowRight className="group-hover:translate-x-0.5 transition-transform" size={16} />
                            </Link>
                        </div>
                    )}
                </div>
                
                {activeGoalsCount > 0 && (
                    <Link to="/goals" className="px-8 py-5 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08] transition-all flex items-center gap-4 group">
                        <div className="text-right">
                            <p className="text-[10px] font-medium uppercase text-white/40 tracking-wider">Manage</p>
                            <p className="text-base font-bold">{activeGoalsCount} Active Goals</p>
                        </div>
                        <Target size={28} className="text-indigo-400 group-hover:scale-110 transition-transform" />
                    </Link>
                )}
            </div>
          </motion.div>
        </section>

        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-10">
            
            {/* Stories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        {t('stories')} <Flame size={16} className="text-rose-400 fill-rose-400" />
                    </h2>
                    <p className="text-[11px] text-white/30 font-medium">{t('whats_happening')}</p>
                </div>
                <Link
                  to="/reels"
                  className="group flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  Reels <Clapperboard size={13} />
                </Link>
              </div>
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5">
                <FeedStories />
              </div>
            </div>

            {/* Create Post */}
            <div className="space-y-4">
               <div className="px-1">
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        {t('post')} <Radio size={16} className="text-indigo-400" />
                    </h2>
                    <p className="text-[11px] text-white/30 font-medium">{t('share_thoughts')}</p>
               </div>
               <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                 <CreatePost onPost={handleNewPost} authUser={authUser} />
               </div>
            </div>

            {/* Goal Activity Feed */}
            <GoalActivityFeed />

            {/* Main Content Feed */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                 <div>
                    <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
                        Your Feed <Globe size={16} className="text-indigo-400/60 animate-[spin_20s_linear_infinite]" />
                    </h2>
                    <p className="text-[11px] text-white/30 font-medium">Posts from friends and people you follow</p>
                 </div>
              </div>

              {loadingFeed ? (
                <div className="space-y-8">
                  {[1, 2, 3].map(i => (
                      <PostSkeleton key={i} />
                  ))}
                </div>
              ) : feedError ? (
                  <div className="bg-white/[0.01] border border-dashed border-white/10 rounded-2xl p-12 text-center space-y-5">
                      <div className="size-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
                          <Ghost size={28} className="text-rose-400" />
                      </div>
                      <div className="space-y-2">
                          <h3 className="text-base font-bold">Couldn't load your feed</h3>
                          <p className="text-xs text-white/40 max-w-xs mx-auto leading-relaxed">
                              Something went wrong. Please check your connection and try again.
                          </p>
                      </div>
                      <button 
                        onClick={() => refetchFeed()}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-xs font-semibold transition-all active:scale-95"
                      >
                         <RefreshCw size={14} /> Try again
                      </button>
                  </div>
              ) : (
                <div className="space-y-6">
                  <PostsFeed posts={allPosts} setPosts={setLocalPosts} />

                  <div ref={observerTarget} className="flex flex-col items-center justify-center py-10 gap-4">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-400">
                        <Loader2 className="size-3.5 animate-spin" />
                        Loading more...
                      </div>
                    ) : hasNextPage ? (
                      <div className="h-12" />
                    ) : allPosts.length > 0 ? (
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-px w-16 bg-white/10" />
                            <p className="text-[11px] text-white/20 font-medium">{t('you_all_caught_up')}</p>
                        </div>
                    ) : (
                        <EmptyFeedState />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-8 lg:sticky lg:top-8 h-fit">
            
            {/* Wallet & Goals Widget */}
            {loadingFeed ? <WidgetSkeleton /> : (
                <WalletGoalWidget 
                    balance={currentWalletBalance}
                    activeGoals={activeGoalsCount}
                    bestStreak={bestStreak}
                />
            )}

            {/* Discover People */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <div>
                  <h2 className="text-base font-bold tracking-tight">{t('suggest_for_you')}</h2>
                  <p className="text-[11px] text-white/30 font-medium">{t('people_might_know')}</p>
                </div>
                <Link to="/search" className="p-2 bg-white/[0.03] rounded-xl hover:bg-white/[0.06] transition-colors border border-white/5">
                  <ArrowUpRight size={16} className="text-white/40" />
                </Link>
              </div>

              <div className="space-y-2">
                {loadingUsers ? (
                  [1, 2, 3, 4, 5].map((item) => (
                    <BusinessCardSkeleton key={item} />
                  ))
                ) : recommendedUsers.length > 0 ? (
                  recommendedUsers.slice(0, 6).map((user) => (
                    <RecommendedUserCard
                      key={user._id}
                      user={user}
                      hasRequestBeenSent={outgoingRequestsIds.has(user._id)}
                      onSendRequest={handleSendRequest}
                      isPending={pendingRequestIds.has(user._id)}
                    />
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 text-center space-y-2">
                    <p className="text-xs text-white/30">No suggestions yet</p>
                    <p className="text-[10px] text-white/15 leading-relaxed">
                        New people will appear as you grow your network.
                    </p>
                  </div>
                )}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
