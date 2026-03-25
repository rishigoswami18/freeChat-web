import { memo } from "react";
import { Crown } from "lucide-react";

/**
 * Pure display header for the premium portal
 */
const MembershipHeader = memo(() => {
    return (
        <header className="text-center mb-8" aria-labelledby="membership-title">
            <div 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-1.5 rounded-full mb-4 shadow-sm"
            >
                <Crown className="size-4 text-amber-500" aria-hidden="true" />
                <span className="text-sm font-semibold text-amber-400">Premium</span>
            </div>
            
            <h1 id="membership-title" className="text-2xl sm:text-3xl font-bold mb-2">Zyro Premium</h1>
            <p className="text-sm opacity-60">Unlock couple profiles and exclusive features</p>
        </header>
    );
});

MembershipHeader.displayName = "MembershipHeader";

export default MembershipHeader;
