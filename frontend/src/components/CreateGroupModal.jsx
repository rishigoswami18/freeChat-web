import { useState } from "react";
import { useChatClient } from "./ChatProvider";
import { useQuery } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import { X, Search, Users, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const CreateGroupModal = ({ isOpen, onClose }) => {
    const chatClient = useChatClient();
    const navigate = useNavigate();
    const [groupName, setGroupName] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { data: friends, isLoading } = useQuery({
        queryKey: ["friends"],
        queryFn: getUserFriends,
        enabled: isOpen,
    });

    const toggleFriend = (friendId) => {
        setSelectedFriends(prev =>
            prev.includes(friendId)
                ? prev.filter(id => id !== friendId)
                : [...prev, friendId]
        );
    };

    const handleCreateGroup = async () => {
        if (!groupName.trim()) return toast.error("Please enter a group name");
        if (selectedFriends.length < 2) return toast.error("Select at least 2 friends for a group");

        setIsCreating(true);
        try {
            const channelId = `group_${Math.random().toString(36).substring(2, 11)}`;
            const channel = chatClient.channel("messaging", channelId, {
                name: groupName,
                members: [...selectedFriends, chatClient.userID],
                created_by_id: chatClient.userID,
            });

            await channel.create();
            toast.success("Group created! 🚀");
            onClose();
            navigate(`/chat/${channelId}`);
        } catch (error) {
            console.error("Error creating group:", error);
            toast.error("Failed to create group");
        } finally {
            setIsCreating(false);
        }
    };

    if (!isOpen) return null;

    const filteredFriends = friends?.filter(f =>
        f.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-base-100 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-base-300 flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="p-6 border-b border-base-300 flex justify-between items-center bg-base-200/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl text-primary">
                            <Users className="size-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">New Group</h2>
                            <p className="text-xs opacity-60">Add at least 2 friends</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X className="size-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold">Group Name</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Coding Squad 💻"
                            className="input input-bordered w-full rounded-xl focus:border-primary"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="label-text font-bold px-1">Select Friends</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
                            <input
                                type="text"
                                placeholder="Search friends..."
                                className="input input-bordered input-sm w-full pl-10 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1 max-h-64 overflow-y-auto pr-2 custom-scrollbar mt-2">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="size-6 animate-spin text-primary" />
                                </div>
                            ) : filteredFriends?.length > 0 ? (
                                filteredFriends.map(friend => (
                                    <div
                                        key={friend._id}
                                        onClick={() => toggleFriend(friend._id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${selectedFriends.includes(friend._id)
                                            ? "bg-primary/5 border-primary/20 shadow-sm"
                                            : "hover:bg-base-200 border-transparent"
                                            }`}
                                    >
                                        <div className="avatar">
                                            <div className="size-10 rounded-full">
                                                <img src={friend.profilePic || "/avatar.png"} alt={friend.fullName} />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-sm">{friend.fullName}</p>
                                        </div>
                                        <div className={`size-5 rounded-md border-2 flex items-center justify-center transition-colors ${selectedFriends.includes(friend._id)
                                            ? "bg-primary border-primary text-primary-content"
                                            : "border-base-300"
                                            }`}>
                                            {selectedFriends.includes(friend._id) && <Check className="size-3.5" />}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center py-10 text-sm opacity-50 italic">No friends found</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-base-200/50 border-t border-base-300 flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs font-medium opacity-60 px-1">
                        <span>{selectedFriends.length} friends selected</span>
                        <span>{selectedFriends.length >= 2 ? "✅ Ready" : "Min. 2"}</span>
                    </div>
                    <button
                        onClick={handleCreateGroup}
                        disabled={isCreating || !groupName.trim() || selectedFriends.length < 2}
                        className="btn btn-primary w-full rounded-xl gap-2 h-12"
                    >
                        {isCreating ? (
                            <>
                                <Loader2 className="size-5 animate-spin" /> Creating...
                            </>
                        ) : (
                            <>
                                Create Group <Users className="size-5" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
