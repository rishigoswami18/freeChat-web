import { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStory, getSongs } from "../lib/api";
import { Plus, Loader2, X, Music, Search, Play } from "lucide-react";
import toast from "react-hot-toast";

const CreateStoryModal = ({ isOpen, onClose }) => {
    const [previewImage, setPreviewImage] = useState(null);
    const [caption, setCaption] = useState("");
    const [songName, setSongName] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const queryClient = useQueryClient();
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const data = await getSongs();
                setSongs(data);
            } catch (err) {
                console.error("Error fetching songs:", err);
            }
        };
        if (isOpen) fetchSongs();
    }, [isOpen]);

    const filteredSongs = useMemo(() => {
        if (!searchQuery) return songs.slice(0, 10);
        return songs.filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [songs, searchQuery]);

    const { mutate: uploadStory, isPending: isUploading } = useMutation({
        mutationFn: createStory,
        onSuccess: () => {
            toast.success("Story shared! ✨");
            queryClient.invalidateQueries({ queryKey: ["stories"] });
            handleClose();
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
            songName: songName.trim() || "Original Audio",
            audioUrl: audioUrl
        });
    };

    const handleClose = () => {
        setPreviewImage(null);
        setCaption("");
        setSongName("");
        setAudioUrl("");
        setSearchQuery("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4 transition-all duration-300">
            <div className="bg-base-100 rounded-3xl overflow-hidden w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300">
                {!previewImage ? (
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Plus className="size-10" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-2">Create Story</h3>
                            <p className="text-sm opacity-60">Share a moment with your friends. Stories disappear after 24 hours.</p>
                        </div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn btn-primary w-full rounded-xl shadow-lg shadow-primary/20"
                        >
                            Select from Gallery
                        </button>
                        <button onClick={onClose} className="btn btn-ghost w-full rounded-xl">Cancel</button>
                    </div>
                ) : (
                    <>
                        <div className="relative aspect-[9/16] bg-base-300">
                            <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
                            <button
                                onClick={() => setPreviewImage(null)}
                                className="absolute top-4 right-4 btn btn-circle btn-sm bg-black/40 text-white border-none hover:bg-black/60 shadow-lg"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        <div className="p-5 space-y-4 max-h-[40vh] overflow-y-auto no-scrollbar">
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Add a caption..."
                                    className="input input-bordered w-full bg-base-200 focus:border-primary border-none rounded-xl"
                                    maxLength={100}
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                />
                                <div className="space-y-2">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            placeholder="Search songs..."
                                            className="input input-bordered w-full bg-base-200 focus:border-primary border-none rounded-xl pl-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50 group-focus-within:text-primary transition-colors" />
                                    </div>

                                    {songName && (
                                        <div className="flex items-center justify-between bg-primary/10 p-2 rounded-xl border border-primary/20">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <Music className="size-3 text-primary" />
                                                <span className="text-[10px] font-bold text-primary truncate">{songName}</span>
                                            </div>
                                            <button onClick={() => { setSongName(""); setAudioUrl(""); }} className="btn btn-ghost btn-xs btn-circle"><X className="size-3" /></button>
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-1.5 px-1 max-h-24 overflow-y-auto no-scrollbar">
                                        {filteredSongs.length > 0 ? filteredSongs.map((song) => {
                                            const label = `${song.title} - ${song.artist}`;
                                            const isSelected = songName === label;
                                            return (
                                                <div key={song._id} className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setSongName(label);
                                                            setAudioUrl(song.audioUrl);
                                                        }}
                                                        className={`text-[9px] px-2 py-1 rounded-full border transition-all whitespace-nowrap ${isSelected ? 'bg-primary text-primary-content border-primary' : 'bg-base-200 text-base-content/60 border-base-300 hover:border-primary/40'}`}
                                                    >
                                                        {label}
                                                    </button>
                                                    {song.audioUrl && (
                                                        <button
                                                            className="btn btn-ghost btn-xs btn-circle text-primary"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                const audio = new Audio(song.audioUrl);
                                                                audio.play().catch(() => { });
                                                                setTimeout(() => audio.pause(), 3000);
                                                            }}
                                                        >
                                                            <Play className="size-2.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        }) : (
                                            <p className="text-[10px] opacity-40 p-2">No songs found</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    className="btn btn-ghost flex-1 rounded-xl"
                                    onClick={() => setPreviewImage(null)}
                                    disabled={isUploading}
                                >
                                    Change
                                </button>
                                <button
                                    className="btn btn-primary flex-1 rounded-xl gap-2 shadow-lg shadow-primary/20"
                                    onClick={handleConfirmUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? (
                                        <Loader2 className="size-4 animate-spin" />
                                    ) : (
                                        "Share story"
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    );
};

export default CreateStoryModal;
