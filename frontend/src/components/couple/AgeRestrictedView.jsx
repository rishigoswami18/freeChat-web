import { memo } from "react";
import { Link } from "react-router-dom";
import { Lock, HeartHandshake } from "lucide-react";

/**
 * AgeRestrictedView
 * Prevents complex UI renders if user does not meet age-gate
 */
const AgeRestrictedView = memo(() => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                <HeartHandshake className="text-pink-500" />
                Couple Profile
            </h1>
            <div className="card bg-base-200 border border-error/20 shadow-xl">
                <div className="card-body items-center text-center">
                    <Lock className="size-8 text-error opacity-50 mb-2" />
                    <h2 className="text-lg font-bold">Age Restricted</h2>
                    <p className="text-sm opacity-60">
                        Available for users aged 14 and above.
                    </p>
                </div>
            </div>
        </div>
    );
});

AgeRestrictedView.displayName = "AgeRestrictedView";

export default AgeRestrictedView;
