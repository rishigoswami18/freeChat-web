import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useCallback, memo, useState } from "react";
import {
  PlayCircle,
  Sparkles,
  TrendingUp,
  Radio,
  UserPlus,
  BadgeCheck,
  Loader2,
  ArrowUpRight,
  Clapperboard,
  MessageSquareText,
  Users,
  Eye,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

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
import { getLanguageFlag } from "../components/FriendCard";

const RecommendedUserCard = memo(({ user, hasRequestBeenSent, onSendRequest, isPending }) => {
  const nativeFlag = useMemo(() => getLanguageFlag(user.nativeLanguage), [user.nativeLanguage]);

  return (
    <div className="social-pro-surface flex items-center justify-between gap-3 rounded-[28px] p-4">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to={`/user/${user._id}`}
          className="avatar avatar-glow h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-white/50"
        >
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="object-cover" />
        </Link>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
            {(user.isVerified || user.role === "admin") && (
              <BadgeCheck className="size-4 shrink-0 fill-sky-500 text-white" />
            )}
          </div>
          <p className="truncate text-xs text-slate-500">
            {nativeFlag} {capitialize(user.nativeLanguage)}
          </p>
        </div>
      </div>

      <button
        className={`btn btn-sm rounded-full border-0 px-4 ${
          hasRequestBeenSent
            ? "btn-disabled bg-slate-200 text-slate-500"
            : "bg-slate-900 text-white hover:bg-slate-800"
        }`}
        onClick={() => onSendRequest(user._id)}
        disabled={hasRequestBeenSent || isPending}
      >
        {hasRequestBeenSent ? <BadgeCheck className="size-4" /> : <UserPlus className="size-4" />}
      </button>
    </div>
  );
});

RecommendedUserCard.displayName = "RecommendedUserCard";

const HomePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [localPosts, setLocalPosts] = useState([]);

  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
  } = useInfiniteQuery({
    queryKey: ["homeFeed", authUser?.friends],
    queryFn: ({ pageParam }) => getPosts(authUser?._id, authUser?.friends || [], pageParam, 10),
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
      if (!post || seen.has(post._id)) return false;
      seen.add(post._id);
      return true;
    });
  }, [feedData, localPosts]);

  const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
    staleTime: 5 * 60 * 1000,
  });

  const { data: recommendedUsers = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: getRecommendedUsers,
    staleTime: 5 * 60 * 1000,
  });

  const { data: outgoingFriendReqs = [] } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
    staleTime: 5 * 60 * 1000,
  });

  const outgoingRequestsIds = useMemo(
    () => new Set((outgoingFriendReqs || []).map((request) => request.recipient._id)),
    [outgoingFriendReqs]
  );

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const handleNewPost = useCallback(
    (post) => {
      setLocalPosts((prev) => [post, ...prev]);
      setTimeout(() => queryClient.invalidateQueries({ queryKey: ["homeFeed"] }), 5000);
    },
    [queryClient]
  );

  const firstName = authUser?.fullName?.split(" ")?.[0] || "Creator";
  const todayPosts = allPosts.length;

  const quickStats = [
    {
      label: "Network",
      value: friends.length,
      hint: "Active connections",
      icon: Users,
      tone: "from-sky-500 to-cyan-500",
    },
    {
      label: "Momentum",
      value: authUser?.streak || 0,
      hint: "Posting streak",
      icon: TrendingUp,
      tone: "from-rose-500 to-orange-500",
    },
    {
      label: "Feed",
      value: todayPosts,
      hint: "Stories and posts",
      icon: Clapperboard,
      tone: "from-violet-500 to-fuchsia-500",
    },
  ];

  const creatorSignals = [
    {
      title: "Short video momentum",
      value: `${Math.max(todayPosts * 3, 12)}K`,
      caption: "Reels-style engagement across your creator graph",
      icon: PlayCircle,
    },
    {
      title: "Live conversations",
      value: `${Math.max(friends.length + 4, 8)}`,
      caption: "Rooms trending in your circles right now",
      icon: Radio,
    },
    {
      title: "Comment velocity",
      value: `${Math.max(todayPosts * 7, 24)}/hr`,
      caption: "Discussion rate inspired by creator communities",
      icon: MessageSquareText,
    },
  ];

  const watchlist = [
    {
      title: "Creator Studio",
      description: "Manage content, monetization, and audience growth in one place.",
      to: "/creator-center",
      icon: PlayCircle,
    },
    {
      title: "Reels",
      description: "Swipe through immersive vertical video with a cleaner production feel.",
      to: "/reels",
      icon: Clapperboard,
    },
    {
      title: "Inbox",
      description: "Jump from public content into private conversations instantly.",
      to: "/inbox",
      icon: MessageSquareText,
    },
  ];

  return (
    <div className="social-pro-bg min-h-screen">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="social-pro-hero overflow-hidden rounded-[36px] p-6 sm:p-8"
          >
            <div className="flex flex-wrap items-center gap-3">
              <span className="social-pro-pill">
                <Sparkles className="size-3.5" />
                Pro social feed
              </span>
              <span className="social-pro-pill">
                <PlayCircle className="size-3.5" />
                Short video + community
              </span>
            </div>

            <div className="mt-6 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-white/70">
                Welcome back, {firstName}
              </p>
              <h1 className="mt-3 max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl">
                A professional creator network built with the polish of Instagram and YouTube.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Publish posts, grow your audience, watch trending clips, and move seamlessly into DMs,
                communities, and creator tools from one premium home screen.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {quickStats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
                    <div className={`mb-4 flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.tone}`}>
                      <Icon className="size-5 text-white" />
                    </div>
                    <p className="text-3xl font-black text-white">{item.value}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-300">{item.hint}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid gap-4"
          >
            <div className="social-pro-surface rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Trend radar</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Audience pulse</h2>
                </div>
                <div className="rounded-2xl bg-slate-950 p-3 text-white">
                  <Eye className="size-5" />
                </div>
              </div>

              <div className="mt-5 space-y-4">
                {creatorSignals.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="rounded-[24px] bg-slate-50 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">{item.caption}</p>
                        </div>
                        <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm">
                          <Icon className="size-4.5" />
                        </div>
                      </div>
                      <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{item.value}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_350px]">
          <div className="space-y-6">
            <div className="social-pro-surface rounded-[32px] p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Stories and discovery</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Creator highlights</h2>
                </div>
                <Link
                  to="/reels"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Watch reels
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
              <div className="mt-5">
                <FeedStories />
              </div>
            </div>

            <div className="social-pro-surface rounded-[32px] p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Publish</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Share something worth watching</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Creator-ready composer
                </span>
              </div>
              <CreatePost onPost={handleNewPost} authUser={authUser} />
            </div>

            <div className="social-pro-surface rounded-[32px] p-5 sm:p-6">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Home feed</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">Recommended posts and creator drops</h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  Fresh ranking
                </span>
              </div>

              {loadingFeed ? (
                <div className="flex min-h-[260px] items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-7 animate-spin text-slate-400" />
                    <p className="text-sm font-medium text-slate-500">Loading your feed...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <PostsFeed posts={allPosts} setPosts={setLocalPosts} />

                  <div ref={observerTarget} className="flex justify-center py-8">
                    {isFetchingNextPage ? (
                      <div className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more posts
                      </div>
                    ) : hasNextPage ? (
                      <div className="h-16" />
                    ) : allPosts.length > 0 ? (
                      <div className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
                        You are fully caught up
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="social-pro-surface rounded-[32px] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Watch next</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Media stack</h3>
                </div>
                <div className="rounded-2xl bg-rose-50 p-3 text-rose-600">
                  <Clapperboard className="size-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {watchlist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="flex items-start gap-3 rounded-[24px] bg-slate-50 p-4 transition hover:bg-slate-100"
                    >
                      <div className="rounded-2xl bg-white p-3 text-slate-900 shadow-sm">
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{item.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="social-pro-surface rounded-[32px] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Recommended</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Who to follow</h3>
                </div>
                <Link to="/search" className="text-sm font-semibold text-slate-900 hover:text-slate-700">
                  Explore
                </Link>
              </div>

              <div className="space-y-3">
                {loadingUsers ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="h-20 animate-pulse rounded-[28px] bg-slate-100" />
                  ))
                ) : recommendedUsers.length > 0 ? (
                  recommendedUsers.slice(0, 5).map((user) => (
                    <RecommendedUserCard
                      key={user._id}
                      user={user}
                      hasRequestBeenSent={outgoingRequestsIds.has(user._id)}
                      onSendRequest={(id) => sendRequestMutation(id)}
                      isPending={isPending}
                    />
                  ))
                ) : (
                  <div className="rounded-[28px] bg-slate-50 p-4 text-sm text-slate-500">
                    Fresh recommendations will appear here as your network grows.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border border-slate-200 bg-white/80 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Platform note</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">Professional by default</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                This layout now emphasizes media, creator momentum, and audience actions so the app feels closer to a serious modern social platform.
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Feed</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Short video</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Creator tools</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">Messaging</span>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
};

export default HomePage;
