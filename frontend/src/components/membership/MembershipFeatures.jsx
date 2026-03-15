import { memo } from "react";
import { Heart, Sparkles, Shield, Star } from "lucide-react";

export const PREMIUM_FEATURES = [
    { icon: Heart, text: "Couple Profiles — Link with your partner", highlight: true },
    { icon: Sparkles, text: "Priority badge on posts & comments" },
    { icon: Shield, text: "Exclusive premium-only content" },
    { icon: Star, text: "Early access to new features" },
];

const MembershipFeatures = memo(() => {
    return (
        <div className="w-full max-w-xs space-y-3 mb-6" role="list">
            {PREMIUM_FEATURES.map((feature, i) => (
                <div
                    key={i}
                    className={`flex items-center gap-3 text-left text-sm ${
                        feature.highlight ? "font-semibold text-primary" : "opacity-80"
                    }`}
                    role="listitem"
                >
                    <div className={`p-1 rounded-full ${feature.highlight ? "bg-primary/20" : "bg-base-300"}`}>
                        <feature.icon className={`size-3.5 ${feature.highlight ? "text-primary" : ""}`} aria-hidden="true" />
                    </div>
                    <span>{feature.text}</span>
                </div>
            ))}
        </div>
    );
});

MembershipFeatures.displayName = "MembershipFeatures";

export default MembershipFeatures;
