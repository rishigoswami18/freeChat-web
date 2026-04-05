import { memo, useState } from "react";
import PremiumPostCard from "./PremiumPostCard";
import PostAd from "../PostAd";
import LikedByModal from "../LikedByModal";
import ProfilePhotoViewer from "../ProfilePhotoViewer";
import { AnimatePresence } from "framer-motion";
import useAuthUser from "../../hooks/useAuthUser";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const FeedPostsList = memo(({ posts }) => {
  const { authUser } = useAuthUser();
  const [likedByPostId, setLikedByPostId] = useState(null);
  const [viewingDP, setViewingDP] = useState(null);

  const isPremium = authUser?.role === "admin" || authUser?.isPremium;

  if (!posts || posts.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-40 bg-white/[0.02] border border-white/5 rounded-[40px] backdrop-blur-3xl"
      >
        <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-primary/20 ring-1 ring-primary/30">
          <Sparkles className="size-10 text-primary animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-white tracking-tighter mb-2 italic">Quiet in the Nexus</h2>
        <p className="text-sm text-white/30 font-bold uppercase tracking-widest">Connect with creators to ignite your feed</p>
      </motion.div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {posts.map((post, index) => {
        if (!post?._id) return null;
        return (
          <div key={post._id} className="stagger-item">
            <PremiumPostCard 
              post={post} 
              setLikedByPostId={setLikedByPostId} 
              setViewingDP={setViewingDP} 
            />
            
            {/* Ad injection for every 4th post for non-premium users */}
            {!isPremium && (index + 1) % 4 === 0 && (
              <div className="max-w-[470px] mx-auto mb-10">
                <PostAd index={Math.floor(index / 4)} />
              </div>
            )}
          </div>
        );
      })}

      <AnimatePresence>
        {likedByPostId && (
          <LikedByModal
            postId={likedByPostId}
            isOpen={true}
            onClose={() => setLikedByPostId(null)}
          />
        )}
        {viewingDP && (
          <ProfilePhotoViewer
            imageUrl={viewingDP.url}
            fullName={viewingDP.name}
            isVerified={viewingDP.isVerified}
            onClose={() => setViewingDP(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
});

FeedPostsList.displayName = "FeedPostsList";

export default FeedPostsList;
