import { useState, useRef } from "react";
import { createPost } from "../lib/api";
import { ImageIcon, VideoIcon, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const TRENDING_SONGS = [
  "Blinding Lights - The Weeknd",
  "Stay - The Kid LAROI & Justin Bieber",
  "Flowers - Miley Cyrus",
  "As It Was - Harry Styles",
  "Heat Waves - Glass Animals",
  "Original Audio",
];

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
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

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
      let mediaUrl = "";
      let mediaBase64 = null;

      if (mediaFile) {
        try {
          const resourceType = mediaType === "video" ? "video" : "image";
          toast.loading(`Uploading ${mediaType}...`, { id: "upload" });
          mediaUrl = await uploadToCloudinary(mediaFile, resourceType, (progress) => {
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
        mediaUrl,
        media: mediaBase64,
        mediaType,
        songName: songName.trim(),
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
    <>
      <div className="card bg-base-200 shadow-sm sm:shadow-md mb-4 sm:mb-6 overflow-hidden rounded-2xl">
        <div className="card-body p-3 sm:p-5">
          {/* User Info Row */}
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="avatar">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border-2 border-primary/20 overflow-hidden">
                <img
                  src={authUser?.profilePic || "/avatar.png"}
                  alt={authUser?.fullName}
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{authUser?.fullName}</p>
              <p className="text-[11px] text-base-content/40">What's on your mind?</p>
            </div>
          </div>

          {/* Text Input */}
          <textarea
            className="textarea textarea-ghost w-full bg-base-100 resize-none text-[15px] sm:text-base placeholder:italic focus:bg-base-100 min-h-[70px] sm:min-h-[80px] p-0 mb-2"
            placeholder="Share your thoughts, a photo, or a video..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
          />

          {/* Media Preview */}
          {mediaPreview && (
            <div className="relative mt-2 rounded-xl overflow-hidden bg-base-300 -mx-3 sm:-mx-5">
              <button
                onClick={removeMedia}
                className="absolute top-2 right-2 btn btn-circle btn-sm bg-black/60 hover:bg-black/80 text-white border-none z-10 active:scale-90 transition-transform"
              >
                <X className="size-4" />
              </button>
              {mediaType === "image" ? (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="w-full max-h-72 sm:max-h-80 object-cover sm:object-contain"
                />
              ) : (
                <video
                  src={mediaPreview}
                  controls
                  playsInline
                  className="w-full max-h-72 sm:max-h-80"
                />
              )}
            </div>
          )}

          {/* Upload Progress Bar */}
          {loading && uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="opacity-60">Uploading...</span>
                <span className="font-bold text-primary">{uploadProgress}%</span>
              </div>
              <progress
                className="progress progress-primary w-full"
                value={uploadProgress}
                max="100"
              />
            </div>
          )}

          {/* Song Name Input (Only for Videos) */}
          {mediaType === "video" && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                placeholder="Song Name (e.g. Blinding Lights)"
                className="input input-bordered input-sm w-full bg-base-100 focus:border-primary rounded-xl"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
              />
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] font-bold opacity-40 w-full uppercase tracking-wider">Suggested</span>
                {TRENDING_SONGS.map((song) => (
                  <button
                    key={song}
                    onClick={() => setSongName(song)}
                    className={`badge badge-sm cursor-pointer transition-colors active:scale-95 ${songName === song ? 'badge-primary' : 'badge-outline opacity-60 hover:bg-primary hover:text-primary-content'}`}
                  >
                    {song}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions Row */}
          <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-base-300/50">
            <div className="flex items-center gap-3 sm:gap-4">
              <label className="text-base-content/50 hover:text-success active:scale-90 cursor-pointer transition-all p-1">
                <ImageIcon className="size-5 sm:size-6" />
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, "image")}
                />
              </label>

              <label className="text-base-content/50 hover:text-info active:scale-90 cursor-pointer transition-all p-1">
                <VideoIcon className="size-5 sm:size-6" />
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
              className="btn btn-primary btn-sm px-6 sm:px-8 rounded-xl shadow-lg shadow-primary/20 active:scale-95 transition-transform"
              onClick={handlePost}
              disabled={loading || (!content.trim() && !mediaFile)}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {uploadProgress > 0 && uploadProgress < 100 ? `${uploadProgress}%` : "Posting..."}
                </>
              ) : (
                "Post"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreatePost;
