import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getStories, createStory } from "../lib/api";
import { Plus, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import StoryViewer from "./StoryViewer";
import useAuthUser from "../hooks/useAuthUser";

const TRENDING_SONGS = [
    "Blinding Lights - The Weeknd",
    "Stay - The Kid LAROI & Justin Bieber",
    "Flowers - Miley Cyrus",
    "As It Was - Harry Styles",
    "Heat Waves - Glass Animals",
    "Original Audio",
];

const StoryTray = () => {
    const { authUser } = useAuthUser();
    const [selectedUserStories, setSelectedUserStories] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [songName, setSongName] = useState("");
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    const { data: storiesGrouped = [], isLoading } = useQuery({
        queryKey: ["stories"],
        queryFn: getStories,
    });

    const { mutate: uploadStory, isPending: isUploading } = useMutation({
        mutationFn: createStory,
        onSuccess: () => {
            toast.success("Story shared! ✨");
            queryClient.invalidateQueries({ queryKey: ["stories"] });
            setPreviewImage(null);
            setCaption("");
            setSongName("");
        },
        onError: (err) => toast.error(err.response?.data?.message || "Failed to share story"),
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleConfirmUpload = () => {
        if (!previewImage) return;
        uploadStory({
            image: previewImage,
            caption: caption.trim(),
            songName: songName.trim() || "Original Audio"
        });
    };

    return (
        <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth min-h-[100px]">
            {/* Add Story Button */}
            <div className="flex flex-col items-center gap-1 min-w-[70px]">
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="relative size-16 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 group overflow-hidden bg-base-200 active:scale-95 shadow-inner"
                >
                    {isUploading ? (
                        <Loader2 className="size-6 animate-spin text-primary" />
                    ) : (
                        <>
                            <img
                                src={authUser?.profilePic || "/avatar.png"}
                                alt="Me"
                                className="size-full object-cover opacity-60 group-hover:scale-110 group-hover:opacity-80 transition-all duration-500"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-base-100/20 group-hover:bg-transparent transition-colors">
                                <div className="p-1.5 rounded-full bg-primary text-primary-content shadow-lg scale-90 group-hover:scale-110 transition-transform duration-300">
                                    <Plus className="size-5" strokeWidth={3} />
                                </div>
                            </div>
                        </>
                    )}
                </button>
                <span className="text-[10px] font-bold opacity-60 group-hover:opacity-100 transition-opacity mt-1">Your Story</span>
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
                        className="flex flex-col items-center gap-1 cursor-pointer min-w-[70px] group/story"
                        onClick={() => setSelectedUserStories(group)}
                    >
                        <div className="relative size-16 rounded-full p-[3px] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:rotate-12 transition-transform duration-500">
                            <div className="size-full rounded-full border-[3px] border-base-100 overflow-hidden bg-base-300 shadow-sm">
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

            {/* Story Viewer Modal */}
            {selectedUserStories && (
                <StoryViewer
                    group={selectedUserStories}
                    onClose={() => setSelectedUserStories(null)}
                />
            )}

            {/* Story Creation Modal */}
            {previewImage && (
                <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4">
                    <div className="bg-base-100 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="relative aspect-[9/16] bg-base-300">
                            <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-4 right-4 btn btn-circle btn-sm bg-black/40 text-white border-none hover:bg-black/60"
                            >
                                <Plus className="size-5 rotate-45" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Add a caption..."
                                    className="input input-bordered w-full bg-base-200 focus:border-primary border-none rounded-xl"
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Song Name (Optional)"
                                            className="input input-bordered w-full bg-base-200 focus:border-primary border-none rounded-xl pl-10"
                                            value={songName}
                                            onChange={(e) => setSongName(e.target.value)}
                                        />
                                        <Plus className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50 rotate-45" />
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 px-1 font-sans">
                                        {TRENDING_SONGS.map((song) => (
                                            <button
                                                key={song}
                                                onClick={() => setSongName(song)}
                                                className={`text-[9px] px-2 py-0.5 rounded-full border transition-all ${songName === song ? 'bg-primary text-primary-content border-primary' : 'bg-base-200 text-base-content/60 border-base-300 hover:border-primary/40'}`}
                                            >
                                                {song}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    className="btn btn-ghost flex-1 rounded-xl"
                                    onClick={() => setPreviewImage(null)}
                                    disabled={isUploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary flex-1 rounded-xl gap-2 shadow-lg shadow-primary/20"
                                    onClick={handleConfirmUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Share Now"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StoryTray;
