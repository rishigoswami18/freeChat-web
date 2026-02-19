import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMembershipStatus, subscribeMembership, cancelMembership } from "../lib/api";
import {
    Crown,
    Heart,
    Sparkles,
    Shield,
    Loader2,
    Check,
    Star,
    CreditCard,
    CalendarCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const MembershipPage = () => {
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
    });

    const { mutate: subscribe, isPending: isSubscribing } = useMutation({
        mutationFn: subscribeMembership,
        onSuccess: () => {
            toast.success("Welcome to freeChat Premium! 🎉");
            queryClient.invalidateQueries({ queryKey: ["membershipStatus"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Subscription failed"),
    });

    const { mutate: cancel, isPending: isCancelling } = useMutation({
        mutationFn: cancelMembership,
        onSuccess: () => {
            toast.success("Membership cancelled");
            queryClient.invalidateQueries({ queryKey: ["membershipStatus"] });
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
        onError: (err) => toast.error(err.response?.data?.message || "Cancellation failed"),
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        );
    }

    const { isMember, memberSince } = data || {};

    const features = [
        { icon: Heart, text: "Couple Profiles — Link with your partner", highlight: true },
        { icon: Sparkles, text: "Priority badge on posts & comments" },
        { icon: Shield, text: "Exclusive premium-only content" },
        { icon: Star, text: "Early access to new features" },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-1.5 rounded-full mb-4">
                    <Crown className="size-4 text-amber-500" />
                    <span className="text-sm font-semibold text-amber-400">Premium</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">freeChat Premium</h1>
                <p className="text-sm opacity-60">Unlock couple profiles and exclusive features</p>
            </div>

            {/* ===== ACTIVE MEMBER ===== */}
            {isMember ? (
                <div className="space-y-6">
                    {/* Active badge card */}
                    <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2">
                                <Crown className="size-8 text-white" />
                            </div>
                            <h2 className="text-lg font-bold">You're a Premium Member!</h2>
                            {memberSince && (
                                <div className="flex items-center gap-2 text-sm opacity-70">
                                    <CalendarCheck className="size-4" />
                                    <span>Member since {new Date(memberSince).toLocaleDateString()}</span>
                                </div>
                            )}

                            <div className="divider my-2"></div>

                            <Link to="/couple" className="btn btn-primary gap-2 w-full max-w-xs">
                                <Heart className="size-4" />
                                Go to Couple Profile
                            </Link>

                            <button
                                onClick={() => cancel()}
                                disabled={isCancelling}
                                className="btn btn-ghost btn-sm text-error mt-2"
                            >
                                {isCancelling ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    "Cancel Membership"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ===== NON-MEMBER / SUBSCRIBE ===== */
                <div className="space-y-6">
                    {/* Pricing card */}
                    <div className="card bg-base-200 border border-primary/20 shadow-xl relative overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/10 rounded-full blur-3xl"></div>

                        <div className="card-body items-center text-center relative z-10">
                            {/* Price */}
                            <div className="mb-4">
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                        ₹49
                                    </span>
                                    <span className="text-sm opacity-50">/month</span>
                                </div>
                                <p className="text-xs opacity-50 mt-1">Cancel anytime</p>
                            </div>

                            {/* Features list */}
                            <div className="w-full max-w-xs space-y-3 mb-6">
                                {features.map((feature, i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-3 text-left text-sm ${feature.highlight ? "font-semibold text-primary" : "opacity-80"
                                            }`}
                                    >
                                        <div className={`p-1 rounded-full ${feature.highlight ? "bg-primary/20" : "bg-base-300"}`}>
                                            <feature.icon className={`size-3.5 ${feature.highlight ? "text-primary" : ""}`} />
                                        </div>
                                        <span>{feature.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Subscribe button */}
                            <button
                                onClick={() => subscribe()}
                                disabled={isSubscribing}
                                className="btn btn-primary btn-wide gap-2 shadow-lg shadow-primary/25"
                            >
                                {isSubscribing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="size-4" />
                                        Subscribe — ₹49/month
                                    </>
                                )}
                            </button>

                            {/* Trust badges */}
                            <div className="flex items-center gap-4 mt-4 text-xs opacity-40">
                                <div className="flex items-center gap-1">
                                    <Shield className="size-3" />
                                    <span>Secure</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check className="size-3" />
                                    <span>Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipPage;
