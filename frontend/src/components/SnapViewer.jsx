import { useState } from "react";
import { X, Download, Image as ImageIcon, Video } from "lucide-react";
import toast from "react-hot-toast";

const SnapViewer = ({ snap, isMyMessage }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Resolve media data
    const mediaUrl = snap?.mediaUrl || snap?.attachments?.[0]?.image_url || snap?.attachments?.[0]?.asset_url;
    const mediaType = snap?.mediaType || (snap?.attachments?.[0]?.type === "video" ? "video" : "image");

    const handleDownload = async (e) => {
        e.stopPropagation();
        if (!mediaUrl) return;
        try {
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bondbeyond_${mediaType}_${Date.now()}.${mediaType === 'video' ? 'mp4' : 'jpg'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => window.URL.revokeObjectURL(url), 1000);
            toast.success("Saved! 🚀");
        } catch (error) {
            console.error("Download failed:", error);
            window.open(mediaUrl, '_blank');
        }
    };

    if (!mediaUrl) {
        return (
            <div className={`flex flex-col items-center justify-center p-4 rounded-3xl ${isMyMessage ? 'bg-[#3797F0]' : 'bg-[#262626]'} text-white/50 w-[200px] h-[150px]`}>
               <ImageIcon className="size-8 opacity-20 mb-2" />
               <span className="text-xs font-semibold">Media unavailable</span>
            </div>
        );
    }

    // Inline Chat Thumbnail View
    const renderThumbnail = () => (
        <div 
            onClick={() => setIsOpen(true)}
            className={`relative group cursor-pointer overflow-hidden rounded-2xl w-[220px] h-[300px] shadow-sm transition-transform active:scale-[0.98] ${isMyMessage ? 'border-2 border-[#3797F0]' : 'border-2 border-[#262626]'}`}
        >
            {mediaType === 'video' ? (
                <div className="absolute inset-0 bg-[#1A1A1A] flex items-center justify-center">
                    <Video className="size-12 text-white/40" />
                </div>
            ) : (
                <img src={mediaUrl} alt="Snap" className="size-full object-cover" loading="lazy" />
            )}
            
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                 <div className="opacity-0 group-hover:opacity-100 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white font-semibold text-xs transition-opacity shadow-lg">
                     Click to View
                 </div>
            </div>
        </div>
    );

    // Fullscreen Expanded View
    if (!isOpen) return renderThumbnail();

    return (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col items-center justify-center backdrop-blur-md">
            {/* Header Controls */}
            <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between z-50 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <button onClick={handleDownload} className="p-3 hover:bg-white/10 rounded-full transition-colors active:scale-90" title="Download">
                        <Download className="size-6 text-white" />
                    </button>
                </div>
                <button onClick={() => setIsOpen(false)} className="p-3 hover:bg-white/10 rounded-full bg-black/50 transition-colors active:scale-90">
                    <X className="size-7 text-white" />
                </button>
            </div>

            {/* Media Content */}
            <div className="relative w-full h-full flex flex-col items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                {mediaType === "video" ? (
                    <video
                        src={mediaUrl}
                        className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
                        autoPlay
                        controls
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <img
                        src={mediaUrl}
                        className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl select-none"
                        alt="Snap Fullscreen"
                        onClick={(e) => e.stopPropagation()}
                        onContextMenu={(e) => e.preventDefault()}
                    />
                )}
            </div>
            
            <div className="absolute bottom-10 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                Click background to close
            </div>
        </div>
    );
};

export default SnapViewer;
