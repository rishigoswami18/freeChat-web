import { memo } from "react";
import { Sparkles } from "lucide-react";

/**
 * Server-validated free trial UI display state isolated purely
 */
const FreeTrialBanner = memo(({ trialEndDate }) => {
    // Failsafe rendering fallback
    const displayDate = trialEndDate instanceof Date ? trialEndDate : new Date(trialEndDate);

    return (
        <section 
            className="alert bg-gradient-to-r from-emerald-500/15 to-teal-500/10 border border-emerald-500/25 mb-6 rounded-2xl animate-in zoom-in-95 duration-500"
            role="alert" 
            aria-live="polite"
        >
            <Sparkles className="size-5 text-emerald-400" aria-hidden="true" />
            <div>
                <h3 className="font-bold text-emerald-400">🎉 Free Trial Active!</h3>
                <p className="text-xs opacity-70 mt-1">
                    All premium features are free until{" "}
                    <span className="font-semibold text-emerald-300">
                        {displayDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                    </span>.
                    Enjoy everything BondBeyond has to offer!
                </p>
            </div>
        </section>
    );
});

FreeTrialBanner.displayName = "FreeTrialBanner";

export default FreeTrialBanner;
