import { useState, memo } from "react";
import FeedPostCard from "./FeedPostCard";
import PostAd from "../PostAd";
import LikedByModal from "../LikedByModal";
import ProfilePhotoViewer from "../ProfilePhotoViewer";
import { AnimatePresence } from "framer-motion";
import useAuthUser from "../../hooks/useAuthUser";
import { MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

const FeedPostsList = memo(({ posts }) => {
  const { authUser } = useAuthUser();
  const [likedByPostId, setLikedByPostId] = useState(null);
  const [viewingDP, setViewingDP] = useState(null);

  const isPremium = authUser?.role === "admin" || authUser?.isPremium;

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-32 opacity-60">
        <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-10" />
        <p className="text-xl font-black italic uppercase tracking-tighter">No Posts Available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {posts.map((post, index) => {
        if (!post?._id) return null;
        return (
          <div key={post._id}>
            <FeedPostCard 
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
