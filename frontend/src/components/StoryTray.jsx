import { useQuery } from "@tanstack/react-query";
import { getStories } from "../lib/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import StoryViewer from "./StoryViewer";
import useAuthUser from "../hooks/useAuthUser";
import CreateStoryModal from "./CreateStoryModal";

const StoryTray = () => {
    const { authUser } = useAuthUser();
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data: storiesGrouped = [], isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: getStories,
    });

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth min-h-[100px]">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[75px] group">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="relative size-16 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden bg-base-200 active:scale-95 shadow-md"
                >
                    <img
                        src={authUser?.profilePic || "/avatar.png"}
                        alt="Me"
                        className="size-full object-cover opacity-80"
                    />
                    <div className="absolute bottom-0 right-0 p-1 bg-orange-500 rounded-full border-2 border-base-100 shadow-sm translate-x-1 translate-y-1">
                        <Plus className="size-3.5 text-white" strokeWidth={4} />
                    </div>
                </button>
                <span className="text-[11px] font-bold opacity-70 mt-1">Your Story</span>
            </div>

            {/* Friend Stories */}
            {isLoading ? (
                <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="size-16 rounded-full bg-base-300 animate-pulse border-2 border-base-200" />
                            <div className="h-2 w-10 bg-base-300 animate-pulse rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                storiesGrouped.map((group) => (
                    <div
                        key={group.userId}
                        className="flex flex-col items-center gap-1 cursor-pointer min-w-[75px] group/story"
                        onClick={() => setSelectedUserStories(group)}
                    >
                        <div className="relative size-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 transition-transform duration-300 active:scale-95">
                            <div className="size-full rounded-full border-[2.5px] border-base-100 overflow-hidden bg-base-300">
                                <img
                                    src={group.profilePic || "/avatar.png"}
                                    alt={group.fullName}
                                    className="size-full object-cover group-hover/story:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <span className="text-[10px] font-bold truncate w-full text-center opacity-80 group-hover/story:opacity-100 transition-opacity">
                            {group.userId === authUser?._id ? "You" : group.fullName.split(" ")[0]}
                        </span>
                    </div>
                ))
            )}

            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            {/* Story Viewer Modal */}
            {selectedUserStories && (
                <StoryViewer
                    group={selectedUserStories}
                    onClose={() => setSelectedUserStories(null)}
                />
            )}
        </div>
    );
};

export default StoryTray;
