import { memo } from "react";
import { Link } from "react-router-dom";
import { HeartHandshake, Crown } from "lucide-react";

/**
 * PremiumRequiredView
 * Displays upsell UI to free-tier users.
 */
const PremiumRequiredView = memo(() => {
    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-2">
                <HeartHandshake className="text-pink-500" />
                Couple Profile
            </h1>
            <div className="card bg-base-200 border border-amber-500/20 shadow-xl">
                <div className="card-body items-center text-center">
                    <Crown className="size-8 text-amber-500 mb-2" />
                    <h2 className="text-lg font-bold">Premium Feature</h2>
                    <p className="text-sm opacity-60">Subscribe to link with your partner.</p>
                    <Link to="/membership" className="btn btn-primary mt-4">Subscribe — ₹49/month</Link>
                </div>
            </div>
        </div>
    );
});

PremiumRequiredView.displayName = "PremiumRequiredView";

export default PremiumRequiredView;
