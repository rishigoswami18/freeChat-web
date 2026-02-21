import { useState, useRef } from "react";
import { createPost } from "../lib/api";
import { ImageIcon, VideoIcon, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const TRENDING_SONGS = [
  "Blinding Lights - The Weeknd",
  "Stay - The Kid LAROI & Justin Bieber",
  "Flowers - Miley Cyrus",
  "As It Was - Harry Styles",
  "Heat Waves - Glass Animals",
  "Original Audio",
];

const CreatePost = ({ onPost, authUser }) => {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null); // base64 string
  const [mediaType, setMediaType] = useState(""); // "image" or "video"
  const [mediaPreview, setMediaPreview] = useState(null); // preview URL
  const [songName, setSongName] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 45MB)
    if (file.size > 45 * 1024 * 1024) {
      toast.error("File size must be under 45MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setMedia(reader.result);
      setMediaType(type);
      setMediaPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    setMedia(null);
    setMediaType("");
    setMediaPreview(null);
    setSongName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() && !media) {
      toast.error("Write something or add media");
      return;
    }

    setLoading(true);
    try {
      const postData = {
        content: content.trim(),
        media,
        mediaType,
        songName: songName.trim(),
      };
      const saved = await createPost(postData);
      onPost(saved);
      setContent("");
      removeMedia();
      toast.success("Post published!");
    } catch (error) {
      toast.error("Failed to create post");
      console.error("Error creating post:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card bg-base-200 shadow-md mb-6 overflow-hidden">
      <div className="card-body p-4 sm:p-5">
        {/* User Info Row */}
        <div className="flex items-center gap-3 mb-3">
          <div className="avatar">
            <div className="w-10 h-10 rounded-full ring ring-primary/20">
              <img
                src={authUser?.profilePic || "/avatar.png"}
                alt={authUser?.fullName}
              />
            </div>
          </div>
          <div>
            <p className="font-semibold text-sm">{authUser?.fullName}</p>
            <p className="text-xs text-base-content/50">What's on your mind?</p>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          className="textarea textarea-bordered w-full bg-base-100 focus:border-primary resize-none"
          placeholder="Share your thoughts, a photo, or a video..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />

        {/* Media Preview */}
        {mediaPreview && (
          <div className="relative mt-3 rounded-xl overflow-hidden bg-base-300">
            <button
              onClick={removeMedia}
              className="absolute top-2 right-2 btn btn-circle btn-sm bg-black/60 hover:bg-black/80 text-white border-none z-10"
            >
              <X className="size-4" />
            </button>
            {mediaType === "image" ? (
              <img
                src={mediaPreview}
                alt="Preview"
                className="w-full max-h-80 object-contain"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-80"
              />
            )}
          </div>
        )}

        {/* Song Name Input (Only for Videos) */}
        {mediaType === "video" && (
          <div className="mt-3 space-y-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Song Name (e.g. Blinding Lights - The Weeknd)"
                className="input input-bordered input-sm w-full bg-base-100 focus:border-primary"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] font-bold opacity-40 w-full uppercase tracking-wider">Suggested Songs</span>
              {TRENDING_SONGS.map((song) => (
                <button
                  key={song}
                  onClick={() => setSongName(song)}
                  className={`badge badge-sm cursor-pointer hover:bg-primary hover:text-primary-content transition-colors ${songName === song ? 'badge-primary' : 'badge-outline opacity-60'}`}
                >
                  {song}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions Row */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-base-300">
          <div className="flex items-center gap-1">
            {/* Image Upload */}
            <label className="btn btn-ghost btn-sm gap-2 text-success cursor-pointer">
              <ImageIcon className="size-4" />
              <span className="hidden sm:inline text-xs">Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "image")}
              />
            </label>

            {/* Video Upload */}
            <label className="btn btn-ghost btn-sm gap-2 text-info cursor-pointer">
              <VideoIcon className="size-4" />
              <span className="hidden sm:inline text-xs">Video</span>
              <input
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e, "video")}
              />
            </label>
          </div>

          {/* Post Button */}
          <button
            className="btn btn-primary btn-sm px-6"
            onClick={handlePost}
            disabled={loading || (!content.trim() && !media)}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
