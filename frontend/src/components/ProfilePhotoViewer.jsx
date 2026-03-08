import { X, Camera, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * A dedicated component for viewing profile pictures (DP) in full screen.
 * @param {string} imageUrl - The URL of the image to display.
 * @param {string} fullName - The name of the user.
 * @param {function} onClose - Function to close the viewer.
 * @param {function} onUpdate - Optional. If provided, shows an Update button and handles base64 upload.
 */
const ProfilePhotoViewer = ({ imageUrl, fullName, onClose, onUpdate }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const isOwn = onUpdate !== undefined;

    if (!imageUrl && !isUpdating) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsUpdating(true);
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    await onUpdate(reader.result);
                    setIsUpdating(false);
                };
                reader.readAsDataURL(file);
            } catch (err) {
                console.error("Update failed", err);
                setIsUpdating(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[1000] bg-black/98 flex flex-col items-center justify-center backdrop-blur-xl animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 sm:p-6 flex items-center justify-between z-50 bg-black/40 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-3">
                    <p className="text-white font-black uppercase tracking-[0.15em] text-xs sm:text-sm">
                        {isOwn ? "Manage Your Photo" : "Viewing Profile Photo"}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {isOwn && (
                        <>
                            <input
                                type="file"
                                id="viewer-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <button
                                onClick={() => document.getElementById("viewer-upload").click()}
                                disabled={isUpdating}
                                className="btn btn-primary btn-sm rounded-xl gap-2 h-10 px-4"
                            >
                                {isUpdating ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                                Update
                            </button>
                        </>
                    )}
                    <button
                        onClick={onClose}
                        className="p-2 sm:p-3 hover:bg-white/10 rounded-full transition-all active:scale-95 text-white/70 hover:text-white"
                    >
                        <X className="size-6 sm:size-8" />
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
                <div className="max-w-[90vw] max-h-[70vh] relative group">
                    <div className="absolute -inset-4 bg-primary/20 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />

                    <img
                        src={imageUrl}
                        alt={fullName}
                        className="relative max-h-full max-w-full rounded-2xl sm:rounded-[2rem] object-contain shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 border-white/10 ring-8 ring-white/5"
                    />

                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full text-center">
                        <h2 className="text-white font-black text-lg sm:text-2xl tracking-tight drop-shadow-lg">
                            {fullName}
                        </h2>
                    </div>
                </div>
            </div>

            {/* Footer / Hint */}
            <div className="absolute bottom-10 px-6 py-2 bg-white/5 rounded-full border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.2em]">
                Click cross to Close
            </div>
        </div>
    );
};

export default ProfilePhotoViewer;
