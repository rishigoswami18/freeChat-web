import { X, Clock, Play } from "lucide-react";

const SnapViewer = ({ snap, onClose }) => {
    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
            {/* Header */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full border border-white/20 overflow-hidden">
                        <img src={snap.user.image || "/avatar.png"} alt="" className="size-full object-cover" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm tracking-tight">{snap.user.name}</p>
                        <p className="text-white/60 text-[10px] flex items-center gap-1">
                            <Clock className="size-2.5" />
                            Disappearing message
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                    <X className="size-7 text-white" />
                </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full flex items-center justify-center">
                {snap.message.extra_data?.mediaType === "video" ? (
                    <video
                        src={snap.message.extra_data.mediaUrl}
                        className="max-h-full max-w-full object-contain"
                        autoPlay
                        onEnded={onClose}
                    />
                ) : (
                    <img
                        src={snap.message.extra_data.mediaUrl}
                        className="max-h-full max-w-full object-contain select-none"
                        alt="Snap"
                        onContextMenu={(e) => e.preventDefault()}
                    />
                )}
            </div>

            {/* Tap to exit hint */}
            <div className="absolute bottom-10 text-white/40 text-xs font-medium animate-pulse">
                Tap the (X) or wait for video to end to close
            </div>
        </div>
    );
};

export default SnapViewer;
