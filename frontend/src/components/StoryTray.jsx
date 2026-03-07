import { useQuery } from "@tanstack/react-query";
import { getStories } from "../lib/api";
import { Plus } from "lucide-react";
import { useState } from "react";
import StoryViewer from "./StoryViewer";
import useAuthUser from "../hooks/useAuthUser";
import CreateStoryModal from "./CreateStoryModal";
import { deleteStory } from "../lib/api";
import { useQueryClient } from "@tanstack/react-query";

const StoryTray = () => {
    const { authUser } = useAuthUser();
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: storiesGrouped = [], isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: getStories,
    });

    const handleDelete = async (storyId) => {
        try {
            await deleteStory(storyId);
            queryClient.invalidateQueries({ queryKey: ["stories"] });
        } catch (err) {
            console.error("Delete story error", err);
        }
    };

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth min-h-[100px]">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-2 min-w-[72px] group relative">
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="relative size-[66px] rounded-full p-[3px] transition-all duration-300 active:scale-95"
                >
                    <div className="size-full rounded-full overflow-hidden bg-base-300 ring-[1px] ring-base-content/10">
                        <img
                            src={authUser?.profilePic || "/avatar.png"}
                            alt="Me"
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                    {/* Instagram-style blue plus badge */}
                    <div className="absolute bottom-1 right-1 size-5 bg-[#0095f6] rounded-full border-[2.5px] border-base-100 shadow-sm flex items-center justify-center translate-x-1 translate-y-1 z-10">
                        <Plus className="size-3 text-white" strokeWidth={4} />
                    </div>
                    {/* Subtle hover overlay */}
                    <div className="absolute inset-[3px] rounded-full bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </button>
                <span className="text-[11px] font-medium opacity-60 tracking-tight">Your story</span>
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
                        className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group/story"
                        onClick={() => setSelectedUserStories(group)}
                    >
                        <div className="relative size-[66px] rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 transition-transform duration-300 active:scale-95 ring-[1px] ring-base-content/5">
                            <div className="size-full rounded-full border-[2.5px] border-base-100 overflow-hidden bg-base-300">
                                <img
                                    src={group.profilePic || "/avatar.png"}
                                    alt={group.fullName}
                                    className="size-full object-cover group-hover/story:scale-105 transition-transform duration-500"
                                />
                            </div>
                        </div>
                        <span className="text-[11px] font-medium truncate w-full text-center opacity-60 tracking-tight group-hover/story:opacity-100 transition-opacity">
                            {group.userId === authUser?._id ? "your story" : group.fullName.split(" ")[0].toLowerCase()}
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
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default StoryTray;
