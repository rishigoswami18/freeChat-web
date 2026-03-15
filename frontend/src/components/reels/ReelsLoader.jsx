import { memo } from "react";
import { Film } from "lucide-react";

const ReelsLoader = memo(() => {
    return (
        <div className="h-screen flex flex-col items-center justify-center bg-black text-white gap-4 w-full">
            <div className="relative">
                <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <Film className="size-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-black text-xs uppercase tracking-[0.2em] animate-pulse">Initializing Feed...</p>
        </div>
    );
});

ReelsLoader.displayName = "ReelsLoader";

export default ReelsLoader;
