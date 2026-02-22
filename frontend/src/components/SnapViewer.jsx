import { X, Clock, Play } from "lucide-react";

const SnapViewer = ({ message, onClose }) => {
    const user = message?.user || {};
    const extraData = message?.extra_data || {};

    // Resolve media data from all possible sources
    const mediaUrl = message?.mediaUrl || extraData?.mediaUrl || message?.attachments?.[0]?.image_url || message?.attachments?.[0]?.asset_url;
    const mediaType = message?.mediaType || extraData?.mediaType || (message?.attachments?.[0]?.type === "video" ? "video" : "image");

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full border border-white/20 overflow-hidden bg-white/10 shrink-0">
                        <img src={user.image || user.profilePic || "/avatar.png"} alt="" className="size-full object-cover" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-bold text-sm tracking-tight truncate">{user.name || user.fullName || "User"}</p>
                        <p className="text-white/60 text-[10px] flex items-center gap-1">
                            <Clock className="size-2.5" />
                            Disappearing message
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors active:scale-90"
                >
                    <X className="size-7 text-white" />
                </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
                {!mediaUrl ? (
                    <div className="flex flex-col items-center gap-4 text-white/40">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center">
                            <Camera className="size-10 opacity-20" />
                        </div>
                        <p className="text-sm font-medium">Media could not be loaded</p>
                    </div>
                ) : mediaType === "video" ? (
                    <video
                        src={mediaUrl}
                        className="max-h-full max-w-full rounded-lg object-contain"
                        autoPlay
                        controls
                        onEnded={onClose}
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        className="max-h-full max-w-full rounded-lg object-contain select-none shadow-2xl"
                        alt="Snap"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                )}
            </div>

            {/* Tap to exit hint */}
            <div className="absolute bottom-10 text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                Click (X) to close
            </div>
        </div>
    );
};

export default SnapViewer;
