import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunityDetails, getCommunityPosts, toggleJoinCommunity, createCommunityPost } from "../lib/api";
import { Users, Lock, ChevronLeft, Image as ImageIcon, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";
import PostsFeed from "../components/PostsFeed";

export default function CommunityDetailsPage() {
  const { id } = useParams();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);

  const { data: cData, isLoading: isCommLoading } = useQuery({
    queryKey: ["community", id],
    queryFn: () => getCommunityDetails(id),
  });

  const { data: pData, isLoading: isPostsLoading } = useQuery({
    queryKey: ["community-posts", id],
    queryFn: () => getCommunityPosts(id),
  });

  const [localPosts, setLocalPosts] = useState([]);
  const community = cData?.community;
  const posts = pData?.posts || [];

  // Sync react-query data to local state for optimistic updates
  useEffect(() => {
    if (posts) setLocalPosts(posts);
  }, [posts]);

  const joinMutation = useMutation({
    mutationFn: toggleJoinCommunity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", id] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success("Community status updated");
    },
    onError: () => toast.error("Action failed"),
  });

  const postMutation = useMutation({
    mutationFn: (data) => createCommunityPost(id, data),
    onSuccess: () => {
      setContent("");
      setMedia(null);
      queryClient.invalidateQueries({ queryKey: ["community-posts", id] });
      toast.success("Posted to community!");
    },
    onError: () => toast.error("Failed to post"),
  });

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) return toast.error("File size must be less than 20MB");
      const reader = new FileReader();
      reader.onload = () => setMedia({ url: reader.result, type: file.type.startsWith("video") ? "video" : "image" });
      reader.readAsDataURL(file);
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() && !media) return toast.error("Post cannot be empty");
    postMutation.mutate({ content, media: media?.url, mediaType: media?.type });
  };

  if (isCommLoading) return <div className="p-10 text-center text-white/50">Loading community...</div>;
  if (!community) return <div className="p-10 text-center text-red-500">Community not found</div>;

  const isMember = community.members.some(m => m._id === authUser?._id);
  const canViewFeed = !community.isPrivate || isMember;

  return (
    <div className="max-w-2xl mx-auto w-full pb-20 font-outfit min-h-screen bg-black">
      {/* Header Banner */}
      <div className="h-48 md:h-64 relative bg-gray-900 overflow-hidden">
        {community.banner ? (
          <img src={community.banner} alt={community.name} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 opacity-60"></div>
        )}
        <Link to="/communities" className="absolute top-4 left-4 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors text-white backdrop-blur-md">
          <ChevronLeft size={24} />
        </Link>
      </div>

      <div className="px-4 pb-4 md:px-6 relative -mt-16">
        <div className="flex items-end justify-between mb-4">
          <div className="w-32 h-32 rounded-3xl bg-gray-800 border-4 border-black overflow-hidden flex items-center justify-center shrink-0 shadow-2xl">
             {community.icon ? <img src={community.icon} alt="icon" className="w-full h-full object-cover" /> : <Users className="text-white/30 w-12 h-12" />}
          </div>
          <div className="flex gap-2">
            <button
               onClick={() => joinMutation.mutate(community._id)}
               disabled={joinMutation.isPending}
               className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-lg ${
                 isMember 
                 ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400 border border-white/20" 
                 : "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105"
               }`}
            >
               {joinMutation.isPending ? "..." : isMember ? "Joined" : "Join Community"}
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            {community.name}
            {community.isPrivate && <Lock size={20} className="text-white/40" title="Private Community" />}
          </h1>
          <p className="text-white/70 mt-3 text-lg leading-relaxed">{community.description}</p>
          <div className="flex items-center gap-4 mt-4 text-white/50 text-sm font-medium">
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5"><Users size={16} /> {community.members.length} Members</span>
            <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">Created by <span className="text-white ml-1">{community.creatorId?.fullName}</span></span>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-white/10"></div>

      <div className="px-4 md:px-6 pt-6">
        {canViewFeed ? (
          <>
            {/* Create Post Input */}
            <form onSubmit={handlePostSubmit} className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-4 shadow-xl">
              <div className="flex gap-3">
                <img src={authUser?.profilePic} alt="avatar" className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0" />
                <div className="flex-1">
                  <textarea 
                    value={content} onChange={e => setContent(e.target.value)}
                    placeholder={`Post to ${community.name}...`}
                    className="w-full bg-transparent text-white outline-none resize-none pt-2 text-lg placeholder:text-white/40"
                    rows={content.length > 50 ? 3 : 1}
                  />
                  {media && (
                    <div className="relative mt-3 rounded-xl overflow-hidden border border-white/20 bg-black/50">
                      <button type="button" onClick={() => setMedia(null)} className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded-full text-white flex items-center justify-center hover:bg-red-500/80 backdrop-blur-md z-10 transition-colors">✕</button>
                      {media.type === "video" ? <video src={media.url} controls className="w-full max-h-80 object-contain" /> : <img src={media.url} alt="upload" className="w-full max-h-80 object-cover" />}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <label className="text-blue-400 hover:text-blue-300 transition-colors p-2 hover:bg-blue-500/10 rounded-full cursor-pointer">
                      <ImageIcon size={22} />
                      <input type="file" accept="image/*,video/*" className="hidden" onChange={handleMediaUpload} />
                    </label>
                    <button type="submit" disabled={postMutation.isPending || (!content.trim() && !media)} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-full font-bold text-sm transition-all shadow-lg hover:shadow-blue-500/25">
                      {postMutation.isPending ? "Posting..." : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* Posts Feed */}
            {isPostsLoading ? (
              <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div></div>
            ) : posts.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                <Sparkles className="mx-auto w-12 h-12 text-white/20 mb-3" />
                <p className="text-white/60 font-medium">It's quiet here. Be the first to post!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                 <PostsFeed posts={localPosts} setPosts={setLocalPosts} />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10 shadow-2xl mx-2">
            <Lock className="w-20 h-20 text-white/10 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-3">Private Community</h3>
            <p className="text-white/60 max-w-sm mx-auto mb-8 text-lg">You must join this community to see member posts and discussions.</p>
            <button onClick={() => joinMutation.mutate(community._id)} disabled={joinMutation.isPending} className="bg-white text-black hover:bg-white/90 px-8 py-3 rounded-full font-bold text-lg shadow-xl shadow-white/10 transition-transform active:scale-95">
              Request to Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
