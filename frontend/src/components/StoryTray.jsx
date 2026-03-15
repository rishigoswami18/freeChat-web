import { memo, useState, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStories, deleteStory } from "../lib/api";
import { Plus, BadgeCheck } from "lucide-react";
import StoryViewer from "./StoryViewer";
import useAuthUser from "../hooks/useAuthUser";
import CreateStoryModal from "./CreateStoryModal";
import { StorySkeleton } from "./Skeletons";

// === PERFORMANCE OPTIMIZATION: Memoized Sub-Components ===
// Extracted the "Add Story" button to prevent unnecessary re-rendering
// when other friends' stories load or change.
const AddStoryButton = memo(({ authUser, onOpenModal }) => {
    return (
        <div className="flex flex-col items-center gap-2 min-w-[72px] group relative select-none">
            <button
                onClick={onOpenModal}
                className="relative size-[66px] rounded-full p-[3px] transition-all duration-300 active:scale-95"
                aria-label="Create a new story"
            >
                <div className="size-full rounded-full overflow-hidden bg-base-300 ring-[1px] ring-base-content/10">
                    <img
                        src={authUser?.profilePic || "/avatar.png"}
                        alt={authUser?.fullName || "Me"}
                        className="size-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                {/* Instagram-style blue plus badge */}
                <div className="absolute bottom-1 right-1 size-5 bg-white rounded-full border-[2.5px] border-base-100 shadow-sm flex items-center justify-center translate-x-1 translate-y-1 z-10 overflow-hidden">
                    {authUser?.isVerified || authUser?.role === "admin" ? (
                        <BadgeCheck className="size-full text-white fill-[#1d9bf0]" strokeWidth={2} />
                    ) : (
                        <div className="size-full bg-[#0095f6] flex items-center justify-center">
                            <Plus className="size-3 text-white" strokeWidth={4} />
                        </div>
                    )}
                </div>
                {/* Subtle hover overlay */}
                <div className="absolute inset-[3px] rounded-full bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
            </button>
            <span className="text-[11px] font-medium opacity-60 tracking-tight">Your story</span>
        </div>
    );
});
AddStoryButton.displayName = "AddStoryButton";

// === REUSABLE STORY AVATAR CARD ===
// Decoupled heavily-styled DOM elements from the main iteration loop
const StoryItem = memo(({ group, currentUserId, onSelect }) => {
    // Prevent inline function recreation inside array map loops
    const handleClick = useCallback(() => {
        onSelect(group);
    }, [group, onSelect]);

    const isCurrentUser = group.userId === currentUserId;
    const displayName = isCurrentUser ? "your story" : group.fullName.split(" ")[0].toLowerCase();
    const isVerified = group.role === "admin" || group.isVerified;

    return (
        <div
            className="flex flex-col items-center gap-2 cursor-pointer min-w-[72px] group/story select-none"
            onClick={handleClick}
            role="button"
            aria-label={`View ${displayName}'s story`}
        >
            {/* CSS Gradient Story Circle */}
            <div className="relative size-[66px] rounded-full p-[3px] bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-600 transition-transform duration-300 active:scale-95 ring-[1px] ring-base-content/5">
                <div className="size-full rounded-full border-[2.5px] border-base-100 overflow-hidden bg-base-300 shrink-0">
                    <img
                        src={group.profilePic || "/avatar.png"}
                        alt={group.fullName}
                        className="size-full object-cover group-hover/story:scale-105 transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                    />
                </div>
                {/* Verification Overlay */}
                {isVerified && (
                    <div className="absolute bottom-1 right-1 size-5 bg-white rounded-full border-[2.5px] border-base-100 shadow-sm flex items-center justify-center translate-x-1 translate-y-1 z-10">
                        <BadgeCheck className="size-full text-white fill-[#1d9bf0]" strokeWidth={2} />
                    </div>
                )}
            </div>
            {/* Text Label */}
            <span className="text-[11px] font-medium truncate w-[72px] text-center opacity-60 tracking-tight group-hover/story:opacity-100 transition-opacity whitespace-nowrap px-1">
                {displayName}
            </span>
        </div>
    );
});
StoryItem.displayName = "StoryItem";

// === MAIN TRAY COMPONENT ===
const StoryTray = memo(() => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();

    // Modal & Viewer UI State
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // === OPTIMIZED CACHING ===
    // Configured staleTime preventing constant background refetches when navigating between feeds/profiles
    const { data: storiesGrouped = [], isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: getStories,
        staleTime: 1000 * 60, // Consider stories fresh for 1 minute
        refetchOnWindowFocus: true // Auto-refresh if they switch tabs and come back
    });

    // === STABLE HANDLERS ===
    const openCreateModal = useCallback(() => setIsCreateModalOpen(true), []);
    const closeCreateModal = useCallback(() => setIsCreateModalOpen(false), []);
    const closeViewer = useCallback(() => setSelectedUserStories(null), []);

    // Separated the selection function to prevent recreating the entire array map loop
    const handleSelectStory = useCallback((group) => {
        setSelectedUserStories(group);
    }, []);

    // Extracted async delete handler utilizing React Query invalidation
    const handleDelete = useCallback(async (storyId) => {
        try {
            await deleteStory(storyId);
            // Targeted invalidation forces a strict UI refresh automatically bridging with cache
            queryClient.invalidateQueries({ queryKey: ["stories"] });
            
            // Note: StoryViewer handles closing itself if it was the last story
        } catch (err) {
            console.error("Delete story error:", err);
        }
    }, [queryClient]);

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth min-h-[100px] w-full relative">
            
            {/* 1. Add Story Button (Always Visible & Memoized) */}
            <AddStoryButton 
                authUser={authUser} 
                onOpenModal={openCreateModal} 
            />

            {/* 2. Loading State vs Real Stories */}
            {isLoading ? (
                <StorySkeleton />
            ) : (
                storiesGrouped.map((group) => (
                    <StoryItem 
                        key={group.userId} 
                        group={group} 
                        currentUserId={authUser?._id}
                        onSelect={handleSelectStory}
                    />
                ))
            )}

            {/* 3. Global Creation & Viewer Modals */}
            <CreateStoryModal
                isOpen={isCreateModalOpen}
                onClose={closeCreateModal}
            />

            {selectedUserStories && (
                <StoryViewer
                    group={selectedUserStories}
                    onClose={closeViewer}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
});

StoryTray.displayName = "StoryTray";
export default StoryTray;
