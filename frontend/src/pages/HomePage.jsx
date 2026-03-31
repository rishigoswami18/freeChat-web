import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo, useCallback, memo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  getOutgoingFriendReqs,
  getRecommendedUsers,
  getUserFriends,
  sendFriendRequest,
  getPosts,
} from "../lib/api";
import { Link } from "react-router-dom";
import { BadgeCheck, MapPin, UserPlus, Users, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { capitialize } from "../lib/utils";
import useAuthUser from "../hooks/useAuthUser";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

import FriendCard, { getLanguageFlag } from "../components/FriendCard";
import PostsFeed from "../components/PostsFeed";
import CreatePost from "../components/CreatePost";
import FeedStories from "../components/feed/FeedStories";

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

  const nativeFlag = useMemo(() => getLanguageFlag(user.nativeLanguage), [user.nativeLanguage]);

  return (
    <motion.div 
      variants={itemVariants}
      className="flex items-center justify-between p-3 bg-base-200/50 rounded-2xl border border-transparent hover:border-primary/20 transition-all group"
    >
      <div className="flex items-center gap-3">
        <Link to={`/user/${user._id}`} className="avatar size-10 rounded-full ring-2 ring-primary/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
          <img src={user.profilePic || "/avatar.png"} alt={user.fullName} className="object-cover" />
        </Link>
        <div className="min-w-0">
          <h4 className="text-xs font-bold truncate flex items-center gap-1">
            {user.fullName}
            {(user.isVerified || user.role === "admin") && <BadgeCheck className="size-3 text-[#1d9bf0] fill-current" />}
          </h4>
          <p className="text-[10px] opacity-50 truncate">{nativeFlag} {capitialize(user.nativeLanguage)}</p>
        </div>
      </div>

      <button
        className={`btn btn-xs rounded-lg ${hasRequestBeenSent ? "btn-disabled bg-base-300" : "btn-primary"}`}
        onClick={() => onSendRequest(user._id)}
        disabled={hasRequestBeenSent || isPending}
      >
        {hasRequestBeenSent ? <BadgeCheck className="size-3" /> : <UserPlus className="size-3" />}
      </button>
    </motion.div>
  );
});

// === MAIN PAGE ARCHITECTURE ===
const HomePage = () => {
  const { t } = useTranslation();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [localPosts, setLocalPosts] = useState([]);

  // === FEED DATA FETCHING (INFINITE) ===
  const {
    data: feedData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loadingFeed,
    refetch: refetchFeed
  } = useInfiniteQuery({
    queryKey: ["homeFeed", authUser?.friends],
    queryFn: ({ pageParam }) => getPosts(authUser?._id, authUser?.friends || [], pageParam, 10),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: !!authUser?._id,
    staleTime: 60000,
  });

  const allPosts = useMemo(() => {
    const serverPosts = feedData?.pages.flatMap(page => page.posts) || [];
    // Efficiently merge local optimistic posts with server data
    // Local posts come first for better UX
    const merged = [...localPosts, ...serverPosts];
    // De-duplicate by ID
    const seen = new Set();
    return merged.filter(p => {
        if (!p || seen.has(p._id)) return false;
        seen.add(p._id);
        return true;
    });
  }, [feedData, localPosts]);

  const { observerTarget } = useInfiniteScroll(fetchNextPage, hasNextPage, isFetchingNextPage);

  // === SIDEBAR DATA ===
  const { data: friends = [], isLoading: loadingFriends } = useQuery({
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

  const outgoingRequestsIds = useMemo(() => new Set((outgoingFriendReqs || []).map(r => r.recipient._id)), [outgoingFriendReqs]);

  // === MUTATIONS ===
  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
  });

  const handleNewPost = useCallback((post) => {
    setLocalPosts(prev => [post, ...prev]);
    // Optionally invalidate after a small delay to get clean server sync
    setTimeout(() => queryClient.invalidateQueries({ queryKey: ["homeFeed"] }), 5000);
  }, [queryClient]);

  // === RENDER ===
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto p-4 sm:p-6 min-h-screen animate-fade-in font-outfit">
      
      {/* 🚀 MAIN FEED COLUMN (LEFT/CENTER) */}
      <div className="flex-1 space-y-8 min-w-0">
        
        {/* Welcome Header */}
        <div className="bg-base-100 p-8 rounded-[2rem] border border-base-content/5 shadow-2xl shadow-primary/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Sparkles className="size-24 text-primary" />
          </div>
          <div className="relative z-10">
            <h1 className="text-3xl font-black italic tracking-tighter uppercase mb-1">
              {t('welcome')}, {authUser?.fullName?.split(' ')[0]}
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary opacity-60">
              Zyro Intelligent Feed
            </p>
          </div>
        </div>

        {/* Stories */}
        <FeedStories />

        {/* Create Post Module */}
        <CreatePost onPost={handleNewPost} authUser={authUser} />

        {/* Infinite Scroll Posts */}
        <div className="space-y-6">
            <PostsFeed posts={allPosts} setPosts={setLocalPosts} />
            
            {/* Scroll Sentinel */}
            <div ref={observerTarget} className="py-20 flex justify-center w-full">
                {isFetchingNextPage ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="size-6 animate-spin text-primary opacity-40" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-20">Syncing Feed...</span>
                    </div>
                ) : hasNextPage ? (
                    <div className="h-20" />
                ) : allPosts.length > 0 && (
                    <div className="text-center opacity-20 text-[10px] font-black uppercase tracking-[0.4em] py-10">
                        You've reached the digital edge
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* 🪄 DISCOVERY SIDEBAR (RIGHT) */}
      <aside className="lg:w-[350px] shrink-0 space-y-8 h-fit lg:sticky lg:top-24 hidden lg:block">
        
        {/* Recommended Creators Section */}
        <section className="bg-base-200/30 rounded-[2.5rem] p-6 border border-base-content/5">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Who to follow</h2>
            <Link to="/search" className="text-[10px] font-bold text-primary hover:underline">Discover More</Link>
          </div>
          
          <div className="space-y-3">
             {loadingUsers ? (
                [1,2,3].map(i => <div key={i} className="h-16 w-full bg-base-300 rounded-2xl animate-pulse" />)
             ) : recommendedUsers.length > 0 ? (
                recommendedUsers.slice(0, 5).map(user => (
                   <RecommendedUserCard 
                      key={user._id} 
                      user={user} 
                      hasRequestBeenSent={outgoingRequestsIds.has(user._id)} 
                      onSendRequest={(id) => sendRequestMutation(id)}
                      isPending={isPending}
                   />
                ))
             ) : (
                <p className="text-[10px] opacity-40 font-bold px-2 py-4">No suggestions in your region.</p>
             )}
          </div>
        </section>

        {/* Global Stats Matrix */}
        <section className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative z-10 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Your Status</h3>
                    <TrendingUp className="size-4 text-primary opacity-40" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-2xl font-black italic tracking-tighter">{friends.length}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Strategic Peers</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl font-black italic tracking-tighter">{authUser?.streak || 0}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Elite Streak</p>
                    </div>
                </div>
            </div>
        </section>

        {/* Legal & Compliance Quick View */}
        <div className="px-8 text-[10px] font-bold opacity-20 uppercase tracking-[0.1em] space-y-2">
            <div className="flex gap-4">
                <Link to="/about" className="hover:text-primary transition-colors">About</Link>
                <Link to="/terms" className="hover:text-primary transition-colors">Privacy</Link>
                <Link to="/refund-policy" className="hover:text-primary transition-colors">Terms</Link>
            </div>
            <p>© {new Date().getFullYear()} Zyro Social Edge</p>
        </div>
      </aside>

    </div>
  );
};

export default HomePage;
