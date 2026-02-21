import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMembershipStatus,
    getRazorpayKey,
    createMembershipOrder,
    verifyMembershipPayment,
    cancelMembership,
} from "../lib/api";
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
import useAuthUser from "../hooks/useAuthUser";

const MembershipPage = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();

    // Load Razorpay script
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ["membershipStatus"],
        queryFn: getMembershipStatus,
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

    const handlePayment = async () => {
        try {
            // 1. Get Razorpay key
            const { key } = await getRazorpayKey();

            // 2. Create order on backend
            const { order } = await createMembershipOrder();

            // 3. Open Razorpay checkout
            const options = {
                key,
                amount: order.amount,
                currency: order.currency,
                name: "freeChat Premium",
                description: "Monthly Premium Membership — ₹49/month",
                order_id: order.id,
                handler: async (response) => {
                    try {
                        // 4. Verify payment on backend
                        await verifyMembershipPayment({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });
                        toast.success("Payment successful! Welcome to Premium! 🎉");
                        queryClient.invalidateQueries({ queryKey: ["membershipStatus"] });
                        queryClient.invalidateQueries({ queryKey: ["authUser"] });
                    } catch (err) {
                        toast.error("Payment verification failed. Contact support.");
                    }
                },
                prefill: {
                    name: authUser?.fullName || "",
                    email: authUser?.email || "",
                },
                theme: {
                    color: "#6366f1",
                },
                modal: {
                    ondismiss: () => {
                        toast.error("Payment cancelled");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response) => {
                console.error("Razorpay Payment Failed:", response.error);
                let msg = response.error.description;
                if (msg.includes("merchant")) {
                    msg = "Merchant configuration issue. If using LIVE keys, ensure KYC is complete. Otherwise, use TEST keys.";
                }
                toast.error(`Payment failed: ${msg}`, { duration: 6000 });
            });
            rzp.open();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to initiate payment");
        }
    };

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
                    <div className="card bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 shadow-xl">
                        <div className="card-body items-center text-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-2">
                                {data?.role === "admin" ? <Shield className="size-8 text-white" /> : <Crown className="size-8 text-white" />}
                            </div>
                            <h2 className="text-lg font-bold">
                                {data?.role === "admin" ? "Admin Access Granted!" : "You're a Premium Member!"}
                            </h2>
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

                            {/* Real Razorpay Payment Button */}
                            <button
                                onClick={handlePayment}
                                className="btn btn-primary btn-wide gap-2 shadow-lg shadow-primary/25"
                            >
                                <CreditCard className="size-4" />
                                Pay ₹49 — Subscribe Now
                            </button>

                            {/* Trust badges */}
                            <div className="flex items-center gap-4 mt-4 text-xs opacity-40">
                                <div className="flex items-center gap-1">
                                    <Shield className="size-3" />
                                    <span>Razorpay Secure</span>
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
