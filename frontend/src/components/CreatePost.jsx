import { useState, useRef, useEffect, useMemo } from "react";
import { createPost, getSongs } from "../lib/api";
import { ImageIcon, VideoIcon, X, Loader2, Play } from "lucide-react";
import toast from "react-hot-toast";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;


// Upload file directly to Cloudinary from the browser (no backend needed)
const uploadToCloudinary = async (file, resourceType = "image", onProgress) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration missing in environment");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
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

const CreatePost = ({ onPost, authUser }) => {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState("");
  const [mediaPreview, setMediaPreview] = useState(null);
  const [songName, setSongName] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [songs, setSongs] = useState([]);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return songs;
    return songs.filter(s =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [songs, searchQuery]);

  useEffect(() => {
    const preSelected = localStorage.getItem("preSelectedSong");
    if (preSelected) {
      try {
        const songData = JSON.parse(preSelected);
        setSongName(`${songData.title} - ${songData.artist}`);
        setAudioUrl(songData.audioUrl);
        // We might want to switch to video mode automatically if a song is selected
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
        setSongs(data);
      } catch (err) {
        console.error("Error fetching songs:", err);
      }
    };
    fetchSongs();
  }, []);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = type === "video" ? 100 * 1024 * 1024 : 50 * 1024 * 1024;
    const maxLabel = type === "video" ? "100MB" : "50MB";
    if (file.size > maxSize) {
      toast.error(`File size must be under ${maxLabel}`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(previewUrl);
  };

  const removeMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaType("");
    setMediaPreview(null);
    setSongName("");
    setAudioUrl("");
    setUploadProgress(0);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !mediaFile) {
      toast.error("Write something or add media");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      let mediaUrlResp = "";
      let mediaBase64 = null;

      if (mediaFile) {
        try {
          const resourceType = mediaType === "video" ? "video" : "image";
          toast.loading(`Uploading ${mediaType}...`, { id: "upload" });
          mediaUrlResp = await uploadToCloudinary(mediaFile, resourceType, (progress) => {
            setUploadProgress(progress);
          });
          toast.dismiss("upload");
        } catch (uploadError) {
          console.warn("Direct upload failed, attempting fallback...", uploadError);
          toast.dismiss("upload");

          if (mediaFile.size < 10 * 1024 * 1024) {
            toast.loading("Uploading via fallback...", { id: "upload-fallback" });
            const reader = new FileReader();
            mediaBase64 = await new Promise((resolve) => {
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(mediaFile);
            });
            toast.dismiss("upload-fallback");
          } else {
            throw new Error(`Upload failed: ${uploadError.message}. Please try a smaller file.`);
          }
        }
      }

      const postData = {
        content: content.trim(),
        mediaUrl: mediaUrlResp,
        media: mediaBase64,
        mediaType,
        songName: songName.trim(),
        audioUrl: audioUrl,
      };

      const saved = await createPost(postData);
      onPost(saved);
      setContent("");
      removeMedia();
      toast.success("Post published!");
    } catch (error) {
      toast.dismiss("upload");
      toast.dismiss("upload-fallback");
      const errorMsg = error.response?.data?.message || error.message || "Failed to create post";
      toast.error(errorMsg);
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-base-100 rounded-[8px] border border-base-content/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
      {/* User Info Row & Input */}
      <div className="flex items-start gap-3">
        <div className="avatar flex-shrink-0">
          <div className="w-10 h-10 rounded-full border border-base-content/10 overflow-hidden bg-base-300">
            <img
              src={authUser?.profilePic || "/avatar.png"}
              alt={authUser?.fullName}
              className="object-cover w-full h-full"
            />
          </div>
        </div>
        <div className="flex-1 min-w-0 relative group">
          <textarea
            className="w-full bg-transparent resize-none text-[15px] focus:outline-none placeholder:opacity-50 min-h-[40px] leading-relaxed pt-2 pb-1"
            placeholder="Share your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />
          {/* Animated focus indicator line */}
          <div className="absolute bottom-0 left-0 h-[1.5px] w-0 bg-primary group-focus-within:w-full transition-all duration-300 ease-out"></div>
        </div>
      </div>

      {/* Media Preview */}
      {mediaPreview && (
        <div className="relative mt-2 rounded-2xl overflow-hidden bg-base-300 border border-base-content/10 mx-auto w-full max-w-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
          <button
            onClick={removeMedia}
            className="absolute top-3 right-3 btn btn-circle btn-sm bg-black/60 hover:bg-black/90 text-white border-none z-10 active:scale-90 transition-all backdrop-blur-md shadow-lg"
          >
            <X className="size-4" />
          </button>
          {mediaType === "image" ? (
            <img
              src={mediaPreview}
              alt="Preview"
              className="w-full max-h-[400px] object-cover"
            />
          ) : (
            <video
              src={mediaPreview}
              controls
              playsInline
              className="w-full max-h-[400px] bg-black"
            />
          )}
        </div>
      )}

      {/* Upload Progress Bar */}
      {loading && uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-2 w-full animate-in fade-in duration-300">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5 px-0.5">
            <span className="opacity-50">Syncing to cloud</span>
            <span className="text-primary">{uploadProgress}%</span>
          </div>
          <div className="h-1.5 w-full bg-base-300 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out relative"
              style={{ width: `${uploadProgress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_1s_infinite]"></div>
            </div>
          </div>
        </div>
      )}

      {/* Song Name Input (Only for Videos) */}
      {mediaType === "video" && (
        <div className="mt-4 p-4 rounded-2xl bg-base-200/50 border border-base-content/5 space-y-4 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search trending audio..."
              className="input-premium w-full flex-1 rounded-xl text-sm"
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            {songName && (
              <div className="flex-1 px-4 py-2.5 bg-primary/10 rounded-xl border border-primary/20 flex items-center shadow-inner">
                <span className="text-xs font-black text-primary uppercase tracking-wider truncate w-full">
                  {songName}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1 custom-scrollbar">
            {filteredSongs.length > 0 ? filteredSongs.map((song) => {
              const label = `${song.title} - ${song.artist}`;
              const isSelected = songName === label;
              return (
                <div key={song._id} className={`flex items-center gap-1 pl-3 pr-1 py-1 rounded-full border transition-all ${isSelected ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-base-100 border-base-content/10 hover:border-primary/50 text-base-content/70'}`}>
                  <button
                    onClick={() => {
                      setSongName(label);
                      setAudioUrl(song.audioUrl);
                    }}
                    className="text-xs font-semibold cursor-pointer truncate max-w-[120px] sm:max-w-xs transition-colors"
                  >
                    {label}
                  </button>
                  {song.audioUrl && (
                    <button
                      className={`btn btn-ghost btn-xs btn-circle ${isSelected ? 'text-primary' : 'text-base-content/40 hover:text-primary'}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const audio = new Audio(song.audioUrl);
                        audio.play().catch(err => toast.error("Wait for audio to load"));
                        toast.success(`Previewing ${song.title}`, { duration: 2000 });
                        setTimeout(() => audio.pause(), 5000); // 5 sec preview
                      }}
                    >
                      <Play className="size-3.5 fill-current" />
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
                className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all cursor-pointer ${songName === "Original Audio" ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-base-100 border-base-content/10 hover:border-primary/50 text-base-content/70'}`}
              >
                Original Audio
              </button>
            )}
          </div>
        </div>
      )}

      {/* Actions Row */}
      <div className="flex items-center justify-between mt-2 pt-4 border-t border-base-content/5">
        <div className="flex items-center gap-2">
          <label className="group flex items-center justify-center size-10 rounded-full hover:bg-base-200 cursor-pointer transition-colors">
            <ImageIcon className="size-5 text-base-content/50 group-hover:text-success transition-colors" />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "image")}
            />
          </label>

          <label className="group flex items-center justify-center size-10 rounded-full hover:bg-base-200 cursor-pointer transition-colors">
            <VideoIcon className="size-5 text-base-content/50 group-hover:text-info transition-colors" />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleFileSelect(e, "video")}
            />
          </label>
        </div>

        <button
          className="btn btn-primary rounded-xl px-8 shadow-[0_4px_14px_0_oklch(var(--p)/0.3)] hover:shadow-[0_6px_20px_oklch(var(--p)/0.23)] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 text-sm font-bold h-10 min-h-10"
          onClick={handlePost}
          disabled={loading || (!content.trim() && !mediaFile)}
        >
          {loading ? (
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
};

export default CreatePost;
