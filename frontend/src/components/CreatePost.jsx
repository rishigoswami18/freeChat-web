import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { createPost, getSongs } from "../lib/api";
import { ImageIcon, VideoIcon, X, Loader2, Play, BadgeCheck, Square, Sparkles, Wand2 } from "lucide-react";
import toast from "react-hot-toast";

// === ENVIRONMENT CONFIGURATION ===
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// === GLOBAL AUDIO PREVIEW SAFEGUARD ===
// Ensures only one audio track can play at a time across the entire application
let currentAudioPreview = null;
const stopCurrentAudio = () => {
    if (currentAudioPreview) {
        currentAudioPreview.pause();
        currentAudioPreview.currentTime = 0;
        currentAudioPreview = null;
    }
};

// === CLOUDINARY DIRECT UPLOAD LOGIC ===
const uploadToCloudinary = (file, resourceType = "image", onProgress) => {
    return new Promise((resolve, reject) => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            reject(new Error("Cloudinary configuration missing in environment"));
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && onProgress) {
                const percent = Math.round((e.loaded / e.total) * 100);
                onProgress(percent);
            }
        };

        xhr.onload = () => {
            try {
                const data = JSON.parse(xhr.responseText);
                if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
                    resolve(data.secure_url);
                } else {
                    console.error("Cloudinary upload error response:", data);
                    reject(new Error(data.error?.message || "Upload failed"));
                }
            } catch (err) {
                reject(new Error("Failed to parse Cloudinary response"));
            }
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
    });
};

// === HELPER COMPONENTS ===
// Shield inputs tightly to prevent keystroke lag
const PostInputs = memo(({ content, setContent, authUser }) => (
    <div className="flex items-start gap-4">
        <div className="avatar flex-shrink-0">
            <div className="w-12 h-12 rounded-full border border-slate-200 overflow-hidden bg-base-300 shadow-sm">
                <img
                    src={authUser?.profilePic || "/avatar.png"}
                    alt={authUser?.fullName}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    decoding="async"
                />
                {(authUser?.isVerified || authUser?.role === "admin") && (
                    <div className="absolute -bottom-1 -right-1 size-4 bg-white rounded-full flex items-center justify-center p-[1px] shadow-sm ring-1 ring-base-content/5 overflow-hidden">
                        <BadgeCheck className="size-full text-white fill-[#1d9bf0]" strokeWidth={2} />
                    </div>
                )}
            </div>
        </div>
        <div className="flex-1 min-w-0 relative group">
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                <Sparkles className="size-3.5" />
                Share a post
            </div>
            <textarea
                className="w-full bg-transparent resize-none text-[15px] text-slate-900 focus:outline-none placeholder:text-slate-400 min-h-[72px] leading-relaxed pt-1 pb-2"
                placeholder="Share an update, clip, launch, or creator insight..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
            />
            <div className="absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-slate-900 group-focus-within:w-full transition-all duration-300 ease-out"></div>
        </div>
    </div>
));
PostInputs.displayName = "PostInputs";

// === MAIN UI COMPONENT ===
const CreatePost = memo(({ onPost, authUser }) => {
    // Media & State
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);
    
    // Audio Logic
    const [songName, setSongName] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [songs, setSongs] = useState([]);
    const [currentPreviewPlaying, setCurrentPreviewPlaying] = useState(null);
    
    // Upload Pipeline Logic
    const [uploadStatus, setUploadStatus] = useState("idle"); // idle, uploading, posting
    const [uploadProgress, setUploadProgress] = useState(0);
    
    // Strict Hardware Pointers
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const previewTimeoutRef = useRef(null);

    // === MEMOIZED DERIVATIONS ===
    const filteredSongs = useMemo(() => {
        if (!searchQuery) return songs;
        const lowerQ = searchQuery.toLowerCase();
        return songs.filter(s =>
            s.title.toLowerCase().includes(lowerQ) ||
            s.artist.toLowerCase().includes(lowerQ)
        );
    }, [songs, searchQuery]);

    // === LIFECYCLE EFFECTS ===
    useEffect(() => {
        // Hydrate selected song from reels flow safely
        const preSelected = localStorage.getItem("preSelectedSong");
        if (preSelected) {
            try {
                const songData = JSON.parse(preSelected);
                setSongName(`${songData.title} - ${songData.artist}`);
                setAudioUrl(songData.audioUrl);
                setMediaType("video");
                localStorage.removeItem("preSelectedSong");
            } catch (e) {
                console.error("Error parsing preselected song", e);
            }
        }
    }, []);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const data = await getSongs();
                setSongs(data || []);
            } catch (err) {
                console.error("Error fetching songs:", err);
            }
        };
        fetchSongs();
    }, []);

    // Memory Leak Failsafe
    useEffect(() => {
        // Will cleanup any ObjectURLs lingering if the component unmounts mid-creation
        return () => {
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            stopCurrentAudio();
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        };
    }, [mediaPreview]);


    // === STABLE HANDLERS ===
    const handleFileSelect = useCallback((e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Failsafe: Replaces any existing file properly preventing 500MB overlapping URLs in RAM
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);

        const maxSize = type === "video" ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
        const maxLabel = type === "video" ? "100MB" : "50MB";
        
        if (file.size > maxSize) {
            toast.error(`File size must be under ${maxLabel}`);
            // Reset the invisible browser input so they can click it again safely
            e.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setMediaFile(file);
        setMediaType(type);
        setMediaPreview(previewUrl);
        e.target.value = ""; // Clear file handle locking
    }, [mediaPreview]);

    const removeMedia = useCallback(() => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaFile(null);
        setMediaType("");
        setMediaPreview(null);
        setSongName("");
        setAudioUrl("");
        setUploadProgress(0);
        
        if (imageInputRef.current) imageInputRef.current.value = "";
        if (videoInputRef.current) videoInputRef.current.value = "";
    }, [mediaPreview]);

    const handleAudioPreview = useCallback((songUrl, songId) => {
        stopCurrentAudio();
        
        if (currentPreviewPlaying === songId) {
            // Toggle off behaviour
            setCurrentPreviewPlaying(null);
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
            return;
        }

        const audio = new Audio(songUrl);
        
        audio.play().then(() => {
            currentAudioPreview = audio;
            setCurrentPreviewPlaying(songId);
            
            // Auto stop logic
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
            previewTimeoutRef.current = setTimeout(() => {
                stopCurrentAudio();
                setCurrentPreviewPlaying(null);
            }, 6000); // Strict 6 second preview limit to save data
            
        }).catch(err => {
            toast.error("Wait for audio to load.");
        });
    }, [currentPreviewPlaying]);

    const handlePost = useCallback(async () => {
        const trimmedContent = content.trim();

        if (!trimmedContent && !mediaFile) {
            toast.error("Write something or add media");
            return;
        }
        if (uploadStatus !== "idle") {
            return; // Throttle double clicks
        }

        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
            let mediaUrlResp = "";
            let mediaBase64 = null;

            if (mediaFile) {
                try {
                    toast.loading(`Uploading ${mediaType}...`, { id: "upload-status" });
                    
                    mediaUrlResp = await uploadToCloudinary(mediaFile, mediaType, (progress) => {
                        setUploadProgress(progress);
                    });
                    
                } catch (uploadError) {
                    console.warn("Direct upload failed, attempting backend fallback...", uploadError);

                    if (mediaFile.size < 10 * 1024 * 1024) {
                        toast.loading("Uploading via backend...", { id: "upload-status" });
                        
                        const reader = new FileReader();
                        mediaBase64 = await new Promise((resolve, reject) => {
                            reader.onloadend = () => resolve(reader.result);
                            reader.onerror = () => reject(new Error("File conversion failed"));
                            reader.readAsDataURL(mediaFile);
                        });
                    } else {
                        throw new Error(`File too large for fallback system (${Math.round(mediaFile.size/1024/1024)}MB). Please connect to a stable network.`);
                    }
                }
            }

            setUploadStatus("posting");
            toast.loading("Publishing...", { id: "upload-status" });

            const postData = {
                content: trimmedContent,
                mediaUrl: mediaUrlResp,
                media: mediaBase64,
                mediaType,
                songName: songName.trim(),
                audioUrl: audioUrl,
            };

            const saved = await createPost(postData);
            onPost(saved);
            
            // Safe Structural Tear Down
            setContent("");
            removeMedia();
            toast.success("Post published!", { id: "upload-status" });

        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || "Failed to create post";
            toast.error(errorMsg, { id: "upload-status" });
        } finally {
            setUploadStatus("idle");
            setUploadProgress(0);
        }
    }, [content, mediaFile, uploadStatus, mediaType, songName, audioUrl, onPost, removeMedia]);


    // === RENDER ===
    const isWorking = uploadStatus !== "idle";

    return (
        <div className="flex flex-col gap-4 rounded-[32px] border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Creator composer
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-slate-950">Post to your audience</h3>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                    <Wand2 className="size-3.5" />
                    Feed-ready layout
                </div>
            </div>
            
            <PostInputs content={content} setContent={setContent} authUser={authUser} />

            {/* Media Preview Container */}
            {mediaPreview && (
                <div className="relative mt-1 mx-auto w-full max-w-2xl overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <button
                        onClick={removeMedia}
                        disabled={isWorking}
                        aria-label="Remove media"
                        className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/60 hover:bg-black/90 text-white border-none z-10 active:scale-90 transition-all backdrop-blur-md shadow-lg disabled:opacity-50"
                    >
                        <X className="size-4" />
                    </button>
                    {mediaType === "image" ? (
                        <img
                            src={mediaPreview}
                            alt="Upload preview"
                            className="w-full max-h-[400px] object-cover"
                            loading="eager"
                        />
                    ) : (
                        <video
                            src={mediaPreview}
                            controls
                            playsInline
                            className="w-full max-h-[400px] bg-black"
                            preload="auto"
                        />
                    )}
                </div>
            )}

            {/* Smart Progress Pipeline UI */}
            {isWorking && uploadProgress > 0 && (
                <div className="mt-1 w-full animate-in fade-in duration-300">
                    <div className="mb-2 flex items-center justify-between px-0.5 text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-500">{uploadStatus === "uploading" ? "Syncing media" : "Publishing post"}</span>
                        <span className="text-slate-900">{uploadProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                            className="relative h-full bg-slate-900 transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]"></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Song Audio Extractor Module (Videos Only) */}
            {mediaType === "video" && (
                <div className="mt-2 space-y-4 rounded-[28px] border border-slate-200 bg-slate-50 p-4 animate-in fade-in duration-300">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="text"
                            placeholder="Search trending audio..."
                            className="input-premium w-full flex-1 rounded-xl text-sm"
                            onChange={(e) => setSearchQuery(e.target.value)}
                            value={searchQuery}
                            disabled={isWorking}
                        />
                        {songName && (
                            <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
                                <span className="w-full truncate text-xs font-black uppercase tracking-wider text-slate-700">
                                    {songName}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
                        {filteredSongs.length > 0 ? filteredSongs.map((song) => {
                            const label = `${song.title} - ${song.artist}`;
                            const isSelected = songName === label;
                            const isPlaying = currentPreviewPlaying === song._id;

                            return (
                                <div key={song._id} className={`flex items-center gap-1 rounded-full border pl-3 pr-1 py-1 transition-all ${isSelected ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}>
                                    <button
                                        onClick={() => {
                                            setSongName(label);
                                            setAudioUrl(song.audioUrl);
                                        }}
                                        disabled={isWorking}
                                        className="text-xs font-semibold cursor-pointer truncate max-w-[120px] sm:max-w-xs transition-colors"
                                    >
                                        {label}
                                    </button>
                                    {song.audioUrl && (
                                        <button
                                        className={`btn btn-ghost btn-xs btn-circle ${isSelected ? 'text-white' : 'text-slate-400 hover:text-slate-900'} ${isPlaying ? 'animate-pulse bg-white/10' : ''}`}
                                        disabled={isWorking}
                                        onClick={(e) => {
                                            e.preventDefault();
                                                handleAudioPreview(song.audioUrl, song._id);
                                            }}
                                            aria-label={isPlaying ? "Stop audio preview" : "Play audio preview"}
                                        >
                                            {isPlaying ? <Square className="size-3.5 fill-current" /> : <Play className="size-3.5 fill-current" />}
                                        </button>
                                    )}
                                </div>
                            );
                        }) : (
                            <span className="text-[10px] font-semibold uppercase tracking-widest opacity-40 px-2 py-1">{searchQuery ? "No songs found" : "Loading library..."}</span>
                        )}
                        {!searchQuery && songs.length === 0 && (
                            <button
                                onClick={() => {
                                    setSongName("Original Audio");
                                    setAudioUrl("");
                                }}
                                disabled={isWorking}
                                className={`cursor-pointer rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${songName === "Original Audio" ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'}`}
                            >
                                Original Audio
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Action Triggers Configuration */}
            <div className="mt-1 flex flex-col gap-4 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                    <label className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isWorking ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : 'cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                        <ImageIcon className="size-4.5 transition-colors group-hover:text-emerald-600" />
                        Photo
                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isWorking}
                            onChange={(e) => handleFileSelect(e, "image")}
                        />
                    </label>

                    <label className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${isWorking ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400' : 'cursor-pointer border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}>
                        <VideoIcon className="size-4.5 transition-colors group-hover:text-sky-600" />
                        Video
                        <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            className="hidden"
                            disabled={isWorking}
                            onChange={(e) => handleFileSelect(e, "video")}
                        />
                    </label>
                </div>

                <button
                    className="btn h-11 min-h-11 rounded-full border-0 bg-slate-950 px-8 text-sm font-bold text-white shadow-[0_18px_50px_rgba(15,23,42,0.22)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-800 active:scale-95"
                    onClick={handlePost}
                    disabled={isWorking || (!content.trim() && !mediaFile)}
                >
                    {isWorking ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            <span className="opacity-90">{uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : "Posting"}</span>
                        </>
                    ) : (
                        "Publish"
                    )}
                </button>
            </div>
        </div>
    );
});
CreatePost.displayName = "CreatePost";

export default CreatePost;
