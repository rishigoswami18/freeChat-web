import { memo } from "react";
import { Link } from "react-router-dom";
import { Crown, Heart, Shield, CalendarCheck, Loader2 } from "lucide-react";

/**
 * Display state when the backend confirms valid premium ledger records.
 */
const ActiveMembershipCard = memo(({ role, memberSince, onCancel, isCancelling }) => {
    const isAdmin = role === "admin";
    
    // Server fallback parsing
    const parsedDate = memberSince ? new Date(memberSince) : null;

    return (
        <section 
            className="space-y-6 animate-in slide-in-from-bottom-4 duration-500"
            aria-label="Active Membership Overview"
        >
            <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-xl relative overflow-hidden focus-within:ring-2 focus-within:ring-primary/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" aria-hidden="true" />
                
                <div className="card-body items-center text-center relative z-10">
                    <div 
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2 shadow-lg shadow-amber-500/20"
                        aria-hidden="true"
                    >
                        {isAdmin ? <Shield className="size-8 text-white" /> : <Crown className="size-8 text-white" />}
                    </div>
                    
                    <h2 className="text-xl font-bold tracking-tight">
                        {isAdmin ? "Admin Access Granted!" : "You're a Premium Member!"}
                    </h2>
                    
                    {parsedDate && (
                        <div className="flex items-center gap-2 text-sm opacity-70 mt-1 font-medium bg-base-100/50 px-3 py-1.5 rounded-full backdrop-blur-sm">
                            <CalendarCheck className="size-4 text-amber-500" aria-hidden="true" />
                            <span>Member since {parsedDate.toLocaleDateString()}</span>
                        </div>
                    )}

                    <div className="divider my-4 w-full opacity-20" aria-hidden="true"></div>

                    <Link 
                        to="/couple" 
                        className="btn btn-primary gap-2 w-full max-w-xs shadow-lg shadow-primary/20 hover:scale-105 transition-all text-sm h-12 rounded-xl"
                        aria-label="Go to Couple Profile dashboard"
                    >
                        <Heart className="size-4" aria-hidden="true" />
                        Go to Couple Profile
                    </Link>

                    <button
                        onClick={onCancel}
                        disabled={isCancelling}
                        aria-label="Cancel Premium Membership"
                        aria-busy={isCancelling}
                        className="btn btn-ghost btn-sm text-error/80 hover:text-error mt-3 rounded-lg hover:bg-error/10 w-full max-w-xs"
                    >
                        {isCancelling ? (
                            <>
                                <Loader2 className="size-4 animate-spin shrink-0" aria-hidden="true" />
                                <span>Processing...</span>
                            </>
                        ) : (
                            "Cancel Membership"
                        )}
                    </button>
                    
                    <p className="text-[10px] opacity-40 mt-4 max-w-[200px] leading-relaxed">
                        Cancellations apply to the next billing cycle. Current benefits remain active until then.
                    </p>
                </div>
            </div>
        </section>
    );
});

ActiveMembershipCard.displayName = "ActiveMembershipCard";

export default ActiveMembershipCard;
