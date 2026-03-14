import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, Plus, Image as ImageIcon, Search } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCommunities, createCommunity, toggleJoinCommunity } from "../lib/api";
import toast from "react-hot-toast";
import useAuthUser from "../hooks/useAuthUser";

export default function CommunityPage() {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState("discover"); // discover or my_communities

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: false,
    icon: null,
    banner: null,
  });

  const { data: communitiesResponse, isLoading } = useQuery({
    queryKey: ["communities"],
    queryFn: getCommunities,
  });

  const communities = communitiesResponse?.communities || [];

  const createMutation = useMutation({
    mutationFn: createCommunity,
    onSuccess: () => {
      toast.success("Community created successfully!");
      setShowCreateModal(false);
      setFormData({ name: "", description: "", isPrivate: false, icon: null, banner: null });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create community");
    },
  });

  const joinMutation = useMutation({
    mutationFn: toggleJoinCommunity,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
    onError: () => toast.error("Action failed"),
  });

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setFormData((prev) => ({ ...prev, [type]: reader.result }));
      };
    }
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return toast.error("Name is required");
    createMutation.mutate(formData);
  };

  const myCommunities = communities.filter(c => c.members.includes(authUser?._id));
  const displayedCommunities = activeTab === "discover" ? communities : myCommunities;

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 pt-4 px-4 font-outfit">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Communities</h1>
          <p className="text-white/60 text-sm mt-1">Connect with like-minded people.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 sm:px-4 sm:py-2 rounded-xl flex items-center gap-2 transition-colors font-medium text-sm sm:text-base"
        >
          <Plus size={20} />
          <span className="hidden sm:inline">Create Community</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-white/10 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("discover")}
          className={`font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${activeTab === "discover" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
        >
          Discover
        </button>
        <button
          onClick={() => setActiveTab("my_communities")}
          className={`font-medium px-4 py-2 rounded-full whitespace-nowrap transition-colors ${activeTab === "my_communities" ? "bg-white text-black" : "text-white hover:bg-white/10"}`}
        >
          My Communities
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : displayedCommunities.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No communities found</h3>
          <p className="text-white/60 mb-6">
            {activeTab === "discover" ? "There are no communities yet. Be the first to create one!" : "You haven't joined any communities yet."}
          </p>
          {activeTab === "my_communities" && (
            <button onClick={() => setActiveTab("discover")} className="text-blue-400 font-medium hover:underline">
               Explore Communities
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedCommunities.map((c) => {
            const isMember = c.members.includes(authUser?._id);
            return (
              <div key={c._id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors flex flex-col group">
                <div className="h-24 bg-gradient-to-r from-blue-900/50 to-purple-900/50 relative">
                  {c.banner && <img src={c.banner} alt="banner" className="w-full h-full object-cover" />}
                  <div className="absolute -bottom-6 left-4 w-12 h-12 rounded-xl bg-gray-800 border-2 border-black overflow-hidden flex items-center justify-center">
                    {c.icon ? <img src={c.icon} alt="icon" className="w-full h-full object-cover" /> : <Users className="text-white/50 w-6 h-6" />}
                  </div>
                </div>
                
                <div className="pt-8 px-4 pb-4 flex flex-col flex-grow">
                  <Link to={`/community/${c._id}`} className="font-bold text-lg text-white mb-1 group-hover:text-blue-400 transition-colors line-clamp-1">
                    {c.name}
                  </Link>
                  <p className="text-white/60 text-sm line-clamp-2 h-10 mb-4">{c.description || "No description provided."}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-white/40 text-xs flex items-center gap-1 font-medium">
                      <Users size={14} /> {c.members.length} members
                    </span>
                    
                    <button
                      onClick={() => joinMutation.mutate(c._id)}
                      disabled={joinMutation.isPending}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                        isMember 
                        ? "bg-white/10 text-white hover:bg-red-500/20 hover:text-red-400" 
                        : "bg-blue-600 text-white hover:bg-blue-500"
                      }`}
                    >
                      {isMember ? "Joined" : "Join"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
              <h2 className="text-xl font-bold text-white">Create Community</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-white/60 hover:text-white p-1">✕</button>
            </div>
            
            <form onSubmit={handleCreateSubmit} className="p-4 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              
              <div>
                <label className="text-sm font-medium text-white/80 block mb-1">Community Name *</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500"
                  placeholder="e.g. Anime Lovers"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-white/80 block mb-1">Description</label>
                <textarea 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 resize-none h-24"
                  placeholder="What is this community about?"
                  maxLength={500}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-white/80 block mb-2">Community Icon</label>
                  <label className="w-full h-24 bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden">
                    {formData.icon ? (
                      <img src={formData.icon} alt="Icon preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="text-white/40 mb-1" size={24} />
                        <span className="text-xs text-white/40">Upload Icon</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'icon')} />
                  </label>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-white/80 block mb-2">Banner Image</label>
                  <label className="w-full h-24 bg-white/5 border border-white/10 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors overflow-hidden">
                    {formData.banner ? (
                      <img src={formData.banner} alt="Banner preview" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="text-white/40 mb-1" size={24} />
                        <span className="text-xs text-white/40">Upload Banner</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageChange(e, 'banner')} />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-2 bg-white/5 p-3 rounded-xl border border-white/5">
                <input 
                  type="checkbox" id="isPrivate"
                  checked={formData.isPrivate} onChange={e => setFormData({...formData, isPrivate: e.target.checked})}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <label htmlFor="isPrivate" className="text-sm text-white/90 cursor-pointer flex-1">
                  <div className="font-semibold">Private Community</div>
                  <div className="text-white/50 text-xs">Only members can view posts.</div>
                </label>
              </div>

              <button 
                type="submit" disabled={createMutation.isPending}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-2"
              >
                {createMutation.isPending ? "Creating..." : "Create Community"}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
