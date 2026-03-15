import { memo } from "react";
import { Link } from "react-router-dom";
import { Gamepad2, HeartOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

/**
 * CoupleActivities
 * Links to couple games and handles the unlink partner logic.
 */
const CoupleActivities = memo(({ isBothAdult, onUnlink, isUnlinking }) => {
    return (
        <div className="pt-2">
            <div className="flex justify-between items-center mb-3 px-1">
                <h3 className="text-[10px] font-black opacity-40 uppercase tracking-widest">ACTIVITIES</h3>
                {isBothAdult && <span className="badge badge-error badge-sm uppercase text-[9px] font-black px-2 py-2 rounded-lg">🔞 18+ Access</span>}
            </div>
            
            <Link to="/games" className="card bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all group rounded-3xl overflow-hidden shadow-sm">
                <div className="card-body p-4 sm:p-5 flex-row items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white"><Gamepad2 className="size-6" /></div>
                    <div className="flex-1">
                        <h4 className="font-black text-primary italic uppercase tracking-tighter text-lg">Couple Games</h4>
                        <p className="text-xs opacity-60">Play compatibility quizzes and more!</p>
                    </div>
                </div>
            </Link>

            <div className="flex justify-center pt-8 mt-4 border-t border-base-300">
                <button 
                    onClick={() => {
                        const isConfirmed = window.confirm("Are you sure you want to permanently unlink from your partner?");
                        if (isConfirmed) onUnlink();
                    }} 
                    disabled={isUnlinking} 
                    className="btn btn-ghost btn-xs text-error/30 hover:text-error transition-all font-bold uppercase tracking-tighter"
                >
                    {isUnlinking ? <Loader2 className="size-3 animate-spin" /> : <HeartOff className="size-3" />}
                    Unlink Partner
                </button>
            </div>
        </div>
    );
});

CoupleActivities.displayName = "CoupleActivities";
export default CoupleActivities;
