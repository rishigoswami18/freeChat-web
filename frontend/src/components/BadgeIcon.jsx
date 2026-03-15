import { memo } from "react";
import { 
    Award, 
    Star, 
    Zap, 
    Shield, 
    Heart, 
    Sparkles,
    Trophy,
    Brain,
    HelpCircle,
    Flame
} from "lucide-react";

// === BADGE CONFIGURATION & SCALABILITY ===
// Mapped as React Component References instead of arbitrary `<JSX />` elements.
// This prevents React from parsing these node trees into memory on engine start, 
// leaving instantiation purely up to the moment they actually render on screen.
const badgeMap = {
    // Legacy mapping
    "Early Bird": { Icon: Zap, iconColor: "text-yellow-400", bgColor: "badge-warning" },
    "Quiz Master": { Icon: Star, iconColor: "text-primary", bgColor: "badge-primary" },
    "Super Partner": { Icon: Heart, iconColor: "text-red-400", bgColor: "badge-error" },
    "Verified": { Icon: Shield, iconColor: "text-blue-400", bgColor: "badge-info" },
    "Loyal User": { Icon: Award, iconColor: "text-purple-400", bgColor: "badge-secondary" },
    "Premium": { Icon: Sparkles, iconColor: "text-yellow-500", bgColor: "badge-warning" },
    
    // Modern Scalability
    "Top Contributor": { Icon: Trophy, iconColor: "text-green-400", bgColor: "badge-success" },
    "AI Trainer": { Icon: Brain, iconColor: "text-blue-500", bgColor: "badge-info" },
    "Community Helper": { Icon: HelpCircle, iconColor: "text-teal-400", bgColor: "badge-ghost" },
    "Streak Champion": { Icon: Flame, iconColor: "text-red-500", bgColor: "badge-error" },
};

// === FALLBACK CONFIGURATION ===
// If database returns a corrupted or new badge name un-mapped above,
// ensure the UI doesn't throw a white-screen-of-death via undefined accessors.
const fallbackBadge = { 
    Icon: Award, 
    iconColor: "text-base-content", 
    bgColor: "badge-ghost" 
};

// === MAIN COMPONENT ===
const BadgeIcon = memo(({ name }) => {
    // Pure lookup (O(1) time complexity)
    const badge = badgeMap[name] || fallbackBadge;
    const { Icon, iconColor, bgColor } = badge;

    return (
        <div className={`badge ${bgColor} gap-1 font-bold py-3 uppercase tracking-tighter w-max`}>
            {/* Component Instantiated dynamically saving memory */}
            <Icon className={`size-4 ${iconColor}`} />
            <span className="text-[10px]">{name}</span>
        </div>
    );
});
BadgeIcon.displayName = "BadgeIcon";

export default BadgeIcon;
