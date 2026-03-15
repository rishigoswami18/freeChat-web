import { memo } from "react";
import { Film, RotateCcw } from "lucide-react";

const ReelsEndScreen = memo(({ onRestart }) => {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-black p-10 text-center gap-6 snap-start">
            <div className="size-20 bg-white/5 rounded-full flex items-center justify-center luxe-shadow-pink">
                <Film className="size-10 text-pink-500" />
            </div>
            <div>
                <h3 className="text-xl font-black italic uppercase tracking-tighter romantic-gradient-text">The End of the Feed</h3>
                <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-2">You've reached the horizon. Watch again or explore more!</p>
            </div>
            <button
                onClick={onRestart}
                className="btn btn-primary btn-md px-10 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all gap-3 border-none romantic-gradient-bg text-white font-black uppercase tracking-[0.2em]"
            >
                <RotateCcw className="size-5" />
                Watch From Top
            </button>
        </div>
    );
});

ReelsEndScreen.displayName = "ReelsEndScreen";

export default ReelsEndScreen;
