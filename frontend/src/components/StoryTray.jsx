import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStories, createStory } from "../lib/api";
import { Plus, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import StoryViewer from "./StoryViewer";
import useAuthUser from "../hooks/useAuthUser";

const StoryTray = () => {
    const { authUser } = useAuthUser();
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);
    const [selectedUserStories, setSelectedUserStories] = useState(null);

    const { data: storiesGrouped = [], isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: getStories,
    });

    const { mutate: uploadStory, isPending: isUploading } = useMutation({
        mutationFn: createStory,
        onSuccess: () => {
            toast.success("Story shared! ✨");
            queryClient.invalidateQueries({ queryKey: ["stories"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to share story"),
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                uploadStory({ image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth min-h-[100px]">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="relative size-16 rounded-full border-2 border-dashed border-primary/50 flex items-center justify-center hover:bg-primary/5 transition-all group overflow-hidden bg-base-200"
                >
                    {isUploading ? (
                        <Loader2 className="size-6 animate-spin text-primary" />
                    ) : (
                        <>
                            <img
                                src={authUser?.profilePic || "/avatar.png"}
                                alt="Me"
                                className="size-full object-cover opacity-50 group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-base-100/30">
                                <Plus className="size-6 text-primary" />
                            </div>
                        </>
                    )}
                </button>
                <span className="text-[10px] font-medium opacity-70">Your Story</span>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
            </div>

            {/* Friend Stories */}
            {isLoading ? (
                <div className="flex gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="size-16 rounded-full bg-base-300 animate-pulse" />
                    ))}
                </div>
            ) : (
                storiesGrouped.map((group) => (
                    <div
                        key={group.userId}
                        className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px]"
                        onClick={() => setSelectedUserStories(group)}
                    >
                        <div className="size-16 rounded-full p-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                            <div className="size-full rounded-full border-2 border-base-100 overflow-hidden bg-base-300">
                                <img
                                    src={group.profilePic || "/avatar.png"}
                                    alt={group.fullName}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-[10px] font-medium truncate w-full text-center">
                            {group.userId === authUser?._id ? "You" : group.fullName.split(" ")[0]}
                        </span>
                    </div>
                ))
            )}

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
