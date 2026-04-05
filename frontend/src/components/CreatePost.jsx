import { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { createPost, getSongs } from "../lib/api";
import { 
  ImageIcon, 
  VideoIcon, 
  X, 
  Loader2, 
  Play, 
  BadgeCheck, 
  Square, 
  Sparkles, 
  Wand2, 
  Lock, 
  DollarSign,
  Send,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// === ENVIRONMENT CONFIGURATION ===
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

// === GLOBAL AUDIO PREVIEW SAFEGUARD ===
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

const CreatePost = memo(({ onPost, authUser }) => {
    const [content, setContent] = useState("");
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaType, setMediaType] = useState("");
    const [mediaPreview, setMediaPreview] = useState(null);
    
    // Premium Logic
    const [isPaid, setIsPaid] = useState(false);
    const [price, setPrice] = useState(0);
    
    const [songName, setSongName] = useState("");
    const [audioUrl, setAudioUrl] = useState("");
    const [songs, setSongs] = useState([]);
    const [currentPreviewPlaying, setCurrentPreviewPlaying] = useState(null);
    
    const [uploadStatus, setUploadStatus] = useState("idle"); 
    const [uploadProgress, setUploadProgress] = useState(0);
    
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);
    const previewTimeoutRef = useRef(null);

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

    useEffect(() => {
        return () => {
            if (mediaPreview) URL.revokeObjectURL(mediaPreview);
            stopCurrentAudio();
            if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
        };
    }, [mediaPreview]);

    const handleFileSelect = useCallback((e, type) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        const maxSize = type === "video" ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
        
        if (file.size > maxSize) {
            toast.error(`File size must be under ${type === "video" ? "100MB" : "50MB"}`);
            e.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setMediaFile(file);
        setMediaType(type);
        setMediaPreview(previewUrl);
        e.target.value = ""; 
    }, [mediaPreview]);

    const removeMedia = useCallback(() => {
        if (mediaPreview) URL.revokeObjectURL(mediaPreview);
        setMediaFile(null);
        setMediaType("");
        setMediaPreview(null);
        setSongName("");
        setAudioUrl("");
        setUploadProgress(0);
        setIsPaid(false);
        setPrice(0);
    }, [mediaPreview]);

    const handlePost = useCallback(async () => {
        const trimmedContent = content.trim();
        if (!trimmedContent && !mediaFile) {
            toast.error("Handshake requires content or media");
            return;
        }
        if (uploadStatus !== "idle") return;

        setUploadStatus("uploading");
        setUploadProgress(0);

        try {
            let mediaUrlResp = "";
            let mediaBase64 = null;

            if (mediaFile) {
                toast.loading(`Syncing ${mediaType}...`, { id: "nexus-status" });
                mediaUrlResp = await uploadToCloudinary(mediaFile, mediaType, (progress) => {
                    setUploadProgress(progress);
                });
            }

            setUploadStatus("posting");
            toast.loading("Broadcasting...", { id: "nexus-status" });

            const postData = {
                content: trimmedContent,
                mediaUrl: mediaUrlResp,
                media: mediaBase64,
                mediaType,
                songName: songName.trim(),
                audioUrl: audioUrl,
                isPaid,
                price: parseInt(price) || 0
            };

            const saved = await createPost(postData);
            onPost(saved);
            
            setContent("");
            removeMedia();
            toast.success("Broadcast Synchronized", { id: "nexus-status" });

        } catch (error) {
            toast.error(error.message || "Uplink Failed", { id: "nexus-status" });
        } finally {
            setUploadStatus("idle");
            setUploadProgress(0);
        }
    }, [content, mediaFile, uploadStatus, mediaType, songName, audioUrl, isPaid, price, onPost, removeMedia]);

    const isWorking = uploadStatus !== "idle";

    return (
        <div className="space-y-6">
            <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                    <div className="size-14 rounded-2xl overflow-hidden ring-2 ring-white/10 shadow-2xl">
                        <img src={authUser?.profilePic || "/avatar.png"} alt="" className="w-full h-full object-cover" />
                    </div>
                    {(authUser?.isVerified || authUser?.role === "admin") && (
                        <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-lg">
                            <BadgeCheck className="size-4 text-primary fill-[#020617]" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <textarea
                        className="w-full bg-transparent border-none outline-none text-lg font-bold text-white placeholder:text-white/20 min-h-[100px] resize-none pt-2"
                        placeholder="Initiate a new broadcast..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isWorking}
                    />
                </div>
            </div>

            {/* Media Preview Hub */}
            <AnimatePresence>
                {mediaPreview && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-white/[0.02] shadow-2xl"
                    >
                        <button
                            onClick={removeMedia}
                            className="absolute top-4 right-4 z-20 size-10 rounded-xl bg-[#020617]/60 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white hover:bg-rose-500 transition-all shadow-xl"
                        >
                            <X size={20} />
                        </button>

                        <div className="relative group">
                            {mediaType === "image" ? (
                                <img src={mediaPreview} alt="" className="w-full max-h-[500px] object-cover" />
                            ) : (
                                <video src={mediaPreview} controls className="w-full max-h-[500px] bg-[#000]" />
                            )}
                            
                            {/* Premium Overlay for preview */}
                            {isPaid && (
                                <div className="absolute top-4 left-4 z-20 px-4 py-2 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center gap-2">
                                    <Lock size={14} className="text-white" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Premium Broadcast</span>
                                </div>
                            )}
                        </div>

                        {/* Premium Settings for Content */}
                        <div className="p-6 bg-white/[0.02] border-t border-white/5 flex flex-col sm:flex-row gap-4 items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setIsPaid(!isPaid)}
                                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl border transition-all ${isPaid ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-white/40 hover:text-white'}`}
                                >
                                    <DollarSign size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">
                                        {isPaid ? "Gated Access" : "Open Access"}
                                    </span>
                                </button>

                                {isPaid && (
                                    <div className="flex items-center gap-2 bg-white/5 rounded-xl border border-white/5 px-4 h-[44px]">
                                        <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Fee:</span>
                                        <input 
                                            type="number" 
                                            value={price}
                                            onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-16 bg-transparent border-none outline-none text-sm font-black text-white text-center"
                                        />
                                        <Sparkles size={12} className="text-primary" />
                                    </div>
                                )}
                            </div>

                            <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest">
                                Platform fee: 30% split • Instant payout
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Pulse */}
            {isWorking && (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Nexus Pulse</span>
                        <span className="text-[10px] font-black text-white/40">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Footer Triggers */}
            <div className="pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => imageInputRef.current.click()}
                        disabled={isWorking}
                        className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <ImageIcon size={18} className="group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Signal Image</span>
                        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileSelect(e, "image")} />
                    </button>

                    <button 
                         onClick={() => videoInputRef.current.click()}
                         disabled={isWorking}
                         className="group flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
                    >
                        <VideoIcon size={18} className="group-hover:text-indigo-400 transition-colors" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Signal Video</span>
                        <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => handleFileSelect(e, "video")} />
                    </button>
                    
                    <button className="hidden sm:flex size-11 items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-white/20 hover:text-white transition-all">
                        <Plus size={20} />
                    </button>
                </div>

                <button
                    onClick={handlePost}
                    disabled={isWorking || (!content.trim() && !mediaFile)}
                    className="btn btn-primary rounded-2xl h-14 px-10 font-black uppercase tracking-[0.2em] shadow-[0_0_40px_rgba(99,101,241,0.2)] hover:scale-105 active:scale-95 transition-all text-[11px]"
                >
                    {isWorking ? <Loader2 size={18} className="animate-spin" /> : <>Publish Broadcast <Send size={14} className="ml-2" /></>}
                </button>
            </div>
        </div>
    );
});

CreatePost.displayName = "CreatePost";

export default CreatePost;
