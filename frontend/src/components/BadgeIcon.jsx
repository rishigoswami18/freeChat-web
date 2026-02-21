import { Award, Star, Zap, Shield, Heart, Sparkles } from "lucide-react";

const badgeMap = {
    "Early Bird": { icon: <Zap className="size-4 text-yellow-400" />, color: "badge-warning" },
    "Quiz Master": { icon: <Star className="size-4 text-primary" />, color: "badge-primary" },
    "Super Partner": { icon: <Heart className="size-4 text-red-400" />, color: "badge-error" },
    "Verified": { icon: <Shield className="size-4 text-blue-400" />, color: "badge-info" },
    "Loyal User": { icon: <Award className="size-4 text-purple-400" />, color: "badge-secondary" },
    "Premium": { icon: <Sparkles className="size-4 text-yellow-500" />, color: "badge-warning" },
};

const BadgeIcon = ({ name }) => {
    const badge = badgeMap[name] || { icon: <Award className="size-4" />, color: "badge-ghost" };

    return (
        <div className={`badge ${badge.color} gap-1 font-bold py-3`}>
            {badge.icon}
            <span className="text-[10px] uppercase tracking-tighter">{name}</span>
        </div>
    );
};

export default BadgeIcon;
