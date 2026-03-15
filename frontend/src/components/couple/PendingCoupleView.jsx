import { memo } from "react";
import { Clock, Heart, Loader2 } from "lucide-react";

/**
 * PendingCoupleView
 * Rendered when a couple request is sent or received but not yet accepted.
 */
const PendingCoupleView = memo(({ partner, iReceivedRequest, onAccept, isAccepting, onUnlink }) => {
    if (!partner) return null;

    return (
        <div className="card bg-base-200 border border-warning/10 rounded-3xl p-8 items-center text-center shadow-xl">
            <Clock className="size-10 text-warning animate-spin-slow mb-4" />
            <h2 className="text-xl font-black italic uppercase tracking-tight mb-2">Request Pending</h2>
            <p className="text-xs opacity-60 mb-6">Waiting for relationship verification</p>
            
            <div className="flex items-center gap-3 p-4 bg-base-100 rounded-2xl border border-base-300 w-full mb-6 max-w-sm">
                <img src={partner.profilePic || "/avatar.png"} className="size-12 rounded-full ring-2 ring-primary/20" alt="Partner" />
                <div className="text-left font-black text-sm uppercase italic truncate">{partner.fullName}</div>
            </div>
            
            {iReceivedRequest ? (
                <div className="flex flex-col w-full max-w-xs gap-2">
                    <button 
                        onClick={() => onAccept(partner._id)} 
                        disabled={isAccepting} 
                        className="btn btn-primary rounded-xl font-bold uppercase"
                    >
                        {isAccepting ? <Loader2 className="animate-spin" /> : <Heart className="mr-2 fill-current" />} 
                        Accept Request
                    </button>
                    <button 
                        onClick={onUnlink} 
                        className="btn btn-ghost text-error btn-sm font-black mt-2"
                    >
                        Decline
                    </button>
                </div>
            ) : (
                <div className="p-4 bg-info/5 rounded-2xl text-xs font-bold text-info italic max-w-xs w-full">
                    Waiting for response...
                </div>
            )}
        </div>
    );
});

PendingCoupleView.displayName = "PendingCoupleView";
export default PendingCoupleView;
